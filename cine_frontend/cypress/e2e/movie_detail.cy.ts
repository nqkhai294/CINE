describe("Kiểm thử chức năng xem thông tin phim", () => {
  const API_BASE_URL = "http://localhost:4200/api";

  type MovieDetail = {
    id: string | number;
    title: string;
    summary?: string;
    poster_url?: string;
    release_year?: number;
    runtime?: number;
    tmdb_vote_average?: string | number;
    original_language?: string;
    trailer_url?: string;
    genres?: string[];
    actors?: { id: number; name: string }[];
    directors?: { id: number; name: string }[];
  };

  const visitHome = () => {
    cy.viewport(1280, 720);
    cy.visit("/");
  };

  const getFirstMovieId = () => {
    return cy
      .request("GET", `${API_BASE_URL}/movies`, { qs: { page: 1, limit: 1 } })
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body?.data?.length).to.be.greaterThan(0);

        const movieId = res.body.data[0].id;
        expect(movieId).to.exist;
        return String(movieId);
      });
  };

  const fetchMovieById = (movieId: string) => {
    return cy
      .request("GET", `${API_BASE_URL}/movies/${movieId}`)
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body?.result?.status).to.eq("ok");

        return res.body.data as MovieDetail;
      });
  };

  const formatRuntime = (runtime?: number) => {
    if (!runtime) return "N/A";
    return `${Math.floor(runtime / 60)}h ${runtime % 60}m`;
  };

  const visitMovieDetailPage = (movieId: string) => {
    cy.intercept("GET", `**/movies/${movieId}*`).as("getMovie");
    cy.visit(`/movie/${movieId}`);
    return cy.wait("@getMovie");
  };

  it("Nên hiển thị thông tin phim khớp với API GET /movies/:id", () => {
    getFirstMovieId().then((movieId) => {
      fetchMovieById(movieId).then((movie) => {
        visitMovieDetailPage(movieId);

        cy.contains("h1", movie.title).should("be.visible");

        if (movie.poster_url) {
          cy.get(`img[alt="${movie.title}"]`).should("be.visible");
        }

        if (movie.summary) {
          cy.contains("Summary:").should("be.visible");
          const excerpt = movie.summary.slice(0, 40).trim();
          if (excerpt.length > 0) {
            cy.contains(excerpt).should("be.visible");
          }
        }

        if (movie.tmdb_vote_average != null) {
          cy.contains("IMDb").should("be.visible");
          cy.contains(String(movie.tmdb_vote_average)).should("be.visible");
        }

        if (movie.release_year) {
          cy.contains(String(movie.release_year)).should("be.visible");
        }

        cy.contains(formatRuntime(movie.runtime)).should("be.visible");

        if (movie.genres?.length) {
          movie.genres.slice(0, 3).forEach((genre) => {
            cy.contains(genre).should("be.visible");
          });
        }

        if (movie.original_language) {
          cy.contains(movie.original_language.toUpperCase()).should(
            "be.visible",
          );
        }

        if (movie.directors?.length) {
          cy.contains(movie.directors[0].name).should("be.visible");
        }
      });
    });
  });

  it("Nên hiển thị các nút thao tác và khu vực bình luận", () => {
    getFirstMovieId().then((movieId) => {
      visitMovieDetailPage(movieId);

      cy.contains("button", "Xem Ngay").should("be.visible");
      cy.contains('[role="tab"]', "Gợi ý cho bạn").should("be.visible");
      cy.contains('[role="tab"]', "Diễn viên").should("be.visible");
      cy.contains("h2", /^Bình luận \(\d+\)$/).should("be.visible");
    });
  });

  it("Nên hiển thị diễn viên từ API khi chọn tab Diễn viên", () => {
    getFirstMovieId().then((movieId) => {
      fetchMovieById(movieId).then((movie) => {
        visitMovieDetailPage(movieId);
        cy.contains('[role="tab"]', "Diễn viên").click();

        if (movie.actors?.length) {
          movie.actors.slice(0, 3).forEach((actor) => {
            cy.contains(actor.name).should("be.visible");
            cy.get(`a[href="/actor/${actor.id}"]`).should("exist");
          });
        } else {
          cy.contains("Chưa có thông tin diễn viên").should("be.visible");
        }
      });
    });
  });

  it("Nên chuyển sang trang xem phim khi bấm Xem Ngay", () => {
    getFirstMovieId().then((movieId) => {
      visitMovieDetailPage(movieId);
      cy.contains("button", "Xem Ngay").click();
      cy.url().should("include", `/watch/${movieId}`);
    });
  });

  it("Nên mở modal trailer khi phim có trailer_url", () => {
    getFirstMovieId().then((movieId) => {
      fetchMovieById(movieId).then((movie) => {
        if (!movie.trailer_url) {
          cy.log("Phim không có trailer — bỏ qua test modal");
          return;
        }

        visitMovieDetailPage(movieId);
        cy.contains("button", "Xem Trailer").should("be.visible").click();
        cy.get('[role="dialog"]').should("be.visible");
        cy.get('iframe[title="Movie Trailer"]').should("exist");
      });
    });
  });

  it("Nên mở trang chi tiết từ kết quả tìm kiếm thật", () => {
    getFirstMovieId().then((movieId) => {
      fetchMovieById(movieId).then((movie) => {
        cy.intercept("GET", "**/movies/search*").as("searchMovies");

        visitHome();
        cy.get('input[placeholder*="Tìm kiếm"]').type(movie.title);
        cy.wait("@searchMovies").its("response.statusCode").should("eq", 200);

        cy.contains("h4", movie.title, { timeout: 10000 })
          .closest("button")
          .click();

        cy.url().should("include", `/movie/${movieId}`);
        cy.contains("h1", movie.title).should("be.visible");
      });
    });
  });

  it("Nên hiển thị thông báo khi API trả 404", () => {
    const missingId = "999999999999";

    cy.request({
      url: `${API_BASE_URL}/movies/${missingId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });

    cy.visit(`/movie/${missingId}`);
    cy.contains("Movie not found.", { timeout: 10000 }).should("be.visible");
  });
});
