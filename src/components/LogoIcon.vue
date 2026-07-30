<script setup>
defineProps({
  size: {
    type: Number,
    default: 32
  }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="shrink-0"
  >
    <!-- 背景六边形 -->
    <path
      d="M16 2L27 8.5V23.5L16 30L5 23.5V8.5L16 2Z"
      fill="url(#logo-grad)"
      opacity="0.15"
    />
    <path
      d="M16 4L25.3 9.5V22.5L16 28L6.7 22.5V9.5L16 4Z"
      stroke="url(#logo-grad)"
      stroke-width="1.2"
      opacity="0.4"
    />

    <!-- 内层菱形发光核心 -->
    <path
      d="M16 7L23 14L16 21L9 14L16 7Z"
      fill="url(#logo-grad)"
      opacity="0.2"
    />
    <path
      d="M16 9L21 14L16 19L11 14L16 9Z"
      fill="url(#logo-grad)"
      opacity="0.35"
    />

    <!-- D 字母 -->
    <text
      x="16"
      y="20.5"
      text-anchor="middle"
      font-family="Inter, system-ui, sans-serif"
      font-weight="700"
      font-size="12"
      fill="url(#logo-grad)"
      style="letter-spacing: -0.5px"
    >D</text>

    <!-- 左上角装饰点 -->
    <circle cx="9" cy="6" r="1.2" fill="#3B82F6" opacity="0.5">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
    <!-- 右上角装饰点 -->
    <circle cx="23" cy="6" r="1" fill="#8B5CF6" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <!-- 底部装饰点 -->
    <circle cx="16" cy="26" r="0.9" fill="#06B6D4" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
    </circle>

    <!-- 上连线 -->
    <line x1="10.2" y1="5.5" x2="14.5" y2="7.5" stroke="#3B82F6" stroke-width="0.4" opacity="0.2" />
    <line x1="21.8" y1="5.5" x2="17.5" y2="7.5" stroke="#8B5CF6" stroke-width="0.4" opacity="0.2" />

    <!-- 渐变定义 -->
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3B82F6" />
        <stop offset="50%" stop-color="#8B5CF6" />
        <stop offset="100%" stop-color="#06B6D4" />
      </linearGradient>
    </defs>
  </svg>
</template>
