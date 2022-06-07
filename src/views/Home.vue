<template>
  <div class="home">
    <div class="wrapper">
      <file-list></file-list>
    </div>
    <div class="trash-box"
         @click="$router.push('/trash')">
      <img :src="trashImg"
           alt="回收站">
      <p class="text">回收站</p>
    </div>
  </div>
</template>

<script>
import FileList from '../components/FileList.vue'
import trashImg from '../assets/trash.svg'
export default {
  name: 'Home',
  components: {
    FileList
  },
  data () {
    return {
      trashImg
    }
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
.trash-box {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  cursor: pointer;
  z-index: 9999;
  img {
    width: 42px;
    height: 42px;
    filter: drop-shadow(0 0 10px #667);
  }
  .text {
    padding: 5px 0;
    font-size: 14px;
    color: #667;
  }
  &:hover {
    img {
      filter: drop-shadow(0 0 10px #262626);
    }
  }
}
</style>
