/*
 * Bộ sinh câu hỏi Toán TIMO cho tiểu học (lớp 1–6) — song ngữ Việt/Anh.
 * Mỗi câu hỏi được sinh ngẫu nhiên theo tham số, đáp án được tính bằng máy
 * (nhiều dạng dùng duyệt vét cạn) để đảm bảo luôn đúng.
 *
 * Câu hỏi trả về dạng:
 *   { topic, text (tiếng Việt), textEn (tiếng Anh), answer, options[],
 *     optLabels? ({giá trị: nhãn tiếng Anh}), explain (tiếng Việt), svg? }
 */
(function (root) {
  'use strict';

  // ---------- Tiện ích ----------
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const band = (g) => (g <= 2 ? 1 : g <= 4 ? 2 : 3);
  // Nhóm hàng nghìn bằng khoảng trắng hẹp: đọc đúng cả trong tiếng Việt lẫn tiếng Anh.
  const fmt = (n) => (Math.abs(n) >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n));
  /** Số thứ tự tiếng Anh: 1st, 2nd, 3rd, 4th, 11th... */
  const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
  const C2 = (n) => (n * (n - 1)) / 2;
  function binom(n, k) {
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return Math.round(r);
  }

  const NAMES = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Minh', 'Lan', 'Nam'];
  const DAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const NUM_WORD = { 2: ['hai', 'two'], 3: ['ba', 'three'] };

  /** Tạo 4 phương án số (gồm đáp án + nhiễu hợp lý). */
  function numOptions(ans, extras) {
    const set = new Set([ans]);
    for (const e of shuffle(extras || [])) {
      if (set.size >= 4) break;
      if (Number.isInteger(e) && e >= 0 && e !== ans) set.add(e);
    }
    const deltas = shuffle([1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10]);
    let i = 0;
    while (set.size < 4) {
      const v = ans + deltas[i % deltas.length] * (1 + Math.floor(i / deltas.length));
      if (v >= 0) set.add(v);
      i++;
    }
    return shuffle([...set]);
  }

  /** Câu hỏi có đáp án là số. text = [tiếng Việt, tiếng Anh]. */
  function numQ(topic, text, ans, extras, explain, svg) {
    return {
      topic,
      text: text[0],
      textEn: text[1],
      answer: fmt(ans),
      options: numOptions(ans, extras).map(fmt),
      explain,
      svg: svg || null,
    };
  }

  /** Câu hỏi có đáp án là chữ (tên, thứ...). labelsEn: nhãn tiếng Anh cho từng giá trị (nếu khác). */
  function strQ(topic, text, ans, pool, explain, labelsEn) {
    const others = shuffle(pool.filter((p) => p !== ans)).slice(0, 3);
    const q = { topic, text: text[0], textEn: text[1], answer: ans, options: shuffle([ans, ...others]), explain, svg: null };
    if (labelsEn) q.optLabels = labelsEn;
    return q;
  }

  // ---------- Hình vẽ SVG ----------
  const SVG_OPEN = (w, h) =>
    `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="fig" role="img" xmlns="http://www.w3.org/2000/svg">`;

  function svgGrid(rows, cols, opts = {}) {
    const cell = Math.min(36, Math.floor(200 / Math.max(rows, cols)));
    const pad = 18;
    const w = cols * cell + pad * 2;
    const h = rows * cell + pad * 2;
    let s = SVG_OPEN(w, h);
    for (let r = 0; r <= rows; r++)
      s += `<line x1="${pad}" y1="${pad + r * cell}" x2="${pad + cols * cell}" y2="${pad + r * cell}" stroke="currentColor" stroke-width="2"/>`;
    for (let c = 0; c <= cols; c++)
      s += `<line x1="${pad + c * cell}" y1="${pad}" x2="${pad + c * cell}" y2="${pad + rows * cell}" stroke="currentColor" stroke-width="2"/>`;
    if (opts.star) {
      const [r, c] = opts.star;
      s += `<text x="${pad + (c - 0.5) * cell}" y="${pad + (r - 0.5) * cell}" font-size="${Math.round(cell * 0.62)}" text-anchor="middle" dominant-baseline="central" fill="#e4572e">★</text>`;
    }
    if (opts.labels) {
      s += `<circle cx="${pad}" cy="${pad + rows * cell}" r="5" fill="#e4572e"/><text x="${pad - 14}" y="${pad + rows * cell + 14}" font-size="14" fill="currentColor">A</text>`;
      s += `<circle cx="${pad + cols * cell}" cy="${pad}" r="5" fill="#2e86de"/><text x="${pad + cols * cell + 4}" y="${pad - 4}" font-size="14" fill="currentColor">B</text>`;
    }
    return s + '</svg>';
  }

  function svgFan(n) {
    // n đoạn thẳng xuất phát từ đỉnh xuống cạnh đáy (kể cả 2 cạnh bên)
    const W = 240, H = 170, ax = W / 2, ay = 14, by = 150, x0 = 14, x1 = W - 14;
    let s = SVG_OPEN(W, H);
    s += `<line x1="${x0}" y1="${by}" x2="${x1}" y2="${by}" stroke="currentColor" stroke-width="2"/>`;
    for (let i = 0; i < n; i++) {
      const x = x0 + ((x1 - x0) * i) / (n - 1);
      s += `<line x1="${ax}" y1="${ay}" x2="${x}" y2="${by}" stroke="currentColor" stroke-width="2"/>`;
    }
    return s + '</svg>';
  }

  // =====================================================================
  // 1. TƯ DUY LOGIC — LOGICAL THINKING
  // =====================================================================
  const logic = [];

  // Quy luật dãy số
  logic.push(function sequence(g) {
    const b = band(g);
    let terms, next, explain;
    const kind = b === 1 ? 'arith' : b === 2 ? pick(['arith', 'second', 'geo']) : pick(['second', 'geo', 'fib', 'square']);
    if (kind === 'arith') {
      const d = b === 1 ? rand(2, 5) : rand(3, 12);
      const down = b > 1 && Math.random() < 0.4;
      const s = down ? rand(5 * d + 5, 5 * d + 60) : rand(1, 20);
      terms = Array.from({ length: 5 }, (_, i) => s + (down ? -1 : 1) * d * i);
      next = s + (down ? -1 : 1) * d * 5;
      explain = `Mỗi số ${down ? 'kém' : 'hơn'} số liền trước ${d} đơn vị. Số tiếp theo là ${terms[4]} ${down ? '−' : '+'} ${d} = ${next}.`;
    } else if (kind === 'second') {
      const s = rand(1, 10), d0 = rand(1, 4), inc = rand(1, b === 3 ? 3 : 2);
      terms = [s];
      let d = d0;
      for (let i = 1; i < 6; i++) { terms.push(terms[i - 1] + d); d += inc; }
      next = terms.pop();
      const diffs = terms.slice(1).map((t, i) => t - terms[i]);
      explain = `Hiệu giữa các số liên tiếp là ${diffs.join(', ')} — mỗi hiệu tăng thêm ${inc}. Hiệu tiếp theo là ${diffs[3] + inc}, nên số cần tìm là ${terms[4]} + ${diffs[3] + inc} = ${next}.`;
    } else if (kind === 'geo') {
      const r = pick([2, 3]), s = rand(1, r === 2 ? 5 : 3);
      terms = Array.from({ length: 5 }, (_, i) => s * r ** i);
      next = s * r ** 5;
      explain = `Mỗi số gấp ${r} lần số liền trước. Số tiếp theo là ${terms[4]} × ${r} = ${next}.`;
    } else if (kind === 'fib') {
      const a = rand(1, 5), c = rand(a, a + 5);
      terms = [a, c];
      while (terms.length < 6) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
      next = terms.pop();
      explain = `Từ số thứ ba, mỗi số bằng tổng hai số liền trước. Số tiếp theo là ${terms[3]} + ${terms[4]} = ${next}.`;
    } else {
      const k = rand(0, 5), st = rand(1, 3);
      terms = Array.from({ length: 5 }, (_, i) => (st + i) ** 2 + k);
      next = (st + 5) ** 2 + k;
      explain = `Các số có dạng n × n + ${k}: ${terms.map((t, i) => `${st + i}×${st + i}+${k}`).join(', ')}. Số tiếp theo là ${st + 5}×${st + 5}+${k} = ${next}.`;
    }
    const d4 = terms[4] - terms[3];
    const seq = `<b>${terms.join(', ')}, ...</b>`;
    return numQ('logic', [`Tìm số tiếp theo của dãy: ${seq}`, `Find the next number in the sequence: ${seq}`],
      next, [terms[4] + d4, next + 1, next - 2, terms[4] * 2], explain);
  });

  // Bài toán tuổi
  logic.push(function ages(g) {
    const b = band(g);
    if (b === 1) {
      const d = rand(2, 6), x = rand(3, 9);
      return numQ('logic', [
        `Anh hơn em ${d} tuổi. Khi em ${x} tuổi thì anh bao nhiêu tuổi?`,
        `An older brother is ${d} years older than his younger brother. How old is the older brother when the younger brother is ${x} years old?`,
      ], x + d, [x - d, d, x + d + 1],
      `Hiệu số tuổi của hai anh em không thay đổi theo thời gian. Khi em ${x} tuổi thì anh ${x} + ${d} = ${x + d} tuổi.`);
    }
    for (;;) {
      const x = rand(6, 15), k = rand(2, b === 3 ? 5 : 4), n = rand(1, 8);
      const an = x - n, me = k * x - n, D = me - an;
      if (an < 2 || D < 18 || D > 40) continue;
      return numQ('logic', [
        `Năm nay An ${an} tuổi, mẹ ${me} tuổi. Hỏi sau bao nhiêu năm nữa thì tuổi mẹ gấp ${k} lần tuổi An?`,
        `This year An is ${an} years old and An's mother is ${me} years old. In how many years will the mother's age be ${k} times An's age?`,
      ], n, [x, n + 1, D, k * n],
      `Mẹ luôn hơn An ${me} − ${an} = ${D} tuổi. Khi tuổi mẹ gấp ${k} lần tuổi An thì hiệu số tuổi bằng ${k} − 1 = ${k - 1} lần tuổi An.<br>Lúc đó An ${D} : ${k - 1} = ${x} tuổi. Vậy sau ${x} − ${an} = <b>${n}</b> năm.`);
    }
  });

  // Sắp xếp thứ tự (cao/thấp)
  logic.push(function ordering(g) {
    const b = band(g);
    const count = b + 2;
    const people = shuffle(NAMES).slice(0, count); // từ cao nhất đến thấp nhất
    const facts = [];
    for (let i = 0; i < count - 1; i++) {
      facts.push(Math.random() < 0.5
        ? [`${people[i]} cao hơn ${people[i + 1]}`, `${people[i]} is taller than ${people[i + 1]}`]
        : [`${people[i + 1]} thấp hơn ${people[i]}`, `${people[i + 1]} is shorter than ${people[i]}`]);
    }
    const ask = b === 3 ? pick(['tall', 'short', 'second']) : pick(['tall', 'short']);
    const qVi = { tall: 'Ai cao nhất?', short: 'Ai thấp nhất?', second: 'Ai cao thứ nhì?' }[ask];
    const qEn = { tall: 'Who is the tallest?', short: 'Who is the shortest?', second: 'Who is the second tallest?' }[ask];
    const ans = { tall: people[0], short: people[count - 1], second: people[1] }[ask];
    const shown = shuffle(people).join(', ');
    const order = shuffle(facts);
    const list = (k) => `<ul>${order.map((f) => `<li>${f[k]}</li>`).join('')}</ul>`;
    return strQ('logic', [
      `Có ${count} bạn: ${shown}. Biết rằng:${list(0)}${qVi}`,
      `There are ${count} children: ${shown}. We know that:${list(1)}${qEn}`,
    ], ans, people,
    `Sắp xếp từ cao đến thấp: <b>${people.join(' > ')}</b>. Vậy câu trả lời là ${ans}.`);
  });

  // Ngày trong tuần
  logic.push(function weekday(g) {
    const b = band(g);
    const today = rand(0, 6);
    const N = b === 1 ? rand(2, 12) : b === 2 ? rand(15, 100) : rand(100, 400);
    const ai = (today + N) % 7, ans = DAYS[ai];
    const q = Math.floor(N / 7), r = N % 7;
    const labels = {};
    DAYS.forEach((d, i) => { labels[d] = DAYS_EN[i]; });
    return strQ('logic', [
      `Hôm nay là <b>${DAYS[today]}</b>. Hỏi ${N} ngày nữa là thứ mấy?`,
      `Today is <b>${DAYS_EN[today]}</b>. What day of the week will it be ${N} days from today?`,
    ], ans, DAYS,
    `Một tuần có 7 ngày nên cứ 7 ngày lại lặp lại thứ cũ. ${N} = 7 × ${q} + ${r}. Từ ${DAYS[today]} đếm thêm ${r} ngày được <b>${ans}</b> (${DAYS_EN[ai]}).`, labels);
  });

  // Trồng cây, cưa gỗ, leo cầu thang
  logic.push(function intervals(g) {
    const b = band(g);
    if (b === 1) {
      const n = rand(3, 7), t = rand(2, 5);
      return numQ('logic', [
        `Một khúc gỗ được cưa thành ${n} đoạn. Mỗi lần cưa mất ${t} phút. Hỏi cưa xong mất bao nhiêu phút?`,
        `A log is sawn into ${n} pieces. Each cut takes ${t} minutes. How many minutes does it take to finish?`,
      ], (n - 1) * t, [n * t, (n + 1) * t],
      `Cưa thành ${n} đoạn chỉ cần ${n} − 1 = ${n - 1} lần cưa. Thời gian: ${n - 1} × ${t} = <b>${(n - 1) * t}</b> phút.`);
    }
    if (b === 2 || Math.random() < 0.4) {
      const d = pick([2, 3, 4, 5, 10]), k = rand(6, 30), L = d * k;
      return numQ('logic', [
        `Người ta trồng cây ở một bên đường dài ${L} m, cứ cách ${d} m trồng một cây, cả hai đầu đường đều có cây. Hỏi trồng được bao nhiêu cây?`,
        `Trees are planted along one side of a ${L} m road, one tree every ${d} m, with a tree at both ends. How many trees are planted?`,
      ], k + 1, [k, k - 1, k + 2],
      `Đoạn đường được chia thành ${L} : ${d} = ${k} khoảng. Trồng cả hai đầu thì số cây nhiều hơn số khoảng 1: ${k} + 1 = <b>${k + 1}</b> cây.`);
    }
    const s = rand(3, 8), a = rand(3, 5), n = rand(6, 12);
    return numQ('logic', [
      `Đi bộ từ tầng 1 lên tầng ${a} mất ${s * (a - 1)} giây. Hỏi với tốc độ như vậy, đi từ tầng 1 lên tầng ${n} mất bao nhiêu giây?`,
      `It takes ${s * (a - 1)} seconds to walk from the 1st floor to the ${ord(a)} floor. At the same speed, how many seconds does it take to walk from the 1st floor to the ${ord(n)} floor?`,
    ], s * (n - 1), [s * n, Math.round((s * (a - 1) * n) / a), s * (n - 2)],
    `Từ tầng 1 lên tầng ${a} phải đi ${a - 1} lượt cầu thang, mỗi lượt mất ${s * (a - 1)} : ${a - 1} = ${s} giây. Lên tầng ${n} phải đi ${n - 1} lượt: ${n - 1} × ${s} = <b>${s * (n - 1)}</b> giây.`);
  });

  // =====================================================================
  // 2. SỐ HỌC — ARITHMETIC
  // =====================================================================
  const arith = [];

  // Tính nhanh
  arith.push(function quickCalc(g) {
    const b = band(g);
    const calc = (expr) => [`Tính nhanh: <b>${expr}</b>`, `Calculate quickly: <b>${expr}</b>`];
    if (g === 1) {
      const a = rand(1, 9), c = rand(1, 9);
      const nums = shuffle([a, 10 - a, c, 10 - c]);
      return numQ('arith', calc(nums.join(' + ')), 20, [19, 21, 18],
        `Ghép các số có tổng bằng 10: (${a} + ${10 - a}) + (${c} + ${10 - c}) = 10 + 10 = <b>20</b>.`);
    }
    if (b === 1) {
      const a = rand(11, 89), m = rand(5, 40);
      return numQ('arith', calc(`${a} + ${m} + ${100 - a}`), 100 + m, [90 + m, 110 + m, 100 + m + 1],
        `(${a} + ${100 - a}) + ${m} = 100 + ${m} = <b>${100 + m}</b>.`);
    }
    if (b === 2) {
      if (Math.random() < 0.5) {
        const a = rand(12, 99), x = rand(11, 89);
        return numQ('arith', calc(`${a} × ${x} + ${a} × ${100 - x}`), a * 100, [a * 10, a * 100 + a, a * 99],
          `Đưa thừa số chung ra ngoài: ${a} × (${x} + ${100 - x}) = ${a} × 100 = <b>${fmt(a * 100)}</b>.`);
      }
      const k = rand(7, 99);
      return numQ('arith', calc(`25 × ${k} × 4`), 100 * k, [10 * k, 100 * k + 25, 99 * k],
        `Đổi chỗ các thừa số: (25 × 4) × ${k} = 100 × ${k} = <b>${fmt(100 * k)}</b>.`);
    }
    const s = rand(1, 20), d = rand(1, 5), n = rand(10, 40), last = s + d * (n - 1);
    const sum = (n * (s + last)) / 2;
    const expr = `<b>${s} + ${s + d} + ${s + 2 * d} + ... + ${last}</b>`;
    return numQ('arith', [`Tính tổng: ${expr}`, `Find the sum: ${expr}`], sum, [sum - last, sum + s, n * last],
      `Dãy có (${last} − ${s}) : ${d} + 1 = ${n} số hạng. Tổng = (số đầu + số cuối) × số số hạng : 2 = (${s} + ${last}) × ${n} : 2 = <b>${fmt(sum)}</b>.`);
  });

  // Tìm số chưa biết
  arith.push(function findX(g) {
    const b = band(g);
    // Tiếng Anh viết phép chia là ÷, tiếng Việt viết là :
    const box = (expr) => [`Tìm số thích hợp điền vào ô trống: <b>${expr}</b>`, `Find the missing number: <b>${expr.replace(/ : /g, ' ÷ ')}</b>`];
    if (b === 1) {
      const max = g === 1 ? 20 : 100;
      const x = rand(1, max - 5), a = rand(1, max - x);
      if (Math.random() < 0.5)
        return numQ('arith', box(`□ + ${a} = ${x + a}`), x, [x + a, a, x + 1], `□ = ${x + a} − ${a} = <b>${x}</b>.`);
      return numQ('arith', box(`□ − ${a} = ${x}`), x + a, [x, x - a, a], `□ = ${x} + ${a} = <b>${x + a}</b>.`);
    }
    if (b === 2) {
      const x = rand(2, 40), a = rand(2, 30), m = rand(2, 9);
      return numQ('arith', box(`(□ + ${a}) × ${m} = ${(x + a) * m}`), x, [x + a, (x + a) * m - a, x * m],
        `□ + ${a} = ${(x + a) * m} : ${m} = ${x + a}, nên □ = ${x + a} − ${a} = <b>${x}</b>.`);
    }
    for (;;) {
      const x = rand(5, 60), a = rand(2, 9), c = rand(2, 9), d = rand(20, 120), bb = d * c - x * a;
      if (bb <= 0) continue;
      return numQ('arith', box(`(□ × ${a} + ${bb}) : ${c} = ${d}`), x, [x + 1, d * c, x * a],
        `□ × ${a} + ${bb} = ${d} × ${c} = ${d * c}; □ × ${a} = ${d * c} − ${bb} = ${x * a}; □ = ${x * a} : ${a} = <b>${x}</b>.`);
    }
  });

  // Tổng – hiệu, tổng – tỉ
  arith.push(function sumDiff(g) {
    const b = band(g);
    if (b === 1) {
      const a = rand(5, 20), d = rand(2, 9);
      return numQ('arith', [
        `Lan có ${a} bông hoa. Mai có nhiều hơn Lan ${d} bông hoa. Hỏi cả hai bạn có bao nhiêu bông hoa?`,
        `Lan has ${a} flowers. Mai has ${d} more flowers than Lan. How many flowers do they have altogether?`,
      ], 2 * a + d, [a + d, 2 * a, 2 * a + 2 * d],
      `Mai có ${a} + ${d} = ${a + d} bông. Cả hai có ${a} + ${a + d} = <b>${2 * a + d}</b> bông.`);
    }
    if (b === 2 || Math.random() < 0.5) {
      const small = rand(10, b === 2 ? 80 : 400), diff = rand(4, b === 2 ? 40 : 150), big = small + diff, S = small + big;
      const askBig = Math.random() < 0.5;
      return numQ('arith', [
        `Tổng của hai số là ${fmt(S)}, hiệu của chúng là ${diff}. Tìm số ${askBig ? 'lớn' : 'bé'}.`,
        `The sum of two numbers is ${fmt(S)} and their difference is ${diff}. Find the ${askBig ? 'larger' : 'smaller'} number.`,
      ], askBig ? big : small, [askBig ? small : big, S - diff, (S + diff) / 2 + diff],
      `Số lớn = (Tổng + Hiệu) : 2 = (${fmt(S)} + ${diff}) : 2 = ${big}.<br>Số bé = (Tổng − Hiệu) : 2 = (${fmt(S)} − ${diff}) : 2 = ${small}.`);
    }
    const k = rand(2, 6), small = rand(8, 60), S = small * (k + 1);
    return numQ('arith', [
      `Hai bạn có tất cả ${S} viên bi. Số bi của Nam gấp ${k} lần số bi của Hà. Hỏi Nam có bao nhiêu viên bi?`,
      `Two children have ${S} marbles in total. Nam has ${k} times as many marbles as Hà. How many marbles does Nam have?`,
    ], small * k, [small, S - k, small * (k - 1)],
    `Coi số bi của Hà là 1 phần thì của Nam là ${k} phần, tổng ${k + 1} phần. Một phần: ${S} : ${k + 1} = ${small}. Nam có ${small} × ${k} = <b>${small * k}</b> viên.`);
  });

  // Gà – chó
  arith.push(function chickenDog(g) {
    const b = band(g);
    if (b === 1) {
      const c = rand(2, 8), d = rand(1, 5);
      return numQ('arith', [
        `Trong sân có ${c} con gà và ${d} con chó. Hỏi có tất cả bao nhiêu cái chân?`,
        `There are ${c} chickens and ${d} dogs in the yard. How many legs are there in total?`,
      ], 2 * c + 4 * d, [2 * (c + d), 4 * (c + d), c + d],
      `Gà có 2 chân, chó có 4 chân. Số chân: ${c} × 2 + ${d} × 4 = ${2 * c} + ${4 * d} = <b>${2 * c + 4 * d}</b>.`);
    }
    const H = b === 2 ? rand(8, 20) : rand(20, 50), d = rand(1, H - 1), L = 2 * H + 2 * d;
    const askDog = Math.random() < 0.5;
    return numQ('arith', [
      `Vừa gà vừa chó có ${H} con, đếm được ${L} cái chân. Hỏi có bao nhiêu con ${askDog ? 'chó' : 'gà'}?`,
      `There are ${H} chickens and dogs in total, with ${L} legs altogether. How many ${askDog ? 'dogs' : 'chickens'} are there?`,
    ], askDog ? d : H - d, [askDog ? H - d : d, L / 4, L - 2 * H],
    `Giả sử tất cả đều là gà thì có ${H} × 2 = ${2 * H} chân, ít hơn thực tế ${L} − ${2 * H} = ${L - 2 * H} chân. Mỗi con chó hơn con gà 2 chân nên số chó là ${L - 2 * H} : 2 = ${d}, số gà là ${H} − ${d} = ${H - d}.`);
  });

  // Trung bình cộng / phần trăm
  arith.push(function average(g) {
    const b = band(g);
    if (b === 1) {
      const per = rand(2, 5), n = rand(3, 9);
      return numQ('arith', [
        `Mỗi hộp có ${per} cái bánh. Hỏi ${n} hộp có bao nhiêu cái bánh?`,
        `Each box has ${per} cakes. How many cakes are there in ${n} boxes?`,
      ], per * n, [per + n, per * (n - 1), per * (n + 1)],
      `${n} hộp có ${per} × ${n} = <b>${per * n}</b> cái bánh.`);
    }
    if (b === 3 && Math.random() < 0.4) {
      const G = 20 * rand(5, 45), p = pick([10, 20, 25, 50]), after = G - (G * p) / 100;
      return numQ('arith', [
        `Một món đồ chơi giá ${G} nghìn đồng được giảm giá ${p}%. Hỏi giá sau khi giảm là bao nhiêu nghìn đồng?`,
        `A toy costs ${G} thousand dong. Its price is reduced by ${p}%. What is the new price, in thousand dong?`,
      ], after, [(G * p) / 100, G - p, G + (G * p) / 100],
      `Số tiền được giảm: ${G} × ${p} : 100 = ${(G * p) / 100} (nghìn đồng). Giá mới: ${G} − ${(G * p) / 100} = <b>${after}</b> nghìn đồng.`);
    }
    for (;;) {
      const n = rand(3, b === 2 ? 4 : 6), a = rand(10, 50), bb = a + pick([-1, 1]) * rand(1, 6), x = (n + 1) * bb - n * a;
      if (x <= 0) continue;
      return numQ('arith', [
        `Trung bình cộng của ${n} số là ${a}. Thêm một số nữa thì trung bình cộng của ${n + 1} số là ${bb}. Số thêm vào là bao nhiêu?`,
        `The average of ${n} numbers is ${a}. When one more number is added, the average of the ${n + 1} numbers becomes ${bb}. What is the number that was added?`,
      ], x, [bb, bb - a + bb, x + n],
      `Tổng ${n} số ban đầu: ${a} × ${n} = ${a * n}. Tổng ${n + 1} số: ${bb} × ${n + 1} = ${bb * (n + 1)}. Số thêm vào: ${bb * (n + 1)} − ${a * n} = <b>${x}</b>.`);
    }
  });

  // =====================================================================
  // 3. LÝ THUYẾT SỐ — NUMBER THEORY
  // =====================================================================
  const numth = [];

  // Đếm số chia hết
  numth.push(function divisibleCount(g) {
    const b = band(g);
    if (b === 1) {
      const lo = rand(0, g === 1 ? 10 : 40), hi = lo + rand(6, g === 1 ? 14 : 40), even = Math.random() < 0.5;
      let c = 0;
      for (let i = lo + 1; i < hi; i++) if (i % 2 === (even ? 0 : 1)) c++;
      return numQ('numth', [
        `Có bao nhiêu số ${even ? 'chẵn' : 'lẻ'} lớn hơn ${lo} và nhỏ hơn ${hi}?`,
        `How many ${even ? 'even' : 'odd'} numbers are greater than ${lo} and less than ${hi}?`,
      ], c, [c + 1, c - 1, hi - lo - 1],
      `Liệt kê các số ${even ? 'chẵn' : 'lẻ'} từ ${lo + 1} đến ${hi - 1} và đếm, ta được <b>${c}</b> số.`);
    }
    const N = rand(50, b === 2 ? 300 : 1000);
    if (b === 2 || Math.random() < 0.4) {
      const k = rand(3, 9), c = Math.floor(N / k);
      return numQ('numth', [
        `Từ 1 đến ${N} có bao nhiêu số chia hết cho ${k}?`,
        `How many numbers from 1 to ${N} are divisible by ${k}?`,
      ], c, [c + 1, c - 1, Math.round(N / k) + 1],
      `Các số đó là ${k}, ${2 * k}, ${3 * k}, ..., ${c * k} (vì ${N} : ${k} = ${c} dư ${N % k}). Có <b>${c}</b> số.`);
    }
    let a, c2;
    do { a = rand(2, 7); c2 = rand(2, 9); } while (a === c2 || a % c2 === 0 || c2 % a === 0);
    const l = lcm(a, c2), ans = Math.floor(N / a) + Math.floor(N / c2) - Math.floor(N / l);
    return numQ('numth', [
      `Từ 1 đến ${N} có bao nhiêu số chia hết cho ${a} hoặc chia hết cho ${c2}?`,
      `How many numbers from 1 to ${N} are divisible by ${a} or by ${c2}?`,
    ], ans, [Math.floor(N / a) + Math.floor(N / c2), ans - 1, ans + Math.floor(N / l) + 1],
    `Chia hết cho ${a}: ${Math.floor(N / a)} số. Chia hết cho ${c2}: ${Math.floor(N / c2)} số. Chia hết cho cả hai (tức chia hết cho ${l}): ${Math.floor(N / l)} số (bị đếm 2 lần).<br>Kết quả: ${Math.floor(N / a)} + ${Math.floor(N / c2)} − ${Math.floor(N / l)} = <b>${ans}</b>.`);
  });

  // Đánh số trang sách
  function digitsUpTo(N) {
    let d = 0;
    for (let i = 1; i <= N; i++) d += String(i).length;
    return d;
  }
  function pagesExplain(N) {
    const parts = [];
    const one = Math.min(N, 9);
    parts.push(`Trang 1–${one}: ${one} × 1 = ${one} chữ số`);
    if (N >= 10) parts.push(`Trang 10–${Math.min(N, 99)}: ${Math.min(N, 99) - 9} × 2 = ${(Math.min(N, 99) - 9) * 2} chữ số`);
    if (N >= 100) parts.push(`Trang 100–${N}: ${N - 99} × 3 = ${(N - 99) * 3} chữ số`);
    return parts.join('<br>');
  }
  numth.push(function pages(g) {
    const b = band(g);
    if (b === 3 && Math.random() < 0.5) {
      const N = rand(100, 600), D = digitsUpTo(N);
      return numQ('numth', [
        `Để đánh số trang một quyển sách (bắt đầu từ trang 1) người ta dùng hết ${fmt(D)} chữ số. Hỏi quyển sách có bao nhiêu trang?`,
        `To number the pages of a book (starting from page 1), ${fmt(D)} digits are used. How many pages does the book have?`,
      ], N, [Math.floor(D / 3), N + 1, N - 1],
      `${pagesExplain(N)}<br>Tổng: ${fmt(D)} chữ số. Vậy sách có <b>${N}</b> trang.<br><i>Cách làm:</i> 9 trang đầu dùng 9 chữ số, 90 trang tiếp dùng 180 chữ số. Còn ${D} − 189 = ${D - 189} chữ số cho các trang có 3 chữ số: ${D - 189} : 3 = ${N - 99} trang. Số trang: 99 + ${N - 99} = ${N}.`);
    }
    const N = b === 1 ? rand(10, 40) : rand(50, 300), D = digitsUpTo(N);
    return numQ('numth', [
      `Viết các số liên tiếp từ 1 đến ${N} thì phải viết tất cả bao nhiêu chữ số?`,
      `If you write all the whole numbers from 1 to ${N}, how many digits do you write in total?`,
    ], D, [N, 2 * N, D - 9],
    `${pagesExplain(N)}<br>Tổng cộng: <b>${fmt(D)}</b> chữ số.`);
  });

  // Phép chia có dư
  numth.push(function remainder(g) {
    const b = band(g);
    if (b === 1) {
      const k = rand(2, 5), q = rand(2, 6), r = rand(1, k - 1), n = k * q + r;
      return numQ('numth', [
        `Có ${n} cái kẹo chia đều cho ${k} bạn, mỗi bạn được nhiều nhất có thể. Hỏi còn thừa mấy cái kẹo?`,
        `${n} candies are shared equally among ${k} children, each getting as many as possible. How many candies are left over?`,
      ], r, [q, k - r, 0],
      `${n} : ${k} = ${q} (dư ${r}). Mỗi bạn được ${q} cái và còn thừa <b>${r}</b> cái.`);
    }
    if (b === 2) {
      let a, c;
      do { a = rand(2, 9); c = rand(2, 9); } while (a === c);
      const r = rand(1, Math.min(a, c) - 1), l = lcm(a, c), ans = l + r;
      return numQ('numth', [
        `Tìm số nhỏ nhất lớn hơn ${r} mà chia cho ${a} dư ${r} và chia cho ${c} dư ${r}.`,
        `Find the smallest number greater than ${r} that leaves a remainder of ${r} when divided by ${a} and also when divided by ${c}.`,
      ], ans, [a * c + r, l, l - r],
      `Số cần tìm trừ đi ${r} thì chia hết cho cả ${a} và ${c}, tức là chia hết cho BCNN(${a}, ${c}) = ${l}. Số nhỏ nhất (lớn hơn ${r}) là ${l} + ${r} = <b>${ans}</b>.`);
    }
    const set = pick([[2, 3, 4], [3, 4, 5], [2, 3, 5], [4, 5, 6], [2, 5, 7], [3, 5, 7], [2, 3, 7], [3, 4, 7]]);
    const l = set.reduce(lcm), ans = l - 1;
    return numQ('numth', [
      `Tìm số tự nhiên nhỏ nhất chia cho ${set[0]} dư ${set[0] - 1}, chia cho ${set[1]} dư ${set[1] - 1} và chia cho ${set[2]} dư ${set[2] - 1}.`,
      `Find the smallest whole number that leaves a remainder of ${set[0] - 1} when divided by ${set[0]}, a remainder of ${set[1] - 1} when divided by ${set[1]}, and a remainder of ${set[2] - 1} when divided by ${set[2]}.`,
    ], ans, [l, l + 1, set[0] * set[1] * set[2] - 1],
    `Nếu thêm 1 vào số đó thì được số chia hết cho ${set.join(', ')}. Số nhỏ nhất chia hết cho ${set.join(', ')} là BCNN = ${l}. Vậy số cần tìm là ${l} − 1 = <b>${ans}</b>.`);
  });

  // Tổng các chữ số
  numth.push(function digitSum(g) {
    const b = band(g);
    const three = b === 3;
    const s = three ? rand(3, 12) : rand(b === 1 ? 2 : 4, b === 1 ? 9 : 16);
    let c = 0;
    const lo = three ? 100 : 10, hi = three ? 999 : 99;
    const list = [];
    for (let i = lo; i <= hi; i++) {
      const ds = String(i).split('').reduce((x, y) => x + +y, 0);
      if (ds === s) { c++; if (list.length < 12) list.push(i); }
    }
    const w = NUM_WORD[three ? 3 : 2];
    return numQ('numth', [
      `Có bao nhiêu số có ${w[0]} chữ số mà tổng các chữ số bằng ${s}?`,
      `How many ${w[1]}-digit numbers have a digit sum of ${s}?`,
    ], c, [c + 1, c - 1, s, s + 1],
    three
      ? `Xét chữ số hàng trăm a (1–9), tổng hai chữ số còn lại là ${s} − a; đếm số cách cho từng trường hợp rồi cộng lại được <b>${c}</b> số.`
      : `Đó là các số: ${list.join(', ')}${c > list.length ? ', ...' : ''}. Có <b>${c}</b> số.`);
  });

  // Số lớn nhất/nhỏ nhất (lớp 1–4) · chữ số tận cùng của lũy thừa / số ước (lớp 5–6)
  numth.push(function lastDigitOrDivisors(g) {
    const b = band(g);
    if (b < 3) {
      const digits = b === 1 ? 2 : 3;
      const kind = pick(['maxDiff', 'minDiff', 'maxEven', 'minOdd']);
      const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
      const distinct = (n) => new Set(String(n)).size === String(n).length;
      const label = {
        maxDiff: ['lớn nhất', 'largest'], minDiff: ['nhỏ nhất', 'smallest'],
        maxEven: ['chẵn lớn nhất', 'largest even'], minOdd: ['lẻ nhỏ nhất', 'smallest odd'],
      }[kind];
      const cand = [];
      for (let i = lo; i <= hi; i++) if (distinct(i)) {
        if (kind === 'maxEven' && i % 2) continue;
        if (kind === 'minOdd' && i % 2 === 0) continue;
        cand.push(i);
      }
      const isMax = kind.startsWith('max');
      const ans = isMax ? cand[cand.length - 1] : cand[0];
      const w = NUM_WORD[digits];
      return numQ('numth', [
        `Số ${label[0]} có ${w[0]} chữ số khác nhau là số nào?`,
        `What is the ${label[1]} ${w[1]}-digit number whose digits are all different?`,
      ], ans, [isMax ? hi : lo, isMax ? cand[cand.length - 2] : cand[1], isMax ? hi - 1 : lo + 1],
      `Các chữ số phải khác nhau${kind.includes('Even') ? ' và chữ số hàng đơn vị là số chẵn' : kind.includes('Odd') ? ' và chữ số hàng đơn vị là số lẻ' : ''}. Chọn chữ số ${isMax ? 'lớn' : 'nhỏ'} nhất có thể cho hàng cao nhất trước, ta được <b>${ans}</b>.`);
    }
    if (Math.random() < 0.5) {
      const base = pick([2, 3, 7, 8, 4, 9]), n = rand(20, 2026);
      const cycle = [];
      let v = base % 10;
      while (!cycle.includes(v)) { cycle.push(v); v = (v * base) % 10; }
      const ans = cycle[(n - 1) % cycle.length];
      const opts = shuffle([...new Set([ans, ...shuffle(cycle), ...shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])])]).slice(0, 4);
      if (!opts.includes(ans)) opts[0] = ans;
      const prod = `<b>${base} × ${base} × ... × ${base}</b>`;
      return {
        topic: 'numth',
        text: `Tìm chữ số tận cùng của tích gồm ${n} thừa số ${base}: ${prod} (tức ${base}<sup>${n}</sup>).`,
        textEn: `Find the last digit of the product of ${n} factors of ${base}: ${prod} (that is, ${base}<sup>${n}</sup>).`,
        answer: String(ans), options: shuffle(opts).map(String),
        explain: `Chữ số tận cùng của ${base}<sup>1</sup>, ${base}<sup>2</sup>, ${base}<sup>3</sup>, ... lặp lại theo chu kỳ ${cycle.join(', ')} (độ dài ${cycle.length}). ${n} chia ${cycle.length} dư ${n % cycle.length}${n % cycle.length === 0 ? ' (ứng với chữ số cuối của chu kỳ)' : ` (ứng với chữ số thứ ${n % cycle.length} của chu kỳ)`} nên chữ số tận cùng là <b>${ans}</b>.`,
        svg: null,
      };
    }
    const n = rand(12, 200);
    const divs = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) divs.push(i);
    return numQ('numth', [`Số ${n} có tất cả bao nhiêu ước số?`, `How many factors (divisors) does ${n} have?`],
      divs.length, [divs.length - 1, divs.length + 1, divs.length - 2],
      `Các ước của ${n}: ${divs.join(', ')}. Có <b>${divs.length}</b> ước.`);
  });

  // =====================================================================
  // 4. HÌNH HỌC — GEOMETRY
  // =====================================================================
  const geo = [];

  // Chu vi, diện tích
  geo.push(function perimeterArea(g) {
    const b = band(g);
    if (b === 1) {
      const a = rand(3, 12), w = rand(2, a - 1);
      return numQ('geo', [
        `Một hình chữ nhật có chiều dài ${a} cm, chiều rộng ${w} cm. Tính chu vi hình chữ nhật đó (cm).`,
        `A rectangle is ${a} cm long and ${w} cm wide. Find its perimeter (in cm).`,
      ], 2 * (a + w), [a + w, a * w, 2 * a + w],
      `Chu vi = (dài + rộng) × 2 = (${a} + ${w}) × 2 = <b>${2 * (a + w)}</b> cm.`);
    }
    if (b === 2) {
      if (Math.random() < 0.5) {
        const s = rand(3, 25), P = 4 * s;
        return numQ('geo', [
          `Một hình vuông có chu vi ${P} cm. Tính diện tích hình vuông đó (cm²).`,
          `A square has a perimeter of ${P} cm. Find its area (in cm²).`,
        ], s * s, [P, s * 4 * 2, (s + 1) * (s + 1)],
        `Cạnh hình vuông: ${P} : 4 = ${s} cm. Diện tích: ${s} × ${s} = <b>${s * s}</b> cm².`);
      }
      const a = rand(6, 30), w = rand(2, a - 1), P = 2 * (a + w);
      return numQ('geo', [
        `Một hình chữ nhật có chu vi ${P} cm, chiều dài ${a} cm. Tính diện tích hình chữ nhật đó (cm²).`,
        `A rectangle has a perimeter of ${P} cm and a length of ${a} cm. Find its area (in cm²).`,
      ], a * w, [P * a, a * (P / 2), (P - a) * a, a + w],
      `Nửa chu vi: ${P} : 2 = ${a + w} cm. Chiều rộng: ${a + w} − ${a} = ${w} cm. Diện tích: ${a} × ${w} = <b>${a * w}</b> cm².`);
    }
    const w = rand(3, 15), k = rand(2, 5), a = k * w, P = 2 * (a + w);
    return numQ('geo', [
      `Một hình chữ nhật có chu vi ${P} cm và chiều dài gấp ${k} lần chiều rộng. Tính diện tích hình chữ nhật (cm²).`,
      `A rectangle has a perimeter of ${P} cm, and its length is ${k} times its width. Find its area (in cm²).`,
    ], a * w, [P, w * w * (k + 1), a * w * 2],
    `Nửa chu vi: ${P / 2} cm = ${k + 1} lần chiều rộng. Chiều rộng: ${P / 2} : ${k + 1} = ${w} cm, chiều dài: ${a} cm. Diện tích: ${a} × ${w} = <b>${a * w}</b> cm².`);
  });

  // Đếm hình vuông / hình chữ nhật trên lưới
  geo.push(function countShapes(g) {
    const b = band(g);
    if (b === 1 && Math.random() < 0.5) {
      const n = rand(3, 5), ans = (n * (n + 1)) / 2;
      return numQ('geo', [`Hình dưới đây có bao nhiêu hình chữ nhật?`, `How many rectangles are there in the figure below?`],
        ans, [n, ans - 1, 2 * n],
        `Băng giấy được chia thành ${n} ô. Hình chữ nhật gồm 1 ô: ${n}; 2 ô: ${n - 1}; ...; ${n} ô: 1. Tổng: ${Array.from({ length: n }, (_, i) => n - i).join(' + ')} = <b>${ans}</b>.`,
        svgGrid(1, n));
    }
    if (b === 3 && Math.random() < 0.5) {
      const m = rand(2, 3), n = rand(3, 4), ans = C2(m + 1) * C2(n + 1);
      return numQ('geo', [
        `Hình dưới đây (lưới ${m} hàng × ${n} cột) có tất cả bao nhiêu hình chữ nhật (kể cả hình vuông)?`,
        `How many rectangles (including squares) are there in the ${m} × ${n} grid below?`,
      ], ans, [m * n, ans - m * n, C2(m + 1) + C2(n + 1)],
      `Mỗi hình chữ nhật được xác định bởi 2 trong ${m + 1} đường ngang và 2 trong ${n + 1} đường dọc. Số cách chọn đường ngang: ${C2(m + 1)}, đường dọc: ${C2(n + 1)}. Tổng: ${C2(m + 1)} × ${C2(n + 1)} = <b>${ans}</b>.`,
      svgGrid(m, n));
    }
    const n = b === 1 ? rand(2, 3) : b === 2 ? rand(3, 4) : rand(4, 5);
    let ans = 0;
    const parts = [];
    for (let k = 1; k <= n; k++) { ans += (n - k + 1) ** 2; parts.push(`${(n - k + 1) ** 2} hình ${k}×${k}`); }
    return numQ('geo', [
      `Hình vuông lưới ${n} × ${n} dưới đây có tất cả bao nhiêu hình vuông?`,
      `How many squares are there in total in the ${n} × ${n} grid below?`,
    ], ans, [n * n, n * n + 1, ans - 1, ans + n],
    `Đếm theo kích thước: ${parts.join(', ')}. Tổng: <b>${ans}</b> hình vuông.`, svgGrid(n, n));
  });

  // Đếm tam giác hình quạt
  geo.push(function countTriangles(g) {
    const b = band(g);
    const n = b === 1 ? rand(3, 4) : b === 2 ? rand(4, 6) : rand(5, 7);
    const ans = C2(n);
    return numQ('geo', [`Hình dưới đây có bao nhiêu hình tam giác?`, `How many triangles are there in the figure below?`],
      ans, [n - 1, n, ans - 1, ans + 1],
      `Mỗi tam giác có chung đỉnh trên cùng và được tạo bởi 2 trong ${n} đoạn thẳng xuất phát từ đỉnh. Số tam giác: ${n - 1} + ${n - 2} + ... + 1 = ${n} × ${n - 1} : 2 = <b>${ans}</b>.`,
      svgFan(n));
  });

  // Ghép hình vuông / lập phương sơn màu / góc
  geo.push(function solidsAngles(g) {
    const b = band(g);
    if (b === 1) {
      const k = rand(2, 4), a = rand(1, 5);
      return numQ('geo', [
        `Xếp ${k} hình vuông cạnh ${a} cm thành một hàng ngang (sát nhau) được một hình chữ nhật. Tính chu vi hình chữ nhật đó (cm).`,
        `${k} squares with sides of ${a} cm are placed side by side in a row to make a rectangle. Find the perimeter of the rectangle (in cm).`,
      ], 2 * (k * a + a), [4 * a * k, k * a + a, 4 * a],
      `Hình chữ nhật có chiều dài ${k} × ${a} = ${k * a} cm, chiều rộng ${a} cm. Chu vi: (${k * a} + ${a}) × 2 = <b>${2 * (k * a + a)}</b> cm.`);
    }
    if (b === 2 || Math.random() < 0.5) {
      const n = rand(3, b === 2 ? 5 : 7), f = pick([0, 1, 2, 3]);
      const vals = [(n - 2) ** 3, 6 * (n - 2) ** 2, 12 * (n - 2), 8];
      const why = [
        `Các khối không được sơn nằm hoàn toàn bên trong, tạo thành khối ${n - 2}×${n - 2}×${n - 2}: ${vals[0]} khối.`,
        `Khối sơn 1 mặt nằm giữa mỗi mặt lớn (không chạm cạnh): mỗi mặt có ${n - 2}×${n - 2} = ${(n - 2) ** 2} khối, 6 mặt có ${vals[1]} khối.`,
        `Khối sơn 2 mặt nằm trên các cạnh (trừ đỉnh): mỗi cạnh có ${n - 2} khối, 12 cạnh có ${vals[2]} khối.`,
        `Khối sơn 3 mặt nằm ở 8 đỉnh của khối lập phương: 8 khối.`,
      ];
      return numQ('geo', [
        `Một khối lập phương lớn được sơn tất cả các mặt rồi cắt thành ${n ** 3} khối lập phương nhỏ bằng nhau (${n} × ${n} × ${n}). Có bao nhiêu khối nhỏ ${f === 0 ? 'không được sơn mặt nào' : `được sơn đúng ${f} mặt`}?`,
        `A large cube is painted on all faces and then cut into ${n ** 3} equal small cubes (${n} × ${n} × ${n}). How many small cubes have ${f === 0 ? 'no painted faces' : `exactly ${f} painted face${f > 1 ? 's' : ''}`}?`,
      ], vals[f], vals.filter((v, i) => i !== f), why[f]);
    }
    if (Math.random() < 0.5) {
      const A = rand(30, 90), B = rand(20, 150 - A), Cc = 180 - A - B;
      return numQ('geo', [
        `Tam giác ABC có góc A = ${A}°, góc B = ${B}°. Tính số đo góc C (độ).`,
        `In triangle ABC, angle A = ${A}° and angle B = ${B}°. Find angle C (in degrees).`,
      ], Cc, [180 - A, 180 - B, 360 - A - B, A + B],
      `Tổng ba góc của một tam giác bằng 180°. Góc C = 180° − ${A}° − ${B}° = <b>${Cc}°</b>.`);
    }
    const top = 2 * rand(10, 70), base = (180 - top) / 2;
    return numQ('geo', [
      `Tam giác ABC cân tại A có góc A = ${top}°. Tính số đo góc B (độ).`,
      `Triangle ABC is isosceles with AB = AC, and angle A = ${top}°. Find angle B (in degrees).`,
    ], base, [top, 180 - top, base + 10],
    `Tam giác cân tại A nên góc B = góc C. Góc B = (180° − ${top}°) : 2 = <b>${base}°</b>.`);
  });

  // =====================================================================
  // 5. TỔ HỢP — COMBINATORICS
  // =====================================================================
  const comb = [];

  // Quy tắc nhân: chọn trang phục
  comb.push(function outfits(g) {
    const b = band(g);
    const a = rand(2, 5), c = rand(2, 4);
    if (b === 1) {
      return numQ('comb', [
        `Lan có ${a} chiếc áo và ${c} chiếc váy khác nhau. Hỏi Lan có bao nhiêu cách chọn một bộ gồm 1 áo và 1 váy?`,
        `Lan has ${a} different shirts and ${c} different skirts. How many ways can Lan choose an outfit of 1 shirt and 1 skirt?`,
      ], a * c, [a + c, a * c + 1, a * c - 1],
      `Mỗi chiếc áo có thể đi với ${c} chiếc váy. Số cách: ${a} × ${c} = <b>${a * c}</b>.`);
    }
    const h = rand(2, 4);
    return numQ('comb', [
      `Nam có ${a} áo, ${c} quần và ${h} mũ khác nhau. Hỏi Nam có bao nhiêu cách chọn một bộ gồm 1 áo, 1 quần và 1 mũ?`,
      `Nam has ${a} shirts, ${c} pairs of trousers and ${h} hats, all different. How many ways can Nam choose an outfit of 1 shirt, 1 pair of trousers and 1 hat?`,
    ], a * c * h, [a + c + h, a * c + h, a * c * h - a],
    `Theo quy tắc nhân: ${a} × ${c} × ${h} = <b>${a * c * h}</b> cách.`);
  });

  // Bắt tay / thi đấu vòng tròn
  comb.push(function handshakes(g) {
    const b = band(g);
    const n = b === 1 ? rand(3, 5) : b === 2 ? rand(5, 12) : rand(8, 30);
    const T = C2(n);
    if (b === 3 && Math.random() < 0.5) {
      return numQ('comb', [
        `Trong một giải bóng đá, mỗi đội đấu với mỗi đội khác đúng 1 trận. Có tất cả ${T} trận đấu. Hỏi có bao nhiêu đội tham gia?`,
        `In a football tournament, each team plays every other team exactly once. There are ${T} matches in total. How many teams take part?`,
      ], n, [n + 1, n - 1, Math.round(Math.sqrt(2 * T))],
      `Với n đội thì số trận là n × (n − 1) : 2. Ta cần n × (n − 1) = ${T} × 2 = ${2 * T} = ${n} × ${n - 1}. Vậy có <b>${n}</b> đội.`);
    }
    return numQ('comb', [
      `Có ${n} bạn gặp nhau, mỗi bạn bắt tay mỗi bạn khác đúng một lần. Hỏi có tất cả bao nhiêu cái bắt tay?`,
      `${n} friends meet, and each person shakes hands with every other person exactly once. How many handshakes are there in total?`,
    ], T, [n * (n - 1), n * n, T + n],
    `Mỗi bạn bắt tay ${n - 1} bạn khác, nhưng mỗi cái bắt tay được tính 2 lần. Số cái bắt tay: ${n} × ${n - 1} : 2 = <b>${T}</b>.`);
  });

  // Lập số từ các chữ số cho trước
  comb.push(function formNumbers(g) {
    const b = band(g);
    let digits, m, even = false;
    if (b === 1) { digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3); m = 2; }
    else if (b === 2) { digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4); m = pick([2, 3]); }
    else { digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, rand(4, 5)); m = 3; even = Math.random() < 0.5; }
    digits.sort((x, y) => x - y);
    if (even && !digits.some((d) => d % 2 === 0)) even = false;
    const results = [];
    (function build(prefix, used) {
      if (prefix.length === m) {
        if (prefix[0] === 0) return;
        if (even && prefix[m - 1] % 2) return;
        results.push(prefix.join(''));
        return;
      }
      for (const d of digits) if (!used.has(d)) { used.add(d); build([...prefix, d], used); used.delete(d); }
    })([], new Set());
    const ans = results.length, k = digits.length;
    const hasZero = digits.includes(0);
    let explain;
    if (even) {
      const byEnd = {};
      for (const r of results) byEnd[r[m - 1]] = (byEnd[r[m - 1]] || 0) + 1;
      explain = `Số chẵn phải tận cùng bằng chữ số chẵn. Đếm theo chữ số hàng đơn vị: ${Object.entries(byEnd).map(([d, c]) => `tận cùng ${d}: ${c} số`).join('; ')}. Tổng: <b>${ans}</b> số.`;
    } else if (hasZero) {
      const f = [k - 1];
      for (let i = 1; i < m; i++) f.push(k - i);
      explain = `Chữ số đầu tiên khác 0: có ${k - 1} cách. Các vị trí tiếp theo chọn từ các chữ số còn lại: ${f.slice(1).join(', ')} cách. Số các số: ${f.join(' × ')} = <b>${ans}</b>.`;
    } else {
      const f = Array.from({ length: m }, (_, i) => k - i);
      explain = `Chữ số đầu có ${k} cách chọn, mỗi vị trí sau ít hơn 1 cách (các chữ số khác nhau). Số các số: ${f.join(' × ')} = <b>${ans}</b>.`;
    }
    const w = NUM_WORD[m], ds = `<b>${digits.join(', ')}</b>`;
    return numQ('comb', [
      `Từ các chữ số ${ds} có thể lập được bao nhiêu số ${even ? 'chẵn ' : ''}có ${w[0]} chữ số khác nhau?`,
      `Using the digits ${ds}, how many ${w[1]}-digit ${even ? 'even ' : ''}numbers with all different digits can be formed?`,
    ], ans, [k ** m, ans + (hasZero ? k - 1 : 1), binom(k, m), ans * 2], explain);
  });

  // Nguyên lý Dirichlet (chim bồ câu)
  comb.push(function pigeonhole(g) {
    const b = band(g);
    if (b === 3 && Math.random() < 0.5) {
      const r = rand(3, 12), x = rand(3, 12), v = rand(3, 12);
      return numQ('comb', [
        `Trong hộp có ${r} bi đỏ, ${x} bi xanh và ${v} bi vàng. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có ít nhất 1 viên bi đỏ?`,
        `A box contains ${r} red, ${x} blue and ${v} yellow marbles. Without looking, what is the least number of marbles you must take out to be sure of getting at least 1 red marble?`,
      ], x + v + 1, [x + v, r + 1, r + x + v],
      `Trường hợp xấu nhất: lấy hết ${x} bi xanh và ${v} bi vàng trước (${x + v} viên) mà chưa có bi đỏ. Lấy thêm 1 viên nữa chắc chắn là bi đỏ. Cần ít nhất ${x + v} + 1 = <b>${x + v + 1}</b> viên.`);
    }
    const k = b === 1 ? rand(2, 3) : rand(3, 6), m = b === 1 ? 2 : rand(2, b === 2 ? 3 : 5);
    const ans = k * (m - 1) + 1;
    return numQ('comb', [
      `Trong một túi có rất nhiều chiếc tất (vớ) gồm ${k} màu khác nhau. Không nhìn, phải lấy ra ít nhất bao nhiêu chiếc để chắc chắn có ${m} chiếc cùng màu?`,
      `A bag has lots of socks in ${k} different colours. Without looking, what is the least number of socks you must take out to be sure of getting ${m} socks of the same colour?`,
    ], ans, [k * m, k * (m - 1), k + m, ans + 1],
    `Trường hợp xấu nhất: mỗi màu lấy được ${m - 1} chiếc, tức ${k} × ${m - 1} = ${k * (m - 1)} chiếc mà chưa có ${m} chiếc cùng màu. Lấy thêm 1 chiếc nữa là chắc chắn. Cần ít nhất <b>${ans}</b> chiếc.`);
  });

  // Đếm đường đi trên lưới (lớp 1–2: bài chia kẹo)
  comb.push(function gridPaths(g) {
    const b = band(g);
    if (b === 1) {
      const n = rand(3, 6), x = rand(2, 4);
      return numQ('comb', [
        `Có ${n} bạn xếp thành một hàng. Mỗi bạn được phát ${x} cái kẹo, bạn đứng đầu hàng được thêm 1 cái. Hỏi cần tất cả bao nhiêu cái kẹo?`,
        `${n} children stand in a line. Each child gets ${x} candies, and the child at the front gets 1 extra candy. How many candies are needed in total?`,
      ], n * x + 1, [n * x, n * (x + 1), n + x],
      `${n} bạn × ${x} cái = ${n * x} cái, cộng thêm 1 cái cho bạn đứng đầu: <b>${n * x + 1}</b> cái.`);
    }
    const m = rand(2, b === 2 ? 2 : 3), n = rand(2, b === 2 ? 3 : 4), ans = binom(m + n, m);
    return numQ('comb', [
      `Một con kiến đi từ điểm A đến điểm B theo các đường kẻ của lưới dưới đây, mỗi bước chỉ được đi sang phải hoặc đi lên trên. Có bao nhiêu đường đi khác nhau?`,
      `An ant walks from point A to point B along the lines of the grid below, moving only right or up. How many different paths are there?`,
    ], ans, [m * n, m + n, ans - 1, ans + 2],
    `Ghi số cách đi đến từng giao điểm: các điểm trên cạnh dưới và cạnh trái đều có 1 cách; mỗi điểm khác bằng tổng số ở điểm bên trái và điểm bên dưới. Điểm B nhận được <b>${ans}</b>.`,
    svgGrid(m, n, { labels: true }));
  });

  // =====================================================================
  // DẠNG BỔ SUNG — theo các dạng bài ôn luyện vòng Quốc gia (đề và số liệu tự sinh)
  // =====================================================================
  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // năm không nhuận
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const distinctDigits = (n) => new Set(String(n)).size === String(n).length;
  const dayLabels = () => { const l = {}; DAYS.forEach((d, i) => { l[d] = DAYS_EN[i]; }); return l; };

  // Dãy số đan xen (hai dãy xen kẽ nhau)
  logic.push(function interleaved(g) {
    const b = band(g);
    const a0 = rand(1, 10), d1 = b === 1 ? 1 : rand(1, 4);
    const down = Math.random() < 0.5, d2 = b === 1 ? pick([1, 2]) : rand(2, 6);
    const b0 = down ? rand(60, 99) : rand(20, 50);
    const A = (i) => a0 + d1 * i, B = (i) => b0 + (down ? -1 : 1) * d2 * i;
    const terms = [];
    for (let i = 0; i < 5; i++) terms.push(A(i), B(i));
    const shownN = pick([7, 8]);
    const shown = terms.slice(0, shownN), ans = terms[shownN];
    const seq = `<b>${shown.join('; ')}; ...</b>`;
    const oddList = shown.filter((_, i) => i % 2 === 0), evenList = shown.filter((_, i) => i % 2 === 1);
    return numQ('logic', [
      `Tìm số tiếp theo của dãy: ${seq}`,
      `According to the pattern below, find the next number: ${seq}`,
    ], ans, [shownN % 2 ? A(4) : B(3), ans + 1, ans - 2, shown[shownN - 1] + 1],
    `Tách thành hai dãy xen kẽ nhau:<br>• Các số ở vị trí lẻ: ${oddList.join('; ')} — mỗi số hơn số trước ${d1}.<br>• Các số ở vị trí chẵn: ${evenList.join('; ')} — mỗi số ${down ? 'kém' : 'hơn'} số trước ${d2}.<br>Số tiếp theo ở vị trí thứ ${shownN + 1} (${shownN % 2 ? 'vị trí chẵn' : 'vị trí lẻ'}) nên là <b>${ans}</b>.`);
  });

  // Dãy hình: đếm số ★ ở nhóm thứ N
  logic.push(function figurePattern(g) {
    const b = band(g);
    const kind = b === 1 ? 'lin' : b === 2 ? pick(['lin', 'tri']) : pick(['lin', 'tri', 'sq']);
    const a = rand(1, 3), d = rand(1, 3);
    const f = { lin: (n) => a + d * (n - 1), tri: (n) => (n * (n + 1)) / 2, sq: (n) => n * n }[kind];
    const rows = (n) => (kind === 'lin' ? [f(n)] : kind === 'tri' ? Array.from({ length: n }, (_, i) => i + 1) : Array(n).fill(n));
    const N = b === 1 ? rand(6, 8) : b === 2 ? rand(9, 12) : rand(12, 20);
    const fig = `<div class="groups">${[1, 2, 3, 4].map((n) => `<div class="grp"><div class="stars">${rows(n).map((r) => `<div>${'★'.repeat(r)}</div>`).join('')}</div><div class="grp-n">(${n})</div></div>`).join('')}</div>`;
    const counts = [1, 2, 3, 4].map(f).join(', ');
    const rule = {
      lin: `mỗi nhóm hơn nhóm trước ${d} dấu ★. Nhóm thứ ${N}: ${a} + ${d} × (${N} − 1) = <b>${f(N)}</b>`,
      tri: `nhóm thứ n có 1 + 2 + ... + n dấu ★. Nhóm thứ ${N}: 1 + 2 + ... + ${N} = ${N} × ${N + 1} : 2 = <b>${f(N)}</b>`,
      sq: `nhóm thứ n là hình vuông n × n dấu ★. Nhóm thứ ${N}: ${N} × ${N} = <b>${f(N)}</b>`,
    }[kind];
    return numQ('logic', [
      `Quan sát quy luật các nhóm dưới đây. Hỏi nhóm thứ ${N} có bao nhiêu dấu ★?`,
      `According to the pattern below, how many ★ are there in the ${ord(N)} group?`,
    ], f(N), [f(N - 1), f(N + 1), f(N) + 1], `Số dấu ★ ở các nhóm đầu: ${counts}. Quy luật: ${rule}.`, fig);
  });

  // Ngày, tháng
  logic.push(function monthsDays(g) {
    const b = band(g);
    if (b === 1) {
      const m = rand(0, 11), days = MONTH_DAYS[m];
      return numQ('logic', [
        `Trong một năm không nhuận, tháng ${m + 1} có bao nhiêu ngày?`,
        `In a non-leap year, how many days are there in ${MONTHS_EN[m]}?`,
      ], days, [28, 29, 30, 31],
      `Tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12. Tháng có 30 ngày: 4, 6, 9, 11. Tháng 2 năm không nhuận có 28 ngày. Vậy tháng ${m + 1} có <b>${days}</b> ngày.`);
    }
    const m = rand(0, 10), d1 = rand(1, MONTH_DAYS[m]), wd = rand(0, 6), d2 = rand(1, MONTH_DAYS[m + 1]);
    const N = MONTH_DAYS[m] - d1 + d2, ai = (wd + N) % 7;
    return strQ('logic', [
      `Trong một năm không nhuận, ngày ${d1} tháng ${m + 1} là <b>${DAYS[wd]}</b>. Hỏi ngày ${d2} tháng ${m + 2} năm đó là thứ mấy?`,
      `In a non-leap year, ${MONTHS_EN[m]} ${d1} is a <b>${DAYS_EN[wd]}</b>. What day of the week is ${MONTHS_EN[m + 1]} ${d2} of the same year?`,
    ], DAYS[ai], DAYS,
    `Tháng ${m + 1} có ${MONTH_DAYS[m]} ngày. Từ ngày ${d1}/${m + 1} đến ngày ${d2}/${m + 2} cách nhau ${MONTH_DAYS[m]} − ${d1} + ${d2} = ${N} ngày. ${N} = 7 × ${Math.floor(N / 7)} + ${N % 7}, nên từ ${DAYS[wd]} đếm thêm ${N % 7} ngày được <b>${DAYS[ai]}</b> (${DAYS_EN[ai]}).`, dayLabels());
  });

  // Ký hiệu phép toán mới
  numth.push(function newOperation(g) {
    const b = band(g);
    const s = pick(['⊗', '★', '#', '◇', '⊕']);
    const k1 = rand(1, 3), k2 = rand(1, 3), k3 = rand(1, 9), m1 = rand(2, 4), m2 = rand(2, 4);
    const T = b === 1 ? [
      { def: `a + b + ${k3}`, f: (x, y) => x + y + k3, sub: (x, y) => `${x} + ${y} + ${k3}` },
      { def: 'a + a + b', f: (x, y) => x + x + y, sub: (x, y) => `${x} + ${x} + ${y}` },
      { def: `a + b − ${k2}`, f: (x, y) => x + y - k2, sub: (x, y) => `${x} + ${y} − ${k2}`, ok: (x, y) => x + y > k2 },
    ] : [
      { def: 'a × b + a + b', f: (x, y) => x * y + x + y, sub: (x, y) => `${x} × ${y} + ${x} + ${y}` },
      { def: `(a + ${k1}) × (b − ${k2}) + ${k3}`, f: (x, y) => (x + k1) * (y - k2) + k3, sub: (x, y) => `(${x} + ${k1}) × (${y} − ${k2}) + ${k3}`, ok: (x, y) => y > k2 },
      { def: `a × ${m1} + b × ${m2}`, f: (x, y) => x * m1 + y * m2, sub: (x, y) => `${x} × ${m1} + ${y} × ${m2}` },
      { def: `a × b − a + ${k3}`, f: (x, y) => x * y - x + k3, sub: (x, y) => `${x} × ${y} − ${x} + ${k3}` },
    ];
    for (;;) {
      const t = pick(T), ok = t.ok || (() => true);
      const lo = b === 1 ? 1 : 2, hi = b === 1 ? 9 : b === 2 ? 12 : 6;
      const x = rand(lo, hi), y = rand(lo, hi);
      const def = `<b>a ${s} b = ${t.def}</b>`;
      if (b < 3 || Math.random() < 0.3) {
        if (!ok(x, y)) continue;
        const ans = t.f(x, y), expr = `<b>${x} ${s} ${y}</b>`;
        return numQ('numth', [
          `Định nghĩa phép toán mới: ${def}. Tính ${expr}.`,
          `Define a new operation: ${def}. Find the value of ${expr}.`,
        ], ans, [ans + 1, x + y, x * y, t.f(y, x)],
        `Thay a = ${x}, b = ${y} vào định nghĩa: ${x} ${s} ${y} = ${t.sub(x, y)} = <b>${ans}</b>.`);
      }
      const z = rand(lo, hi);
      if (!ok(y, z)) continue;
      const inner = t.f(y, z);
      if (!ok(x, inner) || inner > 60) continue;
      const ans = t.f(x, inner), expr = `<b>${x} ${s} (${y} ${s} ${z})</b>`;
      return numQ('numth', [
        `Định nghĩa phép toán mới: ${def}. Tính ${expr}.`,
        `Define a new operation: ${def}. Find the value of ${expr}.`,
      ], ans, [inner, ans + 1, t.f(inner, x), ans - 2],
      `Tính trong ngoặc trước: ${y} ${s} ${z} = ${t.sub(y, z)} = ${inner}.<br>Sau đó: ${x} ${s} ${inner} = ${t.sub(x, inner)} = <b>${ans}</b>.`);
    }
  });

  // Số lớn nhất / nhỏ nhất có 2–3 chữ số chia hết cho …
  numth.push(function extremeDivisible(g) {
    const b = band(g);
    const digits = b === 1 ? 2 : 3, lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    let k, cond;
    if (b === 3 && Math.random() < 0.6) {
      let p, q;
      do { p = rand(2, 9); q = rand(2, 9); } while (p === q || p % q === 0 || q % p === 0);
      k = lcm(p, q);
      cond = [`chia hết cho cả ${p} và ${q}`, `divisible by both ${p} and ${q}`, `Số chia hết cho cả ${p} và ${q} thì chia hết cho BCNN(${p}, ${q}) = ${k}. `];
    } else {
      k = b === 1 ? rand(3, 9) : rand(6, 19);
      cond = [`chia hết cho ${k}`, `divisible by ${k}`, ''];
    }
    const largest = Math.random() < 0.5;
    const ans = largest ? hi - (hi % k) : lo % k === 0 ? lo : lo + k - (lo % k);
    const w = NUM_WORD[digits];
    const how = largest
      ? `Số lớn nhất có ${w[0]} chữ số là ${hi}. ${hi} : ${k} = ${Math.floor(hi / k)} (dư ${hi % k}), nên số cần tìm là ${hi} − ${hi % k} = <b>${ans}</b>.`
      : lo % k === 0
        ? `Số nhỏ nhất có ${w[0]} chữ số là ${lo}, và ${lo} chia hết cho ${k}. Vậy số cần tìm là <b>${lo}</b>.`
        : `Số nhỏ nhất có ${w[0]} chữ số là ${lo}. ${lo} : ${k} = ${Math.floor(lo / k)} (dư ${lo % k}), nên số cần tìm là ${lo} + (${k} − ${lo % k}) = <b>${ans}</b>.`;
    return numQ('numth', [
      `Tìm số ${largest ? 'lớn nhất' : 'nhỏ nhất'} có ${w[0]} chữ số ${cond[0]}.`,
      `Find the ${largest ? 'largest' : 'smallest'} ${digits}-digit number ${cond[1]}.`,
    ], ans, [largest ? ans - k : ans + k, largest ? hi : lo, ans + 1, ans - 1], cond[2] + how);
  });

  // Hình khối: hình lập phương, hình chóp, hình lăng trụ
  geo.push(function solidsCount(g) {
    const b = band(g);
    const what = pick(['v', 'e', 'f']);
    const W = { v: ['đỉnh', 'vertices'], e: ['cạnh', 'edges'], f: ['mặt', 'faces'] }[what];
    if (b === 1) {
      const val = { v: 8, e: 12, f: 6 }[what];
      return numQ('geo', [`Hình lập phương có bao nhiêu ${W[0]}?`, `How many ${W[1]} does a cube have?`], val, [6, 8, 12, 4],
        `Hình lập phương có 8 đỉnh, 12 cạnh và 6 mặt. Vậy có <b>${val}</b> ${W[0]}.`);
    }
    const BASE = { 3: ['tam giác', 'triangular'], 4: ['tứ giác', 'quadrilateral'], 5: ['ngũ giác', 'pentagonal'], 6: ['lục giác', 'hexagonal'], 8: ['bát giác', 'octagonal'] };
    const n = pick([3, 4, 5, 6, 8]);
    const pyr = { v: n + 1, e: 2 * n, f: n + 1 }, pri = { v: 2 * n, e: 3 * n, f: n + 2 };
    if (b === 3 && what !== 'e' && Math.random() < 0.5) {
      const E = 3 * n;
      return numQ('geo', [
        `Một hình lăng trụ có ${E} cạnh. Hỏi hình lăng trụ đó có bao nhiêu ${W[0]}?`,
        `A prism has ${E} edges. How many ${W[1]} does it have?`,
      ], pri[what], [pyr[what], E, n, 2 * n + 2].filter((v) => v !== pri[what]),
      `Đáy của hình lăng trụ là đa giác n cạnh thì hình lăng trụ có 3 × n cạnh. ${E} : 3 = ${n}, nên đáy có ${n} cạnh.<br>Hình lăng trụ đó có ${2 * n} đỉnh, ${3 * n} cạnh, ${n + 2} mặt. Đáp án: <b>${pri[what]}</b>.`);
    }
    const isPyr = Math.random() < 0.5, val = (isPyr ? pyr : pri)[what];
    return numQ('geo', [
      `Hình ${isPyr ? 'chóp' : 'lăng trụ'} ${BASE[n][0]} (đáy là hình ${BASE[n][0]}) có bao nhiêu ${W[0]}?`,
      `How many ${W[1]} does ${/^[aeiou]/.test(BASE[n][1]) ? 'an' : 'a'} ${BASE[n][1]} ${isPyr ? 'pyramid' : 'prism'} have?`,
    ], val, [(isPyr ? pri : pyr)[what], n, val + 1, val - 1],
    isPyr
      ? `Hình chóp có đáy ${n} cạnh: ${n} đỉnh ở đáy + 1 đỉnh trên cùng = ${n + 1} đỉnh; ${n} cạnh đáy + ${n} cạnh bên = ${2 * n} cạnh; 1 mặt đáy + ${n} mặt bên = ${n + 1} mặt. Đáp án: <b>${val}</b>.`
      : `Hình lăng trụ có 2 đáy, mỗi đáy ${n} cạnh: ${n} × 2 = ${2 * n} đỉnh; ${n} × 2 cạnh đáy + ${n} cạnh bên = ${3 * n} cạnh; 2 mặt đáy + ${n} mặt bên = ${n + 2} mặt. Đáp án: <b>${val}</b>.`);
  });

  // Đếm hình chữ nhật chứa dấu ★
  geo.push(function rectWithStar(g) {
    const b = band(g);
    const m = b === 1 ? 1 : b === 2 ? rand(1, 2) : rand(2, 3), n = b === 1 ? rand(3, 5) : rand(3, 4);
    const r = rand(1, m), c = rand(1, n);
    const ans = r * (m - r + 1) * c * (n - c + 1);
    const explain = m === 1
      ? `Hình chữ nhật chứa ★ có cạnh trái là 1 trong ${c} đường dọc bên trái ô ★ và cạnh phải là 1 trong ${n - c + 1} đường dọc bên phải ô ★. Số hình: ${c} × ${n - c + 1} = <b>${ans}</b>.`
      : `Cạnh trái: ${c} cách, cạnh phải: ${n - c + 1} cách (đường dọc ở hai bên ô ★). Cạnh trên: ${r} cách, cạnh dưới: ${m - r + 1} cách. Số hình: ${c} × ${n - c + 1} × ${r} × ${m - r + 1} = <b>${ans}</b>.`;
    return numQ('geo', [
      `Trong hình dưới đây, có bao nhiêu hình chữ nhật (kể cả hình vuông) chứa dấu ★?`,
      `How many rectangles (including squares) in the figure below contain the ★?`,
    ], ans, [C2(m + 1) * C2(n + 1), ans - 1, ans + 1, m * n], explain, svgGrid(m, n, { star: [r, c] }));
  });

  // Xếp hàng (hoán vị)
  comb.push(function arrangements(g) {
    const b = band(g);
    if (b === 2 && Math.random() < 0.4) {
      const word = pick(['MATH', 'TIMO', 'KING', 'LUCKY', 'WORLD']), n = word.length;
      return numQ('comb', [
        `Có bao nhiêu cách sắp xếp các chữ cái của từ <b>${word}</b> (mỗi chữ cái dùng đúng một lần)?`,
        `How many ways are there to arrange the letters in the word <b>${word}</b>?`,
      ], fact(n), [fact(n - 1), n * n, n * (n - 1), 2 * fact(n - 1)],
      `Vị trí đầu có ${n} cách chọn chữ cái, vị trí thứ hai còn ${n - 1} cách, ... Số cách: ${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = <b>${fact(n)}</b>.`);
    }
    const n = b === 1 ? 3 : b === 2 ? rand(4, 5) : rand(4, 6);
    const ppl = shuffle(NAMES).slice(0, n), list = ppl.join(', ');
    const chain = Array.from({ length: n }, (_, i) => n - i).join(' × ');
    if (b === 3) {
      if (Math.random() < 0.5) {
        const ans = fact(n - 1);
        return numQ('comb', [
          `Có bao nhiêu cách xếp ${n} bạn ${list} thành một hàng ngang sao cho ${ppl[0]} luôn đứng ở đầu bên trái?`,
          `How many ways are there to arrange ${list} in a row so that ${ppl[0]} is always at the left end?`,
        ], ans, [fact(n), n * (n - 1), 2 * ans, ans - 1],
        `${ppl[0]} cố định ở đầu trái, chỉ cần xếp ${n - 1} bạn còn lại: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' × ')} = <b>${ans}</b> cách.`);
      }
      const ans = 2 * fact(n - 1);
      return numQ('comb', [
        `Có bao nhiêu cách xếp ${n} bạn ${list} thành một hàng ngang sao cho ${ppl[0]} và ${ppl[1]} luôn đứng cạnh nhau?`,
        `How many ways are there to arrange ${list} in a row so that ${ppl[0]} and ${ppl[1]} always stand next to each other?`,
      ], ans, [fact(n - 1), fact(n), fact(n) - ans, ans + 2],
      `Coi ${ppl[0]} và ${ppl[1]} là một "khối", ta xếp ${n - 1} phần tử: ${fact(n - 1)} cách. Trong khối, hai bạn đổi chỗ được 2 cách. Số cách: ${fact(n - 1)} × 2 = <b>${ans}</b>.`);
    }
    return numQ('comb', [
      `Có bao nhiêu cách xếp ${n} bạn ${list} thành một hàng ngang?`,
      `How many ways are there to arrange ${list} in a row from left to right?`,
    ], fact(n), [n, n * (n - 1), fact(n) - 1, n * n],
    `Vị trí thứ nhất có ${n} cách chọn, vị trí thứ hai còn ${n - 1} cách, ... Số cách: ${chain} = <b>${fact(n)}</b>.`);
  });

  // Bài toán Cho và Nhận
  comb.push(function giveTake(g) {
    const b = band(g);
    const [X, Y, Z] = shuffle(NAMES);
    if (b === 1) {
      const a = rand(2, 9);
      return numQ('comb', [
        `${X} cho ${Y} ${a} cái kẹo thì hai bạn có số kẹo bằng nhau. Hỏi lúc đầu ${X} có nhiều hơn ${Y} bao nhiêu cái kẹo?`,
        `After ${X} gives ${Y} ${a} candies, they have the same number of candies. How many more candies did ${X} have than ${Y} originally?`,
      ], 2 * a, [a, a + 1, 2 * a + 1],
      `Khi cho đi ${a} cái, ${X} bớt ${a} cái và ${Y} được thêm ${a} cái. Để bằng nhau thì lúc đầu ${X} phải nhiều hơn ${Y}: ${a} + ${a} = <b>${2 * a}</b> cái.`);
    }
    if (b === 2 || Math.random() < 0.5) {
      const a = rand(3, 12), t = rand(1, 2 * a - 1), ans = 2 * a - t;
      return numQ('comb', [
        `Sau khi ${X} cho ${Y} ${a} cái kẹo và lấy của ${Z} ${t} cái kẹo thì ${X} và ${Y} có số kẹo bằng nhau. Hỏi lúc đầu ${X} có nhiều hơn ${Y} bao nhiêu cái kẹo?`,
        `After ${X} gives ${Y} ${a} candies and takes ${t} candies from ${Z}, ${X} and ${Y} have the same number of candies. How many more candies did ${X} have than ${Y} originally?`,
      ], ans, [2 * a + t, a - t > 0 ? a - t : a + t, 2 * a, a + t],
      `Gọi số kẹo lúc sau của ${X} và ${Y} là S (bằng nhau).<br>Lúc đầu ${Y} có S − ${a} (vì ${Y} được thêm ${a}).<br>Lúc đầu ${X} có S + ${a} − ${t} (vì ${X} cho đi ${a} và nhận thêm ${t}).<br>Hiệu: (S + ${a} − ${t}) − (S − ${a}) = ${a} + ${a} − ${t} = <b>${ans}</b>.`);
    }
    const k = rand(2, 4), after = rand(5, 25), x = rand(3, k * after - 1);
    const R = after + x, A = k * after - x, T = R + A;
    return numQ('comb', [
      `${X} có ${R} cái kẹo, ${Y} có ${A} cái kẹo. ${X} phải cho ${Y} bao nhiêu cái kẹo để số kẹo của ${Y} gấp ${k} lần số kẹo của ${X}?`,
      `${X} has ${R} candies and ${Y} has ${A} candies. How many candies must ${X} give ${Y} so that ${Y} has ${k} times as many candies as ${X}?`,
    ], x, [after, R - A, k * after, x + k],
    `Tổng số kẹo không đổi: ${R} + ${A} = ${T}. Lúc sau ${X} có 1 phần, ${Y} có ${k} phần, tổng ${k + 1} phần. ${X} còn ${T} : ${k + 1} = ${after} cái. Vậy ${X} phải cho ${R} − ${after} = <b>${x}</b> cái.`);
  });

  // Đếm số có các chữ số khác nhau lớn hơn / nhỏ hơn một số cho trước
  comb.push(function countRange(g) {
    const b = band(g);
    const digits = b === 1 ? 2 : 3, lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
    const N = b === 1 ? rand(4, 8) * 10 + rand(0, 9) : b === 2 ? rand(2, 8) * 100 : rand(2, 8) * 100 + rand(11, 89);
    const greater = Math.random() < 0.5;
    const byLead = {};
    let ans = 0;
    for (let i = lo; i <= hi; i++) {
      if (!distinctDigits(i) || (greater ? i <= N : i >= N)) continue;
      ans++;
      const lead = String(i)[0];
      byLead[lead] = (byLead[lead] || 0) + 1;
    }
    const place = digits === 2 ? 'hàng chục' : 'hàng trăm', w = NUM_WORD[digits];
    const parts = Object.entries(byLead).map(([d, c]) => `${place} là ${d}: ${c} số`).join('; ');
    let all = 0;
    for (let i = lo; i <= hi; i++) if (greater ? i > N : i < N) all++;
    return numQ('comb', [
      `Có bao nhiêu số có ${w[0]} chữ số khác nhau và ${greater ? 'lớn hơn' : 'nhỏ hơn'} ${N}?`,
      `How many ${digits}-digit numbers ${greater ? 'greater' : 'less'} than ${N} have all different digits?`,
    ], ans, [all, ans + 9, ans - 8, ans + 1],
    `Chia trường hợp theo chữ số ${place} (các chữ số phải khác nhau): ${parts}. Tổng cộng: <b>${ans}</b> số.`);
  });

  // =====================================================================
  const TOPICS = [
    { id: 'logic', name: 'Tư duy logic', en: 'Logical Thinking', icon: '🧩', gens: logic },
    { id: 'arith', name: 'Số học', en: 'Arithmetic', icon: '➕', gens: arith },
    { id: 'numth', name: 'Lý thuyết số', en: 'Number Theory', icon: '🔢', gens: numth },
    { id: 'geo', name: 'Hình học', en: 'Geometry', icon: '📐', gens: geo },
    { id: 'comb', name: 'Tổ hợp', en: 'Combinatorics', icon: '🎲', gens: comb },
  ];

  /** Sinh 1 câu hỏi cho chủ đề và lớp. */
  function generate(topicId, grade) {
    const t = TOPICS.find((x) => x.id === topicId);
    return pick(t.gens)(grade);
  }

  /** Sinh n câu không trùng nhau. */
  function generateSet(topicId, grade, n) {
    const seen = new Set();
    const out = [];
    let tries = 0;
    while (out.length < n && tries < n * 50) {
      tries++;
      const q = generate(topicId, grade);
      if (seen.has(q.text)) continue;
      seen.add(q.text);
      out.push(q);
    }
    return out;
  }

  /** Đề thi thử: 25 câu, 5 câu cho mỗi chủ đề (theo cấu trúc TIMO). */
  function generateExam(grade) {
    return TOPICS.flatMap((t) => generateSet(t.id, grade, 5));
  }

  const api = { TOPICS, generate, generateSet, generateExam };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TimoGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
