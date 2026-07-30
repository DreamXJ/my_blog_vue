<script setup>
function openUrl(url) {
  if (url && url !== "#") {
    window.open(url, "_blank");
  }
}

const projects = [
  {
    name: "MyBlog",
    desc: "下一代个人博客系统 — 基于 Vue3 + Vite + Tailwind CSS 构建，Markdown 驱动，支持全站搜索与标签归档。",
    tags: ["Vue3", "Vite", "Tailwind CSS"],
    url: "https://dreamxj.github.io/myblog/",
    status: "已完成",
    gradient: "from-[#3B82F6] to-[#8B5CF6]",
  },
  {
    name: "AI Toolkit",
    desc: "AI 开发工具集 — 自然语言处理管道、模型微调框架与推理部署方案。",
    tags: ["Python", "Transformers", "ONNX"],
    url: "#",
    status: "开发中",
    gradient: "from-[#06B6D4] to-[#3B82F6]",
  },
  {
    name: "Design System",
    desc: "企业级 UI 组件库 — 统一的设计语言与开发规范，提升产品构建效率。",
    tags: ["React", "Storybook", "CSS"],
    url: "#",
    status: "进行中",
    gradient: "from-[#8B5CF6] to-[#06B6D4]",
  },
  {
    name: "Dev CLI",
    desc: "开发者命令行工具 — 自动化项目脚手架、代码生成与工作流优化。",
    tags: ["Node.js", "CLI", "TypeScript"],
    url: "#",
    status: "规划中",
    gradient: "from-[#3B82F6] to-[#06B6D4]",
  },
];
</script>

<template>
  <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- 页面标题 -->
    <div class="mb-10">
      <h1
        class="text-[1.75rem] sm:text-[2.2rem] font-bold text-white tracking-[-0.02em] mb-2"
      >
        项目
      </h1>
      <p class="text-sm text-[#6B7280]">一些个人项目与开源作品</p>
    </div>

    <!-- 项目网格 -->
    <div
      v-if="projects.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <div
        v-for="proj in projects"
        :key="proj.name"
        @click="openUrl(proj.url)"
        class="glass-card rounded-g2xl p-6 cursor-pointer group"
      >
        <div class="flex items-start justify-between mb-4">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300"
          >
            <svg
              class="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full',
              proj.status === '已完成'
                ? 'bg-[rgba(34,197,94,0.08)] text-[#22C55E] border border-[rgba(34,197,94,0.1)]'
                : proj.status === '开发中'
                ? 'bg-[rgba(59,130,246,0.08)] text-[#60A5FA] border border-[rgba(59,130,246,0.1)]'
                : 'bg-[rgba(234,179,8,0.08)] text-[#EAB308] border border-[rgba(234,179,8,0.1)]',
            ]"
          >
            {{ proj.status }}
          </span>
        </div>
        <h3
          class="text-base font-semibold text-white mb-2 group-hover:text-[#60A5FA] transition-colors"
        >
          {{ proj.name }}
        </h3>
        <p class="text-sm text-[#9CA3AF] leading-relaxed mb-4 line-clamp-2">
          {{ proj.desc }}
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="tag in proj.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-20">
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-[#6B7280]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
          />
        </svg>
      </div>
      <p class="text-sm text-[#9CA3AF]">暂无项目展示</p>
      <p class="text-xs text-[#6B7280] mt-1">敬请期待</p>
    </div>
  </div>
</template>
