// Gộp index.html + CSS + JS thành một file HTML duy nhất (dist/timo.html)
// để chia sẻ hoặc đăng lên claude.ai xem trên điện thoại.
// Chạy: node scripts/build-single.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const html = read('index.html');
const body = html.split('<body>')[1].split('</body>')[0]
  .replace(/\s*<script src="[^"]+"><\/script>/g, '');
const out = `<title>Luyện Toán TIMO</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
${read('css/styles.css')}
</style>
${body.trim()}
<script>
${read('js/generators.js')}
</script>
<script>
${read('js/app.js')}
</script>
`;
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/timo.html'), out);
console.log('Đã tạo dist/timo.html (' + Math.round(out.length / 1024) + ' KB)');
