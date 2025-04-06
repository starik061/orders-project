<template>
  <TopNav />
  <SideNav />

  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'

import SideNav from '@/components/SideNav.vue'
import TopNav from '@/components/TopNav.vue'
</script>

<style lang="scss" scoped></style>
