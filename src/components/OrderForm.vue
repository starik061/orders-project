<template>
  <div
    ref="tableContainer"
    class="orders-table-container"
    @mousedown="startDrag"
    @mouseleave="stopDrag"
  >
    <div
      v-if="isEmptyState"
      class="empty-state"
    >
      <div class="empty-icon">📋</div>
      <h3>Список заказов пуст</h3>
      <p>В данный момент в системе нет заказов</p>
    </div>
    <table
      v-else
      class="table"
    >
      <thead>
        <tr>
          <th>Название</th>
          <th>Продукты</th>
          <th>Дата</th>
          <th>Стоимость</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in orders"
          :key="order.id"
          class="order-row"
        >
          <td>
            <div class="order-title">
              <div>{{ order.title }}</div>
              <div class="order-number">№ {{ order.number || order.id }}</div>
            </div>
          </td>
          <td>
            <div class="products-list">
              <span class="products-list__icon-wrapper">
                <IconProductList />
              </span>
              <span v-if="order.products && order.products.length">
                {{ order.products.length }} шт.
              </span>
              <span v-else>—</span>
            </div>
          </td>
          <td>
            <div class="price-container">
              <div class="secondary-price">
                {{ formatShortDateWithoutYear(order.date) }}
              </div>
              <div>
                {{ formatShortDate(order.date) }}
              </div>
            </div>
          </td>
          <td>
            <div class="price-container">
              <div class="secondary-price">
                {{ calculateTotalPrice(order, 'USD') }}
              </div>
              <div class="primary-price">
                {{ calculateTotalPrice(order, 'UAH') }}
              </div>
            </div>
          </td>
          <td>
            <button
              class="delete-button"
              aria-label="Удалить"
              @click="emit('delete-click', order)"
            >
              <IconDeleteBin />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import IconDeleteBin from './icons/IconDeleteBin.vue'
  import IconProductList from './icons/IconProductList.vue'

  const emit = defineEmits(['delete-click'])

  const tableContainer = ref(null)
  const isDragging = ref(false)
  const startX = ref(0)
  const scrollLeft = ref(0)

  defineProps({
    orders: {
      type: Array,
      required: true
    },
    isEmptyState: {
      type: Boolean,
      default: false
    }
  })

  // Функция для начала перетаскивания
  const startDrag = (e) => {
    // Проверяем, не взаимодействует ли пользователь с кнопкой или другим интерактивным элементом
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
      return
    }

    isDragging.value = true
    startX.value = e.pageX - tableContainer.value.offsetLeft
    scrollLeft.value = tableContainer.value.scrollLeft

    document.body.style.cursor = 'grabbing'

    // Добавляем класс для предотвращения выделения текста при перетаскивании
    document.body.classList.add('no-select')
  }

  // Функция для процесса перетаскивания
  const doDrag = (e) => {
    if (!isDragging.value) return

    e.preventDefault()
    const x = e.pageX - tableContainer.value.offsetLeft
    const walk = (x - startX.value) * 1.5 // Множитель для ускорения скролла
    tableContainer.value.scrollLeft = scrollLeft.value - walk
  }

  // Функция для завершения перетаскивания
  const stopDrag = () => {
    isDragging.value = false
    document.body.style.cursor = ''
    document.body.classList.remove('no-select')
  }

  // Получение цены по символу валюты из объекта продукта
  const getPriceBySymbol = (priceArray, symbol) => {
    if (!priceArray || !Array.isArray(priceArray) || priceArray.length === 0) {
      return null
    }
    return priceArray.find((price) => price.symbol === symbol) || null
  }

  // Расчет общей суммы цен продуктов в заказе
  const calculateTotalPrice = (order, currency) => {
    // Если у заказа нет продуктов, возвращаем тире
    if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
      return '—'
    }

    // Проверяем, есть ли у всех продуктов цена в данной валюте
    const allProductsHaveCurrency = order.products.every((product) => {
      const price = getPriceBySymbol(product.price, currency)
      return price !== null
    })

    // Если хотя бы у одного продукта нет цены в данной валюте, возвращаем тире
    if (!allProductsHaveCurrency) {
      return '—'
    }

    const total = order.products.reduce((sum, product) => {
      const price = getPriceBySymbol(product.price, currency)
      return sum + price.value
    }, 0)

    return `${total} ${currency}`
  }

  // Функции форматирования даты
  const formatShortDate = (dateString) => {
    if (!dateString) return '—'

    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const months = [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек'
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} / ${month} / ${year}`
  }

  const formatShortDateWithoutYear = (dateString) => {
    if (!dateString) return '—'

    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }

  onMounted(() => {
    window.addEventListener('mousemove', doDrag)
    window.addEventListener('mouseup', stopDrag)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', doDrag)
    window.removeEventListener('mouseup', stopDrag)
  })
</script>

<style lang="scss" scoped>
  /* Стиль для предотвращения выделения текста при перетаскивании */
  :global(.no-select) {
    user-select: none;
  }

  .orders-table-container {
    font-family: Arial, sans-serif;
    width: 100%;
    overflow-x: auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-height: 200px;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 20px;
      text-align: center;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 20px;
        color: #9e9e9e;
      }

      h3 {
        font-size: 20px;
        color: #424242;
        margin: 0 0 10px 0;
      }

      p {
        font-size: 16px;
        color: #757575;
        margin: 0;
      }
    }

    .table {
      border-collapse: collapse;
      border-spacing: 0;
      table-layout: fixed;
      width: auto;
      min-width: 100%;
    }

    thead {
      th {
        padding: 12px 12px;
        text-align: left;
        font-weight: normal;
        color: #666;
        border-bottom: 5px solid var(--color-main-grey, #e0e0e0);
        text-align: center;
      }
    }

    tbody {
      .order-row {
        border-bottom: 1px solid var(--color-main-grey, #e0e0e0);
        transition: background-color 0.2s ease;

        &:hover {
          background-color: var(--color-main-grey, #f5f5f5);
        }

        &:last-child {
          border-bottom: none;
        }
      }

      td {
        padding: 12px 12px;
        vertical-align: middle;
      }
    }

    th:first-child,
    td:first-child {
      width: 250px;
      min-width: 250px;
    }

    th:nth-child(2),
    td:nth-child(2) {
      width: 100px;
      min-width: 100px;
      text-align: center;
    }

    th:nth-child(3),
    td:nth-child(3) {
      width: 150px;
      min-width: 150px;
      text-align: center;
    }

    th:nth-child(4),
    td:nth-child(4) {
      width: 140px;
      min-width: 140px;
    }

    th:last-child,
    td:last-child {
      width: 30px;
      min-width: 30px;
      text-align: center;
    }

    .order-title {
      display: flex;
      flex-direction: column;

      .order-number {
        font-size: 0.85em;
        color: #666;
      }
    }

    .products-list {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 7px;
    }
    .products-list__icon-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--color-main-grey);
    }
    .price-container {
      display: flex;
      flex-direction: column;

      .primary-price {
        font-weight: 500;
      }

      .secondary-price {
        font-size: 0.85em;
        color: #666;
      }
    }

    .delete-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.1);
        transform: scale(0.95);
      }

      &:disabled {
        cursor: default;
        opacity: 0.6;
      }

      svg {
        width: 18px;
        height: 18px;
        fill: #666;
        transition: color 0.2s ease;
      }

      &:hover:not(:disabled) svg {
        fill: var(--color-main-red);
      }
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
