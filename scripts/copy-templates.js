const { copy } = require('fs-extra')

copy('./template', './lib/template', {
  overwrite: true,
  recursive: true,
})
