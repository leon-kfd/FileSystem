// ###
// 用户信息
// ###

const SvgCaptcha = require('svg-captcha');

// 验证码
exports.captcha = async (ctx) => {
  const c = SvgCaptcha.create({
    background: '#f5f5f7'
  })
  ctx.session.captcha = c.text.toLocaleLowerCase()
  ctx.type = 'image/svg+xml'
  ctx.body = new Buffer.from(c.data)
}

// 登录
exports.login = async (ctx) => {
  const { username, password, captcha } = ctx.request.body
  if (!username || !password || !captcha) {
    ctx.r.parameterError()
    return
  }
  if (captcha != ctx.session.captcha.toLocaleLowerCase()) {
    ctx.r.error(311, '验证码错误')
    return
  }
  try {
    const base64Decode = new Buffer.from(password, 'base64')
    const genPwd = base64Decode.toString()
    const result = await ctx.sql(`select * from storage_user where username = ? and password = ?`, [username, genPwd])
    if (!result || result.length === 0) {
      ctx.r.error(312, '账号或密码错误')
      return
    }
    ctx.session.user = username
    ctx.r.success()
  } catch (e) {
    console.log(e)
    ctx.r.error(310, '登录失败')
  }
}

// 注销
exports.logout = async (ctx) => {
  ctx.session.user = null
  ctx.r.success()
}
