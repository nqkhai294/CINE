describe("Kiểm thử quản lý hồ sơ cá nhân", () => {
  const USERNAME = "iamkhai";
  const PASSWORD = "29042004";

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
  };

  beforeEach(() => {
    loginByUi();
  });

  it("Nên hiển thị ba mục: Phim xem gần đây, Phim đã thích, Danh sách xem sau", () => {
    cy.visit("/profile");

    cy.contains("h2", "Phim xem gần đây").should("be.visible");
    cy.contains("h2", "Phim đã thích").should("be.visible");
    cy.contains("h2", "Danh sách xem sau").should("be.visible");
  });

  it("Nên cập nhật tất cả thông tin cá nhân thành công", () => {
    const newBio = `Bio test ${Date.now()}`;
    const newDate = "1995-08-20";

    cy.intercept("PUT", "**/users/profile").as("updateProfile");

    cy.visit("/profile");

    cy.contains("button", "Chỉnh sửa").click();

    // Cập nhật tiểu sử
    cy.get("textarea[placeholder='Viết vài dòng về bạn...']").then((el) => {
      const textarea = el[0] as HTMLTextAreaElement;
      textarea.value = newBio;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Cập nhật ngày sinh
    cy.get('input[aria-label="Ngày sinh"]')
      .clear()
      .type(newDate, { force: true });

    // Lưu
    cy.contains("button", "Lưu").click();

    cy.wait("@updateProfile").then((interception) => {
      const requestBody = interception.request.body as {
        bio?: string;
        date_of_birth?: string;
        gender?: string;
      };

      expect(requestBody.date_of_birth).to.eq(newDate);
    });

    cy.contains("Cập nhật thông tin thành công!").should("be.visible");
  });
});
