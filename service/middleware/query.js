const { query, transactionQuery } = require('../utils/async-mysql')
module.exports = async (ctx, next) => {
  ctx.sql = query
  ctx.transactionSql = transactionQuery
  await next()
}
