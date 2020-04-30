<template>
  <div class="file-list">
    <div class="header-box clear">
      <div class="left-header fl">
        <div class="operation-icon">
          <i class="el-icon-back"
             :class="{disabled: currentPathArr.length <= 1}"
             @click="hanldeBackBtnClick"></i>
          <i class="el-icon-right"
             :class="{disabled: forwardArr.length < 1}"
             @click="hanldeForwardBtnClick"></i>
          <i class="el-icon-refresh-right"
             @click="getData"></i>
        </div>
        <div class="folder-path">
          <div v-for="(item,index) in currentPathArr"
               :key="index"
               class="path-wrapper">
            <span class="path-link"
                  :class="{disabled: index === currentPathArr.length - 1}"
                  @click="handlePathClick(item)">{{item}}</span>
            <span class="path-divider">/</span>
          </div>
        </div>
      </div>
      <div class="right-header fr">
        <el-input placeholder="搜索"
                  prefix-icon="el-icon-search"
                  style="width:150px;min-width: 150px;margin: 0 10px 10px"
                  v-model="searchStr">
        </el-input>
        <el-button icon="el-icon-upload"
                   type="success"
                   @click="uploaderDialog = true">上传</el-button>
      </div>
    </div>
    <div class="table-box">
      <standard-table v-model="conf"
                      :loading.sync="loading"
                      :border="false"
                      @row-dblclick="handleDbClick"
                      ref="table">
        <template #icon="scoped">
          <div class="icon-wrapper">
            <img :src="iconFormatter(scoped.row.fileName, scoped.row.isFolder)"
                 alt="icon"
                 style="width: 24px;height: auto">
          </div>
        </template>
      </standard-table>
    </div>
    <el-dialog title="上传"
               width="100%"
               :visible.sync="uploaderDialog">
      <file-uploader></file-uploader>
    </el-dialog>
  </div>
</template>

<script>
import typesMap from '@/utils/file-icon'
import FileUploader from '@/components/FileUploader'
const sizeFormatter = (size) => {
  return size < 1024 * 1024
    ? `${parseFloat((size / 1024).toFixed(1))} KB`
    : size < 1024 * 1024 * 1024
      ? `${parseFloat((size / (1024 * 1024)).toFixed(1))} MB`
      : `${parseFloat((size / (1024 * 1024 * 1024)).toFixed(1))} GB`
}
export default {
  name: 'FileList',
  components: {
    FileUploader
  },
  data () {
    return {
      iconFormatter (fileName, isFolder) {
        if (!fileName) return ''
        if (isFolder) return typesMap.folder
        const arr = fileName.split('.')
        if (arr.length > 1) {
          const type = arr[arr.length - 1]
          return typesMap[type] || typesMap.unknown
        } else {
          return typesMap.unknown
        }
      },
      conf: {
        row: [
          {
            slot: 'icon',
            width: 50
          },
          {
            label: 'File Name',
            prop: 'fileName',
            align: 'left'
          },
          {
            label: 'Modify',
            prop: 'updatedTime',
            width: 150
          },
          {
            label: 'Size',
            prop: 'size',
            width: 120,
            formatter: (row) => sizeFormatter(row.size)
          }
        ],
        data: [],
        operation: {
          width: 200,
          btns: [
            {
              label: (row) => row.isFolder ? '打开' : '下载',
              fn: (row) => {
                if (row.isFolder) {
                  this.open(row)
                } else {
                  this.download(row)
                }
              }
            },
            {
              label: '重命名'
            },
            {
              label: '删除',
              style: 'color: #bb3342'
            }
          ]
        },
        url: '/getFileList',
        axiosMethod: 'get',
        params: {
          currentPath: ''
        },
        responseItems: '',
        formatRespone: (data) => data.sort((a, b) => ~~b.isFolder - ~~a.isFolder)
      },
      loading: false,
      currentPathArr: ['$Root'],
      forwardArr: [],
      searchStr: '',
      uploaderDialog: false
    }
  },
  watch: {
    currentPathArr: {
      handler (val) {
        this.conf.params.currentPath = val.join('/').replace('$Root', '')
      },
      immediate: true
    }
  },
  created () {
    this.getData()
  },
  methods: {
    handleDbClick (row) {
      console.log(row)
    },
    getData () {
      this.$nextTick(() => {
        this.$refs.table.fetch()
      })
    },
    open (row) {
      this.forwardArr.length = 0
      this.currentPathArr.push(row.fileName)
      this.getData()
    },
    hanldeBackBtnClick () {
      this.forwardArr.push(this.currentPathArr.pop())
      this.getData()
    },
    hanldeForwardBtnClick () {
      this.currentPathArr.push(this.forwardArr.pop())
      this.getData()
    },
    handlePathClick (path) {
      console.log(path)
    }
  }
}
</script>
<style lang='scss' scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.header-box {
  .left-header {
    padding: 0 5px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    height: 32px;
    .operation-icon {
      display: flex;
      align-items: center;
      i {
        font-size: 24px;
        margin-right: 10px;
        color: #363636;
        cursor: pointer;
      }
      i.disabled {
        color: #99a;
        cursor: not-allowed;
      }
      i:hover {
        background: rgba(255, 255, 255, 0.8);
      }
    }
    .folder-path {
      font-size: 14px;
      color: #363636;
      font-weight: bold;
      padding-left: 10px;
      margin-left: 5px;
      box-shadow: -1px 0 0 #ccc;
      width: 100%;
      min-width: 250px;
      .path-wrapper {
        display: inline-block;
        .path-link {
          cursor: pointer;
          padding: 0 2px;
          &:not(.disabled):hover {
            color: #7f48ff;
            box-shadow: 0 2px 0 #7f48ff;
          }
          &.disabled {
            color: #99a;
            cursor: default;
          }
        }
        .path-divider {
          color: #99a;
          font-weight: normal;
          margin: 0 3px;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.file-list {
  .el-dialog {
    max-width: 680px;
  }
}
</style>
