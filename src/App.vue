<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
body {
  background: #f7f7f8;
}
.el-dialog__header {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    left: 10px;
    top: 22px;
    height: 20px;
    border-left: 4px solid #48f;
  }
}
</style>
