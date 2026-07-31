---
title: AI Agent 智能体架构：从 ReAct 到多智能体协作
description: 拆解 AI Agent 的核心循环、工具调用、记忆系统，对比主流框架并给出 7 个实战踩坑点。
date: 2026-07-31
category: AI
tags:
  - AI
  - Agent
  - 架构
  - 实战
---

# AI Agent 智能体架构：从 ReAct 到多智能体协作

如果说 LLM 是"大脑"，Agent（智能体）就是给大脑装上"手和脚"——不仅能回答问题，还能**执行任务、调用工具、自主决策**。本文从核心原理讲到多智能体协作，覆盖完整落地路径。

## 一、什么是 AI Agent

**Agent = LLM（决策核心）+ 工具（执行能力）+ 记忆（上下文）+ 循环（自主迭代）**

与单次问答的区别：

| | 普通 Chat | Agent |
|--|-----------|-------|
| 任务 | 一次性回答 | 多步骤自主完成 |
| 工具 | 无 | 可调用 API/代码/搜索 |
| 状态 | 无记忆 | 有记忆、可迭代 |
| 决策 | 用户引导 | 自主规划与纠错 |

**典型场景**：让 Agent "帮我调研竞品并生成对比报告"——它需要搜索 → 阅读 → 总结 → 写作，多次调用 LLM 并穿插工具操作。

## 二、核心机制：Agent 循环

### 1. ReAct 模式（推理 + 行动）

ReAct 是 Agent 的基础模式：**交替进行推理（Thought）和行动（Action）**，直到得到最终答案。

```
Thought: 用户想查北京的天气，我需要调用天气 API
Action: call_weather_api(city="北京")
Observation: {"temp": 28, "desc": "晴"}
Thought: 已拿到数据，可以回答用户了
Answer: 北京今天 28°C，晴天
```

### 2. 工具调用（Function Calling）

工具是 Agent 的"手"。通过 JSON Schema 声明工具，LLM 决定调哪个、传什么参数：

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询城市天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名"}
                },
                "required": ["city"],
            },
        },
    }
]

# Agent 循环核心：
while True:
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
    )
    msg = resp.choices[0].message
    if msg.tool_calls:
        # 执行工具，把结果作为新消息加入对话
        for call in msg.tool_calls:
            result = execute_tool(call.function.name, call.function.arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })
    else:
        return msg.content  # 模型不再调用工具，给出最终回答
```

## 三、Agent 的四大组件

### 1. 规划（Planning）

- **单步决策**：ReAct 循环天然支持。
- **任务分解**：复杂任务拆成子任务（Plan-and-Execute）：

```
规划器：把"写一篇博客"拆成
  1. 确定主题和大纲
  2. 搜集素材
  3. 写初稿
  4. 校对润色
执行器：逐个执行子任务
```

- **反思（Reflection）**：让模型评估自己的输出并改进，多轮迭代。

### 2. 工具（Tools）

| 工具类型 | 示例 |
|---------|------|
| 数据查询 | 数据库、API、文件读取 |
| 外部服务 | 搜索、邮件、支付 |
| 代码执行 | 沙箱 Python/JS 运行 |
| 文件操作 | 读写、转换 |

**工具设计原则**：声明要清晰（description 写清楚用途和参数含义），工具粒度适中（太粗无法组合，太细调用次数爆炸）。

### 3. 记忆（Memory）

- **短期记忆**：当前对话上下文（存在消息数组里）。
- **长期记忆**：跨会话存储（向量库 + 摘要）。

```
长期记忆（向量库）
   ↓ 检索相关记忆
短期记忆（当前任务上下文）
   ↓ 组装
LLM 决策
```

### 4. 反思与纠错

Agent 会犯错，关键是有**纠错机制**：

```
执行失败 → 读取错误信息 → 修正策略重试（限次）
结果不满意 → 反思：哪里不对？如何改进？→ 重新生成
```

## 四、主流框架对比

| 框架 | 特点 | 适用 |
|------|------|------|
| LangChain | 生态最全，工具/记忆/链丰富 | 快速搭建，概念多 |
| LlamaIndex | 数据接入与 RAG 强 | 知识库型 Agent |
| AutoGen | 多智能体对话协作 | 研究型多 Agent |
| CrewAI | 角色化多 Agent（role/task） | 团队协作场景 |
| 自研（纯代码） | 完全可控，无框架开销 | 生产级、定制需求 |

**建议**：**先用自研或轻框架跑通核心循环**（ReAct + tools + 记忆），理解原理后再决定是否引入重量级框架。框架解决的是工程便利，不是 Agent 能力。

## 五、7 个实战踩坑点

## 坑 1：无限循环与失控

**踩坑现场**：Agent 反复调用同一个工具，或陷入 Thought→Action→Observation 死循环，token 烧光。

**修复**：

```python
MAX_STEPS = 10  # 强制最大步数
steps = 0
while True:
    if steps >= MAX_STEPS:
        return "已达到最大执行步数，请优化任务描述"
    steps += 1
    ...
```

- 设置**步数上限 + token 预算上限**。
- 工具返回错误时，避免让模型原样重试——要求它**换一种策略**。

## 坑 2：工具调用参数错误

**踩坑现场**：LLM 生成的参数格式不对，或调用了不存在的工具名。

**修复**：

- 用 JSON Schema 严格定义参数。
- 解析工具调用包 try/catch，失败时把错误反馈给模型（它通常能自我修正）。
- 校验工具名白名单，防止模型编造工具名。

## 坑 3：工具执行结果太大

**踩坑现场**：SQL 查询返回 1 万行，全塞进上下文，超限且浪费。

**修复**：工具侧先聚合/截断：

```python
def query_db(sql):
    rows = db.execute(sql)
    if len(rows) > 20:
        return {"summary": f"共 {len(rows)} 行，前 20 行如下", "rows": rows[:20]}
    return {"rows": rows}
```

**原则**：**工具返回给模型的应该是"决策所需的最小信息"**，而不是原始数据。

## 坑 4：同时执行多个工具的参数绑定错乱

**踩坑现场**：模型一次要求调用多个工具（并行 tool_calls），执行结果与调用对不上号。

**修复**：严格按 `tool_call_id` 对应返回，框架（如 OpenAI SDK）已支持；自研时务必用 id 映射结果。

## 坑 5：长期记忆检索不到相关历史

**踩坑现场**：跨会话任务，Agent 忘了之前的约定。

**修复**：

- 记忆入库时带**摘要 + 关键词 + 时间戳**。
- 检索时结合"向量相似 + 时间权重"（近期记忆加权）。
- 关键信息（用户偏好）每次会话开始注入。

## 坑 6：Agent 执行了危险操作

**踩坑现场**：Agent 调用了删除接口、发送了未确认的邮件。

**修复**：**关键工具加确认机制**——危险操作返回"需要用户确认"待命，由用户批准后才真正执行：

```python
DANGEROUS_TOOLS = {"delete_user", "send_mail", "transfer_money"}

def execute_tool(name, args):
    if name in DANGEROUS_TOOLS:
        return {"status": "NEED_CONFIRMATION", "args": args}
    return real_execute(name, args)
```

## 坑 7：Agent 回答与事实不符（幻觉放大器）

**踩坑现场**：Agent 在多个推理步骤中编造了中间结果，越走越偏。

**修复**：

- 关键事实步骤要求**工具验证**而不是凭记忆（如查数据库确认）。
- 每步推理保持简短，避免长链条幻觉累积。
- 输出前让 Agent 标注哪些结论有数据依据、哪些是推断。

## 六、生产级 Agent 检查清单

- [ ] 步数上限 + token 预算
- [ ] 工具参数 schema 校验 + 白名单
- [ ] 危险操作确认机制
- [ ] 错误反馈循环（工具失败可自我修正）
- [ ] 记忆的存取与过期策略
- [ ] 日志记录完整轨迹（thought/action/observation）
- [ ] 评估：固定任务集回归测试

## 总结速查表

| 概念 | 要点 |
|------|------|
| ReAct | 推理 ↔ 行动交替循环 |
| 工具调用 | JSON Schema 声明 + 结果回填 |
| 规划 | 任务分解 + 反思迭代 |
| 记忆 | 短期上下文 + 长期向量库 |
| 纠错 | 错误反馈 + 换策略重试 |
| 框架 | 先自研跑通，再选型 |

Agent 的心法：**Agent 是"有执行力的 LLM"，不是"万能的自动化"**——它的可靠性取决于工具设计的清晰度、循环的边界（步数/预算）和危险操作的护栏。把这三件事做好，Agent 才能从"演示玩具"变成"生产工具"。
