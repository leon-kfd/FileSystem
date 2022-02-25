
const rimraf = require('rimraf')

exports.DateFormat = (date, formatter = 'yyyy-MM-dd') => {
  const opt = {
    "y+": date.getFullYear().toString(),        // 年
    "M+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "m+": date.getMinutes().toString(),         // 分
    "s+": date.getSeconds().toString()          // 秒
  };
  for (let k in opt) {
    const ret = new RegExp("(" + k + ")").exec(formatter);
    if (ret) {
      formatter = formatter.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return formatter;
}

exports.RandomString = (length) => {
  return Math.random().toString(36).slice(2, length)
}

exports.deleteFolder = (path) => {
  return new Promise((resolve, reject) => {
    rimraf(path, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(1)
    })
  })
}
