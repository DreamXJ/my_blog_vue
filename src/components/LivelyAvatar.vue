<script setup>
defineProps({
  size: {
    type: Number,
    default: 80
  }
})
</script>

<template>
  <div class="avatar-lively shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 外圈旋转渐变光环 -->
    <div class="ring ring-outer"></div>
    <!-- 内圈反向旋转光环 -->
    <div class="ring ring-inner"></div>
    <!-- 渐变核心 -->
    <div class="core">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="core-svg">
        <!-- 六边形轮廓 -->
        <path d="M16 4L25.3 9.5V22.5L16 28L6.7 22.5V9.5L16 4Z" stroke="url(#al-grad)" stroke-width="1.2" opacity="0.7"/>
        <!-- 菱形核心 -->
        <path d="M16 10L20.5 16L16 22L11.5 16L16 10Z" fill="url(#al-grad)" opacity="0.5"/>
        <!-- D 字母 -->
        <text x="16" y="20.5" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="11" fill="url(#al-grad)" letter-spacing="-0.5">D</text>
        <defs>
          <linearGradient id="al-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3B82F6"/>
            <stop offset="50%" stop-color="#8B5CF6"/>
            <stop offset="100%" stop-color="#06B6D4"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <!-- 轨道粒子 -->
    <span class="particle p1"></span>
    <span class="particle p2"></span>
    <span class="particle p3"></span>
    <!-- 状态指示点 -->
    <span class="status-dot"></span>
  </div>
</template>

<style scoped>
.avatar-lively {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  animation: breathe 4s ease-in-out infinite;
}

/* 核心呼吸浮动 */
@keyframes breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.03); }
}

/* 渐变核心 */
.core {
  position: relative;
  width: 62%;
  height: 62%;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(139, 92, 246, 0.18));
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: corePulse 3s ease-in-out infinite;
}

@keyframes corePulse {
  0%, 100% { box-shadow: 0 0 12px rgba(59, 130, 246, 0.12); }
  50% { box-shadow: 0 0 24px rgba(139, 92, 246, 0.22); }
}

.core-svg {
  width: 78%;
  height: 78%;
}

/* 旋转光环 */
.ring {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.ring-outer {
  inset: -6px;
  border: 1.5px dashed rgba(59, 130, 246, 0.25);
  animation: spin 14s linear infinite;
}

.ring-inner {
  inset: -2px;
  border: 1px solid rgba(139, 92, 246, 0.18);
  border-top-color: rgba(6, 182, 212, 0.5);
  animation: spin 8s linear infinite reverse;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 轨道粒子 */
.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.p1 {
  width: 5px;
  height: 5px;
  background: #3B82F6;
  top: 2px;
  left: 50%;
  margin-left: -2.5px;
  animation: orbit 5s ease-in-out infinite, twinkle 2.4s ease-in-out infinite;
}

.p2 {
  width: 4px;
  height: 4px;
  background: #8B5CF6;
  right: 8px;
  bottom: 18%;
  animation: orbitAlt 6s ease-in-out infinite, twinkle 3s ease-in-out infinite 0.8s;
}

.p3 {
  width: 3px;
  height: 3px;
  background: #06B6D4;
  left: 10px;
  bottom: 12%;
  animation: orbitAlt2 7s ease-in-out infinite, twinkle 2s ease-in-out infinite 1.4s;
}

@keyframes orbit {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  25% { transform: translateY(-10px); }
  50% { transform: translateX(8px) translateY(-14px); opacity: 1; }
  75% { transform: translateX(-6px) translateY(-8px); }
}

@keyframes orbitAlt {
  0%, 100% { transform: translate(0, 0); opacity: 0.5; }
  33% { transform: translate(-6px, -12px); opacity: 1; }
  66% { transform: translate(4px, -6px); opacity: 0.7; }
}

@keyframes orbitAlt2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  50% { transform: translate(10px, -8px) scale(1.4); opacity: 0.9; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 状态指示点（右下角） */
.status-dot {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22C55E;
  border: 2px solid rgba(255, 255, 255, 0.9);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
}

/* 亮色模式适配 */
.light .status-dot {
  border-color: #F7F8FB;
}

.light .core {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
}
</style>
