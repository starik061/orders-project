<template>
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>

      <div class="modal-content">
        <slot />
      </div>

      <div class="modal-footer">
        <button
          class="btn-cancel"
          @click="$emit('cancel')"
        >
          Отменить
        </button>
        <button
          class="btn-delete"
          @click="emit('confirm', item)"
        >
          <IconDeleteBin class="forever-red" />
          <span>Удалить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import IconDeleteBin from '@/components/icons/IconDeleteBin.vue'

  defineProps({
    title: {
      type: String,
      default: 'Подтверждение действия'
    },
    item: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['cancel', 'confirm'])
</script>

<style lang="scss" scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-window {
    background-color: white;
    border-radius: 10px;
    width: 520px;
    max-width: 90%;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
    animation: fadeIn 0.2s ease-in-out;
  }

  .modal-header {
    padding: 20px;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #f0f0f0;
  }

  .modal-content {
    padding: 20px;
    font-size: 14px;
    color: #333;
  }

  .modal-footer {
    background-color: var(--color-main-green);
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    padding: 16px 20px;
    align-items: center;
  }

  .btn-cancel {
    background: none;
    border: none;
    color: white;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
  }

  .btn-delete {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    background-color: white;
    border: none;
    color: var(--color-main-red);
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    text-transform: uppercase;
    transition: background 0.2s;
  }

  .btn-delete:hover {
    background-color: #fceaea;
  }
  .forever-red {
    position: relative;
    top: -1px;
    fill: var(--color-main-red);
    line-height: 1;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
