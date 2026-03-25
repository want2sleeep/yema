# 页码

MVP 骨架：面向前端作业场景的在线判题系统，支持代码提交、异步评测、结构化评分报告，以及后续接入 Playwright 和 OpenAI 兼容接口。

## 当前实现

- `apps/web`：Next.js 学生端，包含题目列表、作答页、报告页
- `apps/server`：NestJS API，包含题目、提交、评测流水线占位实现
- `packages/shared`：前后端共享类型与评分报告 schema
- 本地演示模式：
  - 题目、提交和报告由内存仓储维护
  - 提交后在进程内异步执行模拟评测任务
  - 已预留 `static-analysis / render-analysis / llm-analysis / score-aggregator` 模块边界

## 后续对接

- Redis + BullMQ：替换当前进程内队列
- PostgreSQL：替换当前内存仓储
- Playwright：替换当前渲染分析占位
- OpenAI 兼容接口：替换当前 LLM 分析占位
- Docker Judge Worker：作为第二阶段安全增强

## 建议开发顺序

1. 安装依赖并运行前后端骨架
2. 接入 PostgreSQL 和 Redis
3. 把评测流水线从占位实现替换为真实分析器
4. 引入 Playwright 渲染抓取和截图
5. 引入 LLM 结构化反馈与失败降级
