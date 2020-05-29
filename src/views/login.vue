<template>
  <div id="Login">
    <div class="wrapper">
      <div class="login-box">
        <h2 class="title"><span>Login</span></h2>
        <div class="form-box">
          <div class="row-item">
            <div class="input-box">
              <input type="text"
                     class="input-ui"
                     v-model="loginForm.username"
                     autocomplete="off"
                     name="username">
              <label for="username"
                     :class="{active: loginForm.username.length>0}">账号</label>
              <span class="line"></span>
            </div>
          </div>
          <div class="row-item">
            <div class="input-box">
              <input type="password"
                     class="input-ui"
                     v-model="loginForm.password"
                     name="password">
              <label for="password"
                     :class="{active: loginForm.password.length>0}">密码</label>
              <span class="line"></span>
            </div>
          </div>
          <div class="row-item">
            <div class="input-box">
              <input type="text"
                     class="input-ui"
                     v-model="loginForm.captcha"
                     @keyup.enter="handleLogin"
                     name="password">
              <label for="password"
                     :class="{active: loginForm.captcha.length>0}">验证码</label>
              <span class="line"></span>
              <img :src="captchaURL"
                   class="captcha"
                   @click="refreshCaptchaURL" />
            </div>
          </div>
          <div class="row-item submit-btn-control">
            <button type="button"
                    class="btn-login"
                    @click="handleLogin">登 录</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      captchaURL: ''
    }
  },
  mounted () {
    this.refreshCaptchaURL()
  },
  methods: {
    refreshCaptchaURL () {
      this.$get(`/captcha?t=${+new Date()}`).then(data => {
        this.captchaURL = data.captcha
      })
    },
    handleLogin () {
      const { username, password, captcha } = this.loginForm
      if (!username || !password || !captcha) {
        this.$message.warning('请填写必要信息')
        return
      }
      this.$post('/login', {
        username, password: window.btoa(password), captcha
      }).then(data => {
        this.$router.push('/main')
      }, data => {
        this.refreshCaptchaURL()
      })
    }
  }
}
</script>
<style lang='scss' scoped>
$theme-color: #573896;
.wrapper {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 0 10px #ccc;
  margin: 100px auto;
}
.login-box {
  padding: 20px;
  h2.title {
    padding-top: 20px;
    padding-left: 15px;
    span {
      padding-left: 10px;
      border-left: 4px solid $theme-color;
    }
  }
  .btn-login {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: 0.1s;
    font-weight: 500;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    padding: 12px 20px;
    color: #fff;
    border-radius: 4px;
    width: 100%;
    border: none;
    background: linear-gradient(45deg, #7957f1, #303ce4);
  }
}
.form-box {
  padding: 10px;
  padding-top: 60px;
  .row-item {
    margin-bottom: 40px;
    .input-box {
      position: relative;
      label {
        position: absolute;
        top: 0;
        left: 0;
        height: 40px;
        line-height: 40px;
        padding-left: 5px;
        color: #888894;
        pointer-events: none;
        font-size: 14px;
        transition: all 0.4s;
        &.active {
          font-size: 14px;
          color: #262626;
          transform: translate(-5px, -30px);
          transition: all 0.4s;
        }
      }
      .input-ui {
        box-sizing: border-box;
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0;
        padding-left: 5px;
        background: transparent;
        color: #363636;
        outline: none;
        border: none;
        border-bottom: 1px solid #ddd;
        border-radius: 0;
        font-size: 16px;
        &:focus ~ label {
          font-size: 14px;
          color: #262626;
          transform: translate(-5px, -30px);
          transition: all 0.4s;
        }
        &:focus ~ .line {
          width: 100%;
          transition: all 0.4s;
        }
      }
      .line {
        position: absolute;
        width: 0;
        left: 0;
        bottom: 0;
        border-top: 2px solid $theme-color;
        transition: all 0.4s;
      }
      .captcha {
        position: absolute;
        right: 0;
        top: 0;
        height: 36px;
        width: auto;
        cursor: pointer;
      }
    }
  }
}
</style>
