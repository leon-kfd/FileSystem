import axios from 'axios'
export const baseURL = '/api/api'
const instance = axios.create({
  baseURL
})

instance.interceptors.request.use(config => {
  return config
}, err => {
  return Promise.reject(err)
})

instance.interceptors.response.use(res => {
  if (res.data.errCode === 200) {
    return res
  } else {
    throw new Error(res.data.errMsg)
  }
}, err => {
  return Promise.reject(err)
})

export default instance
