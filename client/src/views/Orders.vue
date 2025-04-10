<template>
  <div class="orders-container">
    <div
      v-if="loadingGlobal"
      class="spinner-container"
    >
      <div class="spinner"></div>
      <p class="spinner-message">Загрузка данных...</p>
    </div>
    <div
      v-else-if="error"
      class="error-message"
    >
      <div class="error-icon">❌</div>
      <div>
        <h3>Ошибка загрузки данных</h3>
        <p>{{ error }}</p>
        <button
          class="retry-button"
          @click="retryLoading"
        >
          Попробовать снова
        </button>
      </div>
    </div>
    <OrderForm
      v-else
      :orders="filteredOrders"
      :is-empty-state="!filteredOrders.length"
      @delete-click="openDeleteModal"
      @delete-product="openDeleteProductModal"
    />

    <!-- Модальное окно для удаления заказа -->
    <Modal
      v-if="showOrderModal"
      :title="'Вы уверены, что хотите удалить этот приход?'"
      :item="selectedOrder"
      @cancel="showOrderModal = false"
      @confirm="deleteOrder"
    >
      <template #default>
        <div class="item-row">
          <span class="dot"></span>
          <div>
            <div>{{ selectedOrder?.title }}</div>
            <div class="item-sn">№ {{ selectedOrder?.number || selectedOrder?.id }}</div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Модальное окно для удаления продукта -->
    <Modal
      v-if="showProductModal"
      :title="'Вы уверены, что хотите удалить этот продукт?'"
      :item="selectedProduct?.product"
      @cancel="showProductModal = false"
      @confirm="deleteProduct"
    >
      <template #default>
        <div class="item-row">
          <span
            class="dot"
            :class="{
              'dot-green': selectedProduct?.product?.isNew === 1,
              'dot-gray': selectedProduct?.product?.isNew === 0
            }"
          ></span>
          <img
            :src="
              selectedProduct?.product?.photo || require('@/assets/img/product-placeholder.webp')
            "
            alt="Продукт"
            class="item-icon"
          />
          <div>
            <div>{{ selectedProduct?.product?.title }}</div>
            <div class="item-sn">SN {{ selectedProduct?.product?.serialNumber }}</div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import OrderForm from '@/components/OrderForm.vue'
  import Modal from '@/components/Modal.vue'
  import { useOrdersStore } from '@/stores/useOrdersStore'
  import { deleteOrder as apiDeleteOrder, deleteProduct as apiDeleteProduct } from '@/api/orders'
  import { toast } from 'vue3-toastify'

  const ordersStore = useOrdersStore()
  const localError = ref(null)
  const showOrderModal = ref(false)
  const showProductModal = ref(false)
  const selectedOrder = ref(null)
  const selectedProduct = ref(null)
  const isDeleting = ref(false)

  const error = computed(() => {
    return ordersStore.error || localError.value
  })

  const loadingGlobal = computed(() => {
    return ordersStore.loadingGlobal
  })

  const filteredOrders = computed(() => {
    return ordersStore.orders || []
  })

  const retryLoading = async () => {
    localError.value = null
    await ordersStore.fetchOrders()
  }

  const openDeleteModal = (order) => {
    selectedOrder.value = order
    showOrderModal.value = true
  }

  const openDeleteProductModal = (data) => {
    selectedProduct.value = data
    showProductModal.value = true
  }

  const deleteOrder = async () => {
    try {
      if (isDeleting.value) return
      isDeleting.value = true

      showOrderModal.value = false

      if (!selectedOrder.value || !selectedOrder.value.id) {
        throw new Error('ID прихода не указан')
      }

      const orderId = selectedOrder.value.id
      const result = await apiDeleteOrder(orderId)

      if (result.success) {
        if (typeof ordersStore.removeOrderById !== 'function') {
          throw new Error('Метод удаления прихода не реализован в хранилище')
        }

        ordersStore.removeOrderById(orderId)
        toast.success('Приход успешно удален')
      } else {
        throw new Error(result.message || 'Ошибка при удалении прихода')
      }
    } catch (error) {
      console.error('Ошибка при удалении прихода:', error)
      toast.error('Не удалось удалить приход')
    } finally {
      selectedOrder.value = null
      isDeleting.value = false
    }
  }

  const deleteProduct = async () => {
    try {
      if (isDeleting.value) return
      isDeleting.value = true

      showProductModal.value = false

      if (
        !selectedProduct.value ||
        !selectedProduct.value.product ||
        !selectedProduct.value.product.id
      ) {
        throw new Error('ID продукта не указан')
      }

      if (!selectedProduct.value.orderId) {
        throw new Error('ID заказа не указан')
      }

      const productId = selectedProduct.value.product.id

      const result = await apiDeleteProduct(productId)

      if (result.success) {
        ordersStore.removeProductById(productId)
        toast.success('Продукт успешно удален из заказа')
      } else {
        throw new Error(result.message || 'Ошибка при удалении продукта')
      }
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error)
      toast.error('Не удалось удалить продукт из заказа')
    } finally {
      selectedProduct.value = null
      isDeleting.value = false
    }
  }

  onMounted(async () => {
    if (!Array.isArray(ordersStore.orders) || ordersStore.orders.length === 0) {
      await ordersStore.fetchOrders()
    }
  })
</script>

<style lang="scss" scoped>
  .orders-container {
    padding: 20px;
    max-width: 100%;
    overflow-x: auto;
    min-height: 300px;
    display: flex;
  }

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

  .error-message {
    display: flex;
    align-items: flex-start;
    background-color: #fff3f3;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;

    .error-icon {
      font-size: 24px;
      margin-right: 16px;
    }

    h3 {
      margin: 0 0 10px 0;
      color: #d32f2f;
    }

    p {
      margin: 0 0 15px 0;
      color: #666;
    }
  }

  .retry-button {
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #1976d2;
    }
  }

  .item-row {
    display: flex;
    align-items: center;
    padding: 12px 0;

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 12px;
      background-color: #666;

      &-green {
        background-color: #4caf50;
      }

      &-gray {
        background-color: #9e9e9e;
      }
    }

    .item-icon {
      width: 40px;
      height: 32px;
      object-fit: cover;
      margin-right: 12px;
      border-radius: 4px;
    }

    .item-sn {
      font-size: 0.85em;
      color: #666;
      margin-top: 4px;
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
