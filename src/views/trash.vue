<template>
  <div class="trash">
    <div class="wrapper">
      <div class="trash-body">
        <div class="header-box clear">
          <div class="left-header fl">
            <div class="operation-icon">
              <i class="el-icon-back"
                 title="返回主页"
                 @click="$router.go(-1)"></i>
              <i class="el-icon-refresh-right"
                 title="刷新"
                 @click="getData"></i>
            </div>
            <div class="trash-text">回收站</div>
          </div>
        </div>
        <div class="table-box">
          <standard-table v-model="conf"
                          :loading.sync="loading"
                          :border="false"
                          @selection-change="handleSelectionChange"
                          ref="table">
            <template #icon="scoped">
              <div class="icon-wrapper">
                <img :src="iconFormatter(scoped.row.fileName, scoped.row.isFolder)"
                     alt="icon"
                     style="width: 24px;height: auto">
              </div>
            </template>
            <template #footerLeft>
              <div class="footer-btn-box">
                <el-button type="primary"
                           :disabled="selectedList.length === 0"
                           @click="handleBatchRestore">批量还原{{selectedList.length > 0 ? `(${selectedList.length})` : ''}}</el-button>
                <el-button type="danger"
                           :disabled="selectedList.length === 0"
                           @click="handleBatchDelete">批量永久删除{{selectedList.length > 0 ? `(${selectedList.length})` : ''}}</el-button>
              </div>
            </template>
          </standard-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import typesMap from '@/utils/file-icon'
export default {
  name: 'Trash',
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
      loading: false,
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
            formatter: (row) => row.showFileName || row.fileName
          },
          {
            label: '来源位置',
            prop: 'fromPath',
            align: 'left',
            formatter: (row) => row.fromPath || '未知'
          },
          {
            label: '修改时间',
            prop: 'updatedTime'
          }
        ],
        data: [],
        operation: {
          width: 200,
          btns: [
            {
              label: '还原',
              fn: (row) => this.handleRestore([row]),
              show: (row) => row.fromPath
            },
            {
              label: '永久删除',
              style: 'color: #bb3342',
              fn: (row) => this.handleDelete([row])
            }
          ]
        },
        url: '/getTrashList',
        axiosMethod: 'get',
        responseItems: '',
        pagination: {
          static: true
        },
        formatRespone: (data) => data.sort((a, b) => {
          return new Date(b.updatedTime) - new Date(a.updatedTime)
        })
      },
      selectedList: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.$nextTick(() => {
        this.$refs.table.fetch()
      })
    },
    handleRestore (rows, showIgnoreTips = false) {
      const text = showIgnoreTips ? '所选记录中含有不可还原的文件或文件夹,会默认忽略,是否继续?' : '是否将所选的文件还原?'
      this.$confirm(text, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/restore', {
          restoreList: rows
        }).then(data => {
          this.$message.success('操作成功')
          this.getData()
        })
      }).catch(() => { })
    },
    handleDelete (rows) {
      this.$confirm('该操作会永久删除所选文件或文件夹，不可恢复，是否继续', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.$post('/permanentlyDelete', {
          deleteList: rows
        }).then(data => {
          this.$message.success('操作成功')
          this.getData()
        })
      }).catch(() => { })
    },
    handleSelectionChange (selection) {
      this.selectedList = selection
    },
    handleBatchRestore () {
      const isAllCanRestore = this.selectedList.every(item => item.fromPath)
      if (isAllCanRestore) {
        this.handleRestore(this.selectedList)
      } else {
        this.handleRestore(this.selectedList.filter(item => item.fromPath), true)
      }
    },
    handleBatchDelete () {
      this.handleDelete(this.selectedList)
    }
  }
}
</script>
<style lang='scss' scoped>
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
    .trash-text {
      font-size: 14px;
      color: #363636;
      font-weight: bold;
      padding-left: 10px;
      margin-left: 5px;
      box-shadow: -1px 0 0 #ccc;
    }
  }
}
@media screen and (max-width: 1080px) {
  .header-box {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
