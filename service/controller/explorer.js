// ###
// 文件管理器基本操作
// ###

const fs = require('fs')
const { storageRootPath, storageTrashPath } = require('../../config/config')
const { DateFormat, RandomString } = require('../utils/helper')

// 获取路径下列表
exports.getFileList = async ctx => {
  const { currentPath = '$Root' } = ctx.query
  const storageURL = currentPath.replace('$Root', storageRootPath)
  const ls = fs.readdirSync(storageURL)
  const infoList = ls.map(item => {
    const info = fs.statSync(`${storageURL}/${item}`)
    return {
      fileName: item,
      fullPath: `${currentPath}/${item}`,
      isFolder: info.isDirectory(),
      size: info.size,
      updatedTime: DateFormat(new Date(info.mtime), 'yyyy-MM-dd HH:mm:ss')
    }
  })
  ctx.r.successData(infoList)
}

// 重命名
exports.rename = async ctx => {
  const { oldPath, newPath } = ctx.request.body
  if (!oldPath || !newPath) { 
    ctx.r.parameterError()
    return
  }
  const oldRealPath = oldPath.replace('$Root', storageRootPath)
  const newRealPath = newPath.replace('$Root', storageRootPath)
  try {
    await ctx.query(`update storage set fullPath = ? where fullPath = ?`, [newPath, oldPath])
    fs.renameSync(oldRealPath, newRealPath)
    ctx.r.success()
  } catch (e) {
    ctx.r.error(312, e)
  }
}

// 删除
exports.delete = async ctx => {
  const { deleteList } = ctx.request.body
  if (!deleteList || deleteList.length === 0) { 
    ctx.r.parameterError()
    return 
  }
  try {
    await Promise.all(
      deleteList.map(async item => {
        const { target, isFolder } = item
        const oldPath = target.replace('$Root', storageRootPath)
        // 空文件夹直接删除
        if (isFolder) {
          const ls = fs.readdirSync(oldPath)
          if (ls.length === 0) {
            fs.rmdirSync(oldPath)
            return
          }
        }
        try {
          const time = DateFormat(new Date(), 'yyyyMMddHHmmss')
          const pathArr = target.split('/')
          const fileName = pathArr[pathArr.length - 1]
          let newFileName
          if (isFolder) {
            newFileName = `${fileName}-${time}`
          } else {
            const fileNameArr = fileName.split('.')
            const prefix = fileNameArr.length > 1 ? fileNameArr.slice(0, fileNameArr.length - 1).join('.') : fileNameArr[0]
            const suffix = fileNameArr.length > 1 ? fileNameArr[fileNameArr.length - 1] : ''
            const dbFileInfo = await ctx.query(`select * from storage where fullPath = ?`, target)
            if (dbFileInfo.length > 0) {
              newFileName = `${dbFileInfo[0].id}.${suffix}`
            } else {
              newFileName = `${prefix}-${time}.${suffix}`
            }
          }
          const newPathArr = pathArr.slice(0, pathArr.length - 1)
          newPathArr.push(newFileName)
          const afterStorageTrashPath = `${storageTrashPath}/${newFileName}`
          if (!fs.existsSync(storageTrashPath)) fs.mkdirSync(storageTrashPath)
          fs.renameSync(oldPath, afterStorageTrashPath)
          if (isFolder) {
            const now = DateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
            const id = 'D' + RandomString(8)
            await ctx.query(`insert into trash_folder(id, folderName, fromPath, updatedTime) values(?, ?, ?, ?)`, [id, newFileName, target, now])
          } else {
            await ctx.query(`update storage set isDel = 1 where fullPath = ?`, target)
          }
          return Promise.resolve(1)
        } catch (e) {
          return Promise.reject(e)
        }
      })
    )
    ctx.r.success()
  } catch (e) {
    ctx.r.error(308, '操作失败, 未知错误')
  }
}

// 移动与复制
exports.move = async ctx => {
  const { moveFrom, moveTo, moveType = 0 } = ctx.request.body
  if (!moveTo || !moveFrom || moveFrom.length === 0) {
    ctx.body = r.parameterError()
    return
  }
  let sql = ``
  const paramsArr = []
  const moveToRealPath = moveTo.replace('$Root', storageRootPath)
  moveFrom.map(item => {
    const moveFromRealPath = item.replace('$Root', storageRootPath)
    const arr = item.split('/')
    const fileName = arr[arr.length - 1]
    if (moveFromRealPath !== `${moveToRealPath}/${fileName}`) {
      if (moveType === 0) {
        fs.renameSync(moveFromRealPath, `${moveToRealPath}/${fileName}`)
        sql += `update storage set fullPath = ? where fullPath = ?;`
        paramsArr.push(`${moveTo}/${fileName}`, item)
      } else {
        const now = DateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
        const id = 'F' + RandomString(8)
        fs.copyFileSync(moveFromRealPath, `${moveToRealPath}/${fileName}`)
        sql += `insert into storage(id, md5, fullPath, isComplete, isDel, updatedTime) 
                  values(?, (select md5 from storage a where fullPath = ?), ?, 1, 0, ?)`
        paramsArr.push(id, item, moveTo, now)
      }
    }
  })
  if (sql) {
    await ctx.transactionQuery(sql, paramsArr)
  }
  ctx.r.success()
}

// 新建文件夹
exports.createFolder = async ctx => {
  const { folderName } = ctx.request.body
  if (!folderName) { 
    ctx.r.parameterError()
    return 
  }
  const newPath = folderName.replace('$Root', storageRootPath)
  try {
    fs.mkdirSync(newPath)
    ctx.r.success()
  } catch (e) {
    ctx.r.error(312, e)
  }
}
