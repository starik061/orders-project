import { io } from 'socket.io-client'

// Создаём подключение к серверу (изменить адрес на нужный)
const socket = io('http://localhost:3000')

export default socket
