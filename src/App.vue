<script setup>
import { RouterView } from 'vue-router'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
</script>

<template>
  <AnimatedBackground />
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
