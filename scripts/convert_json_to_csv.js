const fs = require('fs');
const json = JSON.parse(fs.readFileSync('data/phase2_vertical_slice_evidence.json', 'utf8'));

const headers = Object.keys(json[0]);
const rows = [headers.join(',')];

for (const item of json) {
  const row = headers.map(h => {
    let val = item[h];
    if (val === null || val === undefined) return '';
    val = String(val).replace(/"/g, '""');
    return '"' + val + '"';
  });
  rows.push(row.join(','));
}

fs.writeFileSync('data/phase2_vertical_slice_evidence.csv', rows.join('\n'), 'utf8');
console.log('Saved CSV with', rows.length - 1, 'records');
