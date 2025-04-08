// Типы данных
interface Price {
  value: number
  symbol: string
  isDefault: number
}

interface Guarantee {
  start: string
  end: string
}

interface Product {
  id: number
  serialNumber: string | null
  isNew: number
  photo: string
  title: string
  type: string
  specification: string
  guarantee: Guarantee
  price: Price[]
  order: number
  date: string
  responsible?: string
}

interface Order {
  id: number
  title: string
  date: string
  description: string
  products: Product[]
}

interface OrdersResponse {
  orders: Order[]
}
//__________________________

// Функция получения заказов
export async function fetchOrdersFromApi(): Promise<Order[]> {
  const response = await fetch('/data/orders.json')

  if (!response.ok) {
    throw new Error(`Ошибка при загрузке заказов: ${response.status}`)
  }

  const data: OrdersResponse = await response.json()

  if (!data || !Array.isArray(data.orders)) {
    throw new Error('Некорректный формат данных: поле "orders" отсутствует или не массив')
  }

  return data.orders
}

export async function deleteProduct(
  productId: string | number
): Promise<{ success: boolean; message: string }> {
  if (!productId) {
    throw new Error('ID продукта не указан')
  }

  // Имитация задержки сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Симуляция случайного успеха/неудачи (70% успех, 30% ошибка)
  const isSuccess = Math.random() < 0.7

  if (isSuccess) {
    console.log(`API: Продукт с ID ${productId} успешно удален`)
    return {
      success: true,
      message: `Продукт успешно удален`
    }
  } else {
    console.error(`API: Ошибка при удалении продукта с ID ${productId}`)
    return {
      success: false,
      message: 'Не удалось удалить продукт. Пожалуйста, попробуйте позже.'
    }
  }
}
export async function deleteOrder(
  orderId: string | number
): Promise<{ success: boolean; message: string }> {
  if (!orderId) {
    throw new Error('ID заказа не указан')
  }

  // Имитация задержки сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Симуляция случайного успеха/неудачи (70% успех, 30% ошибка)
  const isSuccess = Math.random() < 0.7

  if (isSuccess) {
    console.log(`API: Заказ с ID ${orderId} успешно удален`)
    return {
      success: true,
      message: `Заказ успешно удален`
    }
  } else {
    console.error(`API: Ошибка при удалении заказа с ID ${orderId}`)
    return {
      success: false,
      message: 'Не удалось удалить заказ. Пожалуйста, попробуйте позже.'
    }
  }
}
