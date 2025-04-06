<template>
  <header>
    <nav class="top-nav">
      <RouterLink class="logo-wrapper" to="/">
        <img src="/public/img/logo.svg" alt="logo">
        <span class="logo-text">Inventory</span>
      </RouterLink>

      <input class="search-input" type="text" placeholder="поиск">

      <div class="date-time-container">
        <p>{{ getWeekdayName(new Date()) }}</p>
        <p class="day-time-wrapper">
          <span class="date">{{ getDate(new Date()) }}</span>
          <span class="time-container">
            <IconClock />
            <span class="time">{{ currentTime }}</span>
          </span>
        </p>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import IconClock from "@/components/icons/IconClock.vue";

const currentTime = ref('00:00');
let timeInterval = null;
function getWeekdayName(dateInput) {
  const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];

  const date = new Date(dateInput);
  return days[date.getDay()];
}
function getDate(dateInput) {
  const months = [
    'Янв.', 'Фев.', 'Мар.', 'Апр.', 'Мая', 'Июн.',
    'Июл.', 'Авг.', 'Сен.', 'Окт.', 'Ноя.', 'Дек.'
  ];

  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function getTime(dateInput) {
  const date = new Date(dateInput);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

onMounted(() => {
  currentTime.value = getTime(new Date())

  timeInterval = setInterval(() => {
    currentTime.value = getTime(new Date())
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})
</script>

<style lang="scss" scoped>
.top-nav {
  display: flex;
  width: 100vw;
  padding: 20px 7vw;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  background-color: #ffffff;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  margin-right: 7vw;
  gap: 10px;
}

.logo-text {
  font-weight: bold;
  text-transform: uppercase;
  color: var(--color-main-green);
}

.search-input {
  width: 21vw;
  background: #eff1f3;
  border: 1px solid #cdd3d8;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  outline: none;

  &:hover {
    border-color: #aab4be;
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.15);
    background: #f7f9fb;
  }

  &:focus,
  &:active {
    border-color: #5b9dd9;
    background: #ffffff;
    box-shadow:
      0 0 0 2px rgba(91, 157, 217, 0.2),
      inset 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  &::placeholder {
    text-transform: capitalize;
  }
}

.date-time-container {
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 5px;
  margin-left: auto;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;

}

.day-time-wrapper {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;

  @media (max-width: 650px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

.time-container {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
}
</style>
