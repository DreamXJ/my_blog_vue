<script setup>
import LogoIcon from "@/components/LogoIcon.vue";
</script>

<template>
  <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- 页面标题 -->
    <div class="mb-10">
      <h1
        class="text-[1.75rem] sm:text-[2.2rem] font-bold text-white tracking-[-0.02em] mb-2"
      >
        关于
      </h1>
      <p class="text-sm text-[#6B7280]">关于我与这个博客</p>
    </div>

    <!-- ── 个人资料卡 ── -->
    <div class="glass-card rounded-g2xl p-6 sm:p-8 mb-6">
      <div class="flex flex-col sm:flex-row items-start gap-6">
        <div
          class="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0"
        >
          <LogoIcon :size="44" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-semibold text-white mb-1">DreamXj</h2>
          <div class="text-sm text-[#60A5FA] font-medium mb-3">
            高级前端工程师 · 全栈开发者
          </div>
          <p class="text-sm text-[#9CA3AF] leading-relaxed mb-4">
            8 年 + Web 前端开发实战经验，具备腾讯大厂低代码平台开发经历。 精通
            Vue / React 双框架技术栈，同时具备 Node.js 与 Python 全栈开发能力。
            热爱编程，善于将技术落地到实际业务中，为团队创造价值。
          </p>
          <!-- 联系方式 -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6B7280]"
          >
            <div class="flex items-center gap-2">
              <svg
                class="w-3.5 h-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                />
              </svg>
              <span>15197948381</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-3.5 h-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a
                href="mailto:2498956471@qq.com"
                class="hover:text-[#60A5FA] transition-colors"
                >2498956471@qq.com</a
              >
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-3.5 h-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>1997.02.24</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 技能标签 ── -->
    <div class="glass-card rounded-g2xl p-6 sm:p-8 mb-6">
      <h2 class="text-base font-semibold text-white mb-4">技术栈</h2>
      <div class="space-y-4">
        <div
          v-for="group in [
            {
              label: '前端核心',
              tags: [
                'HTML5/CSS3',
                'JavaScript/ES6+',
                'TypeScript',
                'Vue2/Vue3',
                'React',
                'Tailwind CSS',
                'Sass',
                'uni-app',
                'Taro',
              ],
            },
            {
              label: '工程化与构建',
              tags: [
                'Git',
                'Webpack',
                'Vite',
                'Element Plus',
                'Ant Design',
                'Vant UI',
              ],
            },
            {
              label: '服务端与全栈',
              tags: [
                'Node.js',
                'Express/Koa2',
                'NestJS',
                'Python',
                'FastAPI/Flask',
                'WebSocket',
                'RESTful API',
              ],
            },
            {
              label: '可视化与工具',
              tags: [
                'ECharts',
                'D3.js',
                'Electron',
                'i18n/i18next',
                'Axios',
                'Webpack 优化',
              ],
            },
          ]"
          :key="group.label"
        >
          <div class="mb-2">
            <span
              class="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider"
              >{{ group.label }}</span
            >
          </div>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span v-for="tag in group.tags" :key="tag" class="tag">{{
              tag
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 工作经历 ── -->
    <div class="glass-card rounded-g2xl p-6 sm:p-8 mb-6">
      <h2 class="text-base font-semibold text-white mb-5">工作经历</h2>
      <div class="space-y-6">
        <div
          v-for="(job, i) in [
            {
              period: '2022.11 — 至今',
              company: '深圳建广数字科技有限公司',
              title: 'web前端开发',
              highlights: [
                '独立搭建 ITMS 项目架构并完成测试部署，基于 Tailwind.css 实现页面快速开发，通过 Node.js 实现项目中文词条提取与国际化翻译',
                '负责 HR 人力资源管理系统的全流程开发与部署测试，集成 file-online-preview 实现文件在线预览，实现大文件断点续传功能',
                '基于 Electron 开发跨平台终端打印桌面应用，封装打印机通信 SDK，使用 Python 搭建后端服务，通过 WebSocket 实现桌面端与后端实时通信',
                '采用 Vue3+Element Plus 开发企业级后台管理系统，搭建设备管理、打印任务管控、用户权限、数据统计等模块',
                '主导售后服务管理小程序开发，落地 NFC 设备读取、全维度国际化适配，封装优化高性能移动端树形组织选择组件',
              ],
            },
            {
              period: '2020.05 — 2022.11',
              company: '深圳腾讯科技有限公司',
              title: 'web前端开发',
              highlights: [
                '负责腾讯云市场页面重构与性能优化，完成数据埋点功能实现',
                '基于 React 全家桶 + TypeScript 搭建腾讯神笔低代码平台运行态管理后端框架，核心负责权限模块开发',
                '编写设计态拖拽组件，实现大文件分片上传、断点续传、文件秒传',
                '参与项目工程化优化，重构项目结构并优化打包配置，打包速度提升 40% 以上',
              ],
            },
            {
              period: '2019.02 — 2020.03',
              company: '深圳利郎达科技有限公司',
              title: 'web前端开发',
              highlights: [
                '主导品连优选跨境电商平台后台管理系统研发，完成总后台、供应链、供应商、卖家四大系统核心模块开发',
                '实现 i18n 中英文切换、表格导入导出、精度计算、ajax 请求封装等通用功能',
                '基于 Vue 全家桶 + Element+ECharts 开发 BI 大数据平台，实现销售、仓库、财务数据可视化展示',
              ],
            },
            {
              period: '2018.04 — 2019.01',
              company: '湖南华邦互联有限公司',
              title: 'web前端开发',
              highlights: [
                '基于 Vue 全家桶 + Vant UI 搭建爱钻客移动端兼职项目，实现下拉刷新、上拉加载、拍照上传、图片懒加载等核心功能',
                '负责幸福生活 PC/移动端项目开发，封装公共组件与函数，集成 Axios 请求封装与登录拦截',
                '运用 jQuery 完成阿里小仓 PC 端项目开发',
              ],
            },
          ]"
          :key="i"
        >
          <div class="relative pl-5 border-l border-[rgba(59,130,246,0.1)]">
            <div
              class="absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-[5.5px] rounded-full bg-gradient-primary shadow-glow-sm"
            ></div>
            <div
              class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2"
            >
              <span class="text-xs font-medium text-[#60A5FA]">{{
                job.period
              }}</span>
              <span class="text-sm font-semibold text-white">{{
                job.company
              }}</span>
              <span class="text-xs text-[#6B7280]">/ {{ job.title }}</span>
            </div>
            <ul class="space-y-1.5">
              <li
                v-for="(h, j) in job.highlights"
                :key="j"
                class="text-xs text-[#9CA3AF] leading-relaxed pl-0"
              >
                {{ h }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 教育背景 + 证书 ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
      <div class="glass-card rounded-g2xl p-6">
        <h2 class="text-base font-semibold text-white mb-4">教育背景</h2>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.06)] flex items-center justify-center shrink-0 mt-0.5"
            >
              <svg
                class="w-4 h-4 text-[#60A5FA]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-white">湖南信息学院</div>
              <div class="text-xs text-[#9CA3AF]">
                软件技术 · 2015.09 — 2018.06
              </div>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.06)] flex items-center justify-center shrink-0 mt-0.5"
            >
              <svg
                class="w-4 h-4 text-[#60A5FA]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-white">湖南农业大学</div>
              <div class="text-xs text-[#9CA3AF]">
                人力资源管理 · 2017.09 — 2020.12
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-g2xl p-6">
        <h2 class="text-base font-semibold text-white mb-4">相关证书</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="cert in [
              'Java工程师',
              'Web前端工程师',
              '微软认证网络应用开发工程师',
              '数据应用开发工程师',
              '数据管理工程师',
            ]"
            :key="cert"
            class="tag"
            >{{ cert }}</span
          >
        </div>
      </div>
    </div>

    <!-- ── 自我评价 ── -->
    <div class="glass-card rounded-g2xl p-6 sm:p-8 mb-6">
      <h2 class="text-base font-semibold text-white mb-4">自我评价</h2>
      <ul class="space-y-2 text-sm text-[#9CA3AF] leading-relaxed">
        <li class="flex items-start gap-2">
          <span class="text-[#60A5FA] mt-0.5">✦</span>
          <span
            >拥有 8 年 + Web
            前端开发实战经验，具备腾讯大厂低代码平台开发经历，对前端工程化、性能优化、低代码开发有深刻理解，能独立负责中大型前端项目的全流程开发。</span
          >
        </li>
        <li class="flex items-start gap-2">
          <span class="text-[#60A5FA] mt-0.5">✦</span>
          <span
            >精通 Vue/React
            双框架技术栈，熟练掌握前端各类核心技术与工具，同时具备 Node.js 与
            Python
            开发能力，可完成轻服务端开发与数据处理工作，形成复合技术优势。</span
          >
        </li>
        <li class="flex items-start gap-2">
          <span class="text-[#60A5FA] mt-0.5">✦</span>
          <span
            >具备较强的问题分析与解决能力，擅长处理大文件上传、国际化适配、跨端兼容等前端核心痛点，拥有良好的代码编写与注释习惯。</span
          >
        </li>
        <li class="flex items-start gap-2">
          <span class="text-[#60A5FA] mt-0.5">✦</span>
          <span
            >沟通能力与团队协作意识强，工作责任心重，抗压能力突出，开发效率高；热爱编程，具备快速自学能力，喜欢钻研新技术与新框架。</span
          >
        </li>
      </ul>
    </div>

    <!-- ── 关于本站 ── -->
    <div class="glass-card rounded-g2xl p-6 sm:p-8">
      <h2 class="text-base font-semibold text-white mb-4">关于本站</h2>
      <p class="text-sm text-[#9CA3AF] leading-relaxed mb-3">
        本站使用 Vue 3 + Vite + Tailwind CSS 构建，Markdown
        驱动内容，纯静态部署于 GitHub Pages。 所有文章以
        <code
          class="text-[#60A5FA] px-1 py-0.5 rounded bg-[rgba(59,130,246,0.06)]"
          >.md</code
        >
        文件存储在
        <code
          class="text-[#60A5FA] px-1 py-0.5 rounded bg-[rgba(59,130,246,0.06)]"
          >/content</code
        >
        目录，构建时自动解析生成静态页面。
      </p>
      <p class="text-sm text-[#9CA3AF] leading-relaxed">
        记录技术实践、项目复盘与产品思考。用代码、AI 和产品思维构建数字世界。
      </p>
      <div class="flex flex-wrap gap-2 mt-4">
        <span
          v-for="tag in [
            'Vue 3',
            'Vite',
            'Tailwind CSS',
            'Pinia',
            'Vue Router',
            'GitHub Pages',
          ]"
          :key="tag"
          class="tag"
          >{{ tag }}</span
        >
      </div>
    </div>
  </div>
</template>
