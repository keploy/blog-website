const fs = require('fs');
const path = require('path');

function findSubfolder(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folder = entries.find(e => e.isDirectory());
  if (!folder) {
    console.error(`No subdirectory found in: ${dir}`);
    process.exit(1);
  }
  return path.join(dir, folder.name);
}

function findReportFile(directory) {
  const files = fs.readdirSync(directory);
  const reportFile = files.find(file => file.endsWith('.report.json'));
  if (!reportFile) {
    console.error(`No report file found in: ${directory}`);
    process.exit(1);
  }
  return path.join(directory, reportFile);
}

function loadReport(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

const mainDir = findSubfolder('./lhci-reports/app');
const prDir = findSubfolder('./lhci-reports/pr');

const mainReport = loadReport(findReportFile(mainDir));
const prReport = loadReport(findReportFile(prDir));

const categories = ['performance', 'accessibility', 'seo'];
let allPass = true;

categories.forEach(category => {
  const base = mainReport.categories[category].score;
  const pr = prReport.categories[category].score;
  if (pr < base) {
    console.error(`❌ ${category.toUpperCase()} score dropped: PR=${pr}, Main=${base}`);
    allPass = false;
  } else {
    console.log(`✅ ${category.toUpperCase()} score is OK: PR=${pr}, Main=${base}`);
  }
});

if (!allPass) {
  console.error('Some Lighthouse scores regressed. ❌ Failing CI.');
  process.exit(1);
} else {
  console.log('🎉 All Lighthouse scores are equal or improved. ✅');
}
