import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

const baseURL = process.env.NODE_ENV === 'production' ? '/storage' : '/api/storage'

const instance = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use((config) => {
  return config
})

instance.interceptors.response.use((response) => {
  const data = response.data
  if (data.errCode === 200) {
    return data.data
  } else {
    if (data.errCode === 300) {
      Message({
        showClose: true,
        message: data.errMsg,
        type: 'error',
        duration: 2000
      })
      router.push('/login')
    } else if (data.errMsg) {
      Message({
        showClose: true,
        message: data.errMsg,
        type: 'error',
        duration: 2000
      })
    }
    return Promise.reject(response)
  }
})

export { baseURL }

export default instance
