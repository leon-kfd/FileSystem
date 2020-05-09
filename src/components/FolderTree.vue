<template>
  <div class="folder-tree-box">
    <el-tree :props="props"
             :load="getNode"
             :expand-on-click-node="false"
             lazy
             @node-click="handleNodeClick">
    </el-tree>
  </div>
</template>

<script>
export default {
  name: 'FolderTree',
  data () {
    return {
      props: {
        children: 'children',
        label: 'label'
      }
    }
  },
  methods: {
    getNode (node, resolve) {
      const currentPath = node.data && node.data.fullPath ? node.data.fullPath : '$Root'
      this.$get('/getFileList', {
        currentPath
      }).then(data => {
        const folders = data.filter(item => item.isFolder).map(item => {
          return {
            label: item.fileName,
            fullPath: item.fullPath
          }
        })
        resolve(folders)
      })
    },
    handleNodeClick (node) {
      this.$emit('selectedNode', node.fullPath)
    }
  }
}
</script>
<style lang='scss' scoped>
.folder-tree-box {
  padding: 5px;
  border: 1px solid #464646;
  border-radius: 4px;
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
