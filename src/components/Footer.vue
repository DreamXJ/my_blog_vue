<script setup>
import LogoIcon from "@/components/LogoIcon.vue";
</script>

<template>
  <footer class="relative z-10 mt-20 border-t border-[rgba(255,255,255,0.04)]">
    <!-- 顶部发光分割线 -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.08)] to-transparent"
    ></div>

    <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
        <!-- 左侧版权 -->
        <div class="flex flex-col items-center sm:items-start gap-1">
          <div class="flex items-center gap-2">
            <LogoIcon :size="24" />
            <span class="text-sm font-medium text-white tracking-tight"
              >DreamXj</span
            >
          </div>
          <p class="text-xs text-[#6B7280]">
            &copy; {{ new Date().getFullYear() }} 保留所有权利
          </p>
        </div>

        <!-- 中间导航 -->
        <div class="flex items-center gap-5 text-xs text-[#6B7280]">
          <router-link to="/" class="hover:text-[#9CA3AF] transition-colors"
            >首页</router-link
          >
          <router-link
            to="/articles"
            class="hover:text-[#9CA3AF] transition-colors"
            >文章</router-link
          >
          <router-link
            to="/archive"
            class="hover:text-[#9CA3AF] transition-colors"
            >归档</router-link
          >
          <router-link
            to="/projects"
            class="hover:text-[#9CA3AF] transition-colors"
            >项目</router-link
          >
          <router-link
            to="/about"
            class="hover:text-[#9CA3AF] transition-colors"
            >关于</router-link
          >
        </div>

        <!-- 右侧链接 -->
        <div class="flex items-center gap-3">
          <a
            href="https://github.com/DreamXJ/my_blog_vue"
            target="_blank"
            rel="noopener noreferrer"
            class="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#6B7280] hover:text-[#60A5FA] hover:border-[rgba(59,130,246,0.15)] transition-all"
            title="GitHub"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
          <span class="text-[0.6rem] text-[#6B7280]/40 ml-1 hidden sm:inline"
            >由 Vue3 & Vite 驱动</span
          >
        </div>
      </div>
    </div>
  </footer>
</template>
