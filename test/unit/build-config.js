'use strict'

const path = require('path')
const {test, threw} = require('tap')
const buildConfig = require('../../lib/build-config.js')

test('build-config', async (t) => {
  t.testdir({
    standard: {
      'package.json': JSON.stringify({name: 'this-is-not-scoped'})
    }
  , scoped: {
      'package.json': JSON.stringify({name: '@scope/this-is-scoped'})
    }
  , workspace: {
      one: {
        'package.json': JSON.stringify({name: '@internal/package'})
      }
    }
  })

  t.test('standard package', async (tt) => {
    const config = await buildConfig('id', {
    }, {
      cwd: path.join(t.testdirName, 'standard')
    })
    tt.match(config, {
      dockerfile: 'Dockerfile'
    , nocache: false
    , tags: ['latest', '{major}-latest', '{version}']
    , args: {
        SRC_DIRECTORY: 'standard'
      , TARGET_PATH: '.'
      , NPM_PACKAGE_NAME: 'this-is-not-scoped'
      , NPM_PACKAGE_SCOPE: null
      , CONFIG_NAME: 'this-is-not-scoped'
      , CONFIG_PROJECT: null
      }
    , pkg: Object
    , registry: null
    , name: 'this-is-not-scoped'
    , project: null
    , build: 'id'
    , context: '.'
    })
  })

  t.test('nested workspace: target resolution', async (tt) => {
    const config = await buildConfig('id', {
    }, {
      options: {
        root: t.testdirName
      }
    , cwd: path.join(t.testdirName, 'workspace', 'one')
    })
    tt.match(config, {
      dockerfile: 'Dockerfile'
    , nocache: false
    , tags: ['latest', '{major}-latest', '{version}']
    , args: {
        SRC_DIRECTORY: 'one'
      , TARGET_PATH: 'workspace/one'
      , NPM_PACKAGE_NAME: 'package'
      , NPM_PACKAGE_SCOPE: 'internal'
      , CONFIG_NAME: 'package'
      , CONFIG_PROJECT: 'internal'
      }
    , pkg: Object
    , registry: null
    , name: 'package'
    , project: 'internal'
    , build: 'id'
    , context: '.'
    })
  })

  t.test('scoped package', async (tt) => {
    {
      const config = await buildConfig('id', {
      }, {
        cwd: path.join(t.testdirName, 'scoped')
      })
      tt.match(config, {
        dockerfile: 'Dockerfile'
      , nocache: false
      , tags: ['latest', '{major}-latest', '{version}']
      , args: {
          SRC_DIRECTORY: 'scoped'
        , TARGET_PATH: '.'
        , NPM_PACKAGE_NAME: '@scope/this-is-scoped'
        , NPM_PACKAGE_SCOPE: 'scope'
        , CONFIG_NAME: 'this-is-scoped'
        , CONFIG_PROJECT: 'scope'
        }
      , pkg: Object
      , registry: null
      , name: 'this-is-scoped'
      , project: 'scope'
      , build: 'id'
      , context: '.'
      })
    }

    {
      const config = await buildConfig('id', {
        docker: {
          project: 'kittens'
        , image: 'override'
        , dockerfile: 'Dockerfile.test'
        }
      }, {
        cwd: path.join(t.testdirName, 'scoped')
      })
      tt.match(config, {
        dockerfile: 'Dockerfile.test'
      , nocache: false
      , tags: ['latest', '{major}-latest', '{version}']
      , args: {
          SRC_DIRECTORY: 'scoped'
        , TARGET_PATH: '.'
        , NPM_PACKAGE_NAME: '@scope/this-is-scoped'
        , NPM_PACKAGE_SCOPE: 'scope'
        , CONFIG_NAME: 'override'
        , CONFIG_PROJECT: 'kittens'
        }
      , pkg: Object
      , registry: null
      , name: 'override'
      , project: 'kittens'
      , build: 'id'
      , context: '.'
      })
    }

    {
      const config = await buildConfig('id', {
        docker: {
          project: null
        , image: 'override'
        , dockerfile: 'Dockerfile.test'
        }
      }, {
        cwd: path.join(t.testdirName, 'scoped')
      })
      tt.match(config, {
        dockerfile: 'Dockerfile.test'
      , nocache: false
      , tags: ['latest', '{major}-latest', '{version}']
      , args: {
          SRC_DIRECTORY: 'scoped'
        , TARGET_PATH: '.'
        , NPM_PACKAGE_NAME: '@scope/this-is-scoped'
        , NPM_PACKAGE_SCOPE: 'scope'
        , CONFIG_NAME: 'override'
        , CONFIG_PROJECT: null
        }
      , pkg: Object
      , registry: null
      , name: 'override'
      , project: null
      , build: 'id'
      , context: '.'
      })
    }
  })
}).catch(threw)
