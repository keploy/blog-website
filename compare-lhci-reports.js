const fs = require('fs');
const path = require('path');

function findReportFile(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  let files = fs.readdirSync(dir);
  let reportFile = files.find(f => f.endsWith('.report.json'));
  if (reportFile) return path.join(dir, reportFile);

  const subdir = files.find(f => fs.statSync(path.join(dir, f)).isDirectory());
  if (!subdir) {
    console.error(`No .report.json or subfolder found in: ${dir}`);
    process.exit(1);
  }

  const subDirPath = path.join(dir, subdir);
  files = fs.readdirSync(subDirPath);
  reportFile = files.find(f => f.endsWith('.report.json'));
  if (!reportFile) {
    console.error(`No report file found in subfolder: ${subDirPath}`);
    process.exit(1);
  }

  return path.join(subDirPath, reportFile);
}

function loadReport(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

const mainReport = loadReport(findReportFile('./lhci-reports/app'));
const prReport = loadReport(findReportFile('./lhci-reports/pr'));

const categories = ['performance', 'accessibility', 'seo', 'best-practices'];

console.log('\n🔍 Lighthouse Scores:\n');
console.log(`| Category        | Main Branch | PR Branch |`);
console.log(`|-----------------|-------------|-----------|`);

categories.forEach(category => {
  const base = mainReport.categories[category]?.score ?? 'N/A';
  const pr = prReport.categories[category]?.score ?? 'N/A';
  const toPercent = s => (typeof s === 'number' ? `${Math.round(s * 100)}%` : s);
  console.log(`| ${category.padEnd(15)} | ${toPercent(base).padEnd(11)} | ${toPercent(pr)} |`);
});

console.log('\n✅ Done printing LHCI scores.\n');
