'use strict'

const buildTemplateVars = require('./build-template-vars.js')
const docker = require('./docker/index.js')
const string = require('./lang/string/index.js')

module.exports = publish

async function publish(opts, context) {
  const {cwd, logger, env} = context
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

  const tags = opts.tags.map((template) => {
    return string.template(template)(vars)
  }).filter(Boolean)

  logger.info('tagging docker image', image.id)
  for (const tag of tags) {
    logger.info(`pushing image: ${image.repo} tag: ${tag}`)
    await image.tag(tag, opts.publish)
  }

  await image.clean()
}
