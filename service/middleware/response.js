class StandardResponse {
  constructor(ctx) {
    this.ctx = ctx
  }
  success (errMsg = '操作成功') {
    this.ctx.body = { errCode: 200, errMsg }
  }
  successData (data = [], errMsg = '数据获取成功') {
    this.ctx.body = { errCode: 200, errMsg, data }
  }
  successPage (items = [], page = 1, pageSize = 10, total = 0, errMsg = '数据获取成功') {
    this.ctx.body = {
      errCode: 200,
      errMsg,
      data: { items, page, pageSize, total }
    }
  }
  loginError () {
    this.ctx.body = { errCode: 300, errMsg: '登录状态异常!' }
  }
  parameterError () {
    this.ctx.body = { errCode: 301, errMsg: '参数错误' }
  }
  error (errCode = 302, errMsg = '未知错误') {
    this.ctx.body = { errCode, errMsg }
  }
}

module.exports = async (ctx, next) => {
  ctx.r = new StandardResponse(ctx)
  await next()
}
