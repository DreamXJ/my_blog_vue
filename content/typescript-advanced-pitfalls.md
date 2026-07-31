---
title: TypeScript 进阶踩坑：类型体操与 8 个实战陷阱
description: 覆盖 typeof/infer/泛型约束等类型技巧，以及配置、编译、泛型使用中的高频坑。
date: 2026-07-31
category: 前端
tags:
  - TypeScript
  - 类型系统
  - 踩坑
---

# TypeScript 进阶踩坑：类型体操与 8 个实战陷阱

TypeScript 的乐趣一半在类型系统。但类型写得好不好，直接影响开发效率和代码质量。本文整理进阶使用中最高频的 8 个坑，从类型体操技巧到工程配置。

## 坑 1：interface 与 type 的混用困惑

**踩坑现场**：一会儿用 `interface` 一会儿用 `type`，交叉类型时发现合并行为不一致。

**要点**：

- `interface`：可重复声明自动合并（declaration merging），适合描述对象形状、给第三方库补类型。
- `type`：可表示联合、交叉、元组、映射类型等一切，但不能重复声明。
- 交叉类型 `A & B` 与 interface 继承在**同名属性冲突**时的行为不同：`&` 会生成 `never` 或联合，interface 继承会直接报错。

**建议**：库 API 用 `interface`（可扩展），业务内部类型多用 `type`（组合灵活）。

## 坑 2：typeof 与 as const 让常量类型"活"起来

**踩坑现场**：定义了一堆常量，到处手写重复的字符串字面量类型，改一个全崩。

**修复**：

```typescript
export const COLORS = ['red', 'green', 'blue'] as const
export type Color = typeof COLORS[number] // 'red' | 'green' | 'blue'

export const config = { env: 'prod', timeout: 3000 } as const
// config.env 的类型是字面量 'prod'，而不是 string
```

`as const` 让对象/数组的属性变成只读字面量类型，`typeof` 提取类型，二者组合是类型与数据**单一来源**的利器。

## 坑 3：infer 与条件类型提取类型参数

**踩坑现场**：想从 `Promise<T>` 里掏出 `T`，或者拿到函数返回值类型，手写不出来。

**修复**：

```typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type A = UnwrapPromise<Promise<number>> // number

// 内置工具类型已经帮你做好的：
type B = Awaited<Promise<string>> // string
type C = ReturnType<() => boolean> // boolean
type D = Parameters<(a: string, b: number) => void> // [string, number]
```

优先使用内置的 `Awaited`、`ReturnType`、`Parameters`、`Partial`、`Pick`、`Omit`、`Record`，避免自己重复造轮子。

## 坑 4：泛型约束写错，报错信息看不懂

**踩坑现场**：

```typescript
function getLen<T>(arg: T): number {
  return arg.length // ❌ 类型 T 上不存在属性 length
}
```

**原因**：`T` 没有约束，编译器不知道它有 `length`。

**修复**：

```typescript
interface HasLength { length: number }
function getLen<T extends HasLength>(arg: T): number {
  return arg.length // ✅ 约束 T 必须有 length
}
```

记住：**泛型参数默认是"任意类型"**，要访问它的属性必须用 `extends` 约束。这也是报错 "Type 'T' is not assignable" 的最高频来源。

## 坑 5：strict 模式关闭，类型等于形同虚设

**踩坑现场**：`tsconfig.json` 里没开 `strict`，`null` 到处传、`any` 满天飞，TypeScript 变成 "AnyScript"。

**修复**：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

`strict: true` 一次性开启所有严格检查。**生产项目必须开 strict**，这是 TypeScript 价值的下限。

## 坑 6：vite + ts 项目类型检查没跑

**踩坑现场**：`npm run build` 成功了，但 IDE 里一堆类型报错；或反过来，构建时类型错误被忽略直接出包。

**原因**：Vite 用 esbuild 转译 TS，**只去类型、不检查类型**。`vite build` 不会帮你做类型检查。

**修复**：在 package.json 里加一步：

```json
{
  "scripts": {
    "build": "vue-tsc --noEmit && vite build",
    "type-check": "vue-tsc --noEmit"
  }
}
```

Vue 项目用 `vue-tsc`（能识别 `.vue` 文件），React/纯 TS 用 `tsc --noEmit`。

## 坑 7：枚举 enum 的运行时开销与联合类型对比

**踩坑现场**：项目里大量用 `enum`，打包体积膨胀；或 `const enum` 在编译期内联导致跨文件使用时出 bug。

**要点**：

- 普通 `enum` 编译后会生成**运行时对象**，有体积和命名空间污染问题。
- `const enum` 会内联，但开启 `isolatedModules`（Vite 默认场景）时**不被支持**，会报错。

**替代方案**：用 `as const` + 联合类型（坑 2 的做法）实现同样效果，零运行时开销：

```typescript
export const Status = {
  Draft: 'draft',
  Published: 'published',
} as const
export type Status = typeof Status[keyof typeof Status]
```

## 坑 8：函数重载的顺序与实现签名

**踩坑现场**：

```typescript
function format(v: string): string
function format(v: number): string
function format(v: unknown): string { // 实现签名必须兼容所有重载
  return String(v)
}
```

**要点**：

- 重载**声明必须排在实现签名之前**。
- 实现签名对外不可见，参数类型要能兼容所有重载（常用 `unknown` 或联合）。
- 调用时按声明顺序匹配**第一个**满足的重载，顺序写反会匹配错。

## 实战：写一个"根据配置生成类型"的完整案例

```typescript
// 路由表：单一数据源
export const routes = [
  { path: '/home', name: 'Home' },
  { path: '/about', name: 'About' },
] as const

// 从数据推导出路径联合类型
export type RoutePath = typeof routes[number]['path'] // '/home' | '/about'

// 用映射类型做"路径 → 名称"查表
type RouteName = Record<RoutePath, string>
```

这样加新路由只改 `routes`，类型自动更新，杜绝拼错路径字符串。

## 总结速查

| 坑 | 解法 |
|----|------|
| interface/type 混用 | interface 可合并，type 更灵活 |
| 常量类型重复 | as const + typeof 提取 |
| 提取内层类型 | infer / Awaited / ReturnType |
| 泛型没约束 | T extends 接口 |
| strict 没开 | strict: true |
| vite 不查类型 | vue-tsc --noEmit 加进构建 |
| enum 膨胀 | as const + 联合类型替代 |
| 重载顺序 | 声明在前，实现兼容全部 |

类型系统的进阶路径：**先吃透内置工具类型，再掌握 typeof/as const/infer 三件套**，工程上能解决 90% 的场景，最后才需要去写复杂体操。
