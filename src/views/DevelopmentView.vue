<template>
  <div class="dev-container">
    <img
      class="dev-img"
      src="/public/img/development-placeholder.png"
      alt="development image"
    />
    <p class="text">This page is under development</p>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.dev-container {
  height: calc(100vh - 65px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dev-img {
  width: 30%;
  margin-bottom: 20px;
  filter: brightness(0.4) saturate(0%) invert(50%);
}

.text {
  font-size: 24px;
  color: rgb(99, 99, 99);
}
</style>
