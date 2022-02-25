const Koa = require('koa')
const KoaBody = require('koa-body')
const KoaSession = require('koa-session')

const responseMiddleware = require('./middleware/response')
const queryMiddleware = require('./middleware/query')

const router = require('./router')

const app = new Koa()
app.keys = ['SimpleFileSystem']
app.use(KoaSession({
  key: '_fileSystem',
  maxAge: 2 * 3600 * 1000,
  renew: true
}, app))
app.use(KoaBody())

app.use(responseMiddleware)
app.use(queryMiddleware)

app.use(router.routes()).use(router.allowedMethods())

app.listen(5000, () => {
  initMysql()
})

function initMysql() {
  // 初始化Mysql, 若表不存在创建表
}
