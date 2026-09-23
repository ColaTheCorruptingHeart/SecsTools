# SML 解析器说明

SECS Tools 使用统一的 SML 解析器处理不同厂商和日志系统输出的报文。核心实现位于 `src/views/tools/secs-log/sml.ts`，应用内其他模块应优先通过 `src/views/tools/secsSml.ts` 提供的公共入口使用它。

当前接入该解析能力的功能包括：

- SECS SML 格式化与通用文本对比中的 SML 预处理
- SML 构造器的源码导入、严格校验和复制格式化
- SECS 日志时间线分析
- SECS 日志语义差异分析
- S1F12 SVID 提取与 S1F4 解析
- Slot Map 的 U1 List 校验与转换

## 支持的 SML 形式

| 能力 | 示例 |
| --- | --- |
| 报文头 | `S6F11 W`、`S 6 F 11`，可省略 `W` |
| 标准短类型 | `L B BOOLEAN A JIS8 I1 I2 I4 I8 U1 U2 U4 U8 F4 F8` |
| 宽泛短类型 | `I U F J` |
| 长类型别名 | `LIST BINARY BOOL ASCII INT8..64 UINT8..64 FLOAT32 FLOAT64` |
| 逗号计数 | `<L,3`、`<U4,1 100>` |
| 方括号计数 | `<L [3]`、`<ASCII[4] "TEMP">` |
| 裸列表计数 | `<L 3` |
| 字段标签 | `<U4 [CEID] 5>`、`<U4 {CEID} 5>` |
| 紧凑与多行结构 | `<L,1<A "OK">>` 或逐行缩进 |
| 字符串引号 | 单引号、双引号，以及字符串内的 `>` |
| 注释 | 节点之间的 `//`、`--`、`/* ... */` |
| 报文终止符 | `.` 或 `;`，包括无数据报文 |
| 多根节点 | 同一输入中的连续 SML 根节点 |

解析器会规范化报文头中的空格和数字形式，但保留数据节点的类型、声明计数、标签、值、子节点及源码范围。它只负责语法恢复和结构化，不验证某个 Stream/Function 是否符合 SEMI 标准定义。

## 宽松与严格模式

`parseSmlTree` 默认使用 `lenient` 模式。

| 模式 | 行为 | 适合场景 |
| --- | --- | --- |
| `lenient` | 尽可能恢复 AST；可恢复问题记录为 `warning` | 厂商日志导入、现场排障、时间线分析 |
| `strict` | 将可恢复问题提升为 `error` | 构造器源码导入、用户确认前校验、测试 |

输入超限、节点缺少结束符、List 未闭合、节点数超限和嵌套过深等无法安全恢复的问题，在两种模式下始终是 `error`。

## 基本用法

```ts
import {
  formatSecsSml,
  parseSmlTree,
  summarizeSmlDiagnostics,
} from './secsSml'

const parsed = parseSmlTree(source, {
  mode: 'strict',
  additionalTypes: ['X2'],
})

const summary = summarizeSmlDiagnostics(parsed)
if (summary.isUsable) {
  const formatted = formatSecsSml(source, {
    mode: 'strict',
    removeLengthIndicators: true,
  })
  console.log(formatted.text)
}
```

`SmlParseOptions` 支持以下选项：

| 选项 | 作用 |
| --- | --- |
| `mode` | 选择 `lenient` 或 `strict` 模式 |
| `removeLengthIndicators` | 格式化时隐藏字符类型的长度标识，不改变解析后的数据 |
| `additionalTypes` | 为本次解析注册额外的厂商数据类型 |
| `maxInputLength` | 限制输入字符数 |
| `maxNodes` | 限制解析节点数 |
| `maxDepth` | 限制 List 嵌套深度 |

`summarizeSmlDiagnostics(parsed).isUsable` 仅在至少解析到一个根节点且不存在错误时为 `true`。调用方不应只判断 `roots.length` 后继续处理。

## 日志包裹形式

解析日志时支持行内时间戳和方括号时间戳。日期可以使用 `-`、`/`、`.` 或 `YYYYMMDD`，小数秒可以使用 `.` 或 `,`。方向标记支持：

```text
SEND RECV SENT RECEIVED TX RX
H->E E->H HOST->EQUIPMENT EQUIPMENT->HOST
```

时间戳与方向之间允许存在一个或多个日志级别或线程标记，例如 `[worker-7]`、`(thread-2)`、`INFO`。也支持时间戳行与独立 `SxFy` 行组合的日志。

日志包裹识别由 `secs-log/log-dialect.ts` 和 `secs-log/log-message-blocks.ts` 等模块负责；SML 解析器只处理提取后的报文结构。新增日志方言时，不应把特定厂商的整行规则直接加入 SML 节点解析逻辑。

## 诊断契约

每条 `SmlDiagnostic` 都包含稳定的 `code`、`severity`、`line`、`column`、`start` 和 `end`。行列号从 1 开始，`start`/`end` 是原始字符串中的偏移范围，可用于编辑器定位。

| 诊断代码 | 含义 |
| --- | --- |
| `no-sml-node` | 未找到可识别的 SML 数据节点 |
| `unknown-data-type` | 数据类型不在内置类型或 `additionalTypes` 中 |
| `missing-node-close` | 标量节点缺少 `>` |
| `unclosed-list` | List 没有闭合 |
| `declared-count-mismatch` | List 声明项数与实际子节点数不一致 |
| `unexpected-text` | List 内包含无法识别的文本 |
| `unexpected-close` | 存在未匹配的 `>` |
| `nesting-depth-exceeded` | 超过嵌套深度限制 |
| `node-limit-exceeded` | 超过节点数限制 |
| `input-size-exceeded` | 超过输入字符数限制 |

各业务功能遵循以下处理原则：

- 格式化器展示恢复后的结果和完整诊断，并允许跳转到原文。
- 时间线只使用可用 AST 进行路径取值，并保留消息级诊断。
- 语义差异将致命诊断转换为 `parse_error`；可恢复警告随语义事件保留并汇总。
- S1F12 返回结构化诊断和兼容的警告文案，诊断可跳转到源码。
- 构造器和 Slot 转换在应用用户输入前使用严格模式校验。

## 资源限制

默认限制由 `SML_PARSE_LIMITS` 统一定义：

| 资源 | 默认上限 |
| --- | --- |
| 输入长度 | 8 MiB 字符文本 |
| 节点数量 | 100,000 |
| 嵌套深度 | 256 层 |

调用方可以通过 `SmlParseOptions` 下调限制。不要为了接收超大输入而随意提高默认值，也不要在 UI 线程直接处理大输入；应用页面中的重解析任务应继续通过 Web Worker 执行。

这些限制只针对单次 SML 解析。日志时间线导入还受 `src/views/tools/log-timeline/config.ts` 中的独立限制约束，当前上限为 100 MiB、900,000 行。

## 扩展与测试要求

- 新增厂商数据类型时，优先使用 `additionalTypes`，不要直接扩大所有调用方的根节点识别范围。
- 新增 SML 语法时，在 `src/views/tools/secs-log/__tests__/sml.spec.ts` 中覆盖宽松、严格、错误恢复和源码定位。
- 新增日志包裹形式时，同时补充日志方言/消息块测试和至少一个业务消费测试。
- 修改 AST、诊断代码或 `isUsable` 语义属于跨工具变更，需要验证格式化、时间线、语义差异、S1F12、S1F4、Slot 转换和构造器等消费方。
- 测试输入必须脱敏，不要提交真实设备、客户或生产环境数据。

返回 [README](../README.md) 或查看 [贡献指南](../CONTRIBUTING.md)。
