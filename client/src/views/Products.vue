<template>
  <div class="products-container">
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
    <ProductForm
      v-else
      :products="allProducts"
      :orders="orders"
      @delete-click="openDeleteModal"
    />

    <Modal
      v-if="showModal"
      :title="'Вы уверены, что хотите удалить этот продукт?'"
      :item="selectedItem"
      @cancel="showModal = false"
      @confirm="deleteItem"
    >
      <template #default>
        <div class="item-row">
          <span
            class="dot"
            :class="{ 'dot-green': selectedItem.isNew === 1, 'dot-gray': selectedItem.isNew === 0 }"
          ></span>
          <img
            :src="selectedItem.photo || require('@/assets/img/product-placeholder.webp')"
            alt="Продукт"
            class="item-icon"
          />
          <div>
            <div>{{ selectedItem.title }}</div>
            <div class="item-sn">SN {{ selectedItem.serialNumber }}</div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import ProductForm from '@/components/ProductForm.vue'
  import { useOrdersStore } from '@/stores/useOrdersStore'
  import Modal from '@/components/Modal.vue'
  import { deleteProduct } from '@/api/orders'

  const ordersStore = useOrdersStore()
  const localError = ref(null)
  const showModal = ref(false)
  const selectedItem = ref(null)

  const error = computed(() => {
    return ordersStore.error || localError.value
  })

  const loadingGlobal = computed(() => {
    return ordersStore.loadingGlobal
  })

  const orders = computed(() => ordersStore.orders || [])

  const allProducts = computed(() => {
    const ordersData = ordersStore.orders

    if (!Array.isArray(ordersData)) return []

    return ordersData.flatMap((order) =>
      (Array.isArray(order.products) ? order.products : []).map((product) => ({
        ...product,
        orderId: order.id,
        orderTitle: order.title
      }))
    )
  })

  const retryLoading = async () => {
    localError.value = null
    await ordersStore.fetchOrders()
  }

  const openDeleteModal = (product) => {
    selectedItem.value = product
    showModal.value = true
  }

  const deleteItem = async () => {
    try {
      showModal.value = false

      if (!selectedItem.value || !selectedItem.value.id) {
        throw new Error('ID продукта не указан')
      }

      const productId = selectedItem.value.id
      const result = await deleteProduct(productId)

      if (result.success) {
        ordersStore.removeProductById(productId)
        toast.success('Продукт успешно удален')
      } else {
        throw new Error(result.message || 'Ошибка при удалении продукта')
      }
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error)
      toast.error('Не удалось удалить продукт')
    } finally {
      selectedItem.value = null
    }
  }

  onMounted(async () => {
    if (!Array.isArray(ordersStore.orders) || ordersStore.orders.length === 0) {
      await ordersStore.fetchOrders()
    }
  })
</script>

<style lang="scss" scoped>
  .products-container {
    padding: 20px;
    max-width: 100%;
    overflow-x: auto;
    min-height: 300px;
    display: flex;
    flex-direction: column;
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
