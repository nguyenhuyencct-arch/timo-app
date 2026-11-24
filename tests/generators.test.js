// Chạy: node tests/generators.test.js
const assert = require('assert');
const { TOPICS, generateExam } = require('../js/generators.js');
const { VOCAB, glossFor } = require('../js/vocab.js');

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
        assert.ok(!/(^|[^\d.,])1 (candies|dogs|chickens|marbles|apples|socks|trees|cakes|flowers|minutes|seconds|teams|ways|pages|digits|numbers)\b/.test(q.textEn.replace(/<[^>]+>/g, '')), where + ' sai số ít/số nhiều: ' + q.textEn);
        const gl = glossFor(q.textEn);
        assert.ok(gl.length >= 1, where + ' — không có từ chú thích: ' + q.textEn);
        for (const w of gl) assert.ok(w.en && w.vi, where + ' chú thích lỗi');
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
// Lộ trình
const { LESSONS, lessonsFor, allowedFor } = require('../js/curriculum.js');
const { GENS, generateFrom } = require('../js/generators.js');
const allGens = new Set(Object.keys(GENS));
for (const l of LESSONS) assert.ok(GENS[l.gen] && GENS[l.gen].topic === l.topic, 'chuyên đề trỏ sai dạng: ' + l.id);
assert.strictEqual(new Set(LESSONS.map((l) => l.id)).size, LESSONS.length, 'trùng chuyên đề');
for (const name of allGens) assert.ok(LESSONS.some((l) => l.gen === name), 'dạng chưa có trong lộ trình: ' + name);
for (let g = 1; g <= 6; g++) {
  const allowed = allowedFor(g);
  for (const t of TOPICS) assert.ok((allowed[t.id] || []).length >= 3, `lớp ${g} chủ đề ${t.id} quá ít chuyên đề`);
  for (const l of lessonsFor(g)) {
    assert.ok(l.title(g) && l.tip, 'thiếu tên/phương pháp ' + l.id);
    assert.strictEqual(generateFrom([l.gen], g, 5).length, 5, `không sinh đủ 5 câu: ${l.id} lớp ${g}`);
    const variety = new Set();
    for (let i = 0; i < 300; i++) { const q = GENS[l.gen].fn(g); variety.add(q.text + (q.svg || '')); }
    assert.ok(variety.size >= 5, `chuyên đề ${l.id} lớp ${g} quá ít biến thể (${variety.size})`);
  }
  // Bộ đề cố định: cùng seed → cùng danh sách dạng toán nhưng số liệu mới; khác seed → khác dạng
  const e1 = generateExam(g, allowed, 1234), e2 = generateExam(g, allowed, 1234), e3 = generateExam(g, allowed, 999);
  assert.strictEqual(e1.map((q) => q.gen).join(), e2.map((q) => q.gen).join(), 'bộ đề cố định đổi dạng toán ở lớp ' + g);
  assert.ok(e1.every((q) => q.gen && allowed[q.topic].includes(q.gen)), 'đề có dạng không phù hợp lớp ' + g);
  assert.ok(e1.filter((q, i) => q.text === e2[i].text).length < 20, 'làm lại bộ đề mà số liệu gần như không đổi ở lớp ' + g);
  assert.notStrictEqual(e1.map((q) => q.gen).join(), e3.map((q) => q.gen).join(), 'hai bộ đề khác nhau lại trùng ở lớp ' + g);
  assert.strictEqual(new Set(e1.map((q) => q.text + (q.svg || ''))).size, 25, 'đề có câu trùng ở lớp ' + g);
  assert.strictEqual(generateExam(g, allowed, 1234).length, 25);
}
console.log(`Lộ trình: ${LESSONS.length} chuyên đề; số chuyên đề theo lớp: ${[1,2,3,4,5,6].map((g) => lessonsFor(g).length).join(', ')}`);
console.log(`OK — đã kiểm tra ${count} câu hỏi và ${seen.size} từ vựng`);
