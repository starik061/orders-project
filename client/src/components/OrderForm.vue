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
  import { ref, onMounted, onUnmounted } from 'vue'
  import IconDeleteBin from '@/components/icons/IconDeleteBin.vue'
  import IconProductList from '@/components/icons/IconProductList.vue'
  import ProductPlaceholderImg from '@/assets/img/product-placeholder.webp'

  // Вместо создания компонента с JSX, мы будем использовать встроенный SVG в шаблоне

  const emit = defineEmits(['delete-click', 'delete-product'])

  const tableContainer = ref(null)
  const isDragging = ref(false)
  const startX = ref(0)
  const scrollLeft = ref(0)
  const selectedOrder = ref(null)

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

  // Функция для выбора заказа и отображения его продуктов
  const toggleOrderProducts = (order) => {
    if (selectedOrder.value && selectedOrder.value.id === order.id) {
      // Если кликнули на уже выбранный заказ, закрываем панель
      selectedOrder.value = null
    } else {
      // Выбираем новый заказ
      selectedOrder.value = order
    }
  }

  // Функция для закрытия боковой панели с продуктами
  const closeProductsSidebar = () => {
    selectedOrder.value = null
  }

  // Функция для удаления продукта из заказа
  const deleteProductFromOrder = (product) => {
    emit('delete-product', { product, orderId: selectedOrder.value.id })
  }

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

  .orders-container {
    display: flex;
    width: 100%;
    position: relative;
    flex-direction: row; /* Принудительно задаем горизонтальное направление */
    align-items: flex-start; /* Выравниваем элементы по верхнему краю */
    gap: 16px; /* Фиксированный отступ между элементами */
  }

  .orders-table-container {
    font-family: Arial, sans-serif;
    flex: 1 1 auto; /* Растягиваем по доступной ширине */
    min-width: 0; /* Важно для корректного flex-shrink */
    width: 100%; /* Начальная ширина */
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
      flex: 0 0 25%; /* Уменьшаем ширину основной таблицы */
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

  /* Стили для боковой панели с продуктами */
  .products-sidebar {
    flex: 0 0 75%; /* Увеличиваем ширину панели продуктов */
    max-width: 75%; /* Максимальная ширина */
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    visibility: visible; /* Явно задаем видимость */
    opacity: 1;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px; /* Синхронизируем padding с header основной таблицы */
      border-bottom: 5px solid var(--color-main-grey, #e0e0e0); /* Соответствует стилю основной таблицы */

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
        font-weight: normal; /* Соответствует стилю основной таблицы */
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
        table-layout: fixed; /* Фиксированный layout для контроля ширины */

        thead th {
          padding: 10px 8px; /* Уменьшаем padding */
          font-weight: normal;
          color: #666;
          border-bottom: 5px solid var(--color-main-grey, #e0e0e0);
          text-align: left;
          white-space: nowrap; /* Предотвращаем перенос текста */
        }

        /* Уменьшаем ширину конкретных столбцов */
        .dot-column {
          width: 20px;
          max-width: 20px;
        }

        .model-column {
          width: auto; /* Этот столбец будет растягиваться */
          min-width: 200px;
        }

        .status-column {
          width: 80px;
          max-width: 80px;
          white-space: nowrap;
        }

        .action-column {
          width: 50px; /* Увеличиваем ширину, чтобы кнопка помещалась полностью */
          max-width: 50px;
          text-align: center;
        }

        tbody td {
          padding: 10px 8px; /* Уменьшаем padding */
          border-bottom: 1px solid var(--color-main-grey, #e0e0e0);
          vertical-align: middle;
        }

        .product-row {
          &:hover {
            background-color: var(--color-main-grey, #f5f5f5);
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
            width: 40px; /* Уменьшаем размер фото */
            height: 32px;
            margin-right: 8px; /* Уменьшаем отступ */
            border-radius: 4px;
          }

          .product-info {
            min-width: 0; /* Чтобы текст мог сжиматься */
            overflow: hidden; /* Скрываем переполнение */
          }

          .product-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; /* Добавляем многоточие для длинных названий */
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
          text-align: center;
          white-space: nowrap;

          .status-free {
            color: #4caf50;
          }

          .status-repair {
            color: #9e9e9e;
          }
        }

        /* Применяем те же стили для кнопки удаления, что и в основной таблице */
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
          margin: 0 auto; /* Центрируем кнопку */

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
