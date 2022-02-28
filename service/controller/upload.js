const fs = require('fs')
const { storageRootPath, storageChunkPath } = require('../config/config')
const { DateFormat, RandomString, deleteFolder } = require('../utils/helper')

// 分片上传预检
exports.testUpload = async ctx => {
  const { identifier, filename, targetPath = '$Root', totalChunks } = ctx.sql
  const chunkFolderURL = `${storageChunkPath}/${identifier}`
  try {
    const checkExistResult = await ctx.sql(`select * from storage where md5 = ? and isComplete = 1 and isDel = 0`, identifier)
    // 检查是否已经完整上传过该文件
    if (checkExistResult.length > 0) {
      const { fullPath } = checkExistResult[0]
      const realPath = fullPath.replace('$Root', storageRootPath)
      // 因性能问题，且默认当前用户不会直接操作物理目录不开放检测
      // 检查当前DB信息是否与物理存储相符
      // if (fs.existsSync(realPath)) {
      //   // 检查目标位置是否与之前上传的位置一样，不一致则复制过去
      //   let targetFilePath = `${targetPath}/${filename}`
      //   if (fullPath !== targetFilePath) {
      //     targetFilePath = targetFilePath.replace('$Root', storageRootPath)
      //     fs.copyFileSync(realPath, targetFilePath)
      //   }
      // }
      const targetFilePath = `${targetPath}/${filename}`
      if (fullPath !== targetFilePath) {
        targetFilePath = targetFilePath.replace('$Root', storageRootPath)
        fs.copyFileSync(realPath, targetFilePath)
      }
      if (!fs.existsSync(realPath)) {
        const now = DateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
        const id = 'F' + RandomString(8)
        const sql = `insert into storage(id, md5, fullPath, updatedTime, isComplete, isDel) values(?, ?, ?, ?, 1, 0)`
        await ctx.sql(sql, [id, identifier, targetFilePath, now])
      }
      ctx.r.successData(Array.from({ length: totalChunks }, (item, index) => ~~index + 1))
      return
    }
    if (!fs.existsSync(chunkFolderURL)) {
      fs.mkdirSync(chunkFolderURL, { recursive: true })
      const now = DateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
      const id = 'F' + RandomString(8)
      const sql = `insert into storage(id, md5, fullPath, updatedTime, isComplete, isDel) values(?, ?, ?, ?, 0, 0)`
      await query(sql, [id, identifier, `${targetPath}/${filename}`, now])
      ctx.r.successData([])
    } else {
      const ls = fs.readdirSync(chunkFolderURL)
      ctx.r.successData(ls)
    }
  } catch (e) {
    ctx.status = 501
    ctx.r.error(306, e)
  }
}

// 分片上传
exports.upload = async ctx => {
  const { chunkNumber, identifier, filename, totalChunks, targetPath = '$Root' } = ctx.request.body
  const { file } = ctx.request.files
  const chunkFolderURL = `${storageChunkPath}/${identifier}`
  const chunkFileURL = `${chunkFolderURL}/${chunkNumber}`
  if (chunkNumber !== totalChunks) {
    const reader = fs.createReadStream(file.path)
    const upStream = fs.createWriteStream(chunkFileURL)
    reader.pipe(upStream)
    ctx.r.success()
  } else {
    // 文件最后一个分片需执行合并文件->删除切片数据操作
    const targetFile = `${targetPath}/${filename}`.replace('$Root', storageRootPath)
    fs.writeFileSync(targetFile, '')
    try {
      for (let i = 1; i <= totalChunks; i++) {
        const url = i == totalChunks ? file.path : `${chunkFolderURL}/${i}`
        const buffer = fs.readFileSync(url)
        fs.appendFileSync(targetFile, buffer)
      }
      const now = DateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
      const sql = `update storage set isComplete = 1, updatedTime = ? where md5 = ?`
      await ctx.sql(sql, [now, identifier])
      ctx.r.success()
      deleteFolder(chunkFolderURL)
    } catch (e) {
      ctx.status = 501
      ctx.r.error(501, e)
      fs.unlinkSync(targetFile)
    }
  }
}

// 简易上传(不切片)
exports.simpleUpload = async ctx => {
  const { targetPath = '$Root' } = ctx.request.body
  const { file } = ctx.request.files
  const fileName = file.name.slice(-20)
  const targetFile = `${targetPath}/${fileName}`.replace('$Root', storageRootPath)
  const now = DateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')
  const id = 'F' + RandomString(8)
  const fakeMd5 = '_Fake' + fileName.split('.')[0] // 简单上传没有计算MD5, 使用文件名创建假的MD5
  try {
    fs.writeFileSync(targetFile, fs.readFileSync(file.path))
    const sql = `insert into storage(id, md5, fullPath, isComplete, isDel, updatedTime) values (?, ?, ?, 1, 0, ?)`
    await ctx.sql(sql, [id, fakeMd5, `${targetPath}/${fileName}`, now])
    ctx.r.successData({ fileName })
  } catch (e) {
    ctx.r.error(309, e.toString())
  }
}
