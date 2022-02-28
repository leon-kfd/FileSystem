import request from './'
export function login(username: string, password: string, captcha: string) {
  return request.post('/login', { username, password, captcha })
}

export function logout() {
  return request.post('/logout')
}
