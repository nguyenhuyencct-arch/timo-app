// Chạy: node tests/generators.test.js
const assert = require('assert');
const { TOPICS, generateExam } = require('../js/generators.js');

let count = 0;
for (const t of TOPICS) {
  for (const gen of t.gens) {
    for (let grade = 1; grade <= 6; grade++) {
      for (let i = 0; i < 400; i++) {
        const q = gen(grade);
        const where = `${t.id}/${gen.name} lớp ${grade}: ${q.text}`;
        assert.strictEqual(q.topic, t.id, where);
        assert.ok(q.text && q.explain, where);
        assert.ok(q.options.length >= 3 && q.options.length <= 4, where + ' số phương án');
        assert.strictEqual(new Set(q.options).size, q.options.length, where + ' trùng phương án ' + q.options);
        assert.ok(q.options.includes(q.answer), where + ' thiếu đáp án');
        assert.ok(!/NaN|undefined|Infinity/.test(q.text + q.explain + q.options.join()), where + ' có NaN/undefined');
        for (const o of q.options) if (/^\d/.test(o)) assert.ok(!o.startsWith('-'), where);
        count++;
      }
    }
  }
}
for (let g = 1; g <= 6; g++) {
  const exam = generateExam(g);
  assert.strictEqual(exam.length, 25, 'đề thi lớp ' + g);
}
console.log(`OK — đã kiểm tra ${count} câu hỏi`);
