import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import addPhoneticField from '../utils/pinyin.js'
import JSONbig from 'json-bigint' // 引入 json-bigint 解析库

// **强制解析数字为字符串**
// yaml.scalarOptions.int.asBigInt = false
// yaml.scalarOptions.int.keepSourceTokens = true

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')
  
  // // 较长的手机号码（超过 15 位）在转换成 vCard 格式时发生了变化，具体表现在 末尾的数字被改动（有的变成 0，有的加 1）。
  // // 使用 JSON_SCHEMA，确保所有数据解析为字符串
  // //const json = yaml.load(data)
  // //const json = yaml.load(data, { schema: yaml.JSON_SCHEMA })
  // // **先用 yaml 转 JSON，然后用 json-bigint 解析**
  // const jsonString = JSON.stringify(yaml.load(data),{ schema: yaml.JSON_SCHEMA }) // YAML 转 JSON 字符串
  // console.log("jsonString为：",jsonString)
  // const json = JSONbig.parse(jsonString) // 使用 json-bigint 解析，保证长数字不会丢失精度
  // console.log("json为：",json.basic.cellPhone)

  const json = yaml.load(data)

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }
  // // 移除 cellPhone 中 106 长号码
  // if (vCard.cellPhone) {
  //   vCard.cellPhone = vCard.cellPhone
  //     .filter((phone) => {
  //       const phoneStr = `${phone}`
  //       return !phoneStr.startsWith('106') || phoneStr.length <= 11
  //   })
  // }

 // 处理 cellPhone，确保为字符串
  if (json.basic.cellPhone) {
    if (Array.isArray(json.basic.cellPhone)) {
      vCard.cellPhone = json.basic.cellPhone.map(phone => String(phone))
    } else {
      vCard.cellPhone = [String(json.basic.cellPhone)]
    }
  }

  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  let formatted = vCard.getFormattedString()
  formatted = addPhoneticField(formatted, 'ORG')

  //console.log("最终 cellPhone:", vCard.cellPhone)

  file.contents = Buffer.from(formatted)
  cb(null, file)
}

export default plugin
