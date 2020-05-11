<template>
  <div class="file-list">
    <div class="header-box clear">
      <div class="left-header fl">
        <div class="operation-icon">
          <i class="el-icon-back"
             title="后退"
             :class="{disabled: currentPathArr.length <= 1}"
             @click="hanldeBackBtnClick"></i>
          <i class="el-icon-right"
             title="前进"
             :class="{disabled: forwardArr.length < 1}"
             @click="hanldeForwardBtnClick"></i>
          <i class="el-icon-refresh-right"
             title="刷新"
             @click="getData"></i>
        </div>
        <div class="folder-path">
          <div v-for="(item,index) in currentPathArr"
               :key="item + index"
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
        <el-button type="warning"
                   @click="handleCreateFolder">新建文件夹</el-button>
      </div>
    </div>
    <div class="table-box">
      <standard-table v-model="conf"
                      :loading.sync="loading"
                      :border="false"
                      @row-dblclick="handleDbClick"
                      @selection-change="handleSelectionChange"
                      ref="table">
        <template #icon="scoped">
          <div class="icon-wrapper">
            <img :src="iconFormatter(scoped.row.fileName, scoped.row.isFolder)"
                 alt="icon"
                 style="width: 24px;height: auto">
          </div>
        </template>
        <template #fileName="scoped">
          <div class="renaming-item"
               :class="{'is-editing': scoped.row.isRenaming}">
            <div class="text">{{scoped.row.fileName}}</div>
            <div class="edit">
              <el-input v-model="renamingPrefix"
                        v-focus
                        @blur="handleRenamingInputBlur(scoped.row)"
                        @keyup.native.enter="handleRenamingInputBlur(scoped.row)"
                        style="min-width: 100px;max-width: 350px"></el-input>
              <span class="suffix">{{renamingSuffix}}</span>
            </div>
          </div>
        </template>
        <template #footerLeft>
          <div class="footer-btn-box">
            <el-button type="primary"
                       :disabled="selectedList.length === 0"
                       @click="handleBatchMove">批量移动{{selectedList.length > 0 ? `(${selectedList.length})` : ''}}</el-button>
            <el-button type="danger"
                       :disabled="selectedList.length === 0"
                       @click="handleBatchDelete">批量删除{{selectedList.length > 0 ? `(${selectedList.length})` : ''}}</el-button>
          </div>
        </template>
      </standard-table>
    </div>
    <el-dialog title="上传"
               width="100%"
               :visible.sync="uploaderDialog"
               @close="getData">
      <file-uploader :currentPath="conf.params.currentPath"></file-uploader>
    </el-dialog>
    <el-dialog title="移动"
               width="500px"
               :visible.sync="moveDialog">
      <folder-tree @selectedNode="setMoveTo"></folder-tree>
      <div slot="footer"
           class="dialog-footer clear">
        <div class="folder-selected-box fl">
          <span class="label">目标位置</span>
          <span class="content">{{moveTo}}</span>
        </div>
        <el-button @click="moveDialog = false">取消</el-button>
        <el-button type="primary"
                   @click="handleMoveSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import typesMap from '@/utils/file-icon'
import FileUploader from '@/components/FileUploader'
import FolderTree from '@/components/FolderTree'
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
    FileUploader,
    FolderTree
  },
  directives: {
    focus: {
      update: el => el.querySelector('input, textarea').focus()
    }
  },
  data () {
    return {
      iconFormatter (fileName, isFolder) {
        if (!fileName) return typesMap.folder
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
            type: 'selection'
          },
          {
            slot: 'icon',
            width: 50
          },
          {
            label: '名称',
            prop: 'fileName',
            align: 'left',
            slot: 'fileName'
          },
          {
            label: '修改日期',
            prop: 'updatedTime',
            width: 150
          },
          {
            label: '大小',
            prop: 'size',
            width: 120,
            formatter: (row) => row.isFolder ? '-' : sizeFormatter(row.size)
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
              label: '移动',
              fn: (row) => this.showMove(row)
            },
            {
              label: '重命名',
              fn: (row) => this.rename(row)
            },
            {
              label: '删除',
              style: 'color: #bb3342',
              fn: (row) => this.delete([row])
            }
          ]
        },
        url: '/getFileList',
        axiosMethod: 'get',
        params: {
          currentPath: ''
        },
        responseItems: '',
        pagination: {
          static: true
        },
        formatRespone: (data) => data.sort((a, b) => {
          return ~~b.isFolder - ~~a.isFolder
        })
      },
      loading: false,
      currentPathArr: ['$Root'],
      forwardArr: [],
      searchStr: '',
      uploaderDialog: false,
      moveDialog: false,
      moveFrom: [],
      moveTo: '',
      renamingPrefix: '',
      renamingSuffix: '',
      searchStoreList: [],
      selectedList: [],
      isRenaming: false
    }
  },
  watch: {
    currentPathArr: {
      handler (val) {
        this.conf.params.currentPath = val.join('/')
      },
      immediate: true
    },
    searchStr (val) {
      if (val) {
        const ls = this.conf.data.filter(item => item.fileName.includes(val))
        this.$set(this.conf, 'data', ls)
      } else {
        this.$set(this.conf, 'data', this.searchStoreList)
      }
    }
  },
  created () {
    this.getData()
  },
  methods: {
    handleDbClick (row) {
      if (row.isFolder) {
        this.open(row)
      }
    },
    handleSelectionChange (selection) {
      this.selectedList = selection
    },
    handleBatchDelete () {
      this.delete(this.selectedList)
    },
    handleBatchMove () {
      this.moveDialog = true
      this.moveFrom = this.selectedList.map(item => this.conf.params.currentPath + '/' + item.fileName)
      this.moveTo = ''
    },
    getData () {
      this.$nextTick(() => {
        this.$refs.table.fetch().then(data => {
          this.searchStoreList = data
        })
      })
    },
    open (row) {
      this.forwardArr.length = 0
      this.currentPathArr.push(row.fileName)
      this.getData()
    },
    download (row) {
      const targetPath = this.conf.params.currentPath + '/' + row.fileName
      const realPath = targetPath.replace('$Root', this.$baseURL)
      const a = document.createElement('a')
      a.href = realPath
      a.download = row.fileName
      a.setAttribute('target', '_blank')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    showMove (row) {
      const targetPath = this.conf.params.currentPath + '/' + row.fileName
      this.moveDialog = true
      this.moveFrom = [targetPath]
      this.moveTo = ''
    },
    rename (row) {
      this.$set(row, 'isRenaming', true)
      this.isRenaming = true
      const arr = row.fileName.split('.')
      const prefix = arr.length > 1 ? arr.slice(0, arr.length - 1).join('.') : arr[0]
      const suffix = arr.length > 1 ? arr[arr.length - 1] : ''
      this.renamingPrefix = prefix
      this.renamingSuffix = !row.isFolder ? `.${suffix}` : ''
    },
    delete (rows) {
      const pathPrefix = this.currentPathArr.join('/')
      const deleteList = rows.map(row => {
        return {
          target: pathPrefix + '/' + row.fileName,
          isFolder: row.isFolder
        }
      })
      this.$confirm('此操作会将文件移动到回收站，你可在一周内进行恢复操作，一周后将永久删除（空文件夹默认直接删除）', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/delete', {
          deleteList
        }).then(data => {
          this.$message.success('操作成功')
          this.getData()
        })
      }).catch(() => { })
    },
    setMoveTo (val) {
      this.moveTo = val
    },
    hanldeBackBtnClick () {
      if (this.currentPathArr.length > 1) {
        this.forwardArr.push(this.currentPathArr.pop())
        this.getData()
      }
    },
    hanldeForwardBtnClick () {
      if (this.forwardArr.length >= 1) {
        this.currentPathArr.push(this.forwardArr.pop())
        this.getData()
      }
    },
    handlePathClick (path) {
      const index = this.currentPathArr.findIndex(item => item === path)
      if (~index) {
        this.currentPathArr = this.currentPathArr.slice(0, index + 1)
        this.getData()
      }
    },
    handleRenamingInputBlur (row) {
      if (this.isRenaming) {
        this.isRenaming = false
        const pathPrefix = this.currentPathArr.join('/')
        if (!row.isNewFolder) {
          const newName = !row.isFolder ? `${this.renamingPrefix}${this.renamingSuffix}` : this.renamingPrefix
          const hasChange = row.fileName !== newName
          if (hasChange) {
            this.$post('/rename', {
              oldPath: pathPrefix + '/' + row.fileName,
              newPath: pathPrefix + '/' + newName
            }).then(data => {
              this.$set(row, 'fileName', newName)
              this.$message.success('操作成功')
            })
          }
          this.$set(row, 'isRenaming', false)
        } else {
          this.$post('/createFolder', {
            folderName: pathPrefix + '/' + this.renamingPrefix
          }).then(data => {
            this.$message.success('操作成功')
          })
          this.$set(row, 'isRenaming', false)
          this.getData()
        }
      }
    },
    handleCreateFolder () {
      this.renamingPrefix = ''
      this.renamingSuffix = ''
      this.conf.data.push({
        fileName: '',
        isFolder: true,
        size: 0,
        isNewFolder: true
      })
      this.$nextTick(() => {
        const newName = '新建文件夹'
        const count = this.conf.data.filter(item => item.fileName.includes(newName))
        this.renamingPrefix = `${newName}${count.length > 0 ? count.length : ''}`
        this.$set(this.conf.data[this.conf.data.length - 1], 'isRenaming', true)
        this.isRenaming = true
      })
    },
    handleMoveSubmit () {
      if (!this.moveTo) {
        this.$message.warning('请选择目标位置')
        return
      }
      this.$confirm(`是否确定将所需文件或文件夹移动至${this.moveTo}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('move', {
          moveFrom: this.moveFrom,
          moveTo: this.moveTo
        }).then(data => {
          this.$message.success('操作成功')
          this.getData()
        }).finally(() => {
          this.moveDialog = false
        })
      }).catch(() => { })
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
.renaming-item {
  display: flex;
  align-items: center;
  user-select: none;
  .text {
    display: block;
  }
  .edit {
    display: none;
  }
  &.is-editing {
    .text {
      display: none;
    }
    .edit {
      display: block;
    }
  }
  .suffix {
    margin-left: 5px;
    font-weight: bold;
  }
}
.folder-selected-box {
  line-height: 32px;
  .label {
    font-size: 14px;
    color: #778;
  }
  .content {
    margin-left: 5px;
    font-size: 15px;
    color: #363636;
    font-weight: bold;
  }
}
.footer-btn-box {
  padding-left: 10px;
}
@media screen and (max-width: 1080px) {
  .header-box {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
<style lang="scss">
.file-list {
  .el-dialog {
    max-width: 768px;
  }
}
</style>
