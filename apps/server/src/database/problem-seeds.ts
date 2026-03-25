import { Problem } from "@yema/shared";

export const problemSeeds: Problem[] = [
  {
    id: "login-card",
    title: "Build a Login Card",
    difficulty: "easy",
    shortDescription: "Create a centered login card with a title, two inputs and a submit button.",
    description:
      "Implement a centered login card page. The page must include a title, username input, password input and a login button.",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Login Card</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"page\">\n      <section class=\"card\" id=\"login-card\">\n        <h1>Welcome Back</h1>\n        <form class=\"form\">\n          <input type=\"text\" placeholder=\"Username\" />\n          <input type=\"password\" placeholder=\"Password\" />\n          <button type=\"submit\">Log in</button>\n        </form>\n      </section>\n    </main>\n  </body>\n</html>\n",
      },
      {
        path: "styles.css",
        language: "css",
        content:
          "body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #f4efe6, #d7e4f3);\n}\n\n.page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n}\n\n.card {\n  width: 320px;\n  padding: 24px;\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.92);\n  box-shadow: 0 18px 40px rgba(24, 39, 75, 0.16);\n}\n\n.form {\n  display: grid;\n  gap: 12px;\n}\n",
      },
    ],
    config: {
      editableFiles: [
        {
          path: "index.html",
          language: "html",
          content:
            "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Login Card</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"page\">\n      <section class=\"card\" id=\"login-card\">\n        <h1>Welcome Back</h1>\n        <form class=\"form\">\n          <input type=\"text\" placeholder=\"Username\" />\n          <input type=\"password\" placeholder=\"Password\" />\n          <button type=\"submit\">Log in</button>\n        </form>\n      </section>\n    </main>\n  </body>\n</html>\n",
        },
        {
          path: "styles.css",
          language: "css",
          content:
            "body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #f4efe6, #d7e4f3);\n}\n\n.page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n}\n\n.card {\n  width: 320px;\n  padding: 24px;\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.92);\n  box-shadow: 0 18px 40px rgba(24, 39, 75, 0.16);\n}\n\n.form {\n  display: grid;\n  gap: 12px;\n}\n",
        },
      ],
      requiredSelectors: ["#login-card", ".form", "button"],
      requiredTexts: ["Welcome Back", "Log in"],
      weights: {
        correctness: 35,
        codeQuality: 20,
        uiRendering: 25,
        engineering: 20,
      },
    },
  },
  {
    id: "todo-board",
    title: "Build a Todo Board",
    difficulty: "medium",
    shortDescription: "Create a Todo page with a composer area and a task list section.",
    description:
      "Implement a simple Todo page with a title, input field, add button and a list area for tasks.",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Todo Board</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"todo-page\">\n      <section class=\"todo-card\">\n        <h1>Todo Board</h1>\n        <div class=\"composer\">\n          <input type=\"text\" placeholder=\"Add a task\" />\n          <button>Add Task</button>\n        </div>\n        <ul class=\"todo-list\">\n          <li>Example Task</li>\n        </ul>\n      </section>\n    </main>\n  </body>\n</html>\n",
      },
      {
        path: "styles.css",
        language: "css",
        content:
          "body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: #f8f8fb;\n}\n\n.todo-page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n}\n\n.todo-card {\n  width: min(92vw, 480px);\n  padding: 24px;\n  border-radius: 18px;\n  background: white;\n}\n",
      },
    ],
    config: {
      editableFiles: [
        {
          path: "index.html",
          language: "html",
          content:
            "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Todo Board</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"todo-page\">\n      <section class=\"todo-card\">\n        <h1>Todo Board</h1>\n        <div class=\"composer\">\n          <input type=\"text\" placeholder=\"Add a task\" />\n          <button>Add Task</button>\n        </div>\n        <ul class=\"todo-list\">\n          <li>Example Task</li>\n        </ul>\n      </section>\n    </main>\n  </body>\n</html>\n",
        },
        {
          path: "styles.css",
          language: "css",
          content:
            "body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: #f8f8fb;\n}\n\n.todo-page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n}\n\n.todo-card {\n  width: min(92vw, 480px);\n  padding: 24px;\n  border-radius: 18px;\n  background: white;\n}\n",
        },
      ],
      requiredSelectors: [".composer", ".todo-list", "button"],
      requiredTexts: ["Todo Board", "Add Task"],
      weights: {
        correctness: 35,
        codeQuality: 20,
        uiRendering: 25,
        engineering: 20,
      },
    },
  },
];

