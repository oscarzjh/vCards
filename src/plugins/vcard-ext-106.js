import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import {execSync} from 'child_process'
import addPhoneticField from '../utils/pinyin.js'

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')

  // 使用 JSON_SCHEMA 解析，防止长数字被当作 Number 处理
  //const json = yaml.load(data)
  const json = yaml.load(data, { schema: yaml.JSON_SCHEMA })

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }

  // // 只选择 cellPhone 中 106 长号码
  // if (vCard.cellPhone) {
  //   vCard.cellPhone = vCard.cellPhone
  //     .filter((phone) => {
  //       const phoneStr = `${phone}`
  //       return phoneStr.startsWith('106') 
  //   })
  // }

  // 确保 cellPhone 始终是字符串数组
  if (json.basic.cellPhone) {
    if (Array.isArray(json.basic.cellPhone)) {
      vCard.cellPhone = json.basic.cellPhone.map(phone => String(phone))
    } else {
      vCard.cellPhone = [String(json.basic.cellPhone)]
    }
  }

  if (!vCard.uid){
    vCard.uid = vCard.organization
  }
  
  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  let lastYamlChangeDateString = execSync(`git log -1 --pretty="format:%ci" "${path}"`).toString().trim().replace(/\s\+\d+/, '')
  let lastPngChangeDateString = execSync(`git log -1 --pretty="format:%ci" "${path.replace('yaml', 'png')}"`).toString().trim().replace(/\s\+\d+/, '')

  let rev = new Date(Math.max(new Date(lastYamlChangeDateString), new Date(lastPngChangeDateString))).toISOString()
  
  let formatted = vCard.getFormattedString()
  formatted = formatted.replace(/REV:[\d\-:T\.Z]+/, 'REV:' + rev)
  formatted = addPhoneticField(formatted, 'ORG')
  file.contents = Buffer.from(formatted)
  cb(null, file)
}

export default plugin