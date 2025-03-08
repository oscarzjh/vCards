import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import addPhoneticField from '../utils/pinyin.js'

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')

  // 使用 JSON_SCHEMA 确保所有数据解析为字符串，防止长数字被转换成 Number
  //const json = yaml.load(data)
  const json = yaml.load(data, { schema: yaml.JSON_SCHEMA })


  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }


  // 确保 cellPhone 始终是字符串数组
  if (json.basic.cellPhone) {
    if (Array.isArray(json.basic.cellPhone)) {
      vCard.cellPhone = json.basic.cellPhone.map(phone => String(phone))
    } else {
      vCard.cellPhone = [String(json.basic.cellPhone)]
    }
  }

  // 移除特定长号码
  if (vCard.cellPhone) {
    vCard.cellPhone = vCard.cellPhone.filter(phone => !(phone.startsWith('106') && phone.length > 11))
  }

  // // 移除 cellPhone 中 106 长号码
  // if (vCard.cellPhone) {
  //   vCard.cellPhone = vCard.cellPhone
  //     .filter((phone) => {
  //       const phoneStr = `${phone}`
  //       return !phoneStr.startsWith('106') || phoneStr.length <= 11
  //   })
  // }
  
  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  let formatted = vCard.getFormattedString()
  formatted = addPhoneticField(formatted, 'ORG')
  file.contents = Buffer.from(formatted)
  cb(null, file)
}

export default plugin
