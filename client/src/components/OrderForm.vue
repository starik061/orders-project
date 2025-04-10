<template>
  <div class="orders-container">
    <div
      ref="tableContainer"
      :class="['orders-table-container', { collapsed: selectedOrder }]"
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
            <th :class="{ 'hidden-column': selectedOrder }">Название</th>
            <th>Продукты</th>
            <th>Дата</th>
            <th :class="{ 'hidden-column': selectedOrder }">Стоимость</th>
            <th :class="{ 'hidden-column': selectedOrder }"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            :class="[
              'order-row',
              { 'selected-row': selectedOrder && selectedOrder.id === order.id }
            ]"
            @click="toggleOrderProducts(order)"
          >
            <td :class="{ 'hidden-column': selectedOrder }">
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
            <td :class="{ 'hidden-column': selectedOrder }">
              <div class="price-container">
                <div class="secondary-price">
                  {{ calculateTotalPrice(order, 'USD') }}
                </div>
                <div class="primary-price">
                  {{ calculateTotalPrice(order, 'UAH') }}
                </div>
              </div>
            </td>
            <td :class="{ 'hidden-column': selectedOrder }">
              <button
                class="delete-button"
                aria-label="Удалить"
                @click.stop="emit('delete-click', order)"
              >
                <IconDeleteBin />
              </button>
            </td>
            <td
              v-if="selectedOrder && selectedOrder.id === order.id"
              class="arrow-column"
            >
              <div class="arrow-indicator">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L20 12L12 20"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Боковая панель продуктов -->
    <div
      v-if="selectedOrder"
      class="products-sidebar"
    >
      <div class="sidebar-header">
        <h3>Продукты заказа "{{ selectedOrder.title }}"</h3>
        <button
          class="close-sidebar-btn"
          @click="closeProductsSidebar"
        >
          <span>&times;</span>
        </button>
      </div>

      <div
        v-if="!selectedOrder.products || selectedOrder.products.length === 0"
        class="empty-products"
      >
        <div class="empty-icon">📦</div>
        <p>В этом заказе нет продуктов</p>
      </div>

      <div
        v-else
        class="products-list-container"
      >
        <table class="products-table">
          <thead>
            <tr>
              <th class="dot-column"></th>
              <th class="model-column">Модель</th>
              <th class="status-column">Статус</th>
              <th class="action-column"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in selectedOrder.products"
              :key="product.id"
              class="product-row"
            >
              <td class="dot-column">
                <span
                  class="dot"
                  :class="{ 'dot-green': product.isNew === 1, 'dot-gray': product.isNew === 0 }"
                ></span>
              </td>
              <td class="model-column">
                <div class="product-model">
                  <img
                    :src="product.photo || ProductPlaceholderImg"
                    alt="Продукт"
                    class="product-photo"
                  />
                  <div class="product-info">
                    <div class="product-title">{{ product.title }}</div>
                    <div class="serial-number">SN {{ product.serialNumber }}</div>
                  </div>
                </div>
              </td>
              <td class="status-column">
                <div class="status-container">
                  <span
                    :class="{
                      'status-free': product.isNew === 1,
                      'status-repair': product.isNew === 0
                    }"
                  >
                    {{ product.isNew === 1 ? 'свободен' : 'в ремонте' }}
                  </span>
                </div>
              </td>
              <td class="action-column">
                <button
                  class="delete-button"
                  aria-label="Удалить"
                  @click.stop="deleteProductFromOrder(product)"
                >
                  <IconDeleteBin />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import IconDeleteBin from '@/components/icons/IconDeleteBin.vue'
  import IconProductList from '@/components/icons/IconProductList.vue'
  import ProductPlaceholderImg from '@/assets/img/product-placeholder.webp'

  const emit = defineEmits(['delete-click', 'delete-product'])

  const tableContainer = ref(null)
  const isDragging = ref(false)
  const startX = ref(0)
  const scrollLeft = ref(0)
  const selectedOrderId = ref(null)

  const selectedOrder = computed(() => {
    if (!selectedOrderId.value) return null
    return props.orders.find((order) => order.id === selectedOrderId.value) || null
  })

  const props = defineProps({
    orders: {
      type: Array,
      required: true
    },
    isEmptyState: {
      type: Boolean,
      default: false
    }
  })

  const toggleOrderProducts = (order) => {
    if (selectedOrderId.value === order.id) {
      selectedOrderId.value = null
    } else {
      selectedOrderId.value = order.id
    }
  }

  const closeProductsSidebar = () => {
    selectedOrderId.value = null
  }

  const deleteProductFromOrder = (product) => {
    emit('delete-product', {
      product,
      orderId: selectedOrderId.value
    })
  }

  const startDrag = (e) => {
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

  const doDrag = (e) => {
    if (!isDragging.value) return

    e.preventDefault()
    const x = e.pageX - tableContainer.value.offsetLeft
    const walk = (x - startX.value) * 1.5 // Множитель для ускорения скролла
    tableContainer.value.scrollLeft = scrollLeft.value - walk
  }

  const stopDrag = () => {
    isDragging.value = false
    document.body.style.cursor = ''
    document.body.classList.remove('no-select')
  }

  const getPriceBySymbol = (priceArray, symbol) => {
    if (!priceArray || !Array.isArray(priceArray) || priceArray.length === 0) {
      return null
    }
    return priceArray.find((price) => price.symbol === symbol) || null
  }

  const calculateTotalPrice = (order, currency) => {
    if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
      return '—'
    }

    const allProductsHaveCurrency = order.products.every((product) => {
      const price = getPriceBySymbol(product.price, currency)
      return price !== null
    })

    if (!allProductsHaveCurrency) {
      return '—'
    }

    const total = order.products.reduce((sum, product) => {
      const price = getPriceBySymbol(product.price, currency)
      return sum + price.value
    }, 0)

    return `${total} ${currency}`
  }

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

  .orders-container {
    display: flex;
    width: 100%;
    position: relative;
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
  }

  .orders-table-container {
    font-family: Arial, sans-serif;
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
    overflow-x: auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-height: 200px;
    cursor: grab;
    transition:
      width 0.3s ease,
      flex 0.3s ease;

    &:active {
      cursor: grabbing;
    }

    &.collapsed {
      flex: 0 0 25%;
      min-width: 250px;
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

        &.hidden-column {
          display: none;
        }
      }
    }

    tbody {
      .order-row {
        border-bottom: 1px solid var(--color-main-grey, #e0e0e0);
        transition: background-color 0.2s ease;
        cursor: pointer;

        &:hover {
          background-color: var(--color-main-grey, #f5f5f5);
        }

        &:last-child {
          border-bottom: none;
        }

        &.selected-row {
          background-color: #e3f2fd;
          position: relative;
        }
      }

      td {
        padding: 12px 12px;
        vertical-align: middle;

        &.hidden-column {
          display: none;
        }
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

    .arrow-column {
      width: 30px;
      display: table-cell;
    }

    .arrow-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2196f3;
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

  .products-sidebar {
    flex: 0 0 75%;
    max-width: 75%;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    visibility: visible;
    opacity: 1;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 5px solid var(--color-main-grey);

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
        font-weight: normal;
      }

      .close-sidebar-btn {
        background: none;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        color: #666;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }

    .empty-products {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 20px;
      text-align: center;

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #9e9e9e;
      }

      p {
        font-size: 16px;
        color: #757575;
        margin: 0;
      }
    }

    .products-list-container {
      overflow-x: auto;
      padding: 0;

      .products-table {
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;

        thead th {
          padding: 10px 8px;
          font-weight: normal;
          color: #666;
          border-bottom: 5px solid var(--color-main-grey, #e0e0e0);
          text-align: left;
          white-space: nowrap;
        }

        .dot-column {
          width: 20px;
          max-width: 20px;
        }

        .model-column {
          width: auto;
          min-width: 200px;
        }

        .status-column {
          width: 150px;
          max-width: 150px;
          white-space: nowrap;
        }

        .action-column {
          width: 120px;
          max-width: 120px;
          text-align: center;
        }

        tbody td {
          padding: 10px 8px;
          border-bottom: 1px solid var(--color-main-grey);
          vertical-align: middle;
        }

        .product-row {
          &:hover {
            background-color: var(--color-main-grey);
          }

          &:last-child td {
            border-bottom: none;
          }
        }

        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &-green {
            background-color: #4caf50;
          }

          &-gray {
            background-color: #9e9e9e;
          }
        }

        .product-model {
          display: flex;
          align-items: center;

          .product-photo {
            object-fit: cover;
            width: 40px;
            height: 32px;
            margin-right: 8px;
            border-radius: 4px;
          }

          .product-info {
            min-width: 0;
            overflow: hidden;
          }

          .product-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .serial-number {
            font-size: 0.85em;
            color: #666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .status-container {
          text-align: left;
          white-space: nowrap;

          .status-free {
            color: #4caf50;
          }

          .status-repair {
            color: #9e9e9e;
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
          margin: 0 auto;

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
            transition: fill 0.2s ease;
          }

          &:hover:not(:disabled) svg {
            fill: var(--color-main-red);
          }
        }
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
