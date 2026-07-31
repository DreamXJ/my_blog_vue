---
title: Python 进阶特性精讲：装饰器、生成器与上下文管理器
description: 从原理到实战，深入理解 Python 三大高级特性，附 8 个高频踩坑点。
date: 2026-07-31
category: Python
tags:
  - Python
  - 装饰器
  - 生成器
  - 进阶
---

# Python 进阶特性精讲：装饰器、生成器与上下文管理器

装饰器、生成器、上下文管理器是 Python 进阶路上绕不开的三大特性。它们看似花哨，实则是解决横切关注点、惰性计算、资源管理的**标准答案**。本文从原理讲到实战，帮你彻底吃透。

## 一、装饰器：给函数"穿上外套"

### 原理：函数是一等公民

在 Python 里，函数可以像变量一样传递、返回：

```python
def greet(name):
    return f"你好，{name}"

# 函数可以赋值给变量
f = greet
print(f("DreamXJ"))  # 你好，DreamXJ

# 函数可以作参数
def call_twice(func, arg):
    return func(func(arg))
```

装饰器就是"接收函数、返回新函数"的包装器：

```python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@log  # 等价于 say_hello = log(say_hello)
def say_hello():
    print("hello")
```

### 带参数的装饰器（三层嵌套）

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def hello():
    print("hi")
```

### 保留函数元信息

**坑 1：装饰后函数名/文档丢失**——`hello.__name__` 变成 `wrapper`，影响调试和文档生成。用 `functools.wraps` 修复：

```python
from functools import wraps

def log(func):
    @wraps(func)  # 复制 __name__/__doc__ 等元信息
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### 实用装饰器速查

```python
from functools import lru_cache, singledispatch

# 1. 缓存计算结果（递归加速神器）
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# 2. 单分派：按第一个参数类型分派
@singledispatch
def process(data):
    raise NotImplementedError

@process.register(str)
def _(data):
    return f"字符串: {data}"

@process.register(list)
def _(data):
    return f"列表: {len(data)} 项"
```

**坑 2：装饰器修改了函数的签名**——`inspect.signature` 看到的参数变成 `(*args, **kwargs)`。需保留签名用 `wraps` + 复杂场景考虑 `decorator` 库。

## 二、生成器：惰性求值的艺术

### 原理

生成器是**可迭代对象**，但不同于列表一次性算完——它**按需产生**下一个值，暂停在 `yield` 处：

```python
def count_up(n):
    i = 0
    while i < n:
        yield i
        i += 1

gen = count_up(3)
print(next(gen))  # 0 —— 执行到 yield 暂停
print(next(gen))  # 1
```

### 生成器表达式

```python
# 列表推导：一次全部生成，占内存
squares = [x * x for x in range(1000000)]

# 生成器表达式：惰性生成，省内存
squares_gen = (x * x for x in range(1000000))
print(sum(squares_gen))  # 用时才算
```

**坑 3：生成器只能遍历一次**——第一次 `for` 循环耗尽后，再遍历是空的：

```python
gen = (x for x in range(3))
print(list(gen))  # [0, 1, 2]
print(list(gen))  # [] —— 已经耗尽！
```

### yield from：委托给子生成器

```python
def flatten(lists):
    for sub in lists:
        yield from sub  # 把子列表的元素逐个 yield

print(list(flatten([[1, 2], [3, 4]])))  # [1, 2, 3, 4]
```

### 实战：分块读取大文件

```python
def read_chunks(file_path, size=1024):
    with open(file_path, "r", encoding="utf-8") as f:
        while chunk := f.read(size):  # 海象运算符
            yield chunk

# 处理 10GB 日志而不占满内存
for chunk in read_chunks("huge.log"):
    process(chunk)
```

## 三、上下文管理器：资源的自动管理

### 原理：__enter__ / __exit__

```python
class FileOpen:
    def __init__(self, path, mode):
        self.path = path
        self.mode = mode

    def __enter__(self):
        self.f = open(self.path, self.mode)
        return self.f  # as 语句接收的值

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.f.close()
        return False  # False = 不吞异常；True = 吞掉异常

with FileOpen("a.txt", "w") as f:
    f.write("hello")
# with 块结束（无论是否异常）都会调用 __exit__ 关闭文件
```

### contextlib：不用写类的快速方案

```python
from contextlib import contextmanager

@contextmanager
def timer(name):
    import time
    start = time.perf_counter()
    try:
        yield  # 这里是 with 块内的代码
    finally:
        print(f"{name} 耗时 {time.perf_counter() - start:.4f}s")

with timer("查询"):
    do_something()
```

### 多资源管理

```python
with open("a.txt") as fa, open("b.txt") as fb:
    data = fa.read() + fb.read()
```

## 四、8 个高频踩坑点汇总

## 坑 1：装饰器忘了 @wraps

**踩坑现场**：API 文档（FastAPI/Flask）基于 `__name__`/`__doc__` 生成，装饰后接口名全变成 `wrapper`。

**修复**：所有自定义装饰器**一律加 `@functools.wraps`**。

## 坑 2：生成器被提前耗尽

**踩坑现场**：同一个生成器传给两个函数，第二个函数拿到空数据。

**修复**：需要多次遍历时，用 `list(gen)` 物化或重新创建生成器。**生成器是"一次性水管"，不是"可回放的数据"**。

## 坑 3：装饰器叠加顺序反直觉

```python
@auth        # 外层
@log         # 内层
def api(): ...
# 执行顺序：auth(log(api)) —— 先执行 auth，auth 内部再调 log 包好的函数
```

**坑**：认为先执行 log。记住**装饰器自下而上应用，自上而下执行**。

## 坑 4：生成器函数没有立即执行

```python
def gen():
    print("开始")  # 不会立即打印！
    yield 1

g = gen()  # 此时 print 不会执行，只有 next(g) 时才执行
```

**坑**：以为调用生成器函数会执行函数体。**生成器函数调用返回生成器对象，函数体延迟到首次迭代**。

## 坑 5：上下文管理器吞掉异常

**坑**：`__exit__` 返回 `True` 会吞掉异常，业务上很危险。默认返回 `None`/`False` 是正确的；只有明确要"容忍特定异常"时才返回 True，且要按 `exc_type` 判断。

## 坑 6：yield 与 return 混用

生成器函数里 `return` 的返回值会进入 `StopIteration.value`，正常 for 循环**拿不到**：

```python
def gen():
    yield 1
    return "结束"  # for 循环拿不到这个值

for x in gen():
    print(x)  # 只有 1
```

**修复**：需要返回值用显式变量传递，或用 `yield from` 组合。

## 坑 7：装饰器修改签名导致框架报错

**坑**：`inspect.signature` 或参数校验框架（pydantic 某些场景）读取被装饰函数签名出错。

**修复**：`@wraps` 能保留大部分元信息；必要时用 `inspect.signature(wrapper, follow_wrapped=True)` 穿透。

## 坑 8：with 里 return 会不会执行 __exit__？

**答案**：**会**。`with` 块内 `return`/`raise` 都会触发 `__exit__`，这正是上下文管理器保证资源释放的原因。这也是它在异常安全上的核心价值。

## 五、三大特性实战组合

```python
from functools import wraps
from contextlib import contextmanager
import time

def retry(times=3, delay=0.1):
    """重试装饰器 + 上下文管理器组合"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if i == times - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=3)
def unstable_api():
    # 可能偶发失败的第三方调用
    return requests.get("https://api.example.com")
```

## 总结速查表

| 特性 | 核心 | 典型场景 |
|------|------|---------|
| 装饰器 | 函数包函数 | 日志、鉴权、缓存、重试 |
| 生成器 | yield 暂停/续跑 | 大文件、无限序列、流水线 |
| 上下文管理器 | __enter__/__exit__ | 文件、连接、锁、计时 |

Python 进阶的心法：**装饰器管理"行为"，生成器管理"数据流"，上下文管理器管理"资源"**。三者都是"约定优于实现"的体现——框架/标准库通过约定接口，让业务代码保持简洁。把这三大特性吃透，阅读源码和编写优雅代码的能力都会上一个台阶。
