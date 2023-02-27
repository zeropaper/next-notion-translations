const path = require('path')

const buildNextCommand = (filenames) =>
  `pnpm -C apps/web lint -- --fix --file ${filenames
    .map((f) => path.relative(__dirname, f))
    .join(' --file ')}`

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildNextCommand],
}
