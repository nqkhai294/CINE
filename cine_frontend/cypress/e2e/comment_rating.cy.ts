describe("Kiểm thử chức năng bình luận và đánh giá", () => {
  const USERNAME = "user10";
  const PASSWORD = "12345678";
  const API_BASE_URL = "http://localhost:4200/api";

  const visitHome = () => {
    cy.viewport(1280, 720);
    cy.visit("/");
  };

  const loginByUi = () => {
    cy.intercept("POST", "**/auth/login").as("loginRequest");

    visitHome();

    cy.contains("button", "Thành viên").should("be.visible").click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().clear().type(USERNAME);
      cy.get('input[type="password"]').clear().type(PASSWORD);
      cy.contains("button", /^Đăng nhập$/).click();
    });

    cy.wait("@loginRequest")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.not.be.null;
    });
  };

  const getFirstMovieId = () => {
    return cy
      .request("GET", `${API_BASE_URL}/movies?page=1&limit=1`)
      .then((res) => {
        expect(res.status).to.eq(200);

        const movieId = res.body?.data?.[0]?.id;
        expect(movieId, "movieId from API /movies").to.exist;

        return String(movieId);
      });
  };

  beforeEach(() => {
    loginByUi();
  });

  it("Nên gửi bình luận thành công ở trang xem phim", () => {
    const commentContent = `Cypress comment ${Date.now()}`;

    getFirstMovieId().then((movieId) => {
      cy.intercept("GET", `**/reviews/movie/${movieId}`).as("getComments");
      cy.intercept("POST", "**/reviews").as("postComment");

      cy.visit(`/watch/${movieId}`);
      cy.wait("@getComments");

      cy.get('textarea[placeholder="Viết bình luận"]')
        .should("be.visible")
        .type(commentContent);

      cy.contains("button", "Gửi").click();

      cy.wait("@postComment").then((interception) => {
        const requestBody = interception.request.body as {
          movieId: string;
          content: string;
        };

        expect(requestBody.movieId).to.eq(movieId);
        expect(requestBody.content).to.eq(commentContent);

        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });

      cy.contains(commentContent, { timeout: 10000 }).should("be.visible");
      cy.get('textarea[placeholder="Viết bình luận"]').should("have.value", "");
    });
  });

  it("Nên đánh giá phim thành công ở trang xem phim", () => {
    const score = 4;

    getFirstMovieId().then((movieId) => {
      cy.intercept("POST", "**/ratings").as("postRating");

      cy.visit(`/watch/${movieId}`);

      cy.contains("button", "Đánh giá ngay")
        .should("be.visible")
        .parent()
        .as("ratingCard");

      cy.get("@ratingCard").within(() => {
        cy.get('button[type="button"]')
          .eq(score - 1)
          .click();
      });

      cy.contains(`Bạn chọn ${score} / 5 sao`).should("be.visible");
      cy.get("@ratingCard").contains("button", "Đánh giá ngay").click();

      cy.wait("@postRating").then((interception) => {
        const requestBody = interception.request.body as {
          movieId: number;
          score: number;
        };

        expect(requestBody.movieId).to.eq(Number(movieId));
        expect(requestBody.score).to.eq(score);

        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });

      cy.contains("Đánh giá của bạn đã được lưu", { timeout: 10000 }).should(
        "be.visible",
      );
    });
  });
});
