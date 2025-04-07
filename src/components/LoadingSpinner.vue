<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<template>
  <div class="spinner-container">
    <div class="spinner"></div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Загрузка данных...'
  }
});
</script>

<style lang="scss" scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-left-color: #3498db;
    animation: spin 1s ease-in-out infinite;
  }

  .spinner-message {
    margin-top: 15px;
    color: #666;
    font-size: 16px;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
