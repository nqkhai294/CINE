describe("Kiểm thử gợi ý phim trên trang chủ", () => {
  const FEW_RATINGS_USER = {
    username: "iamkhai",
    password: "29042004",
  };

  const MANY_RATINGS_USER = {
    username: "user10",
    password: "12345678",
  };

  const TITLE_FOR_YOU = "Phim gợi ý cho bạn";
  const TITLE_SIMILAR_USERS = "Những người dùng giống bạn cũng xem";
  const TITLE_TRENDING = "Các phim đang xu hướng";

  const visitHome = () => {
    cy.viewport(1280, 720);
    cy.visit("/");
  };

  const loginAs = (username: string, password: string) => {
    cy.intercept("POST", "**/auth/login").as("loginRequest");

    visitHome();

    cy.contains("button", "Thành viên").should("be.visible").click();
    cy.get('[role="dialog"]').should("be.visible");

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().clear().type(username);
      cy.get('input[type="password"]').clear().type(password);
      cy.contains("button", /^Đăng nhập$/).click();
    });

    cy.wait("@loginRequest")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.not.be.null;
    });
  };

  const setupRecommendationIntercepts = () => {
    cy.intercept("GET", "**/recommendations/for-you").as("forYou");
    cy.intercept("GET", "**/recommendations/similar-users-watch").as(
      "similarUsersWatch",
    );
  };

  const assertSectionVisible = (title: string) => {
    cy.contains("h2", title).should("be.visible");
  };

  const assertSectionHidden = (title: string) => {
    cy.contains("h2", title).should("not.exist");
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("Chưa đăng nhập: không hiện 2 khối gợi ý, có khối phim xu hướng", () => {
    cy.intercept("GET", "**/recommendations/for-you").as("forYou");
    cy.intercept("GET", "**/recommendations/similar-users-watch").as(
      "similarUsersWatch",
    );

    visitHome();

    assertSectionHidden(TITLE_FOR_YOU);
    assertSectionHidden(TITLE_SIMILAR_USERS);
    assertSectionVisible(TITLE_TRENDING);

    cy.get("@forYou.all").should("have.length", 0);
    cy.get("@similarUsersWatch.all").should("have.length", 0);
  });

  it("Đã đăng nhập (iamkhai): chỉ hiện Phim gợi ý cho bạn", () => {
    setupRecommendationIntercepts();
    loginAs(FEW_RATINGS_USER.username, FEW_RATINGS_USER.password);

    cy.wait("@forYou").its("response.statusCode").should("eq", 200);

    assertSectionVisible(TITLE_FOR_YOU);
    assertSectionHidden(TITLE_SIMILAR_USERS);
    assertSectionVisible(TITLE_TRENDING);
  });

  it("Đã đăng nhập (user10): hiện cả 2 khối gợi ý", () => {
    setupRecommendationIntercepts();
    loginAs(MANY_RATINGS_USER.username, MANY_RATINGS_USER.password);

    cy.wait("@forYou").its("response.statusCode").should("eq", 200);

    cy.wait("@similarUsersWatch", { timeout: 20000 })
      .its("response.statusCode")
      .should("eq", 200);

    assertSectionVisible(TITLE_FOR_YOU);
    assertSectionVisible(TITLE_SIMILAR_USERS);
    assertSectionVisible(TITLE_TRENDING);
  });
});
