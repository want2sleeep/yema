import { Problem } from "@yema/shared";

export const problemSeeds: Problem[] = [
  {
    id: "login-card",
    title: "实现登录卡片页面",
    difficulty: "easy",
    shortDescription: "实现一个居中的登录卡片，包含标题、两个输入框和一个提交按钮。",
    description: "实现一个居中的登录卡片页面，页面中必须包含标题、用户名输入框、密码输入框和登录按钮。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>登录卡片</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"page\">\n      <section class=\"card\" id=\"login-card\">\n        <h1>欢迎回来</h1>\n        <form class=\"form\">\n          <input type=\"text\" placeholder=\"用户名\" />\n          <input type=\"password\" placeholder=\"密码\" />\n          <button type=\"submit\">立即登录</button>\n        </form>\n      </section>\n    </main>\n  </body>\n</html>\n",
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
            "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>登录卡片</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"page\">\n      <section class=\"card\" id=\"login-card\">\n        <h1>欢迎回来</h1>\n        <form class=\"form\">\n          <input type=\"text\" placeholder=\"用户名\" />\n          <input type=\"password\" placeholder=\"密码\" />\n          <button type=\"submit\">立即登录</button>\n        </form>\n      </section>\n    </main>\n  </body>\n</html>\n",
        },
        {
          path: "styles.css",
          language: "css",
          content:
            "body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #f4efe6, #d7e4f3);\n}\n\n.page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n}\n\n.card {\n  width: 320px;\n  padding: 24px;\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.92);\n  box-shadow: 0 18px 40px rgba(24, 39, 75, 0.16);\n}\n\n.form {\n  display: grid;\n  gap: 12px;\n}\n",
        },
      ],
      requiredSelectors: ["#login-card", ".form", "button"],
      requiredTexts: ["欢迎回来", "立即登录"],
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
    title: "实现待办事项面板",
    difficulty: "medium",
    shortDescription: "实现一个待办事项页面，包含输入区、添加按钮和任务列表区域。",
    description: "实现一个简单的待办事项页面，页面中需要包含标题、输入框、添加按钮以及任务列表区域。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>待办事项面板</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"todo-page\">\n      <section class=\"todo-card\">\n        <h1>待办事项</h1>\n        <div class=\"composer\">\n          <input type=\"text\" placeholder=\"添加一条待办\" />\n          <button>添加任务</button>\n        </div>\n        <ul class=\"todo-list\">\n          <li>示例任务</li>\n        </ul>\n      </section>\n    </main>\n  </body>\n</html>\n",
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
            "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>待办事项面板</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    <main class=\"todo-page\">\n      <section class=\"todo-card\">\n        <h1>待办事项</h1>\n        <div class=\"composer\">\n          <input type=\"text\" placeholder=\"添加一条待办\" />\n          <button>添加任务</button>\n        </div>\n        <ul class=\"todo-list\">\n          <li>示例任务</li>\n        </ul>\n      </section>\n    </main>\n  </body>\n</html>\n",
        },
        {
          path: "styles.css",
          language: "css",
          content:
            "body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: #f8f8fb;\n}\n\n.todo-page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n}\n\n.todo-card {\n  width: min(92vw, 480px);\n  padding: 24px;\n  border-radius: 18px;\n  background: white;\n}\n",
        },
      ],
      requiredSelectors: [".composer", ".todo-list", "button"],
      requiredTexts: ["待办事项", "添加任务"],
      weights: {
        correctness: 35,
        codeQuality: 20,
        uiRendering: 25,
        engineering: 20,
      },
    },
  },
];

