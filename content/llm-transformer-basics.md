---
title: 大语言模型原理精讲：从 Transformer 到 GPT 的完整旅程
description: 拆解 Transformer 架构、注意力机制、预训练与微调流程，讲透 LLM 为什么"会说话"。
date: 2026-07-31
category: AI
tags:
  - AI
  - LLM
  - Transformer
  - 原理
---

# 大语言模型原理精讲：从 Transformer 到 GPT 的完整旅程

大语言模型（LLM）已经成为开发者的日常工具，但很多人对它的工作原理只有一个模糊印象："一堆参数 + 海量数据"。本文从 Transformer 架构讲起，把 LLM 的核心机制拆开揉碎，让你真正理解它为什么"会说话"。

## 一、一切的起点：注意力机制

在 Transformer 之前，RNN/LSTM 是处理序列的主流，但存在两个致命问题：

1. **长距离依赖**：句子太长时，早期的信息会被"遗忘"。
2. **无法并行**：必须逐词处理，训练极慢。

**注意力机制（Attention）** 的突破在于：不再按顺序"记忆"，而是**每次生成时直接"回看"输入中的所有位置**，并计算每个位置的重要性。

### 注意力公式

```
Attention(Q, K, V) = softmax(Q·Kᵀ / √dₖ) · V
```

- **Q（Query，查询）**：当前要关注的"问题"
- **K（Key，键）**：每个词用来被匹配的"标签"
- **V（Value，值）**：每个词携带的"内容"

流程：用 Q 和所有 K 做点积算相似度 → softmax 归一化成权重 → 按权重加权求和 V。

**直观理解**：翻译 "I love AI" 中的 "love" 时，模型会计算它与 "I"、"love"、"AI" 的相关性，发现和 "I" 关系最密切（主语），从而正确翻译。

## 二、多头注意力：从不同角度看问题

单头注意力只能学一种关系模式，多头注意力（Multi-Head Attention）把 Q/K/V 拆成多个子空间并行计算：

```
8 个头 = 8 种"视角"
  - 头 1 关注语法关系
  - 头 2 关注语义关联
  - 头 3 关注指代关系（代词指代谁）
  ...
拼接所有头的结果 → 线性变换 → 输出
```

这就像一组专家从不同角度审阅同一段文字，比单个专家看得更全面。

## 三、Transformer 的完整结构

一个 Transformer 层由两部分组成（下图是标准编码器-解码器结构）：

```
输入序列
   │
   ▼
┌──────────────────────┐
│ 多头注意力            │ ← 捕捉词与词的关系
│ + 残差连接 + 层归一化  │ ← 防止梯度消失
├──────────────────────┤
│ 前馈网络 (FFN)        │ ← 逐位置的非线性变换
│ + 残差连接 + 层归一化  │
└──────────────────────┘
   │
   ▼
输出序列
```

### 残差连接

`输出 = 层输出 + 原始输入`。好处：梯度可以"抄近道"回传，支持训练超深网络。

### 位置编码

注意力机制本身**不感知顺序**——"I love AI" 和 "AI love I" 对注意力来说是一样的。所以需要把位置信息注入：

```
位置编码(pos, 2i) = sin(pos / 10000^(2i/d))
位置编码(pos, 2i+1) = cos(pos / 10000^(2i/d))
```

正弦/余弦波让模型能通过三角函数关系推断相对位置。

## 四、从 Transformer 到 GPT：只用解码器

GPT 系列的关键简化：**只保留解码器部分**（自回归结构），因为生成式任务只需要"根据前文预测下一个词"：

```
输入: "今天天气"
   ▼
预测下一个词的概率分布: P(很好)=0.6, P(不错)=0.3, ...
   ▼
采样: "很好"
   ▼
拼接: "今天天气很好"
   ▼
继续预测下一个词...
```

### 自回归生成

```python
# 简化版：GPT 的生成循环
def generate(model, tokenizer, prompt, max_tokens=100):
    tokens = tokenizer.encode(prompt)
    for _ in range(max_tokens):
        logits = model(tokens)          # 前向传播
        next_id = sample(logits[-1])    # 从最后一个位置采样
        tokens.append(next_id)
        if next_id == tokenizer.eos_id: # 遇到结束符
            break
    return tokenizer.decode(tokens)
```

这就是为什么 GPT 的回答是"逐字生成"的——它每步只看前文，输出下一个 token。

## 五、训练三阶段：预训练、监督微调、RLHF

### 1. 预训练（Pre-training）：学会"说话"

- 数据：TB 级互联网文本。
- 任务：**预测下一个词**（Next Token Prediction）。
- 产物：基础模型（Base Model），会接话但不会"回答问题"。

```
输入: "中国的首都是"
目标: "北京"
```

### 2. 监督微调（SFT）：学会"听话"

- 数据：人工标注的 (指令, 回答) 对。
- 任务：根据指令生成符合预期的回答。
- 产物：指令模型（Instruct Model），学会对话格式。

### 3. RLHF / DPO：学会"讨喜"

- **RLHF**：训练奖励模型打分 → 用强化学习（PPO）优化策略。
- **DPO**：更简单的替代方案，直接用偏好数据做对比学习，省去奖励模型。

这一阶段让模型从"正确"走向"有用、无害、诚实"。

## 六、关键参数与概念

| 概念 | 含义 | 直觉 |
|------|------|------|
| Token | 文本切分的最小单元 | 中文约 1 字~1.5 字/token |
| 参数量 | 模型权重总数 | 7B = 70 亿参数 |
| 上下文窗口 | 一次能看的最长文本 | 4K/8K/128K |
| Temperature | 采样随机性 | 越高越有创意，越低越确定 |
| Top-p | 核采样截断 | 只从累计概率前 p 的词里采样 |
| Embedding | 词的向量表示 | 语义相近的词向量距离近 |

### Temperature 与 Top-p 的实际影响

```python
import openai

# 创意写作：高 temperature
resp = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一首关于秋天的诗"}],
    temperature=0.9,   # 天马行空
    top_p=0.95
)

# 代码生成：低 temperature
resp = openai.ChatCompletion.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一个快速排序函数"}],
    temperature=0.1,   # 稳定可靠
    top_p=0.1
)
```

## 七、部署与推理的 4 个实战要点

### 1. KV Cache：推理提速的关键

生成时每个 token 都要重新计算历史 token 的 KV 值。**KV Cache** 把历史 KV 缓存下来，只算新 token，推理速度提升数倍。代价是**显存占用随上下文增长**——长对话显存暴涨的来源。

### 2. 量化：压缩模型

```
FP16（16 位）→ INT8（8 位）→ INT4（4 位）
  精度 ↓        显存 ↓        速度 ↑（内存带宽瓶颈时）
```

7B 模型 FP16 约 14GB 显存，INT4 量化后约 4GB，普通消费级显卡可跑。

### 3. 批处理（Batching）

多个请求合并成一批前向传播，GPU 利用率大幅提升。**动态批处理**（Continuous Batching）按 token 粒度调度，是 vLLM 等推理引擎的核心优化。

### 4. 流式输出

```python
# 流式输出：逐 token 返回，用户感知延迟从"10 秒"变成"0.1 秒首字"
resp = openai.ChatCompletion.create(..., stream=True)
for chunk in resp:
    delta = chunk["choices"][0]["delta"].get("content", "")
    print(delta, end="", flush=True)
```

## 八、高频踩坑点

## 坑 1：上下文窗口不是越大越好

**踩坑现场**：长文档全塞进上下文，回答质量反而下降——"lost in the middle" 现象：模型对**开头和结尾**记得牢，**中间内容**容易被忽略。

**修复**：RAG 检索相关片段（见 RAG 专题），而不是全量塞入；重要指令放在 prompt 开头或结尾。

## 坑 2：中文 Token 数预估错误

**踩坑现场**：以为 1000 字 = 1000 token，结果 API 报超限。

**真相**：中文约 **1 个汉字 ≈ 1-1.5 个 token**（分词器按字符/子词切分），1000 字约 1200-1500 token。预留余量，或用 `tiktoken` 精确计算：

```python
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
print(len(enc.encode("你好，世界")))  # 通常 > 5
```

## 坑 3：Temperature 在代码场景用太高

**踩坑现场**：代码生成结果不稳定，同样输入每次输出不同。

**修复**：代码/结构化输出用 `temperature=0`（或 0.1），并配合 JSON 输出格式约束。

## 坑 4：忽略 Prompt 中指令的位置

**踩坑现场**：系统指令放在长上下文的中间，被"淹没"。

**修复**：**系统指令放最前面 + 结尾重申关键约束**（如"只输出 JSON"）。

## 总结速查表

| 概念 | 一句话 |
|------|--------|
| 注意力 | 生成时回看输入所有位置并加权 |
| 多头 | 多视角捕捉不同关系 |
| 残差 | 防梯度消失，支持深网络 |
| 位置编码 | 注入顺序信息 |
| GPT | 只用解码器的自回归结构 |
| 预训练 | 预测下一个词，学会说话 |
| SFT | 指令对齐，学会听话 |
| RLHF/DPO | 偏好对齐，学会讨喜 |
| KV Cache | 缓存历史 KV，推理提速 |
| 量化 | 降精度换显存 |

理解 LLM 的核心在于抓住一条主线：**Transformer 提供并行处理长序列的能力 → GPT 用自回归方式实现生成 → 三阶段训练让它从"会说话"进化到"会聊天"**。抓住这条主线，其余都是细节。
