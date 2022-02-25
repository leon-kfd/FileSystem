const Router = require('koa-router')
const UserController = require('./controller/user')
const ExplorerController = require('./controller/explorer')
const TrashController = require('./controller/trash')
const UploadController = require('./controller/upload')

const router = new Router({
  prefix: '/api'
})

router.get('/captcha', UserController.captcha)
router.post('/login', UserController.login)
router.post('/logout', UserController.logout)

router.get('/getFileList', ExplorerController.getFileList)
router.post('/rename', ExplorerController.rename)
router.post('/delete', ExplorerController.delete)
router.post('/move', ExplorerController.move)
router.post('/createFolder', ExplorerController.createFolder)

router.get('/getTrashList', TrashController.getTrashList)
router.post('/restore', TrashController.restore)
router.post('/permanentlyDelete', TrashController.permanentlyDelete)

router.post('/testUpload', UploadController.testUpload)
router.post('/upload', UploadController.upload)
router.post('/simpleUpload', UploadController.simpleUpload)

module.exports = router
