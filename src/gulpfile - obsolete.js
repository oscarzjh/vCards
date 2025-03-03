import fs from 'fs'
import path from 'path'
import { deleteAsync } from 'del'
import through2 from 'through2'

import gulp from 'gulp'
import zip from 'gulp-zip'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import concatFolders from 'gulp-concat-folders'

import plugin_vcard from './plugins/vcard.js'
import plugin_vcard_ext from './plugins/vcard-ext.js'

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

const allinone = () => {
  return gulp.src('temp/汇总/*.all.vcf')
    .pipe(concat('全部.vcf'))
    .pipe(gulp.dest('./temp/汇总'))
}

const clean = () => {
  return deleteAsync([
    'public',
    'temp'
  ])
}


// 106部分号段
const generator2 = () => {
  return gulp.src('data/*/*/*.yaml')
    .pipe(through2.obj(plugin_vcard))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp-106'))
}

const generator_ext2 = () => {
  return gulp.src('data/*/*/*.yaml')
    .pipe(through2.obj(plugin_vcard_ext))
    .pipe(rename({ extname: '.vcf' }))
    .pipe(gulp.dest('./temp-106'))
}


const archive2 = () => {
  return gulp.src('temp-106/**')
    .pipe(zip('archive-106.zip'))
    .pipe(gulp.dest('./public'))
}

const combine2 = () => {
  return gulp.src('temp-106/*/*.vcf')
    .pipe(concatFolders('汇总'))
    .pipe(rename({ extname: '-106.all.vcf' }))
    .pipe(gulp.dest('./temp-106'))
}

const allinone2 = () => {
  return gulp.src('temp-106/汇总/*-106.all.vcf')
    .pipe(concat('全部-106.vcf'))
    .pipe(gulp.dest('./temp-106/汇总'))
}


const clean2 = () => {
  return deleteAsync([
    'public',
    'temp-106'
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


// 106号段
const createRadicale2 = () => {
  let folders = fs.readdirSync('temp-106')
    .filter(function(f) {
      return fs.statSync(path.join('temp-106', f)).isDirectory();
    })
  folders.map(function(folder){
    const fileCount = fs.readdirSync(path.join('temp-106', folder))
      .filter(file => file.endsWith('.vcf'))
      .length;
    fs.writeFileSync(
      path.join('temp-106', folder, '/.Radicale.props'), 
      `{"D:displayname": "${folder}(${fileCount})", "tag": "VADDRESSBOOK"}`
    )
  })
  return gulp.src('temp-106/**', {})
}

// const cleanRadicale2 = () => {
//   return deleteAsync([
//     'radicale'
//   ], {force: true})
// }

const distRadicale2 = () => {
  return gulp.src('temp-106/**', {dot: true})
    .pipe(gulp.dest('./radicale'))
}


// const build = gulp.series(clean, generator, combine, allinone, archive)
// const radicale = gulp.series(clean, generator_ext, createRadicale, cleanRadicale, distRadicale)

const build = gulp.series(clean,clean2, generator, generator2,combine,combine2, allinone, allinone2,archive,archive2)
// const build2 = gulp.series(clean2, generator2, combine2, allinone2, archive2)
const radicale = gulp.series(clean,clean2, generator_ext,generator_ext2, createRadicale,createRadicale2, cleanRadicale, distRadicale,distRadicale2)
//const radicale2 = gulp.series(clean, generator_ext, createRadicale, cleanRadicale, distRadicale)


export {
  generator,
  combine,
  allinone,
  archive,
  build,
  radicale
}