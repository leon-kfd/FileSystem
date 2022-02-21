const Router = require('koa-router');
const SvgCaptcha = require('svg-captcha');

const router = new Router({
  prefix: '/api/user'
})

router.get('/captcha', async ctx => {
  const c = SvgCaptcha.create({
    background: '#f5f5f7'
  })
  ctx.type = 'image/svg+xml'
  ctx.body = new Buffer.from(c.data)
})

module.exports = router
