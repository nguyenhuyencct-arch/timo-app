// Chạy: node tests/generators.test.js
const assert = require('assert');
const { TOPICS, generateExam } = require('../js/generators.js');
const { VOCAB } = require('../js/vocab.js');

let count = 0;
for (const t of TOPICS) {
  for (const gen of t.gens) {
    for (let grade = 1; grade <= 6; grade++) {
      for (let i = 0; i < 400; i++) {
        const q = gen(grade);
        const where = `${t.id}/${gen.name} lớp ${grade}: ${q.text}`;
        assert.strictEqual(q.topic, t.id, where);
        assert.ok(q.text && q.textEn && q.explain, where + ' thiếu nội dung song ngữ');
        assert.ok(!/[ạảãàáâậầấẩẫăắằặẳẵđêềếệểễôồốộổỗơờớợởỡưừứựửữ]/i.test(q.textEn.replace(/An|Bình|Chi|Dũng|Hà|Minh|Lan|Nam|Mai|nghìn đồng/g, '')),
          where + ' — bản tiếng Anh còn chữ tiếng Việt: ' + q.textEn);
        assert.ok(q.options.length >= 3 && q.options.length <= 4, where + ' số phương án');
        assert.strictEqual(new Set(q.options).size, q.options.length, where + ' trùng phương án ' + q.options);
        assert.ok(q.options.includes(q.answer), where + ' thiếu đáp án');
        if (q.optLabels) for (const o of q.options) assert.ok(q.optLabels[o], where + ' thiếu nhãn tiếng Anh cho ' + o);
        assert.ok(!/NaN|undefined|Infinity|\d(th|st|nd|rd)\b.*\b(3th|2th|1th)/.test(q.text + q.textEn + q.explain + q.options.join()), where + ' có NaN/undefined');
        assert.ok(!/\b(1th|2th|3th)\b/.test(q.textEn), where + ' sai số thứ tự');
        count++;
      }
    }
  }
}
for (let g = 1; g <= 6; g++) assert.strictEqual(generateExam(g).length, 25, 'đề thi lớp ' + g);

// Từ vựng
const seen = new Set();
for (const topic of Object.keys(VOCAB)) {
  for (const w of VOCAB[topic]) {
    assert.ok(w.en && w.vi, 'từ vựng thiếu nghĩa: ' + JSON.stringify(w));
    assert.ok(!seen.has(w.en.toLowerCase()), 'từ vựng trùng: ' + w.en);
    seen.add(w.en.toLowerCase());
  }
}
console.log(`OK — đã kiểm tra ${count} câu hỏi và ${seen.size} từ vựng`);
