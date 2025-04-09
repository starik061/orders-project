import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchOrdersFromApi } from '@/api/orders'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const error = ref(null)
  const loadingGlobal = ref(false)
  const searchQuery = ref('')

  async function fetchOrders() {
    loadingGlobal.value = true
    error.value = null
    try {
      orders.value = await fetchOrdersFromApi()
    } catch (err) {
      error.value = err.message || 'Неизвестная ошибка'
    } finally {
      loadingGlobal.value = false
    }
  }

  function removeProductById(productId) {
    orders.value = orders.value.map((order) => ({
      ...order,
      products: order.products.filter((product) => product.id !== productId)
    }))
  }

  function removeOrderById(orderId) {
    if (!orderId) return

    orders.value = orders.value.filter((order) => order.id !== orderId)
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  return {
    orders,
    error,
    loadingGlobal,
    searchQuery,
    fetchOrders,
    removeProductById,
    removeOrderById,
    setSearchQuery
  }
})
