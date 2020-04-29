<template>
  <div id="Login">
    <div class="wrapper">
      <div class="input-box">
        <h3>Access</h3>
        <el-input suffix-icon="el-icon-lock"
                  type="password"
                  v-model="access"
                  @keyup.native.enter="handleLogin">
        </el-input>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      access: ''
    }
  },
  methods: {
    handleLogin () {
      if (!this.access) return
      this.$post('/login', {
        access: window.btoa(this.access)
      }).then(data => {
        this.$router.push('/main')
      })
    }
  }
}
</script>
<style lang='scss' scoped>
.input-box {
  width: 280px;
  margin: 30vh auto;
  h3 {
    text-align: center;
    margin: 20px 0;
  }
}
</style>
