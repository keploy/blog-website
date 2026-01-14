/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{js,jsx,ts,tsx}': (files) => [
    `next lint --fix ${files.map((f) => `--file ${f}`).join(' ')}`,
  ],
  '*.{js,jsx,ts,tsx,json,md,mdx,css,scss,html,yml,yaml}': (files) => [
    `prettier --write ${files.join(' ')}`,
  ],
};
