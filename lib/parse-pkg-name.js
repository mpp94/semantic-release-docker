'use strict'

const NAME_EXP = /^(?:@([^/]+?)[/])?([^/]+?)$/

module.exports = parsePkgName

function parsePkgName(pkgname) {
  if (!pkgname) return {scope: null, name: null}
  console.log('test exec 1', NAME_EXP.exec(pkgname))
  const [_, scope = null, name = null] = (NAME_EXP.exec(pkgname) || [])
  console.log('test exec 2', NAME_EXP.exec(pkgname))
  return {scope, name}
}

