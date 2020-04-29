<template>
  <uploader :options="options"
            class="uploader">
    <div class="header clear">
      <uploader-btn class="fr">Select File</uploader-btn>
    </div>
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <uploader-list></uploader-list>
    </uploader-drop>
  </uploader>
</template>

<script>
export default {
  name: 'FileUploader',
  data () {
    return {
      options: {}
    }
  }
}
</script>
<style lang='scss'>
.uploader {
  .header {
    margin-bottom: 10px;
  }
  .uploader-drop {
    padding: 0;
    min-height: 300px;
  }
}
</style>
