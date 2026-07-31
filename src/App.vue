<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

const scrolled = ref(false)
function handleScroll() { scrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div class="min-h-screen flex flex-col relative">
    <div class="bg-glow"></div>
    <div class="bg-grid fixed inset-0 pointer-events-none z-[1]"></div>
    <NavBar :scrolled="scrolled" />
    <main class="relative z-10 flex-1 pt-16">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>
