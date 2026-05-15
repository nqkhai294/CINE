describe("Kiểm thử tính năng đăng ký và đăng nhập", () => {
  const visitHomeWithMockTurnstile = () => {
    cy.viewport(1280, 720);
    cy.visit("/", {
      onBeforeLoad(win) {
        (win as any).turnstile = {
          render: (
            _container: unknown,
            options: { callback?: (token: string) => void },
          ) => {
            if (options?.callback) {
              options.callback("e2e-turnstile-token");
            }

            return "mock-turnstile-widget";
          },
          reset: () => {},
          remove: () => {},
          getResponse: () => "e2e-turnstile-token",
        };
      },
    });
  };

  const openAuthModal = () => {
    cy.contains("button", "Thành viên").should("be.visible").click();
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("h2", "Đăng nhập").should("be.visible");
  };

  it("Nên đăng ký thành công với dữ liệu hợp lệ", () => {
    const unique = Date.now();
    const email = `e2e-${unique}@cine.test`;
    const username = `e2e_user_${unique}`;
    const password = "P@ssword123";
    const displayName = "E2E Tester";

    cy.intercept("POST", "**/auth/register", {
      statusCode: 200,
      body: {
        result: { status: "ok" },
        data: {
          id: 101,
        },
      },
    }).as("registerRequest");

    visitHomeWithMockTurnstile();
    openAuthModal();

    cy.contains("a", "đăng ký ngay", { matchCase: false }).click();
    cy.contains("h2", "Đăng ký").should("be.visible");

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="text"]').eq(0).type(username);
      cy.get('input[type="text"]').eq(1).type(displayName);
      cy.get('input[type="password"]').type(password);
      cy.contains("button", /^Đăng ký$/).click();
    });

    cy.wait("@registerRequest")
      .its("request.body")
      .should((body) => {
        expect(body.email).to.eq(email);
        expect(body.username).to.eq(username);
        expect(body.displayName).to.eq(displayName);
        expect(body.password).to.eq(password);
        expect(body.turnstileToken).to.eq("e2e-turnstile-token");
      });

    cy.contains("Đăng ký thành công!").should("be.visible");
    cy.contains("h2", "Đăng nhập").should("be.visible");
  });

  it("Nên đăng nhập thành công với tài khoản hợp lệ", () => {
    const username = "e2e_login_user";
    const password = "P@ssword123";

    cy.intercept("POST", "**/auth/login", {
      statusCode: 200,
      body: {
        result: { status: "ok" },
        data: {
          token: "e2e-access-token",
          user: {
            id: 123,
            username,
            email: "e2e_login_user@cine.test",
            avatar_url: "",
          },
        },
      },
    }).as("loginRequest");

    visitHomeWithMockTurnstile();
    openAuthModal();

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().type(username);
      cy.get('input[type="password"]').type(password);
      cy.contains("button", /^Đăng nhập$/).click();
    });

    cy.wait("@loginRequest")
      .its("request.body")
      .should((body) => {
        expect(body.username).to.eq(username);
        expect(body.password).to.eq(password);
        expect(body.turnstileToken).to.eq("e2e-turnstile-token");
      });

    cy.contains("Đăng nhập thành công!").should("be.visible");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.eq("e2e-access-token");
      expect(win.localStorage.getItem("user")).to.contain(username);
    });
    cy.contains("button", "Thành viên").should("not.exist");
  });

  it("Nên hiển thị lỗi khi đăng nhập sai mật khẩu", () => {
    const username = "e2e_login_user";
    const wrongPassword = "wrong-password";

    cy.intercept("POST", "**/auth/login", {
      statusCode: 401,
      body: {
        message: "Thông tin đăng nhập không hợp lệ",
      },
    }).as("loginFailedRequest");

    visitHomeWithMockTurnstile();
    openAuthModal();

    cy.get('[role="dialog"]').within(() => {
      cy.get('input[type="text"]').first().type(username);
      cy.get('input[type="password"]').type(wrongPassword);
      cy.contains("button", /^Đăng nhập$/).click();
    });

    cy.wait("@loginFailedRequest");
    cy.contains("Thông tin đăng nhập không hợp lệ").should("be.visible");
    cy.get('[role="dialog"]').should("be.visible");
  });
});
