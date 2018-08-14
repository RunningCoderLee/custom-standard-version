#!/usr/bin/env node
var standardVersion = require('../index')
var cmdParser = require('../command')

var nodeVerArr = process.version.match(/v(\d+)\.(\d+)\./)
var majorVer = nodeVerArr[1]
var minorVer = nodeVerArr[2]
var isInvalidVersion = majorVer < 6 || (Number(majorVer) === 6 && minorVer < 9)
/* istanbul ignore if */

if (isInvalidVersion) {
  console.error('custom-standard-version: Node v6.9 or greater is required. `custom-standard-version` did not run.')
} else {
  standardVersion(cmdParser.argv)
    .catch(() => {
      process.exit(1)
    })
}
