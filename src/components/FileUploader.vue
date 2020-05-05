<template>
  <uploader :options="options"
            class="uploader"
            :autoStart="false"
            @file-added="hanldeFileAdd">
    <div class="header clear">
      <label class="label fl">目标位置</label>
      <div class="content fl">{{currentPath}}</div>
      <uploader-btn class="fr">Select File</uploader-btn>
    </div>
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <uploader-list>
        <div slot-scope="scoped">
          <ul>
            <li v-for="file in scoped.fileList"
                :key="file.id">
              <uploader-file :file="file"
                             :class="`file-${file.id}`"
                             :list="true"></uploader-file>
            </li>
          </ul>
        </div>
      </uploader-list>
    </uploader-drop>
  </uploader>
</template>

<script>
import SparkMD5 from 'spark-md5'
const CHUNK_SIZE = 1 * 1024 * 1024
export default {
  name: 'FileUploader',
  props: {
    currentPath: String
  },
  data () {
    return {
      options: {
        target: (instance, chunk, isTest) => isTest ? '/api/storage/testUpload' : '/api/storage/upload',
        query: () => {
          return {
            targetPath: this.currentPath
          }
        },
        chunkSize: CHUNK_SIZE
      }
    }
  },
  methods: {
    hanldeFileAdd (file) {
      this.computeMD5(file)
      console.log(1, file)
    },
    computeMD5 (file) {
      const fileReader = new FileReader()
      const time = new Date().getTime()
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = CHUNK_SIZE
      const chunks = Math.ceil(file.size / chunkSize)
      const spark = new SparkMD5.ArrayBuffer()
      this.$nextTick(() => {
        this.createMD5Element(file)
      })
      loadNext()
      fileReader.onload = e => {
        spark.append(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++
          loadNext()
          this.$nextTick(() => {
            this.setMD5ElementText(file, `校验MD5 ${((currentChunk / chunks) * 100).toFixed(0)}%`)
          })
        } else {
          const md5 = spark.end()
          file.uniqueIdentifier = md5
          console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`)
          file.resume()
          this.destoryMD5Element(file)
        }
      }
      fileReader.onerror = function () {
        this.$nextTick(() => {
          this.setMD5ElementText(file, '校验MD5失败')
        })
        file.cancel()
      }
      function loadNext () {
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },
    createMD5Element (file) {
      this.$nextTick(() => {
        const el = document.querySelector(`.uploader-list .file-${file.id} .uploader-file-status`)
        const MD5Status = document.createElement('div')
        MD5Status.setAttribute('class', 'md5-status')
        el.appendChild(MD5Status)
      })
    },
    destoryMD5Element (file) {
      this.$nextTick(() => {
        const el = document.querySelector(`.uploader-list .file-${file.id} .uploader-file-status .md5-status`)
        if (el) {
          el.parentNode.removeChild(el)
        }
      })
    },
    setMD5ElementText (file, text) {
      const el = document.querySelector(`.uploader-list .file-${file.id} .uploader-file-status .md5-status`)
      if (el) {
        el.innerText = text
      }
    }
  }
}
</script>
<style lang='scss'>
.uploader {
  .header {
    margin-bottom: 10px;
    .label {
      height: 30px;
      line-height: 30px;
    }
    .content {
      font-weight: bold;
      color: #262626;
      margin-left: 5px;
      height: 30px;
      line-height: 30px;
    }
  }
  .uploader-drop {
    padding: 0;
    min-height: 300px;
  }
}
</style>
<style lang="scss">
.file-list {
  .el-dialog__body {
    padding: 10px 20px 20px;
  }
  .md5-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background: #f5f5f5;
  }
}
</style>
