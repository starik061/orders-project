<template>
  <div class="layout">
    <TopNav />

    <div class="layout__body">
      <SideNav class="layout__sidebar" />

      <main class="layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import SideNav from '@/components/SideNav.vue'
import TopNav from '@/components/TopNav.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout__body {
  display: flex;
  flex: 1;
}

.layout__sidebar {
  width: 240px;
  background-color: #f5f5f5;
  flex-shrink: 0;
}

.layout__content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
