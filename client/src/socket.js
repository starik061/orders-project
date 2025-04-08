import { io } from 'socket.io-client'

// Создаём подключение к серверу (изменить адрес на нужный)
const socket = io('https://orders-project-server.onrender.com')

export default socket
