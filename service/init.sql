-- ----------------------------
-- 主存储表，记录文件MD5与断点续传状态
-- ----------------------------
CREATE TABLE IF NOT EXISTS `storage` (
  `id` varchar(50) NOT NULL,
  `md5` varchar(50) DEFAULT NULL,
  `fullPath` varchar(255) DEFAULT NULL,
  `isComplete` int(1) DEFAULT '0',
  `isDel` int(1) DEFAULT '0',
  `updatedTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- 回收站表，记录回收站的文件与还原路径
-- ----------------------------
CREATE TABLE IF NOT EXISTS `trash_folder` (
  `id` varchar(50) NOT NULL,
  `folderName` varchar(50) DEFAULT NULL,
  `fromPath` varchar(50) DEFAULT NULL,
  `updatedTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS `storage_user` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
