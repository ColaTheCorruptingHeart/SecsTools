# SECS Tools

一款专为半导体设备联机、调试与现场排障打造的 SECS/GEM 工具箱，由 FAB 一线 EAP 工程师以 Vibe Coding 开发。

SECS Tools 将常用的 SML 报文处理、SECS 日志分析、SVID 提取、Slot Map 转换和 RecipeBody 分析能力集中在一个 Web 应用中。项目采用纯前端架构，业务数据直接在浏览器内处理，无需配套后端服务，适合本地运行、内网部署或托管为静态站点。


## 为什么使用 SECS Tools

- **贴近工程现场**：围绕设备接入、报文联调、日志定位等真实场景设计，而不是通用工具的简单集合。
- **数据留在本地**：报文、日志与配方数据在浏览器端完成解析；偏好设置和少量历史记录保存在 `localStorage`。
- **兼容多种输入**：SML 解析器支持类型别名、计数写法、字段标签、注释、多根节点和常见日志包装格式。
- **大输入更流畅**：格式化、日志分析、语义对比和 RecipeBody 分析等重任务通过 Web Worker 执行。
- **便于私有化部署**：构建产物为静态文件，并提供 PWA 支持，可安装为桌面式 Web 应用。

## 内置工具

| 分类 | 工具 | 能力 |
| --- | --- | --- |
| 通用数据处理 | JSON 格式化 | 校验、格式化与压缩 JSON 数据 |
| 通用数据处理 | 进制转换 | 批量进行进制转换，并保留本地历史记录 |
| 通用数据处理 | ASCII / Hex 转换 | 大块文本、ASCII 与十六进制数据互转 |
| 通用数据处理 | 通用差异对比 | 左右并排比较文本，支持大文本按需渲染 |
| SECS 报文 | SML 构造器 | 通过参数表、结构树或 GEM 模板创建 SML，支持严格校验、长度标识和节点上下文操作 |
| SECS 报文 | SECS SML 格式化 | 格式化原始报文，提供宽松/严格解析、诊断定位和层级路径点选 |
| SECS 报文 | S1F12 SVID 提取 | 从 S1F12 中提取 SVID、SVNAME 和 UNITS，支持备注编辑与结构化命名的 CSV 导出 |
| SECS 报文 | S1F3 生成器 | 根据 SVID 列表生成指定数据格式的 S1F3 W 命令 |
| SECS 报文 | S1F4 解析 | 将 S1F4 返回值与 SVNAME 映射顺序对齐展示 |
| SECS 报文 | Slot 转换工具 | 在 25 槽位、数字映射、map、U1 List、反相结果和区间表达式之间转换 |
| SECS 报文 | RecipeBody 分析器 | 统一分析 PPBODY、Hex、字节数组和文件输入，并支持无损导出 |
| 日志分析 | SECS 日志时间线分析 | 提取关键事件并按时间线展示，支持消息块操作、CEID 规则、范围标记、跳转及多种结构化导出 |
| 日志分析 | SECS 日志语义差异 | 按消息块、字段路径与关键语义比较两份 SECS/SML 作业日志 |

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm 10 或更高版本

### 本地开发

```bash
git clone https://github.com/ColaTheCorruptingHeart/SecsTools.git
cd SecsTools
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:63897>。

### 构建与预览

```bash
npm run build
npm run preview
```

生产构建输出到 `dist/`。`npm run build` 会先执行 Vue/TypeScript 类型检查，再生成构建产物。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 执行类型检查并构建生产版本 |
| `npm run build-only` | 仅执行 Vite 构建 |
| `npm run type-check` | 执行 Vue 与 TypeScript 类型检查 |
| `npm run lint` | 使用 Oxlint 和 ESLint 检查并自动修复代码 |
| `npm test` | 运行 Vitest 单元测试与集成测试 |
| `npm run test:watch` | 以监听模式运行 Vitest |
| `npm run test:e2e` | 运行 Playwright 端到端测试 |
| `npm run preview` | 本地预览生产构建 |

首次运行端到端测试时，可能需要安装 Playwright 浏览器：

```bash
npx playwright install chromium
```

## 部署

`dist/` 可以部署到任意静态文件服务。项目使用 Vue Router 的 History 模式，部署时需要将无法匹配的前端路由回退到 `index.html`；否则直接访问 `/tools/...` 地址时可能返回 404。

若要启用完整的 PWA 安装与缓存能力，生产环境应通过 HTTPS 提供服务（`localhost` 除外）。

## 技术栈

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) + [Vue Router](https://router.vuejs.org/)
- [Element Plus](https://element-plus.org/) + [Tailwind CSS](https://tailwindcss.com/)
- [CodeMirror 6](https://codemirror.net/)
- [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

界面状态与交互色以 Element Plus 语义色为准，Tailwind CSS 主要负责布局和语义类映射。SML 数据类型、日志规则和差异标记保留独立的业务辨识色。

## 项目结构

```text
SecsTools/
├─ src/
│  ├─ components/        通用组件
│  ├─ composables/       可复用的组合式逻辑
│  ├─ config/            工具清单、版本与更新说明
│  ├─ layout/            应用布局
│  ├─ router/            路由配置
│  └─ views/tools/       工具页面、领域逻辑与 Web Worker
├─ tests/e2e/            Playwright 端到端测试
├─ docs/                 设计与解析能力文档
├─ public/               静态资源
└─ vite.config.ts        构建、开发服务器与 PWA 配置
```

工具入口集中配置在 `src/config/tools.ts`。新增工具时，在 `src/views/tools/` 中实现页面并在该配置文件中注册，路由与导航会自动生成。

## 文档与协作

- [SML 解析器说明](docs/sml-parser.md)：支持的语法、日志包装格式、诊断契约与资源限制。
- [更新日志](CHANGELOG.md)：版本功能与修复记录。
- [贡献指南](CONTRIBUTING.md)：开发约定、提交流程与 Pull Request 要求。
- [安全策略](SECURITY.md)：安全问题的报告方式。

欢迎通过 [Issue](https://github.com/ColaTheCorruptingHeart/SecsTools/issues) 提交问题或建议，也欢迎发起 Pull Request。提交现场日志或报文样本前，请务必移除设备标识、客户信息、账号及其他敏感数据。

## License

本项目基于 [MIT License](LICENSE) 开源。
