const Koa = require('koa')
const KoaBody = require('koa-body')
const KoaSession = require('koa-session')
const responseUtil = require('./middleware/response')

const UserRouter = require('./router/user')

const app = new Koa()
app.keys = ['SimpleFileSystem']
app.use(KoaSession({
  key: '_fileSystem',
  maxAge: 2 * 3600 * 1000,
  renew: true
}, app))
app.use(KoaBody())

app.use(responseUtil)

app.use(UserRouter.routes()).use(UserRouter.allowedMethods())

app.listen(5000, () => {
  initMysql()
})

function initMysql() {
  // 初始化Mysql, 若表不存在创建表
}
