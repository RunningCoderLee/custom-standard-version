const accessSync = require('fs-access').sync
const chalk = require('chalk')
const checkpoint = require('../checkpoint')
const conventionalChangelog = require('conventional-changelog')
const fs = require('fs')
const runLifecycleScript = require('../run-lifecycle-script')
const writeFile = require('../write-file')

module.exports = function (args, newVersion) {
  if (args.skip.changelog) return Promise.resolve()
  return runLifecycleScript(args, 'prechangelog')
    .then(() => {
      return outputChangelog(args, newVersion)
    })
    .then(() => {
      return runLifecycleScript(args, 'postchangelog')
    })
}

function outputChangelog (args, newVersion) {
  return new Promise((resolve, reject) => {
    // 用来标记最后一次发布的位置
    var flag = '<br />'
    createIfMissing(args)
    var header = `# 更新日志\n\n本项目中所有重要改动都会记录在这里。\n\n查阅 [custom-standard-version](https://github.com/RunningCoderLee/custom-standard-version) 获取更多关于提交的参考。\n\n${flag}\n`
    var oldContent = args.dryRun ? '' : fs.readFileSync(args.infile, 'utf-8')
    // find the position of the last release and remove header:
    if (oldContent.indexOf(flag) !== -1) {
      oldContent = oldContent.substring(oldContent.indexOf(flag) + flag.length)
    }
    var content = ''
    var context
    if (args.dryRun) context = {version: newVersion}
    var changelogStream = conventionalChangelog({
      preset: args.preset,
      tagPrefix: args.tagPrefix
    }, context, {merges: null})
      .on('error', function (err) {
        return reject(err)
      })

    changelogStream.on('data', function (buffer) {
      content += buffer.toString()
    })

    changelogStream.on('end', function () {
      checkpoint(args, 'outputting changes to %s', [args.infile])
      if (args.dryRun) console.info(`\n---\n${chalk.gray(content.trim())}\n---\n`)
      else writeFile(args, args.infile, header + '\n' + (content + oldContent).replace(/\n+$/, '\n'))
      return resolve()
    })
  })
}

function createIfMissing (args) {
  try {
    accessSync(args.infile, fs.F_OK)
  } catch (err) {
    if (err.code === 'ENOENT') {
      checkpoint(args, 'created %s', [args.infile])
      args.outputUnreleased = true
      writeFile(args, args.infile, '\n')
    }
  }
}
