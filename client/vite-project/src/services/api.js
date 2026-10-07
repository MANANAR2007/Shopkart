import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8002',
    withCredentials: true
})

export default api