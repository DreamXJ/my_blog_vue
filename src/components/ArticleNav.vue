<script setup>
import { ref, computed } from 'vue'
import { useBlogStore } from '@/store/blog'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const store = useBlogStore()

const tagsExpanded = ref(false)
const MAX_VISIBLE_TAGS = 12

// 标签按文章数降序，默认只展示 Top N，展开后显示全部
const allTags = computed(() =>
  Object.entries(store.tags)
    .map(([name, slugs]) => ({ name, count: slugs.length }))
    .sort((a, b) => b.count - a.count)
)

const visibleTags = computed(() =>
  tagsExpanded.value ? allTags.value : allTags.value.slice(0, MAX_VISIBLE_TAGS)
)

const hasMoreTags = computed(() => allTags.value.length > MAX_VISIBLE_TAGS)

function selectTag(name) {
  emit('update:modelValue', name)
}
</script>

<template>
  <div class="mb-10">
    <!-- 标题 -->
    <div class="flex items-center gap-2 mb-3">
      <svg class="w-4 h-4 text-[#60A5FA]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      <span class="text-sm font-semibold text-white">按标签筛选</span>
      <span class="text-xs text-[#6B7280]">共 {{ allTags.length }} 个标签</span>
    </div>
    <!-- 标签列表 -->
    <div class="flex flex-wrap gap-2">
      <button
        @click="selectTag('')"
        :class="['tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all',
          !modelValue ? 'tag-active' : ''
        ]"
      >
        全部
      </button>
      <button
        v-for="tag in visibleTags"
        :key="tag.name"
        @click="selectTag(tag.name)"
        :class="['tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all',
          modelValue === tag.name ? 'tag-active' : ''
        ]"
      >
        {{ tag.name }}
        <span class="ml-1 opacity-60">({{ tag.count }})</span>
      </button>
      <button
        v-if="hasMoreTags"
        @click="tagsExpanded = !tagsExpanded"
        class="tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all hover:border-[#60A5FA]/40"
      >
        {{ tagsExpanded ? '收起' : `展开全部 (${allTags.length})` }}
        <svg class="w-3 h-3 inline-block ml-1 transition-transform duration-300" :class="tagsExpanded ? 'rotate-180' : ''" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  </div>
</template>
