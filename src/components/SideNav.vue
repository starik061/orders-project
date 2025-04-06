<template>
  <aside class="side-nav-container">
    <div class="avatar-wrapper">
      <img class="avatar" src="@/assets/img/avatar-placeholder.png" alt="avatar" width="90px" height="90px">
      <button class="avatar-settings-btn">
        <IconAvatarSettings class="avatar-settings-btn-icon" />
      </button>
    </div>

    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.name" class="nav-list__item">
        <RouterLink :to="item.to" class="nav-list__link" :class="{ active: isActive(item.to) }">
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>


  </aside>
</template>

<script setup>
import IconAvatarSettings from "@/components/icons/IconAvatarSettings.vue";
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', label: 'Приход' },
  { to: '/groups', label: 'Группы' },
  { to: '/products', label: 'Продукты' },
  { to: '/users', label: 'Пользователи' },
  { to: '/settings', label: 'Настройки' }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style lang="scss" scoped>
.side-nav-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 50px;
  width: fit-content;
  max-width: 300px;
  height: calc(100vh - 65px);
  background-color: #ffffff;
  padding: 50px 45px;
  box-shadow: var(--shadow-main-right);
  z-index: 0;
}

.avatar-wrapper {
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  display: inline-block;
  border-radius: 50%;
  box-shadow: var(--shadow-main);
}

.avatar {
  display: block;
  object-fit: cover;
  border-radius: 50%;
  background-color: #7cb342;
  overflow: hidden;
}

.avatar-settings-btn {
  position: absolute;
  top: 55%;
  right: 0;
  width: 45px;
  height: 45px;
  transform: translate(15%, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: var(--shadow-main);
  cursor: pointer;
}

.avatar-settings-btn-icon {
  width: 55%;
  height: 55%;
}

.nav-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 30px;
  width: 100%;
}

.nav-list__link {
  position: relative;
  display: inline-block;
  padding: 2px 0;
  color: #000000;
  text-transform: uppercase;
  font-weight: bold;

  &.active::after,
  &:hover::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    width: 110%;
    height: 3px;
    border-radius: 1.5px;
    background-color: var(--color-main-green);
  }
}
</style>
