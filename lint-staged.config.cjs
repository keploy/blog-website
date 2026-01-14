/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{js,jsx,ts,tsx}': (files) => [
    `next lint --fix ${files.map((f) => `--file ${JSON.stringify(f)}`).join(' ')}`,
  ],
  '*.{js,jsx,ts,tsx,json,md,mdx,css,scss,html,yml,yaml}': (files) => [
    `prettier --write ${files.map((f) => JSON.stringify(f)).join(' ')}`,
  ],
};
