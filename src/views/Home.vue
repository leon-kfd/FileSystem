<template>
  <div class="home">
    <div class="wrapper">
      <file-list></file-list>
    </div>
  </div>
</template>

<script>
import FileList from '@/components/FileList'
export default {
  name: 'Home',
  components: {
    FileList
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  max-width: 1080px;
  width: 100%;
  margin: 20px auto;
  padding: 20px 20px 30px;
  background: #fff;
  box-shadow: 0 10px 20px #c9c9c9;
}
@media screen and (max-width: 1080px) {
  .wrapper {
    margin: 0 auto;
    padding: 20px 0 30px;
  }
}
</style>
