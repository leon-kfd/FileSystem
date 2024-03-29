const icons = ['folder', 'word', 'ppt', 'excel', 'pdf', 'txt', 'zip', 'psd', 'jpg', 'mp3', 'video', 'html', 'white', 'exe']
const iconsMap = {}
icons.map(item => {
  iconsMap[item] = getImageUrl(item)
})
function getImageUrl(name) {
  return new URL(`../assets/file-icon/${name}.svg`, import.meta.url).href
}
const typesMap = {
  folder: iconsMap.folder,
  doc: iconsMap.word,
  docx: iconsMap.word,
  xls: iconsMap.excel,
  xlsx: iconsMap.excel,
  ppt: iconsMap.ppt,
  pptx: iconsMap.ppt,
  pdf: iconsMap.pdf,
  txt: iconsMap.txt,
  zip: iconsMap.zip,
  rar: iconsMap.zip,
  jpg: iconsMap.jpg,
  gif: iconsMap.jpg,
  png: iconsMap.jpg,
  jpge: iconsMap.jpg,
  svg: iconsMap.jpg,
  jpe: iconsMap.jpg,
  mp3: iconsMap.mp3,
  mp4: iconsMap.video,
  avi: iconsMap.video,
  wmv: iconsMap.video,
  html: iconsMap.html,
  md: iconsMap.html,
  js: iconsMap.html,
  css: iconsMap.html,
  exe: iconsMap.exe,
  unknown: iconsMap.white
}
export default typesMap
