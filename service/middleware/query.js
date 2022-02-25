const { query, transactionQuery } = require('../utils/async-mysql')
module.exports = async (ctx, next) => {
  ctx.query = query
  ctx.transactionQuery = transactionQuery
  await next()
}
