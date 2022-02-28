// ###
// 回收站
// ###

const fs = require('fs')
const { storageRootPath, storageTrashPath } = require('../config/config')
const { deleteFolder } = require('../utils/helper')

// 获取回收站数据列表
exports.getTrashList = async ctx => {
  // 仅查询出一周前的数据
  // 利用查询出的DB结果与本地回收站目录物理文件对比再返回
  // TODO: 配合定时器定时清空回收站
  const weekAgo = new Date().setDate(new Date().getDate() - 8)
  const trashFileSql = `select id, md5, fullPath, DATE_FORMAT(updatedTime, '%Y-%m-%d %H:%i:%s') updatedTime from storage where isDel = 1 and updatedTime > ?`
  const trashFileList = await ctx.sql(trashFileSql, weekAgo)
  const trashFolderSql = `select id, folderName, fromPath, DATE_FORMAT(updatedTime, '%Y-%m-%d %H:%i:%s') updatedTime from trash_folder where updatedTime > ?`
  const trashFolderList = await ctx.sql(trashFolderSql, weekAgo)
  // DB上的回收站数据
  const trashListMap = {}
  trashFileList.map(item => {
    const pathArr = item.fullPath.split('/')
    const fileRealName = pathArr[pathArr.length - 1]
    const fileNameArr = fileRealName.split('.')
    const suffix = fileNameArr.length > 1 ? fileNameArr[fileNameArr.length - 1] : ''
    const fileName = `${item.id}.${suffix}`
    trashListMap[fileName] = {
      fileName,
      showFileName: fileRealName,
      fromPath: item.fullPath,
      updatedTime: item.updatedTime,
      isFolder: false
    }
  })
  trashFolderList.map(item => {
    const folderNameArr = item.folderName.split('/')
    const fileName = folderNameArr[folderNameArr.length - 1]
    trashListMap[fileName] = {
      fileName,
      fromPath: item.fromPath,
      updatedTime: item.updatedTime,
      isFolder: true
    }
  })
  // 物理存储上的回收站数据
  const ls = fs.readdirSync(storageTrashPath)
  const result = ls.map(item => {
    if (trashListMap[item]) {
      return trashListMap[item]
    } else {
      const arr = item.split('.')
      const fileName = arr.length > 1 ? arr.slice(0, arr.length - 1).join('.') : arr[0]
      const a = fileName.substr(-14)
      return {
        fileName: item,
        updatedTime: `${a.substr(0, 4)}-${a.substr(4, 2)}-${a.substr(6, 2)} ${a.substr(8, 2)}:${a.substr(10, 2)}:${a.substr(12, 2)}`
      }
    }
  })
  ctx.r.successData(result)
}

// 还原回收站文件
exports.restore = async ctx => {
  const { restoreList } = ctx.request.body
  if (!restoreList || restoreList.length === 0) { 
    ctx.r.parameterError()
    return
  }
  try {
    let sql = ''
    const paramsArr = []
    restoreList.map(item => {
      const oldPath = `${storageTrashPath}/${item.fileName}`
      const restorePath = item.fromPath.replace('$Root', storageRootPath)
      fs.renameSync(oldPath, restorePath)
      if (item.isFolder) {
        sql += `delete from trash_folder where folderName = ?;`
        paramsArr.push(item.fileName)
      } else {
        const id = item.fileName.split('.')[0]
        sql += `update storage set isDel = 0 where id = ?;`
        paramsArr.push(id)
      }
    })
    await ctx.transactionSql(sql, paramsArr)
    ctx.r.success()
  } catch (e) {
    ctx.r.error(e)
  }
}

// 永久删除
exports.permanentlyDelete = async ctx => {
  const { deleteList } = ctx.request.body
  if (!deleteList || deleteList.length === 0) { 
    ctx.r.parameterError()
    return 
  }
  try {
    let sql = ''
    const paramsArr = []
    await Promise.all(
      deleteList.map(async item => {
        const oldPath = `${storageTrashPath}/${item.fileName}`
        if (item.isFolder) {
          await deleteFolder(oldPath)
        } else {
          fs.unlinkSync(oldPath)
        }
        if (item.isFolder) {
          sql += `delete from trash_folder where folderName = ?;`
          paramsArr.push(item.fileName)
        } else {
          const id = item.fileName.split('.')[0]
          sql += `delete from storage where id = ?;`
          paramsArr.push(id)
        }
      })
    )
    await transactionQuery(sql, paramsArr)
    ctx.r.success()
  } catch (e) {
    ctx.r.error(e)
  }
}
