<template>
  <aside class="side-nav">
    <div class="side-nav__avatar">
      <img class="side-nav__avatar-img" src="@/assets/img/avatar-placeholder.png" alt="avatar" />
      <button class="side-nav__avatar-btn">
        <IconAvatarSettings class="side-nav__avatar-icon" />
      </button>
    </div>

    <ul class="side-nav__list">
      <li v-for="item in navItems" :key="item.name" class="side-nav__item">
        <RouterLink :to="item.to" class="side-nav__link" :class="{ active: isActive(item.to) }">
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import IconAvatarSettings from '@/components/icons/IconAvatarSettings.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', label: 'Приход' },
  { to: '/groups', label: 'Группы' },
  { to: '/products', label: 'Продукты' },
  { to: '/users', label: 'Пользователи' },
  { to: '/settings', label: 'Настройки' }
]

const isActive = (path) => route.path === path
</script>

<style lang="scss" scoped>
.side-nav__avatar {
  position: relative;
  margin-bottom: 40px;
}

.side-nav__avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #7cb342;
  box-shadow: var(--shadow-main);
}

.side-nav__avatar-btn {
  position: absolute;
  top: 60%;
  right: -10px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-main);
  cursor: pointer;
}

.side-nav__avatar-icon {
  width: 60%;
  height: 60%;
}

.side-nav__list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}

.side-nav__link {
  position: relative;
  color: #000;
  text-transform: uppercase;
  font-weight: bold;
  padding: 4px 0;
  transition: 0.2s ease;

  &.active::after,
  &:hover::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 110%;
    height: 3px;
    background-color: var(--color-main-green);
    border-radius: 1.5px;
  }
}
</style>
