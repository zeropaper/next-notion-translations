const path = require('path')

const buildNextCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    // .map((f) => path.relative(__dirname, f))
    .join(' --file ')}`

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildNextCommand],
  // 'packages/**/*.{js,jsx,ts,tsx}': [buildNextCommand],
}

// module.exports = {
//   "*.{js,ts,tsx, jsx}": [
//     "eslint --quiet --fix"
//   ],
//   "*.{json,md,html,js,jsx,ts,tsx}": [
//     "prettier --write"
//   ]
// }