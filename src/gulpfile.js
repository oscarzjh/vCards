import fs from 'fs'
import path from 'path'
import { deleteAsync } from 'del'
import through2 from 'through2'

import gulp from 'gulp'
import zip from 'gulp-zip'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import flatmap from 'gulp-flatmap'
import concatFolders from 'gulp-concat-folders'

import plugin_vcard from './plugins/vcard.js'
import plugin_vcard_106 from './plugins/vcard-106.js'
import plugin_vcard_ext from './plugins/vcard-ext.js'
import plugin_vcard_ext_106 from './plugins/vcard-ext-106.js'


const generator = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const generator_ext = () => {
  return gulp.src('data/*/*.yaml')
    .pipe(through2.obj(plugin_vcard_ext))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp'))
}

const archive = () => {
  return gulp.src('temp/**')
    .pipe(zip('archive.zip'))
    .pipe(gulp.dest('./public'))
}

const combine = () => {
  return gulp.src('temp/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '.all.vcf' }))
    .pipe(gulp.dest('./temp'))
}


// //你的需求是：

// // 1.遍历 temp/ 目录下所有子目录，对同一个目录下的 .vcf 文件合并。
// // 2.合并后的文件命名规则：
// //  以当前目录及其上级目录名称拼接，使用 - 连接，后缀 .all.vcf。
// // 3.输出位置：
// // 根目录变为 temp/汇总/，并且保留原 temp/ 的目录结构。

// const combine = () => {
//   return gulp.src('temp/**/*/*.vcf') // 读取所有子目录的 .vcf 文件
//     .pipe(flatmap((stream, file) => {
//       const fileDir = path.dirname(file.path); // 获取当前 .vcf 文件所在目录
//       const relativePath = path.relative('temp', fileDir); // 计算相对路径
//       const folders = relativePath.split(path.sep); // 解析路径为数组
//       const newFileName = folders.join('-') + '.all.vcf'; // 以 `-` 连接所有父级目录
//       const outputDir = path.join('temp/汇总', path.dirname(relativePath)); // 计算输出目录

//       return gulp.src(`${fileDir}/*.vcf`) // 读取当前目录下所有 .vcf
//         .pipe(concat(newFileName)) // 合并文件并命名
//         .pipe(gulp.dest(outputDir)); // 输出到 `temp/汇总/` 对应的目录
//     }));
// };


const allinone = () => {
  return gulp.src('temp/汇总/*.all.vcf')
    .pipe(concat('全部.vcf'))
    .pipe(gulp.dest('./temp/汇总'))
}

// const allinone = () => {
//   return gulp.src('temp/汇总/**/*.all.vcf')
//     .pipe(concat('全部.vcf'))
//     .pipe(gulp.dest('./temp/汇总'))
// }

const clean = () => {
  return deleteAsync([
    'public',
    'temp',
  ])
}


const generator_106 = () => {
  return gulp.src('data_106/*/*.yaml')
    .pipe(through2.obj(plugin_vcard_106))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp_106'))
}

const generator_ext_106 = () => {
  return gulp.src('data_106/*/*.yaml')
    .pipe(through2.obj(plugin_vcard_ext_106))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp_106'))
}

const archive_106 = () => {
  return gulp.src('temp_106/**')
    .pipe(zip('archive_106.zip'))
    .pipe(gulp.dest('./public_106'))
}

const combine_106 = () => {
  return gulp.src('temp_106/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '.all.vcf' }))
    .pipe(gulp.dest('./temp_106'))
}

const allinone_106 = () => {
  return gulp.src('temp_106/汇总/*.all.vcf')
    .pipe(concat('全部.vcf'))
    .pipe(gulp.dest('./temp_106/汇总'))
}

const clean_106 = () => {
  return deleteAsync([
    'public_106',
    'temp_106',
  ])
}


const createRadicale = () => {
  let folders = fs.readdirSync('temp')
    .filter(function(f) {
      return fs.statSync(path.join('temp', f)).isDirectory();
    })
  folders.map(function(folder){
    const fileCount = fs.readdirSync(path.join('temp', folder))
      .filter(file => file.endsWith('.vcf'))
      .length;
    fs.writeFileSync(
      path.join('temp', folder, '/.Radicale.props'), 
      `{"D:displayname": "${folder}(${fileCount})", "tag": "VADDRESSBOOK"}`
    )
  })
  return gulp.src('temp/**', {})
}

const cleanRadicale = () => {
  return deleteAsync([
    'radicale'
  ], {force: true})
}

const distRadicale = () => {
  return gulp.src('temp/**', {dot: true})
    .pipe(gulp.dest('./radicale'))
}


const createRadicale_106 = () => {
  let folders = fs.readdirSync('temp_106')
    .filter(function(f) {
      return fs.statSync(path.join('temp_106', f)).isDirectory();
    })
  folders.map(function(folder){
    const fileCount = fs.readdirSync(path.join('temp_106', folder))
      .filter(file => file.endsWith('.vcf'))
      .length;
    fs.writeFileSync(
      path.join('temp_106', folder, '/.Radicale.props'), 
      `{"D:displayname": "${folder}(${fileCount})", "tag": "VADDRESSBOOK"}`
    )
  })
  return gulp.src('temp_106/**', {})
}

const cleanRadicale_106= () => {
  return deleteAsync([
    'radicale_106',
  ], {force: true})
}

const distRadicale_106 = () => {
  return gulp.src('temp_106/**', {dot: true})
    .pipe(gulp.dest('./radicale_106'))
}


const build = gulp.series(clean, generator, combine, allinone, archive)
const radicale = gulp.series(clean, generator_ext, createRadicale, cleanRadicale, distRadicale)

const build_106 = gulp.series(clean_106, generator_106, combine_106, allinone_106, archive_106)
const radicale_106 = gulp.series(clean_106, generator_ext_106, createRadicale_106, cleanRadicale_106, distRadicale_106)



export {
  generator,
  combine,
  allinone,
  archive,
  build,
  radicale,
  build_106,
  radicale_106
}