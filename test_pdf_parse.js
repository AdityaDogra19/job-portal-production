// Direct test of PDF parsing - testing every step
const fs = require('fs');

const testFile = './uploads/1775638790671-vansh_resume (4).pdf';
console.log('1. File exists?', fs.existsSync(testFile));
console.log('2. File size:', fs.statSync(testFile).size, 'bytes');

const buffer = fs.readFileSync(testFile);
console.log('3. Buffer length:', buffer.length);
console.log('4. First bytes (PDF magic number check):', buffer.slice(0, 5).toString());

// Now test pdf-parse
const pdfParse = require('pdf-parse');

pdfParse(buffer).then(data => {
  console.log('5. SUCCESS! Text length:', data.text.length);
  console.log('6. First 200 chars:', data.text.substring(0, 200));
}).catch(err => {
  console.log('5. FAILED:', err.message);
  console.log('6. Error stack:', err.stack);
});
