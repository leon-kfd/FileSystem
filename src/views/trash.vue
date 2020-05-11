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
            // formatter: (row) => {
            //   const arr = row.fileName.split('.')
            //   const fileName = arr.length > 1 ? arr.slice(0, arr.length - 1).join('.') : arr[0]
            //   const a = fileName.substr(-14)
            //   return row.updatedTime || `${a.substr(0, 4)}-${a.substr(4, 2)}-${a.substr(6, 2)} ${a.substr(8, 2)}:${a.substr(10, 2)}:${a.substr(12, 2)}`
            // }
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
              fn: (row) => this.delete([row])
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
      }
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
    handleRestore (rows) {
      this.$confirm('是否将所需的文件还原?', '提示', {
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
