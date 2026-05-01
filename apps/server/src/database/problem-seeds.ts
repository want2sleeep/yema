import { Problem } from "@yema/shared";

export const problemSeeds: Problem[] = [
  {
    id: "login-card",
    title: "实现登录卡片页面",
    difficulty: "easy",
    tags: ["HTML", "CSS"],
    shortDescription: "实现一个居中的登录卡片，包含标题、两个输入框和一个提交按钮。",
    description:
      "请完成一个登录卡片页面。页面中至少要有主标题、用户名输入框、密码输入框和登录按钮，并保持基础的居中布局与清晰层次。",
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
      requirements: [
        "页面中包含登录标题、用户名输入框、密码输入框和提交按钮。",
        "登录卡片在桌面视口下应保持明显的居中展示。",
        "表单元素之间应有基本的间距与层次。",
      ],
      requiredSelectors: ["#login-card", ".form", "button"],
      requiredTexts: ["欢迎回来", "立即登录"],
      evaluationRules: [
        {
          id: "login-required-file-html",
          title: "保留 HTML 入口文件",
          description: "提交中需要包含 index.html，保证页面可被评测系统加载。",
          engine: "static",
          type: "file",
          dimension: "engineering",
          target: "index.html",
          failureSeverity: "error",
          failureScoreImpact: -10,
          successMessage: "已找到 index.html，可继续进行结构与渲染检查。",
          failureMessage: "缺少 index.html，评测系统无法定位页面入口。",
        },
        {
          id: "login-required-file-css",
          title: "保留样式文件",
          description: "提交中需要包含 styles.css，以便评估页面样式和布局。",
          engine: "static",
          type: "file",
          dimension: "engineering",
          target: "styles.css",
          failureSeverity: "error",
          failureScoreImpact: -8,
          successMessage: "已找到 styles.css，样式检查可正常进行。",
          failureMessage: "缺少 styles.css，页面样式和布局将无法完整评估。",
        },
        {
          id: "login-selector-card",
          title: "存在登录卡片容器",
          description: "源码中应存在 id 为 login-card 的卡片容器。",
          engine: "static",
          type: "selector",
          dimension: "correctness",
          target: "#login-card",
          failureSeverity: "warning",
          failureScoreImpact: -8,
          successMessage: "源码中已包含登录卡片容器。",
          failureMessage: "源码中未找到 #login-card，页面主体结构不完整。",
        },
        {
          id: "login-selector-form",
          title: "存在表单容器",
          description: "源码中应包含表单容器，便于组织输入项和按钮。",
          engine: "static",
          type: "selector",
          dimension: "correctness",
          target: ".form",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "源码中已包含表单容器。",
          failureMessage: "源码中未找到 .form，输入区结构不够清晰。",
        },
        {
          id: "login-text-title",
          title: "显示欢迎标题",
          description: "页面中应出现“欢迎回来”文字。",
          engine: "render",
          type: "text",
          dimension: "uiRendering",
          target: "欢迎回来",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "页面渲染后已显示欢迎标题。",
          failureMessage: "页面渲染后未显示“欢迎回来”标题。",
        },
        {
          id: "login-text-button",
          title: "显示登录按钮文案",
          description: "页面中应出现“立即登录”按钮文案。",
          engine: "render",
          type: "text",
          dimension: "correctness",
          target: "立即登录",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "页面渲染后已显示登录按钮文案。",
          failureMessage: "页面渲染后未显示“立即登录”按钮文案。",
        },
        {
          id: "login-render-button",
          title: "浏览器中存在按钮元素",
          description: "渲染后的 DOM 中应存在按钮元素。",
          engine: "render",
          type: "selector",
          dimension: "uiRendering",
          target: "button",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "浏览器渲染后的 DOM 中已检测到按钮元素。",
          failureMessage: "浏览器渲染后的 DOM 中未检测到按钮元素。",
        },
        {
          id: "login-layout-keyword",
          title: "包含基础居中布局样式",
          description: "样式中建议体现基础布局能力，例如 display/grid/flex。",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["display", "place-items"],
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "样式中已包含基础布局声明。",
          failureMessage: "样式中缺少明确的布局声明，页面可能难以稳定居中。",
        },
        {
          id: "login-console-clean",
          title: "浏览器运行期无报错",
          description: "页面加载后不应出现 console error 或 page error。",
          engine: "render",
          type: "console",
          dimension: "engineering",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "浏览器控制台未捕获到运行期错误。",
          failureMessage: "浏览器控制台存在运行期错误，说明页面稳定性仍需提升。",
        },
      ],
      renderConfig: {
        viewportWidth: 1440,
        viewportHeight: 960,
        waitAfterLoadMs: 250,
      },
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
    tags: ["HTML", "CSS", "JavaScript"],
    shortDescription: "实现一个待办事项面板，包含输入区、添加按钮和任务列表。",
    description:
      "请完成一个简洁的待办事项面板。页面中至少要有标题、输入框、添加按钮和列表区域，并保持基本的卡片式排版。",
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
      requirements: [
        "页面中包含标题、输入框、添加按钮和待办列表。",
        "面板区域应有明确的卡片容器和基本留白。",
        "列表中至少存在一条示例任务，便于展示结构完整性。",
      ],
      requiredSelectors: [".composer", ".todo-list", "button"],
      requiredTexts: ["待办事项", "添加任务"],
      evaluationRules: [
        {
          id: "todo-required-file-html",
          title: "保留 HTML 入口文件",
          description: "提交中需要包含 index.html，保证页面可被评测系统加载。",
          engine: "static",
          type: "file",
          dimension: "engineering",
          target: "index.html",
          failureSeverity: "error",
          failureScoreImpact: -10,
          successMessage: "已找到 index.html，可继续进行结构与渲染检查。",
          failureMessage: "缺少 index.html，评测系统无法定位页面入口。",
        },
        {
          id: "todo-required-file-css",
          title: "保留样式文件",
          description: "提交中需要包含 styles.css，以便评估页面样式和布局。",
          engine: "static",
          type: "file",
          dimension: "engineering",
          target: "styles.css",
          failureSeverity: "error",
          failureScoreImpact: -8,
          successMessage: "已找到 styles.css，样式检查可正常进行。",
          failureMessage: "缺少 styles.css，页面样式和布局将无法完整评估。",
        },
        {
          id: "todo-selector-composer",
          title: "存在输入操作区",
          description: "源码中应包含 .composer 容器，用于组织输入框和按钮。",
          engine: "static",
          type: "selector",
          dimension: "correctness",
          target: ".composer",
          failureSeverity: "warning",
          failureScoreImpact: -8,
          successMessage: "源码中已包含输入操作区。",
          failureMessage: "源码中未找到 .composer，输入区结构不完整。",
        },
        {
          id: "todo-selector-list",
          title: "存在待办列表",
          description: "源码中应包含 .todo-list 列表容器。",
          engine: "static",
          type: "selector",
          dimension: "correctness",
          target: ".todo-list",
          failureSeverity: "warning",
          failureScoreImpact: -8,
          successMessage: "源码中已包含待办列表容器。",
          failureMessage: "源码中未找到 .todo-list，任务展示区域缺失。",
        },
        {
          id: "todo-text-title",
          title: "显示页面标题",
          description: "页面中应出现“待办事项”文字。",
          engine: "render",
          type: "text",
          dimension: "uiRendering",
          target: "待办事项",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "页面渲染后已显示标题。",
          failureMessage: "页面渲染后未显示“待办事项”标题。",
        },
        {
          id: "todo-text-button",
          title: "显示添加按钮文案",
          description: "页面中应出现“添加任务”按钮文案。",
          engine: "render",
          type: "text",
          dimension: "correctness",
          target: "添加任务",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "页面渲染后已显示添加按钮文案。",
          failureMessage: "页面渲染后未显示“添加任务”按钮文案。",
        },
        {
          id: "todo-render-button",
          title: "浏览器中存在按钮元素",
          description: "渲染后的 DOM 中应存在按钮元素。",
          engine: "render",
          type: "selector",
          dimension: "uiRendering",
          target: "button",
          failureSeverity: "warning",
          failureScoreImpact: -5,
          successMessage: "浏览器渲染后的 DOM 中已检测到按钮元素。",
          failureMessage: "浏览器渲染后的 DOM 中未检测到按钮元素。",
        },
        {
          id: "todo-layout-keyword",
          title: "包含基础布局样式",
          description: "样式中建议体现基础布局能力，例如 display/grid/flex。",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["display", "place-items"],
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "样式中已包含基础布局声明。",
          failureMessage: "样式中缺少明确的布局声明，面板位置可能不稳定。",
        },
        {
          id: "todo-console-clean",
          title: "浏览器运行期无报错",
          description: "页面加载后不应出现 console error 或 page error。",
          engine: "render",
          type: "console",
          dimension: "engineering",
          failureSeverity: "warning",
          failureScoreImpact: -6,
          successMessage: "浏览器控制台未捕获到运行期错误。",
          failureMessage: "浏览器控制台存在运行期错误，说明页面稳定性仍需提升。",
        },
      ],
      renderConfig: {
        viewportWidth: 1440,
        viewportHeight: 960,
        waitAfterLoadMs: 250,
      },
      weights: {
        correctness: 35,
        codeQuality: 20,
        uiRendering: 25,
        engineering: 20,
      },
    },
  },
  {
    id: "circular-progress",
    title: "实现环形进度条",
    difficulty: "easy",
    tags: ["HTML", "CSS"],
    shortDescription: "使用 HTML 和 CSS 实现一个静态的环形进度条。",
    description:
      "请实现一个环形进度条。要求：环形背景为浅灰色，进度部分为蓝色，进度值显示在环形中央。建议使用 conic-gradient 或 SVG 描边实现。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <div class="progress-container">\n    <div class="circular-progress">\n      <span class="value">75%</span>\n    </div>\n  </div>\n</body>\n</html>',
      },
      {
        path: "styles.css",
        language: "css",
        content:
          '.progress-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}\n\n.circular-progress {\n  width: 150px;\n  height: 150px;\n  border-radius: 50%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  /* 在这里编写进度条样式 */\n  background: #eee; \n}\n\n.value {\n  font-size: 24px;\n  font-family: sans-serif;\n}',
      },
    ],
    config: {
      editableFiles: [{ path: "styles.css", language: "css", content: "" }],
      requirements: [
        "进度条必须是圆形的。",
        "必须有明显的进度颜色区分。",
        "进度数值（75%）必须居中显示。",
      ],
      requiredSelectors: [".circular-progress", ".value"],
      requiredTexts: ["75%"],
      evaluationRules: [
        {
          id: "cp-circular",
          title: "保持圆形外观",
          description: "检查是否使用了 border-radius: 50%",
          engine: "static",
          type: "keyword",
          dimension: "uiRendering",
          keywords: ["border-radius", "50%"],
          failureSeverity: "error",
          failureScoreImpact: -15,
        },
      ],
      renderConfig: {
        viewportWidth: 800,
        viewportHeight: 600,
        waitAfterLoadMs: 500,
      },
      weights: {
        correctness: 40,
        codeQuality: 20,
        uiRendering: 30,
        engineering: 10,
      },
    },
  },
  {
    id: "react-countdown",
    title: "React 倒计时组件",
    difficulty: "medium",
    tags: ["React", "JavaScript"],
    shortDescription: "使用 React 实现一个 60 秒倒计时器。",
    description:
      "实现一个倒计时组件：点击“开始”按钮从 60 开始倒计时，点击“重置”回到 60。要求处理好定时器的清除逻辑防止内存泄漏。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          '<!DOCTYPE html>\n<html>\n<head>\n  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="text/babel" src="app.js"></script>\n</body>\n</html>',
      },
      {
        path: "app.js",
        language: "javascript",
        content:
          'const { useState, useEffect, useRef } = React;\n\nfunction Countdown() {\n  const [seconds, setSeconds] = useState(60);\n  const [isActive, setIsActive] = useState(false);\n\n  // 在这里实现倒计时逻辑\n\n  return (\n    <div className="timer">\n      <h1>{seconds}s</h1>\n      <button onClick={() => setIsActive(true)}>开始</button>\n      <button onClick={() => { setIsActive(false); setSeconds(60); }}>重置</button>\n    </div>\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("root"));\nroot.render(<Countdown />);',
      },
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: ["初始显示 60s。", "点击“开始”后每秒递减。", "具有重置功能。"],
      requiredSelectors: [".timer", "button"],
      requiredTexts: ["60s", "开始", "重置"],
      evaluationRules: [
        {
          id: "react-hook-usage",
          title: "使用 useEffect 或 setInterval",
          description: "检查代码中是否包含定时器逻辑",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["useEffect", "setInterval"],
          failureSeverity: "warning",
          failureScoreImpact: -10,
        },
      ],
      renderConfig: {
        viewportWidth: 800,
        viewportHeight: 600,
        waitAfterLoadMs: 1000,
      },
      weights: {
        correctness: 50,
        codeQuality: 20,
        uiRendering: 15,
        engineering: 15,
      },
    },
  },
  {
    id: "vue-countdown",
    title: "Vue 倒计时组件",
    difficulty: "medium",
    tags: ["Vue", "JavaScript"],
    shortDescription: "使用 Vue 3 实现一个倒计时功能。",
    description:
      "请使用 Vue 3 的 Composition API 实现一个倒计时。要求显示当前剩余秒数，并在倒计时结束时改变文字颜色。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content:
          '<!DOCTYPE html>\n<html>\n<head>\n  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>\n</head>\n<body>\n  <div id="app">\n    <div class="countdown-box">\n      <p :style="{ color: count === 0 ? \'red\' : \'black\' }">{{ count }}</p>\n      <button @click="start">开始</button>\n    </div>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>',
      },
      {
        path: "app.js",
        language: "javascript",
        content:
          "const { createApp, ref } = Vue;\n\ncreateApp({\n  setup() {\n    const count = ref(10);\n    const start = () => {\n      // 实现逻辑\n    };\n    return { count, start };\n  }\n}).mount('#app');",
      },
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "使用 Vue 3 响应式变量。",
        "倒计时结束（0）时数字变为红色。",
        "包含开始触发按钮。",
      ],
      requiredSelectors: [".countdown-box", "button"],
      requiredTexts: ["10", "开始"],
      evaluationRules: [
        {
          id: "vue-ref-usage",
          title: "正确使用 ref",
          description: "检查是否使用了 ref 定义状态",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["ref(", "setup()"],
          failureSeverity: "error",
          failureScoreImpact: -10,
        },
      ],
      renderConfig: {
        viewportWidth: 800,
        viewportHeight: 600,
        waitAfterLoadMs: 800,
      },
      weights: {
        correctness: 45,
        codeQuality: 25,
        uiRendering: 15,
        engineering: 15,
      },
    },
  },
  {
    id: "responsive-navbar",
    title: "响应式导航栏",
    difficulty: "easy",
    tags: ["HTML", "CSS"],
    shortDescription: "实现一个在移动端可以折叠的响应式导航栏。",
    description: "要求：桌面端水平排列导航项，移动端（<768px）隐藏导航项并显示汉堡菜单图标（可用三道杠表示）。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <nav class="navbar">\n    <div class="logo">Logo</div>\n    <ul class="nav-links">\n      <li>首页</li>\n      <li>产品</li>\n      <li>关于</li>\n    </ul>\n    <div class="menu-toggle">☰</div>\n  </nav>\n</body>\n</html>'
      },
      {
        path: "styles.css",
        language: "css",
        content: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 2rem;\n  background: #333;\n  color: white;\n}\n\n.nav-links {\n  display: flex;\n  list-style: none;\n  gap: 20px;\n}\n\n.menu-toggle {\n  display: none;\n  cursor: pointer;\n  font-size: 24px;\n}\n\n/* 在这里编写媒体查询逻辑 */'
      }
    ],
    config: {
      editableFiles: [{ path: "styles.css", language: "css", content: "" }],
      requirements: [
        "桌面端显示 .nav-links，隐藏 .menu-toggle。",
        "屏幕宽度小于 768px 时，隐藏 .nav-links，显示 .menu-toggle。",
        "使用 CSS 媒体查询实现。"
      ],
      requiredSelectors: [".navbar", ".nav-links", ".menu-toggle"],
      requiredTexts: ["首页", "☰"],
      evaluationRules: [
        {
          id: "nav-media-query",
          title: "使用了媒体查询",
          description: "检查 CSS 中是否包含 @media (max-width: 768px)",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["@media", "768px"],
          failureSeverity: "error",
          failureScoreImpact: -20
        }
      ],
      renderConfig: { viewportWidth: 1024, viewportHeight: 768, waitAfterLoadMs: 500 },
      weights: { correctness: 40, codeQuality: 20, uiRendering: 30, engineering: 10 }
    }
  },
  {
    id: "skeleton-loading",
    title: "骨架屏加载动画",
    difficulty: "easy",
    tags: ["HTML", "CSS"],
    shortDescription: "实现一个带流光效果的卡片骨架屏。",
    description: "要求实现一个常见的骨架屏效果。卡片内包含一个圆形头像区和两条长条文字区。需要有从左向右循环移动的灰白渐变流光动画。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <div class="card-skeleton">\n    <div class="avatar-skeleton"></div>\n    <div class="lines">\n      <div class="line-skeleton short"></div>\n      <div class="line-skeleton"></div>\n    </div>\n  </div>\n</body>\n</html>'
      },
      {
        path: "styles.css",
        language: "css",
        content: '.card-skeleton {\n  width: 300px;\n  padding: 20px;\n  border: 1px solid #eee;\n  display: flex;\n  gap: 15px;\n}\n\n.avatar-skeleton {\n  width: 50px;\n  height: 50px;\n  border-radius: 50%;\n  background: #eee;\n}\n\n.line-skeleton {\n  height: 12px;\n  background: #eee;\n  margin-bottom: 10px;\n  width: 200px;\n}\n\n.short { width: 100px; }\n\n/* 在这里编写流光动画 */'
      }
    ],
    config: {
      editableFiles: [{ path: "styles.css", language: "css", content: "" }],
      requirements: [
        "包含圆形和长条形的骨架占位。",
        "背景使用 linear-gradient 实现流光效果。",
        "使用 @keyframes 实现循环动画。"
      ],
      requiredSelectors: [".avatar-skeleton", ".line-skeleton"],
      requiredTexts: [],
      evaluationRules: [
        {
          id: "skeleton-animation",
          title: "定义了 CSS 动画",
          description: "检查是否使用了 @keyframes 和 linear-gradient",
          engine: "static",
          type: "keyword",
          dimension: "uiRendering",
          keywords: ["@keyframes", "linear-gradient", "infinite"],
          failureSeverity: "error",
          failureScoreImpact: -15
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 500 },
      weights: { correctness: 30, codeQuality: 20, uiRendering: 40, engineering: 10 }
    }
  },
  {
    id: "js-carousel",
    title: "简易轮播图",
    difficulty: "medium",
    tags: ["HTML", "CSS", "JavaScript"],
    shortDescription: "使用原生 JS 实现一个无缝切换的图片轮播图。",
    description: "实现一个包含 3 张图片的轮播图。要求：点击“上一张”、“下一张”按钮可以切换图片，并有平滑的过渡动画。同时需要支持每 3 秒自动切换。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <div class="carousel">\n    <div class="slides">\n      <div class="slide">1</div>\n      <div class="slide">2</div>\n      <div class="slide">3</div>\n    </div>\n    <button id="prev">上</button>\n    <button id="next">下</button>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "styles.css",
        language: "css",
        content: '.carousel {\n  width: 400px;\n  height: 200px;\n  overflow: hidden;\n  position: relative;\n}\n.slides {\n  display: flex;\n  transition: transform 0.5s ease;\n}\n.slide {\n  min-width: 400px;\n  height: 200px;\n  background: #3b82f6;\n  color: white;\n  display: grid;\n  place-items: center;\n  font-size: 50px;\n}'
      },
      {
        path: "app.js",
        language: "javascript",
        content: '// 在这里编写轮播逻辑'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "点击按钮控制 .slides 的 transform 偏移量。",
        "实现自动播放逻辑。",
        "点击上一张/下一张能正确重置定时器或更新索引。"
      ],
      requiredSelectors: [".slides", "#prev", "#next"],
      requiredTexts: [],
      evaluationRules: [
        {
          id: "carousel-js-logic",
          title: "包含定时器和事件监听",
          description: "检查代码中是否使用了 setInterval 和 addEventListener",
          engine: "static",
          type: "keyword",
          dimension: "correctness",
          keywords: ["setInterval", "addEventListener", "transform"],
          failureSeverity: "error",
          failureScoreImpact: -20
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 500 },
      weights: { correctness: 45, codeQuality: 20, uiRendering: 20, engineering: 15 }
    }
  },
  {
    id: "js-modal",
    title: "自定义模态框",
    difficulty: "medium",
    tags: ["HTML", "CSS", "JavaScript"],
    shortDescription: "实现一个带遮罩层且支持点击外部关闭的模态框。",
    description: "要求：点击“打开”按钮显示弹窗，弹窗垂直居中。点击弹窗右上角“关闭”按钮或点击遮罩层背景，弹窗消失。注意防止点击弹窗内部时触发关闭。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <button id="open-btn">打开弹窗</button>\n  <div id="overlay" class="overlay">\n    <div class="modal">\n      <h3>模态框标题</h3>\n      <p>这是内容区域</p>\n      <button id="close-btn">关闭</button>\n    </div>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "styles.css",
        language: "css",
        content: '.overlay {\n  display: none;\n  position: fixed;\n  top: 0; left: 0;\n  width: 100%; height: 100%;\n  background: rgba(0,0,0,0.5);\n  place-items: center;\n}\n.overlay.show { display: grid; }\n.modal { background: white; padding: 24px; border-radius: 8px; }'
      },
      {
        path: "app.js",
        language: "javascript",
        content: '// 在这里编写弹窗切换与事件委托逻辑'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "通过操作 .overlay 的样式或类名来控制显示/隐藏。",
        "点击 .overlay 自身（背景）时应关闭弹窗。",
        "点击 .modal 内部不应触发关闭逻辑。"
      ],
      requiredSelectors: ["#overlay", ".modal", "#open-btn"],
      requiredTexts: ["模态框标题"],
      evaluationRules: [
        {
          id: "modal-event-logic",
          title: "处理了事件冒泡或目标判断",
          description: "检查是否使用了 event.target 或 stopPropagation",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["event.target", "stopPropagation", "classList"],
          failureSeverity: "warning",
          failureScoreImpact: -10
        }
      ],
      renderConfig: { viewportWidth: 1024, viewportHeight: 768, waitAfterLoadMs: 500 },
      weights: { correctness: 40, codeQuality: 25, uiRendering: 20, engineering: 15 }
    }
  },
  {
    id: "react-form-validation",
    title: "实时表单校验器",
    difficulty: "medium",
    tags: ["React", "JavaScript"],
    shortDescription: "使用 React 实现一个带实时校验反馈的登录表单。",
    description: "要求：用户输入邮箱和密码时，实时检查格式。邮箱需符合 Email 正则，密码长度需 >= 8 位。若不符合要求，在输入框下方显示红色错误信息。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n  <style>.error { color: red; font-size: 12px; margin-top: 4px; }</style>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="text/babel" src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "app.js",
        language: "javascript",
        content: 'const { useState } = React;\n\nfunction LoginForm() {\n  const [email, setEmail] = useState("");\n  const [password, setPassword] = useState("");\n\n  // 在这里编写校验逻辑\n\n  return (\n    <form className="login-form">\n      <div>\n        <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} />\n        {/* 错误提示 */}\n      </div>\n      <div>\n        <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />\n        {/* 错误提示 */}\n      </div>\n    </form>\n  );\n}\n\nconst root = ReactDOM.createRoot(document.getElementById("root"));\nroot.render(<LoginForm />);'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "使用 React useState 管理表单状态。",
        "实时校验并显示对应的错误提示文案。",
        "使用正则表达式判断邮箱格式。"
      ],
      requiredSelectors: [".login-form", "input[type=\'email\']"],
      requiredTexts: ["邮箱"],
      evaluationRules: [
        {
          id: "react-validation-regex",
          title: "使用了正则表达式",
          description: "检查代码中是否包含邮箱校验正则",
          engine: "static",
          type: "keyword",
          dimension: "codeQuality",
          keywords: ["test(", ".match(", "@"],
          failureSeverity: "warning",
          failureScoreImpact: -10
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 1000 },
      weights: { correctness: 50, codeQuality: 20, uiRendering: 15, engineering: 15 }
    }
  },
  {
    id: "vue-virtual-list",
    title: "虚拟列表渲染优化",
    difficulty: "hard",
    tags: ["Vue", "JavaScript", "Performance"],
    shortDescription: "使用 Vue 3 实现基础的虚拟列表滚动，优化长列表性能。",
    description: "要求：模拟 10,000 条数据的列表，但在页面中只渲染可视区域内的若干个 DOM 节点。通过监听滚动事件并动态计算偏移量来实现无缝滚动。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>\n  <style>\n    .list-container { height: 400px; overflow-y: auto; position: relative; border: 1px solid #ccc; }\n    .phantom { position: absolute; left: 0; top: 0; right: 0; z-index: -1; }\n    .actual-list { position: absolute; left: 0; top: 0; right: 0; }\n    .item { height: 40px; border-bottom: 1px solid #eee; display: flex; align-items: center; padding: 0 16px; }\n  </style>\n</head>\n<body>\n  <div id="app"></div>\n  <script src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "app.js",
        language: "javascript",
        content: 'const { createApp, ref, computed } = Vue;\n\ncreateApp({\n  setup() {\n    const allItems = Array.from({ length: 10000 }).map((_, i) => `项目 ${i + 1}`);\n    const itemHeight = 40;\n    // 在这里实现虚拟列表滚动逻辑\n\n    return { allItems, itemHeight };\n  },\n  template: `\n    <div class="list-container">\n      <div class="phantom" :style="{ height: allItems.length * itemHeight + \'px\' }"></div>\n      <div class="actual-list">\n        <div v-for="item in []" class="item">{{ item }}</div>\n      </div>\n    </div>\n  `\n}).mount("#app");'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "容器高度固定，内部使用一个绝对定位的占位层支撑滚动条高度。",
        "根据滚动位置计算可见项的起始索引和偏移量。",
        "实际渲染的 DOM 节点数量应保持恒定（如 10-20 个）。"
      ],
      requiredSelectors: [".list-container", ".phantom", ".actual-list"],
      requiredTexts: ["项目"],
      evaluationRules: [
        {
          id: "vue-virtual-dom-limit",
          title: "限制了 DOM 节点数量",
          description: "检查代码中是否包含 slice 或计算可见区域的逻辑",
          engine: "static",
          type: "keyword",
          dimension: "engineering",
          keywords: ["slice(", "Math.floor(", "scrollTop"],
          failureSeverity: "error",
          failureScoreImpact: -25
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 800 },
      weights: { correctness: 40, codeQuality: 20, uiRendering: 10, engineering: 30 }
    }
  },
  {
    id: "html-semantic-article",
    title: "语义化文章结构",
    difficulty: "easy",
    tags: ["HTML"],
    shortDescription: "使用 HTML5 语义化标签构建一篇结构清晰的文章。",
    description: "要求：使用 <article>, <section>, <header>, <footer>, <aside> 等标签。文章需包含主标题、正文段落、引言块（blockquote）以及侧边栏附加信息。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<body>\n  <!-- 在这里编写语义化 HTML -->\n</body>\n</html>'
      }
    ],
    config: {
      editableFiles: [{ path: "index.html", language: "html", content: "" }],
      requirements: [
        "禁止全部使用 <div>，必须使用 5 种以上的 HTML5 语义化标签。",
        "包含一个 <aside> 标签用于展示相关链接或作者信息。",
        "包含 <footer> 标签并写有版权信息。"
      ],
      requiredSelectors: ["article", "section", "header", "footer", "aside"],
      requiredTexts: ["版权所有"],
      evaluationRules: [
        {
          id: "html-semantic-check",
          title: "标签语义化程度",
          description: "检查是否包含多种语义化标签",
          engine: "static",
          type: "selector",
          dimension: "codeQuality",
          target: "article",
          failureSeverity: "error",
          failureScoreImpact: -15
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 200 },
      weights: { correctness: 50, codeQuality: 30, uiRendering: 10, engineering: 10 }
    }
  },
  {
    id: "css-3d-flip-card",
    title: "3D 翻转卡片",
    difficulty: "medium",
    tags: ["CSS"],
    shortDescription: "实现一个鼠标悬停时进行 3D 翻转的精美卡片。",
    description: "要求：利用 transform-style: preserve-3d 实现。卡片分正反两面，初始显示正面，鼠标悬停（hover）时平滑翻转 180 度显示背面内容。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<div class="flip-card">\n  <div class="flip-card-inner">\n    <div class="flip-card-front">正面内容</div>\n    <div class="flip-card-back">背面内容</div>\n  </div>\n</div>'
      },
      {
        path: "styles.css",
        language: "css",
        content: '.flip-card {\n  perspective: 1000px;\n  width: 200px;\n  height: 300px;\n}\n.flip-card-inner {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  transition: transform 0.6s;\n  /* 需要开启 3D 空间 */\n}\n/* 在这里编写翻转样式 */'
      }
    ],
    config: {
      editableFiles: [{ path: "styles.css", language: "css", content: "" }],
      requirements: [
        "必须使用 transform-style: preserve-3d。",
        "使用 backface-visibility: hidden 隐藏背面。",
        "悬停时的动画过渡时间不少于 0.4s。"
      ],
      requiredSelectors: [".flip-card-inner", ".flip-card-front", ".flip-card-back"],
      requiredTexts: ["正面内容", "背面内容"],
      evaluationRules: [
        {
          id: "css-3d-keyword",
          title: "核心 3D 属性",
          description: "检查是否使用了 preserve-3d",
          engine: "static",
          type: "keyword",
          dimension: "uiRendering",
          keywords: ["preserve-3d", "perspective", "rotateY"],
          failureSeverity: "error",
          failureScoreImpact: -25
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 300 },
      weights: { correctness: 30, codeQuality: 20, uiRendering: 40, engineering: 10 }
    }
  },
  {
    id: "css-glassmorphism",
    title: "毛玻璃 UI 效果",
    difficulty: "easy",
    tags: ["CSS"],
    shortDescription: "实现现代化的 Glassmorphism（毛玻璃）卡片设计。",
    description: "要求：背景是一张彩色渐变图，卡片浮于其上。卡片需要有半透明背景、模糊效果（backdrop-filter）和细微的白色边框阴影。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<div class="bg-gradient">\n  <div class="glass-card">\n    <h2>Glass UI</h2>\n    <p>Modern Design Style</p>\n  </div>\n</div>'
      },
      {
        path: "styles.css",
        language: "css",
        content: '.bg-gradient {\n  height: 100vh;\n  background: linear-gradient(45deg, #ff9a9e, #fad0c4, #a1c4fd);\n  display: grid;\n  place-items: center;\n}\n.glass-card {\n  padding: 40px;\n  width: 300px;\n  /* 在这里编写毛玻璃样式 */\n}'
      }
    ],
    config: {
      editableFiles: [{ path: "styles.css", language: "css", content: "" }],
      requirements: [
        "使用 backdrop-filter: blur() 实现背景模糊。",
        "设置半透明的背景颜色（如 rgba）。",
        "添加细微的白色边框以增强玻璃质感。"
      ],
      requiredSelectors: [".glass-card"],
      requiredTexts: ["Glass UI"],
      evaluationRules: [
        {
          id: "css-backdrop-check",
          title: "背景模糊属性",
          description: "检查是否使用了 backdrop-filter",
          engine: "static",
          type: "keyword",
          dimension: "uiRendering",
          keywords: ["backdrop-filter", "blur(", "rgba("],
          failureSeverity: "error",
          failureScoreImpact: -20
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 300 },
      weights: { correctness: 30, codeQuality: 20, uiRendering: 40, engineering: 10 }
    }
  },
  {
    id: "js-digital-clock",
    title: "数字时钟 (24H)",
    difficulty: "easy",
    tags: ["JavaScript"],
    shortDescription: "使用原生 JS 实现一个每秒更新的 24 小时制数字时钟。",
    description: "要求：页面显示格式为 HH:mm:ss。当数字小于 10 时，需要在前面补 0（例如 09:05:01）。需要使用定时器实时更新。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<body>\n  <div id="clock" style="font-size: 48px; font-family: monospace;">00:00:00</div>\n  <script src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "app.js",
        language: "javascript",
        content: '// 在这里编写时钟逻辑'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "使用 Date 对象获取系统当前时间。",
        "使用 setInterval 每一秒更新一次 DOM。",
        "实现补 0 逻辑，确保显示始终为 8 位字符（含冒号）。"
      ],
      requiredSelectors: ["#clock"],
      requiredTexts: [":"],
      evaluationRules: [
        {
          id: "js-date-usage",
          title: "使用了 Date 对象",
          description: "检查代码中是否包含 new Date()",
          engine: "static",
          type: "keyword",
          dimension: "correctness",
          keywords: ["new Date()", "setInterval", "innerText", "padStart"],
          failureSeverity: "error",
          failureScoreImpact: -20
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 1100 },
      weights: { correctness: 50, codeQuality: 20, uiRendering: 10, engineering: 20 }
    }
  },
  {
    id: "js-binary-converter",
    title: "进制转换器 (二进制)",
    difficulty: "easy",
    tags: ["JavaScript"],
    shortDescription: "实现一个将十进制正整数转换为二进制字符串的逻辑。",
    description: "要求：在输入框输入十进制数字，点击按钮后在下方显示其对应的二进制表达。不得直接使用 Number.toString(2)（建议通过循环与取余逻辑实现，考察算法基础）。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<body>\n  <input type="number" id="decimal-input" placeholder="输入十进制数" />\n  <button id="convert-btn">转换</button>\n  <p id="result"></p>\n  <script src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "app.js",
        language: "javascript",
        content: '// 在这里编写转换逻辑'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "获取输入框的数值并处理点击事件。",
        "将结果输出到 #result 元素中。",
        "处理非法输入（如非数字或负数）。"
      ],
      requiredSelectors: ["#decimal-input", "#convert-btn", "#result"],
      requiredTexts: [],
      evaluationRules: [
        {
          id: "js-algorithm-logic",
          title: "算法逻辑实现",
          description: "检查是否包含循环或取余运算",
          engine: "static",
          type: "keyword",
          dimension: "correctness",
          keywords: ["while", "for", "%", "push", "reverse"],
          failureSeverity: "warning",
          failureScoreImpact: -15
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 200 },
      weights: { correctness: 60, codeQuality: 20, uiRendering: 10, engineering: 10 }
    }
  },
  {
    id: "js-drag-drop-list",
    title: "原生拖拽排序列表",
    difficulty: "hard",
    tags: ["JavaScript"],
    shortDescription: "使用 HTML5 Drag and Drop API 实现列表项的简单拖拽排序。",
    description: "要求：有一个列表，用户可以拖动任意一项。当拖动项放置在另一项上时，交换它们的位置。考察对原生拖拽事件流（dragstart, dragover, drop）的掌握。",
    templateFiles: [
      {
        path: "index.html",
        language: "html",
        content: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .list-item { padding: 10px; border: 1px solid #ccc; margin: 4px; cursor: move; background: white; }\n    .dragging { opacity: 0.5; }\n  </style>\n</head>\n<body>\n  <div id="drag-list">\n    <div class="list-item" draggable="true">项目 A</div>\n    <div class="list-item" draggable="true">项目 B</div>\n    <div class="list-item" draggable="true">项目 C</div>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>'
      },
      {
        path: "app.js",
        language: "javascript",
        content: '// 在这里编写拖拽排序逻辑'
      }
    ],
    config: {
      editableFiles: [{ path: "app.js", language: "javascript", content: "" }],
      requirements: [
        "为列表项绑定必要的拖拽事件。",
        "实现位置交换或插入逻辑。",
        "在拖拽过程中为正在拖动的元素添加特定的视觉反馈类（.dragging）。"
      ],
      requiredSelectors: ["#drag-list", ".list-item"],
      requiredTexts: ["项目 A"],
      evaluationRules: [
        {
          id: "js-drag-api-usage",
          title: "使用了原生拖拽 API",
          description: "检查代码中是否包含 dragstart 或 dragover 事件",
          engine: "static",
          type: "keyword",
          dimension: "correctness",
          keywords: ["dragstart", "dragover", "drop", "preventDefault"],
          failureSeverity: "error",
          failureScoreImpact: -25
        }
      ],
      renderConfig: { viewportWidth: 800, viewportHeight: 600, waitAfterLoadMs: 300 },
      weights: { correctness: 40, codeQuality: 20, uiRendering: 10, engineering: 30 }
    }
  },
];
