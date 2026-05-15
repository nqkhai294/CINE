describe("Kiểm thử tính năng tìm kiếm phim", () => {
  it("Nên tìm thấy phim khi nhập từ khóa chính xác", () => {
    cy.viewport(1280, 720);
    cy.visit("/");

    cy.get('input[placeholder*="Tìm kiếm"]').type("Captain America{enter}");

    cy.contains("Captain America").should("be.visible");
  });
});
