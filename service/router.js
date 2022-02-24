const Router = require('koa-router')
const UserController = require('./controller/user')

const router = new Router({
  prefix: '/api'
})

router.get('/captcha', UserController.captcha)
router.post('/login', UserController.login)
router.post('/logout', UserController.logout)

module.exports = router
