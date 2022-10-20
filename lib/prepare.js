'use strict'

const path = require('path')
const docker = require('./docker/index.js')
const buildTemplateVars = require('./build-template-vars.js')
const string = require('./lang/string/index.js')

module.exports = dockerPrepare

async function dockerPrepare(opts, context) {
  const {cwd, env} = context
  const vars = buildTemplateVars(opts, context)
  const registry = env[opts.registry]
  const project = env[opts.project]
  const name = env[opts.name]
  const image = new docker.Image({
    registry
  , project
  , name
  , dockerfile: opts.dockerfile
  , build_id: opts.build
  , cwd: cwd
  , context: opts.context
  })

  const args = {
    ...opts.args
  }

  for (const [key, value] of Object.entries(args)) {
    image.arg(key, string.template(value)(vars))
  }

  context.logger.info('building image', image.name)
  context.logger.debug('build command: docker %s', image.build_cmd.join(' '))
  await image.build(path.join(cwd, opts.context))
  return image
}
