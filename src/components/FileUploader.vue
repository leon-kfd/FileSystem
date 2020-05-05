<template>
  <uploader :options="options"
            class="uploader"
            :autoStart="false"
            @file-added="hanldeFileAdd"
            ref="uploader">
    <div class="header clear">
      <label class="label fl">
        <el-tooltip content="请进入到相应文件夹更改上传位置">
          <i class="el-icon-warning-outline path-tips"></i>
        </el-tooltip>
        <span>当前上传位置</span>
      </label>
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
              <div class="uploader-target">目标位置<span class="text">{{file.targetPath}}</span></div>
              <uploader-file :file="file"
                             :class="`file-${file.id}`"
                             :list="true">
              </uploader-file>
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
        chunkSize: CHUNK_SIZE,
        allowDuplicateUploads: false,
        checkChunkUploadedByResponse: (chunk, message) => {
          const response = JSON.parse(message)
          const existChunk = response.data.map(item => ~~item)
          return existChunk.includes(chunk.offset + 1)
        }
      }
    }
  },
  methods: {
    hanldeFileAdd (file) {
      const fileList = this.$refs.uploader.files
      const index = fileList.findIndex(item => item.name === file.name)
      if (~index) {
        file.removeFile(file)
      } else {
        file.targetPath = this.currentPath
        this.computeMD5(file)
      }
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
            document.querySelector(`.uploader-list .file-${file.id} .uploader-file-actions`).style.display = 'none'
          })
        } else {
          const md5 = spark.end()
          file.uniqueIdentifier = md5
          console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`)
          file.resume()
          this.destoryMD5Element(file)
          document.querySelector(`.uploader-list .file-${file.id} .uploader-file-actions`).style.display = 'block'
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
      .path-tips {
        font-size: 20px;
        vertical-align: middle;
        cursor: pointer;
        margin-right: 5px;
      }
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
  .uploader-target {
    position: absolute;
    z-index: 999;
    padding-left: 10px;
    font-size: 13px;
    height: 24px;
    line-height: 24px;
    .text {
      font-weight: bold;
      margin-left: 5px;
      color: #464646;
    }
  }
  .uploader-file {
    height: 65px;
    padding-top: 16px;
  }
  .uploader-file-progress {
    top: 0;
  }
  .uploader-file[status='success'] .uploader-file-remove {
    display: block;
  }
  .uploader-file-meta {
    width: 0;
  }
  .uploader-file-status {
    width: 30%;
  }
  .uploader-file-actions {
    width: 12%;
    padding-left: 5px;
  }
  .uploader-file-name {
    font-weight: bold;
    color: #262626;
  }
  .uploader-file-icon:before {
    font-size: 20px;
  }
}
</style>
