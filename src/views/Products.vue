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
      @product-deleted="handleProductDeleted"
      @delete-error="handleDeleteError"
    />
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import ProductForm from '@/components/ProductForm.vue'
  import { useOrdersStore } from '@/stores/useOrdersStore'

  const ordersStore = useOrdersStore()
  const localError = ref(null)

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

  const handleProductDeleted = async (productId) => {
    // Вызов метода из store для удаления продукта
    ordersStore.removeProductById(productId)
  }

  const handleDeleteError = ({ productId, error }) => {
    localError.value = `Ошибка при удалении продукта: ${error}`

    // Очистить ошибку через некоторое время
    setTimeout(() => {
      if (localError.value) {
        localError.value = null
      }
    }, 5000)
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

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
