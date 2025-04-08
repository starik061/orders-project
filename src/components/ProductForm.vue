<template>
  <div
    ref="tableContainer"
    class="products-table-container"
    @mousedown="startDrag"
    @mouseleave="stopDrag"
  >
    <div
      v-if="isEmptyState"
      class="empty-state"
    >
      <div class="empty-icon">📦</div>
      <h3>Список продуктов пуст</h3>
      <p>В данный момент в системе нет продуктов</p>
    </div>
    <table
      v-else
      class="table"
    >
      <thead>
        <tr>
          <th></th>
          <th>Модель</th>
          <th>Статус</th>
          <th>Гарантия</th>
          <th>Состояние</th>
          <th>Стоимость</th>
          <th>Группа</th>
          <th>Ответственный</th>
          <th>Приход</th>
          <th>Дата покупки</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products"
          :key="product.id"
          class="product-row"
        >
          <td>
            <span
              class="dot"
              :class="{ 'dot-green': product.isNew === 1, 'dot-gray': product.isNew === 0 }"
            ></span>
          </td>
          <td>
            <div class="product-model">
              <img
                :src="product.photo || ProductPlaceholderImg"
                alt="Компьютер"
                class="product-photo"
              />
              <div>
                <div>{{ product.title }}</div>
                <div class="serial-number">SN {{ product.serialNumber }}</div>
              </div>
            </div>
          </td>
          <td>
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
          <td>
            <div class="date-container">
              <div>
                <span class="date-secondary">с</span> {{ formatDate(product.guarantee.start) }}
              </div>
              <div>
                <span class="date-secondary">по</span> {{ formatDate(product.guarantee.end) }}
              </div>
            </div>
          </td>
          <td>
            <div class="status-indicator">
              <span>{{ product.isNew === 1 ? 'новый' : 'б/у' }}</span>
            </div>
          </td>
          <td>
            <div class="price-container">
              <div class="secondary-price">
                {{
                  getPriceBySymbol(product.price, 'USD')
                    ? `${getPriceBySymbol(product.price, 'USD').value} USD`
                    : '—'
                }}
              </div>
              <div class="primary-price">
                {{
                  getPriceBySymbol(product.price, 'UAH')
                    ? `${getPriceBySymbol(product.price, 'UAH').value} UAH`
                    : '—'
                }}
              </div>
            </div>
          </td>
          <td>
            <div>{{ product.specification || '—' }}</div>
          </td>
          <td>
            <div>{{ getResponsible(product) }}</div>
          </td>
          <td>
            <div>{{ getOrderTitle(product) }}</div>
          </td>
          <td>
            <div class="price-container">
              <div class="secondary-price">
                {{ formatShortDateWithoutYear(product.date) }}
              </div>
              <div>{{ formatShortDate(product.date) }}</div>
            </div>
          </td>
          <td>
            <button
              class="delete-button"
              aria-label="Удалить"
              :disabled="isDeleting === product.id"
              @click="handleDeleteProductBtn(product)"
            >
              <div
                v-if="isDeleting === product.id"
                class="button-spinner"
              ></div>
              <IconDeleteBin v-else />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import ProductPlaceholderImg from '@/assets/img/product-placeholder.webp'
  import IconDeleteBin from './icons/IconDeleteBin.vue'
  import { deleteProduct } from '@/api/orders'

  const emit = defineEmits(['productDeleted', 'deleteError'])
  const isDeleting = ref(null)
  const tableContainer = ref(null)
  const isDragging = ref(false)
  const startX = ref(0)
  const scrollLeft = ref(0)

  defineProps({
    products: {
      type: Array,
      required: true
    },
    orders: {
      type: Array,
      default: () => []
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

    // Добавляем курсор-захват при перетаскивании
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

  // Получение заголовка заказа
  const getOrderTitle = (product) => {
    return product.orderTitle || '—'
  }

  // Получение ответственного
  const getResponsible = (product) => {
    return product.responsible || '—'
  }

  // Получение цены по символу валюты
  const getPriceBySymbol = (priceArray, symbol) => {
    if (!priceArray || !Array.isArray(priceArray) || priceArray.length === 0) {
      return null
    }
    return priceArray.find((price) => price.symbol === symbol) || null
  }

  // Функция для форматирования даты в формате "DD / MM / YYYY"
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day} / ${month} / ${year}`
  }

  // Функции форматирования даты
  const formatShortDate = (dateString) => {
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
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы начинаются с 0
    return `${day}/${month}`
  }
  // Функция для обработки удаления продукта
  const handleDeleteProductBtn = async (product) => {
    if (!product || !product.id) {
      console.error('Невозможно удалить продукт без ID')
      return
    }

    try {
      isDeleting.value = product.id

      // Вызываем API для удаления продукта
      const result = await deleteProduct(product.id)

      if (result.success) {
        emit('productDeleted', product.id)
      } else {
        throw new Error(result.message || 'Ошибка при удалении продукта')
      }
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error)
      emit('deleteError', { productId: product.id, error: error.message || String(error) })
    } finally {
      isDeleting.value = null
    }
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

  .products-table-container {
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
      .product-row {
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
      padding-right: 0;
      width: 20px;
      min-width: 20px;
    }

    th:nth-child(2),
    td:nth-child(2) {
      width: 250px;
      min-width: 250px;
    }

    th:nth-child(3),
    td:nth-child(3) {
      width: 80px;
      min-width: 80px;
      text-align: center;
    }

    th:nth-child(4),
    td:nth-child(4) {
      width: 145px;
      min-width: 145px;
      text-align: center;
    }

    th:nth-child(5),
    td:nth-child(5) {
      width: 30px;
      text-align: center;
    }

    th:nth-child(6),
    td:nth-child(6) {
      width: 140px;
    }

    th:nth-child(7),
    td:nth-child(7) {
      width: 140px;
    }

    th:nth-child(8),
    td:nth-child(8) {
      text-align: center;
    }

    th:nth-child(9),
    td:nth-child(9) {
      width: 280px;
    }

    th:nth-child(10),
    td:nth-child(10) {
      width: 150px;
      text-align: center;
    }

    th:last-child,
    td:last-child {
      width: 30px;
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
        width: 50px;
        height: 40px;
        margin-right: 8px;
      }
    }

    .serial-number {
      font-size: 0.85em;
      color: #666;
    }

    .status-container {
      display: inline-block;
    }

    .status {
      &-free {
        color: #4caf50;
      }

      &-repair {
        color: #9e9e9e;
      }
    }

    .date-container {
      display: flex;
      flex-direction: column;

      .date-secondary {
        font-size: 0.85em;
        color: #666;
      }
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

    .status-indicator {
      display: flex;
      flex-direction: column;

      .condition-details {
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
        fill: #ff5252;
      }

      .button-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-left-color: #666;
        animation: spin 1s linear infinite;
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
