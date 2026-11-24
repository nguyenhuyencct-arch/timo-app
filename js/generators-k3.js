/*
 * Các dạng toán bổ sung theo bộ 49 chuyên đề luyện thi TIMO Vòng Quốc gia khối 3.
 * Đề và số liệu do máy tự sinh (không chép đề gốc); đáp án tính bằng công thức
 * hoặc duyệt vét cạn. Mỗi hàm ghi số chuyên đề tương ứng.
 */
(function (root) {
  'use strict';
  const G = typeof module !== 'undefined' && module.exports ? require('./generators.js') : root.TimoGen;
  const H = G.helpers;
  const { rand, pick, shuffle, gcd, lcm, band, fmt, ord, pl, C2, binom, numQ, strQ, NAMES, DAYS, DAYS_EN, MONTHS_EN } = H;
  const R = () => H.rng();
  const add = G.addGen;
  const mod = (a, m) => ((a % m) + m) % m;
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LET = (i) => ABC[mod(i, 26)];
  const SVG = (w, h) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="fig" role="img" xmlns="http://www.w3.org/2000/svg">`;
  const RED = '#e4572e';
  const dayLabels = () => { const l = {}; DAYS.forEach((d, i) => { l[d] = DAYS_EN[i]; }); return l; };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  /** Câu hỏi đáp án chữ, lựa chọn tự đặt (đảm bảo đủ 4 lựa chọn khác nhau). */
  function textQ(topic, text, ans, pool, explain, svg) {
    const others = shuffle([...new Set(pool.filter((p) => p !== ans))]).slice(0, 3);
    return { topic, text: text[0], textEn: text[1], answer: ans, options: shuffle([ans, ...others]), explain, svg: svg || null };
  }

  // =====================================================================
  // SỐ HỌC
  // =====================================================================

  // CĐ 07 — Thủ thuật với phép cộng: ghép tròn trăm, dãy "núi"
  add('arith', function addTricks(g) {
    const b = band(g);
    if (b === 1 || R() < 0.55) {
      const pairs = b === 1 ? 2 : 3;
      const terms = [], parts = [];
      let total = 0;
      for (let i = 0; i < pairs; i++) {
        const T = b === 1 ? 100 : 100 * rand(5, 10);
        let x;
        do { x = b === 1 ? rand(11, 89) : rand(101, T - 101); } while (x * 2 === T);
        terms.push(x, T - x); parts.push(`(${x} + ${T - x}) = ${T}`); total += T;
      }
      const expr = shuffle(terms).join(' + ');
      return numQ('arith', [`Tính nhanh: <b>${expr}</b>`, `Calculate quickly: <b>${expr}</b>`], total,
        [total + 10, total - 100, total + 1, total - 10],
        `Ghép các số có tổng tròn trăm: ${parts.join('; ')}. Tổng: <b>${fmt(total)}</b>.`);
    }
    const a = rand(1, 5), d = rand(1, b === 2 ? 3 : 5), n = rand(5, b === 2 ? 8 : 12), peak = a + d * (n - 1);
    const up = (n * (a + peak)) / 2, total = 2 * up - peak;
    const expr = `${a} + ${a + d} + ${a + 2 * d} + ... + ${peak} + ${peak - d} + ... + ${a + d} + ${a}`;
    return numQ('arith', [`Tính: <b>${expr}</b>`, `Find the value of: <b>${expr}</b>`], total, [2 * up, up, total + peak, total - d],
      `Dãy tăng từ ${a} lên ${peak} (mỗi số hơn số trước ${d}) rồi giảm về ${a}. Phần tăng có ${n} số, tổng = (${a} + ${peak}) × ${n} : 2 = ${up}. Phần giảm (không tính ${peak}) có tổng ${up} − ${peak} = ${up - peak}. Tổng cả dãy: ${up} + ${up - peak} = <b>${fmt(total)}</b>.`);
  });

  // CĐ 08 — Thủ thuật với phép chia
  add('arith', function divTricks(g) {
    const b = band(g);
    if (R() < 0.5) {
      const ds = shuffle([2, 3, 4, 5, 6, 10, 12, 15, 20]).slice(0, b === 3 ? 4 : 3).sort((x, y) => x - y);
      const L = ds.reduce(lcm);
      if (L > 300) return divTricks(g);
      const A = L * rand(1, Math.max(1, Math.floor(900 / L)));
      if (A < 60) return divTricks(g);
      const qs = ds.map((d) => A / d), ans = sum(qs);
      const expr = ds.map((d) => `${A} : ${d}`).join(' + ');
      return numQ('arith', [`Tính: <b>${expr}</b>`, `Find the value of: <b>${expr.replace(/ : /g, ' ÷ ')}</b>`], ans, [ans + A / ds[0], ans - 1, ans + 10],
        `${ds.map((d) => `${A} : ${d} = ${A / d}`).join('; ')}. Tổng: ${qs.join(' + ')} = <b>${fmt(ans)}</b>.`);
    }
    const M = rand(3, 9), Tq = rand(8, b === 3 ? 60 : 30), T = M * Tq;
    let A, B, c, D = 0;
    for (;;) {
      c = rand(3, Math.floor(T / 3));
      A = rand(2, T - c - 2);
      D = b === 3 && R() < 0.5 ? rand(2, 30) : 0;
      B = T - A - c + D;
      if (B > 1 && A % M && B % M && c % M && (!D || D % M)) break;
    }
    const expr = `${A} : ${M} + ${B} : ${M} + ${2 * c} : ${2 * M}${D ? ` − ${D} : ${M}` : ''}`;
    return numQ('arith', [`Tính nhanh: <b>${expr}</b>`, `Calculate quickly: <b>${expr.replace(/ : /g, ' ÷ ')}</b>`], Tq, [Tq + 1, Tq * 2, Tq - 2],
      `${2 * c} : ${2 * M} = (${2 * c} : 2) : ${M} = ${c} : ${M}. Các số hạng có cùng số chia ${M} nên gộp lại: (${A} + ${B} + ${c}${D ? ` − ${D}` : ''}) : ${M} = ${T} : ${M} = <b>${Tq}</b>.`);
  });

  // CĐ 09 — Tính phân phối của phép nhân
  add('arith', function mulTricks(g) {
    const b = band(g);
    const kind = b === 1 ? 'common' : pick(b === 2 ? ['common', 'hidden'] : ['common', 'hidden', 'repeat']);
    if (kind === 'common') {
      const k = rand(3, 9), Rr = pick([50, 100, 100, 200]);
      let a, c, d, e;
      do { a = rand(15, 70); c = rand(5, 30); d = b === 1 ? 0 : rand(5, 25); e = Rr - a + c - d; } while (e < 5);
      const terms = [[a, '+'], [e, '+'], [c, '−']].concat(d ? [[d, '+']] : []);
      const ordd = shuffle(terms.slice(1));
      const expr = `${k} × ${a}` + ordd.map(([v, sg]) => ` ${sg} ${k} × ${v}`).join('');
      const inner = `${a}` + ordd.map(([v, sg]) => ` ${sg} ${v}`).join('');
      return numQ('arith', [`Tính nhanh: <b>${expr}</b>`, `Calculate quickly: <b>${expr}</b>`], k * Rr, [k * Rr + k, Rr, k * (Rr - c)],
        `Đặt thừa số chung ${k} ra ngoài: ${k} × (${inner}) = ${k} × ${Rr} = <b>${fmt(k * Rr)}</b>.`);
    }
    if (kind === 'hidden') {
      const a = rand(11, 49), c = rand(10, 45), bb = 100 - 2 * c;
      const t2 = R() < 0.5 ? `${2 * a} × ${c}` : `${c} × ${2 * a}`;
      const expr = `${a} × ${bb} + ${t2}`;
      return numQ('arith', [`Tính nhanh: <b>${expr}</b>`, `Calculate quickly: <b>${expr}</b>`], a * 100, [a * 10, a * 100 + c, 2 * a * 100],
        `${2 * a} × ${c} = ${a} × 2 × ${c} = ${a} × ${2 * c}. Vậy biểu thức = ${a} × ${bb} + ${a} × ${2 * c} = ${a} × (${bb} + ${2 * c}) = ${a} × 100 = <b>${fmt(a * 100)}</b>.`);
    }
    const a = rand(12, 45), dgt = pick([1, 1, 2, 3]), r = rand(3, 4), rep = Number(String(dgt).repeat(r));
    const ans = a * rep;
    return numQ('arith', [`Tính: <b>${a} × ${rep}</b>`, `Find the value of: <b>${a} × ${rep}</b>`], ans, [ans + a, ans - 10 * a, a * rep * 10],
      `${rep} = ${dgt} × ${'1'.repeat(r)}. ${a} × ${'1'.repeat(r)} = ${Array.from({ length: r }, (_, i) => `${a} × ${10 ** (r - 1 - i)}`).join(' + ')} = ${fmt(a * Number('1'.repeat(r)))}${dgt > 1 ? `; nhân thêm ${dgt}` : ''}. Kết quả: <b>${fmt(ans)}</b>.`);
  });

  // CĐ 10 — Điền số còn thiếu trong phép tính hỗn hợp
  add('arith', function fillMixed(g) {
    const b = band(g);
    if (b === 1) {
      const x = rand(2, 9), m = rand(2, 5), c = rand(1, 20), d = x * m + c;
      return numQ('arith', [`Tìm số thích hợp điền vào ô trống: <b>□ × ${m} + ${c} = ${d}</b>`, `Find the missing number: <b>□ × ${m} + ${c} = ${d}</b>`], x, [x + 1, d - c, x * m],
        `□ × ${m} = ${d} − ${c} = ${d - c}; □ = ${d - c} : ${m} = <b>${x}</b>.`);
    }
    if (b === 2 || R() < 0.5) {
      const a = rand(2, 9), q = rand(2, 12), x = q * a, m = rand(2, 9), val = q * m, plus = R() < 0.5;
      const c = plus ? rand(2, 40) : rand(1, val - 1), d = plus ? val + c : val - c;
      const expr = `□ : ${a} × ${m} ${plus ? '+' : '−'} ${c} = ${d}`;
      return numQ('arith', [`Tìm số thích hợp điền vào ô trống: <b>${expr}</b>`, `Find the missing number: <b>${expr.replace(/ : /g, ' ÷ ')}</b>`], x, [q, x + a, val],
        `Làm ngược từ cuối: □ : ${a} × ${m} = ${d} ${plus ? '−' : '+'} ${c} = ${val}; □ : ${a} = ${val} : ${m} = ${q}; □ = ${q} × ${a} = <b>${x}</b>.`);
    }
    const a = rand(2, 9), bq = rand(2, 6), x = bq * rand(2, 9), val = (x * a) / bq, e = rand(2, 9), f = rand(2, 9);
    const c = rand(1, val - 1), gg = val - c + e * f;
    const expr = `□ × ${a} : ${bq} − ${c} + ${e} × ${f} = ${gg}`;
    return numQ('arith', [`Tìm số thích hợp điền vào ô trống: <b>${expr}</b>`, `Find the missing number: <b>${expr.replace(/ : /g, ' ÷ ')}</b>`], x, [x + bq, val, x * a],
      `${e} × ${f} = ${e * f}. □ × ${a} : ${bq} − ${c} = ${gg} − ${e * f} = ${gg - e * f}; □ × ${a} : ${bq} = ${gg - e * f} + ${c} = ${val}; □ × ${a} = ${val} × ${bq} = ${val * bq}; □ = ${val * bq} : ${a} = <b>${x}</b>.`);
  });

  // CĐ 25 — Bài toán đổi tiền
  add('arith', function money(g) {
    const b = band(g);
    const X = pick(NAMES);
    if (b === 1 || R() < 0.6) {
      const ds = shuffle([1, 2, 5, 10]).slice(0, b === 1 ? 2 : 3).sort((x, y) => x - y);
      const cs = ds.map(() => rand(2, 9));
      const T = sum(ds.map((d, i) => d * cs[i]));
      const p = rand(3, Math.min(15, Math.floor(T / 2)));
      const ans = Math.floor(T / p);
      const listVi = ds.map((d, i) => `${cs[i]} đồng $${d}`).join(', ');
      const listEn = ds.map((d, i) => `${pl(cs[i], `$${d} coin`, `$${d} coins`)}`).join(', ');
      return numQ('arith', [
        `${X} có ${listVi}. Mỗi cuốn truyện giá $${p}. Hỏi ${X} mua được nhiều nhất bao nhiêu cuốn truyện?`,
        `${X} has ${listEn}. Each comic book costs $${p}. What is the greatest number of comic books ${X} can buy?`,
      ], ans, [ans + 1, ans - 1, Math.ceil(T / p) + 1, sum(cs)],
      `Tổng số tiền: ${ds.map((d, i) => `${cs[i]} × ${d}`).join(' + ')} = $${T}. ${T} : ${p} = ${ans} (dư ${T % p}). Vậy mua được nhiều nhất <b>${ans}</b> cuốn.`);
    }
    for (;;) {
      const c1 = rand(2, 6), c2 = rand(2, 5), c5 = rand(1, 3), X$ = rand(6, Math.min(c1 + 2 * c2 + 5 * c5, 20));
      const ways = [];
      for (let z = 0; z <= c5; z++) for (let y = 0; y <= c2; y++) { const x = X$ - 5 * z - 2 * y; if (x >= 0 && x <= c1) ways.push([z, y, x]); }
      if (ways.length < 2 || ways.length > 9) continue;
      return numQ('arith', [
        `${X} có ${c1} đồng $1, ${c2} đồng $2 và ${c5} đồng $5. Hỏi có bao nhiêu cách để ${X} trả đúng $${X$} (không cần trả lại tiền thừa)?`,
        `${X} has ${pl(c1, '$1 coin', '$1 coins')}, ${pl(c2, '$2 coin', '$2 coins')} and ${pl(c5, '$5 coin', '$5 coins')}. In how many different ways can ${X} pay exactly $${X$}?`,
      ], ways.length, [ways.length + 1, ways.length - 1, ways.length + 2],
      `Xét số đồng $5 trước, rồi số đồng $2, phần còn lại trả bằng đồng $1 (không quá ${c1} đồng):<br>${ways.map(([z, y, x]) => `• ${z} đồng $5 + ${y} đồng $2 + ${x} đồng $1`).join('<br>')}<br>Có <b>${ways.length}</b> cách.`);
    }
  });

  // =====================================================================
  // TƯ DUY LOGIC
  // =====================================================================

  // CĐ 01–02 — Quy luật dãy hình lặp lại
  const SYM = ['🔴', '🔵', '🟢', '🟡', '⭐', '🔺', '🟪', '🟧'];
  add('logic', function repeatPattern(g) {
    const b = band(g);
    let cyc;
    for (;;) {
      const k = rand(3, b === 1 ? 4 : 5), uniq = shuffle(SYM).slice(0, rand(2, Math.min(4, k)));
      cyc = Array.from({ length: k }, (_, i) => (i < uniq.length ? uniq[i] : pick(uniq)));
      cyc = shuffle(cyc);
      const k0 = cyc.length;
      if (new Set(cyc).size < 2) continue;
      const isRepeat = [1, 2].some((p) => k0 % p === 0 && p < k0 && cyc.every((x, i) => x === cyc[i % p]));
      if (!isRepeat) break;
    }
    const k = cyc.length, shown = Array.from({ length: 2 * k + 2 }, (_, i) => cyc[i % k]);
    const line = `<span class="seq">${shown.join(' ')} …</span>`;
    const N = b === 1 ? rand(12, 30) : b === 2 ? rand(30, 120) : rand(100, 500);
    const q = Math.floor(N / k), r = N % k;
    const cycTxt = cyc.join(' ');
    if (b === 1 || R() < 0.5) {
      const ans = cyc[(N - 1) % k];
      return textQ('logic', [
        `Các hình được xếp theo quy luật lặp lại: ${line} Hỏi hình thứ ${N} là hình nào?`,
        `The shapes below repeat in a pattern: ${line} What is the ${ord(N)} shape?`,
      ], ans, [...new Set(cyc), ...SYM],
      `Mỗi nhóm lặp lại gồm ${k} hình: ${cycTxt}. ${N} = ${k} × ${q} + ${r}. ${r === 0 ? `Hình thứ ${N} là hình cuối cùng của nhóm` : `Hình thứ ${N} là hình thứ ${r} trong nhóm`}: <b>${ans}</b>.`);
    }
    const sym = pick([...new Set(cyc)]), per = cyc.filter((x) => x === sym).length, extra = cyc.slice(0, r).filter((x) => x === sym).length;
    const ans = q * per + extra;
    return numQ('logic', [
      `Các hình được xếp theo quy luật lặp lại: ${line} Trong ${N} hình đầu tiên có bao nhiêu hình ${sym}?`,
      `The shapes below repeat in a pattern: ${line} How many ${sym} are there among the first ${N} shapes?`,
    ], ans, [ans + 1, ans - 1, q * per, Math.round(N / k)],
    `Mỗi nhóm ${k} hình (${cycTxt}) có ${per} hình ${sym}. ${N} = ${k} × ${q} + ${r}: có ${q} nhóm đầy đủ và ${r} hình lẻ (${cyc.slice(0, r).join(' ') || 'không có'}) chứa ${extra} hình ${sym}. Tổng: ${q} × ${per} + ${extra} = <b>${ans}</b>.`);
  });

  // CĐ 03–04 — Quy luật nhóm hình (nhóm thứ n gồm n hàng × (n + 1) hình)
  add('logic', function groupShapes(g) {
    const b = band(g);
    const border = (n) => (n === 1 ? 2 : 4 * n - 2), inside = (n) => (n < 2 ? 0 : (n - 2) * (n - 1)), total = (n) => n * (n + 1);
    const cell = 11;
    let x = 6, svg = '';
    const W = [1, 2, 3, 4].reduce((w, n) => w + (n + 1) * cell + 18, 6), Hh = 4 * cell + 30;
    for (let n = 1; n <= 4; n++) {
      for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) {
        const edge = r === 0 || r === n - 1 || c === 0 || c === n;
        const cx = x + c * cell + cell / 2, cy = 6 + (4 - n) * cell + r * cell + cell / 2;
        svg += edge ? `<circle cx="${cx}" cy="${cy}" r="4" fill="currentColor"/>` : `<circle cx="${cx}" cy="${cy}" r="3.6" fill="none" stroke="currentColor" stroke-width="1.4"/>`;
      }
      svg += `<text x="${x + ((n + 1) * cell) / 2}" y="${Hh - 4}" font-size="11" text-anchor="middle" fill="currentColor">(${n})</text>`;
      x += (n + 1) * cell + 18;
    }
    const fig = SVG(W, Hh) + svg + '</svg>';
    const N = b === 1 ? rand(4, 10) : b === 2 ? rand(6, 12) : rand(10, 25);
    const rule = `Nhóm thứ n gồm n hàng, mỗi hàng n + 1 hình. Các hình ● nằm ở viền: n × (n + 1) − (n − 2) × (n − 1) = 4 × n − 2 hình (với n ≥ 2); các hình ○ nằm bên trong: (n − 2) × (n − 1) hình.`;
    const kind = b === 1 ? pick(['total', 'border']) : b === 2 ? pick(['border', 'inside']) : pick(['border', 'inside', 'diff']);
    const ans = { total: total(N), border: border(N), inside: inside(N), diff: Math.abs(inside(N) - border(N)) }[kind];
    const askVi = { total: 'tất cả bao nhiêu hình', border: 'bao nhiêu hình ●', inside: 'bao nhiêu hình ○', diff: 'số hình ○ và số hình ● hơn kém nhau bao nhiêu' }[kind];
    const askEn = { total: 'How many shapes are there', border: 'How many ● are there', inside: 'How many ○ are there', diff: 'What is the difference between the number of ○ and the number of ●' }[kind];
    return numQ('logic', [
      `Quan sát quy luật các nhóm hình dưới đây. Hỏi nhóm thứ ${N} có ${askVi}?`,
      `Look at the pattern of the groups below. ${askEn} in the ${ord(N)} group?`,
    ], ans, [total(N), border(N), inside(N), ans + 2, ans + N].filter((v) => v !== ans),
    `${rule}<br>Nhóm thứ ${N}: tổng ${N} × ${N + 1} = ${total(N)} hình, ● = ${border(N)}, ○ = ${inside(N)}. Đáp án: <b>${ans}</b>.`, fig);
  });

  // CĐ 05 — Ngày thứ: N ngày trước, mốc hôm qua / ngày mai
  add('logic', function weekdayShift(g) {
    const b = band(g);
    const N = b === 1 ? rand(3, 20) : b === 2 ? rand(20, 150) : rand(100, 500);
    const kind = b === 1 ? pick(['before', 'yest']) : pick(['before', 'yest', 'tom']);
    const x = rand(0, 6), q = Math.floor(N / 7), r = N % 7;
    let ans, vi, en, exp;
    if (kind === 'before') {
      ans = mod(x - N, 7);
      vi = `Hôm nay là <b>${DAYS[x]}</b>. Hỏi ${N} ngày trước là thứ mấy?`;
      en = `Today is <b>${DAYS_EN[x]}</b>. What day of the week was it ${N} days ago?`;
      exp = `${N} = 7 × ${q} + ${r}. Cứ lùi 7 ngày lại về đúng thứ cũ, nên chỉ cần đếm lùi ${r} ngày từ ${DAYS[x]}: <b>${DAYS[ans]}</b>.`;
    } else if (kind === 'yest') {
      const t = mod(x + 1, 7);
      ans = mod(t + N, 7);
      vi = `Hôm qua là <b>${DAYS[x]}</b>. Hỏi ${N} ngày nữa (tính từ hôm nay) là thứ mấy?`;
      en = `Yesterday was <b>${DAYS_EN[x]}</b>. What day of the week will it be ${N} days from today?`;
      exp = `Hôm qua là ${DAYS[x]} nên hôm nay là ${DAYS[t]}. ${N} = 7 × ${q} + ${r}, đếm tiếp ${r} ngày từ ${DAYS[t]}: <b>${DAYS[ans]}</b>.`;
    } else {
      const t = mod(x - 1, 7);
      ans = mod(t - N, 7);
      vi = `Ngày mai là <b>${DAYS[x]}</b>. Hỏi ${N} ngày trước (tính từ hôm nay) là thứ mấy?`;
      en = `Tomorrow is <b>${DAYS_EN[x]}</b>. What day of the week was it ${N} days ago?`;
      exp = `Ngày mai là ${DAYS[x]} nên hôm nay là ${DAYS[t]}. ${N} = 7 × ${q} + ${r}, đếm lùi ${r} ngày từ ${DAYS[t]}: <b>${DAYS[ans]}</b>.`;
    }
    return strQ('logic', [vi, en], DAYS[ans], DAYS, `${exp} (${DAYS_EN[ans]})`, dayLabels());
  });

  // CĐ 06 — Ngày thứ qua nhiều tháng, sang năm, đi ngược, năm nhuận (theo lịch thật)
  add('logic', function calendarSpan(g) {
    const b = band(g);
    const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
    const kind = b === 3 ? pick(['fwd', 'next', 'back']) : pick(['fwd', 'fwd', 'back']);
    const y1 = pick([2024, 2025, 2026, 2027, 2028]);
    let m1, m2, y2 = y1;
    if (kind === 'fwd') { m1 = rand(1, 10); m2 = rand(m1 + 1, Math.min(12, m1 + (b === 1 ? 2 : 5))); }
    else if (kind === 'back') { m1 = rand(3, 12); m2 = rand(Math.max(1, m1 - (b === 1 ? 2 : 5)), m1 - 1); }
    else { m1 = rand(9, 12); m2 = rand(1, 3); y2 = y1 + 1; }
    const d1 = rand(1, dim(y1, m1)), d2 = rand(1, dim(y2, m2));
    const t1 = Date.UTC(y1, m1 - 1, d1), t2 = Date.UTC(y2, m2 - 1, d2);
    const w1 = new Date(t1).getUTCDay(), w2 = new Date(t2).getUTCDay();
    const N = Math.abs(t2 - t1) / 86400000;
    // Diễn giải số ngày: từ mốc sớm đến mốc muộn
    const [ey, em, ed, ly, lm, ld] = t1 < t2 ? [y1, m1, d1, y2, m2, d2] : [y2, m2, d2, y1, m1, d1];
    const parts = [`${dim(ey, em) - ed} ngày còn lại của tháng ${em}`];
    let yy = ey, mm = em + 1;
    if (mm > 12) { mm = 1; yy++; }
    let leap = false;
    while (yy < ly || (yy === ly && mm < lm)) {
      parts.push(`tháng ${mm}${yy !== ey ? `/${yy}` : ''}: ${dim(yy, mm)}`);
      if (mm === 2 && dim(yy, 2) === 29) leap = true;
      mm++; if (mm > 12) { mm = 1; yy++; }
    }
    parts.push(`${ld} ngày của tháng ${lm}`);
    const q = Math.floor(N / 7), r = N % 7, fwd = t2 > t1;
    return strQ('logic', [
      `Biết ngày ${d1}/${m1}/${y1} là <b>${DAYS[w1]}</b>. Hỏi ngày ${d2}/${m2}/${y2} là thứ mấy?`,
      `${MONTHS_EN[m1 - 1]} ${d1}, ${y1} is a <b>${DAYS_EN[w1]}</b>. What day of the week is ${MONTHS_EN[m2 - 1]} ${d2}, ${y2}?`,
    ], DAYS[w2], DAYS,
    `Số ngày giữa hai mốc: ${parts.join(' + ')} = ${N} ngày.${leap ? ' (Năm nhuận: tháng 2 có 29 ngày.)' : ''}<br>${N} = 7 × ${q} + ${r}, nên đếm ${fwd ? 'tiến' : 'lùi'} ${r} ngày từ ${DAYS[w1]}: <b>${DAYS[w2]}</b> (${DAYS_EN[w2]}).`, dayLabels());
  });

  // CĐ 26 — Quy luật chữ cái
  add('logic', function letterPattern(g) {
    const b = band(g);
    const kind = b === 1 ? 'step' : pick(b === 2 ? ['step', 'step', 'inter', 'code'] : ['step', 'inter', 'code', 'inter']);
    const idx = (ch) => ABC.indexOf(ch) + 1;
    if (kind === 'step') {
      const k = (b === 1 ? rand(1, 3) : rand(2, 6)) * (b > 1 && R() < 0.3 ? -1 : 1), s = rand(0, 25);
      const terms = Array.from({ length: 5 }, (_, i) => LET(s + k * i)), ans = LET(s + 5 * k);
      const seq = `<b>${terms.join(', ')}, ...</b>`;
      return textQ('logic', [`Dựa vào quy luật, tìm chữ cái tiếp theo của dãy: ${seq}`, `According to the pattern below, find the next letter: ${seq}`], ans,
        [LET(s + 5 * k + 1), LET(s + 5 * k - 1), LET(s + 6 * k), LET(s + 4 * k), LET(s + 5 * k + 2)],
        `Đổi chữ cái sang số thứ tự (A = 1, …, Z = 26): ${terms.map((t) => `${t} = ${idx(t)}`).join(', ')}. Mỗi chữ ${k > 0 ? 'sau' : 'trước'} chữ liền trước ${Math.abs(k)} vị trí (quá Z thì quay lại A). Chữ tiếp theo: <b>${ans}</b> (= ${idx(ans)}).`);
    }
    if (kind === 'inter') {
      const s1 = rand(0, 25), k1 = rand(2, 4), s2 = rand(0, 25), k2 = -rand(1, 3) * (R() < 0.5 ? 1 : -1);
      const t = [];
      for (let i = 0; i < 5; i++) t.push(LET(s1 + k1 * i), LET(s2 + k2 * i));
      const shownN = 7, ans = t[shownN];
      const seq = `<b>${t.slice(0, shownN).join(', ')}, ...</b>`;
      const odd = t.slice(0, shownN).filter((_, i) => i % 2 === 0), even = t.slice(0, shownN).filter((_, i) => i % 2 === 1);
      return textQ('logic', [`Dựa vào quy luật, tìm chữ cái tiếp theo của dãy: ${seq}`, `According to the pattern below, find the next letter: ${seq}`], ans,
        [LET(s2 + k2 * 3 + 1), LET(s1 + k1 * 4), LET(s2 + k2 * 4), LET(s2 + k2 * 3 - 1), LET(s1 + k1 * 3)],
        `Tách thành hai dãy xen kẽ:<br>• Vị trí lẻ: ${odd.join(', ')} — mỗi chữ ${k1 > 0 ? 'sau' : 'trước'} chữ trước ${Math.abs(k1)} vị trí.<br>• Vị trí chẵn: ${even.join(', ')} — mỗi chữ ${k2 > 0 ? 'sau' : 'trước'} chữ trước ${Math.abs(k2)} vị trí.<br>Chữ thứ 8 thuộc dãy vị trí chẵn: <b>${ans}</b>.`);
    }
    const words = ['CAT', 'DOG', 'SUN', 'MATH', 'BOOK', 'STAR', 'TREE', 'FISH', 'BIRD', 'CAKE', 'MILK', 'RAIN', 'KING', 'LION', 'MOON'];
    const [w1, w2] = shuffle(words);
    const k = rand(1, 5), enc = (w, kk) => w.split('').map((c) => LET(ABC.indexOf(c) + kk)).join('');
    const ans = enc(w2, k);
    return textQ('logic', [
      `Trong một mật mã, từ <b>${w1}</b> được viết thành <b>${enc(w1, k)}</b>. Hỏi từ <b>${w2}</b> được viết thành gì?`,
      `In a code, the word <b>${w1}</b> is written as <b>${enc(w1, k)}</b>. How is the word <b>${w2}</b> written in this code?`,
    ], ans, [enc(w2, k + 1), enc(w2, k - 1), enc(w2, -k), enc(w2, k + 2)],
    `So sánh từng chữ: ${w1.split('').map((c, i) => `${c} → ${enc(w1, k)[i]}`).join(', ')} — mỗi chữ dời đi ${k} vị trí trong bảng chữ cái. Áp dụng cho ${w2}: ${w2.split('').map((c, i) => `${c} → ${ans[i]}`).join(', ')}. Đáp án: <b>${ans}</b>.`);
  });

  // CĐ 28 — Quy luật nhóm số (tam giác số)
  add('logic', function numberTriangle(g) {
    const b = band(g);
    const T = [];
    if (b === 1) {
      for (let k = 0; k <= 5; k++) T.push({ d: k ? `a + b + ${k}` : 'a + b', f: (a, c) => a + c + k });
      T.push({ d: 'a + a + b', f: (a, c) => 2 * a + c }, { d: 'a + b + b', f: (a, c) => a + 2 * c });
    } else {
      for (let k = 1; k <= 5; k++) T.push({ d: `a × b + ${k}`, f: (a, c) => a * c + k }, { d: `a × b − ${k}`, f: (a, c) => a * c - k });
      for (let k = 2; k <= 5; k++) T.push({ d: `(a + b) × ${k}`, f: (a, c) => (a + c) * k }, { d: `(a + b) × ${k} − 1`, f: (a, c) => (a + c) * k - 1 });
      for (let k = 1; k <= 3; k++) T.push({ d: `a × (b + ${k})`, f: (a, c) => a * (c + k) }, { d: `(a + ${k}) × b`, f: (a, c) => (a + k) * c });
      T.push({ d: '(a + 1) × (b + 1)', f: (a, c) => (a + 1) * (c + 1) }, { d: 'a × b + a', f: (a, c) => a * c + a }, { d: 'a × b', f: (a, c) => a * c });
    }
    for (;;) {
      const t = pick(T), lo = b === 1 ? 1 : 2, hi = b === 1 ? 9 : 9;
      const ps = [[rand(lo, hi), rand(lo, hi)], [rand(lo, hi), rand(lo, hi)], [rand(lo, hi), rand(lo, hi)]];
      const tops = ps.map(([a, c]) => t.f(a, c));
      if (tops.some((v) => v <= 0)) continue;
      const fits = T.filter((u) => u.f(...ps[0]) === tops[0] && u.f(...ps[1]) === tops[1]);
      if (new Set(fits.map((u) => u.f(...ps[2]))).size !== 1) continue;
      let svg = SVG(330, 92);
      ps.forEach(([a, c], i) => {
        const x = i * 112;
        svg += `<polygon points="${x + 55},6 ${x + 8},84 ${x + 102},84" fill="none" stroke="currentColor" stroke-width="2"/>`;
        svg += `<text x="${x + 55}" y="40" font-size="17" font-weight="700" text-anchor="middle" fill="${i === 2 ? RED : 'currentColor'}">${i === 2 ? '?' : tops[i]}</text>`;
        svg += `<text x="${x + 32}" y="76" font-size="16" text-anchor="middle" fill="currentColor">${a}</text><text x="${x + 78}" y="76" font-size="16" text-anchor="middle" fill="currentColor">${c}</text>`;
      });
      svg += '</svg>';
      const ans = tops[2];
      return numQ('logic', [
        `Quan sát quy luật của các nhóm số dưới đây. Tìm số thích hợp thay cho dấu "?".`,
        `According to the pattern below, find the missing number "?".`,
      ], ans, [ans + 1, ans - 1, ps[2][0] + ps[2][1], ps[2][0] * ps[2][1]],
      `Gọi a là số bên trái, b là số bên phải ở đáy. Quy luật: số ở đỉnh = <b>${t.d}</b>.<br>Kiểm tra: nhóm 1: ${t.d.replace(/a/g, ps[0][0]).replace(/b/g, ps[0][1])} = ${tops[0]}; nhóm 2: ${t.d.replace(/a/g, ps[1][0]).replace(/b/g, ps[1][1])} = ${tops[1]}.<br>Nhóm 3: ${t.d.replace(/a/g, ps[2][0]).replace(/b/g, ps[2][1])} = <b>${ans}</b>.`, svg);
    }
  });

  // CĐ 29 — Dãy số cách đều: số hạng thứ N, tổng hai số hạng
  add('logic', function nthTerm(g) {
    const b = band(g);
    const d = rand(2, b === 1 ? 5 : 12), down = b > 1 && R() < 0.35;
    const Nmax = b === 1 ? 15 : b === 2 ? 40 : 80;
    const a = down ? d * (Nmax - 1) + rand(5, 60) : rand(1, 30);
    const v = (n) => a + (down ? -1 : 1) * d * (n - 1);
    const seq = `<b>${[1, 2, 3, 4, 5].map(v).join(', ')}, ...</b>`;
    const rule = `Dãy ${down ? 'giảm' : 'tăng'} đều ${d} đơn vị. Số hạng thứ n = ${a} ${down ? '−' : '+'} (n − 1) × ${d}.`;
    if (b > 1 && R() < 0.4) {
      const m = rand(6, Nmax - 5), n = rand(m + 2, Nmax), ans = v(m) + v(n);
      return numQ('logic', [
        `Cho dãy số cách đều: ${seq} Tính tổng của số hạng thứ ${m} và số hạng thứ ${n}.`,
        `Look at the evenly spaced sequence: ${seq} Find the sum of the ${ord(m)} term and the ${ord(n)} term.`,
      ], ans, [ans + d, ans - d, v(m) * 2, v(n) + v(m + 1)],
      `${rule}<br>Số hạng thứ ${m}: ${v(m)}; số hạng thứ ${n}: ${v(n)}. Tổng: ${v(m)} + ${v(n)} = <b>${ans}</b>.`);
    }
    const N = rand(b === 1 ? 8 : 12, Nmax), ans = v(N);
    return numQ('logic', [
      `Cho dãy số cách đều: ${seq} Tìm số hạng thứ ${N} của dãy.`,
      `Look at the evenly spaced sequence: ${seq} Find the ${ord(N)} term.`,
    ], ans, [v(N + 1), v(N - 1), a + d * N, ans + 1].filter((x) => x >= 0),
    `${rule}<br>Số hạng thứ ${N} = ${a} ${down ? '−' : '+'} ${N - 1} × ${d} = <b>${ans}</b>.`);
  });

  // CĐ 34 — Thời gian làm việc xen nghỉ
  add('logic', function workRest(g) {
    const b = band(g);
    const X = pick(NAMES);
    if (b === 1 || R() < 0.5) {
      const n = rand(3, b === 1 ? 5 : 9), a = rand(3, b === 1 ? 6 : 15), r = rand(1, 5), ans = n * a + (n - 1) * r;
      return numQ('logic', [
        `${X} làm ${n} chiếc bánh, mỗi chiếc mất ${a} phút. Giữa hai lần làm bánh liên tiếp, ${X} nghỉ ${r} phút. Hỏi ${X} làm xong ${n} chiếc bánh mất bao nhiêu phút?`,
        `${X} makes ${n} cakes. Each cake takes ${a} minutes, and ${X} rests ${pl(r, 'minute', 'minutes')} between two cakes. How many minutes does it take ${X} to make all ${n} cakes?`,
      ], ans, [n * (a + r), n * a, ans + r],
      `Làm ${n} chiếc bánh: ${n} × ${a} = ${n * a} phút. Chỉ nghỉ giữa hai lần làm nên có ${n} − 1 = ${n - 1} lần nghỉ: ${n - 1} × ${r} = ${(n - 1) * r} phút. Tổng: <b>${ans}</b> phút.`);
    }
    const a = rand(8, 20), r = rand(2, 6), hours = rand(1, 3), extra = pick([0, 0, 30]), T = hours * 60 + extra;
    const ans = Math.floor((T + r) / (a + r));
    return numQ('logic', [
      `${X} đọc một chương sách mất ${a} phút; đọc xong mỗi chương, ${X} nghỉ ${r} phút rồi mới đọc chương tiếp theo. Hỏi trong ${hours} giờ${extra ? ` ${extra} phút` : ''}, ${X} đọc xong nhiều nhất bao nhiêu chương?`,
      `${X} needs ${a} minutes to read a chapter. After each chapter, ${X} rests ${pl(r, 'minute', 'minutes')} before reading the next one. What is the greatest number of chapters ${X} can finish in ${hours} ${hours > 1 ? 'hours' : 'hour'}${extra ? ` ${extra} minutes` : ''}?`,
    ], ans, [ans + 1, Math.floor(T / a), ans - 1],
    `${hours} giờ${extra ? ` ${extra} phút` : ''} = ${T} phút. Đọc n chương cần n × ${a} + (n − 1) × ${r} phút (không tính lần nghỉ sau chương cuối). Với n = ${ans}: ${ans * a + (ans - 1) * r} ≤ ${T}; với n = ${ans + 1}: ${(ans + 1) * a + ans * r} > ${T}. Vậy nhiều nhất <b>${ans}</b> chương.`);
  });

  // =====================================================================
  // LÝ THUYẾT SỐ
  // =====================================================================

  // CĐ 32 — Tìm số liên quan phép chia (nhiều điều kiện)
  add('numth', function divisibleSearch(g) {
    const b = band(g);
    for (;;) {
      const ds = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]).slice(0, b === 3 ? rand(2, 3) : rand(1, 2)).sort((x, y) => x - y);
      const L = ds.reduce(lcm);
      if (L > 180) continue;
      const largest = R() < 0.5;
      const conds = [];
      if (R() < 0.5) conds.push(pick(['even', 'odd']));
      if (b === 3 && R() < 0.4) conds.push('distinct');
      if (b === 3 && largest && R() < 0.3) conds.push('below');
      const cap = conds.includes('below') ? pick([500, 600, 700]) : 1000;
      if (conds.includes('odd') && ds.some((d) => d % 2 === 0)) continue;
      const okk = (n) => n % L === 0 && (!conds.includes('even') || n % 2 === 0) && (!conds.includes('odd') || n % 2 === 1)
        && (!conds.includes('distinct') || new Set(String(n)).size === 3) && n < cap;
      const cand = [];
      for (let n = 100; n <= 999; n++) if (okk(n)) cand.push(n);
      if (!cand.length) continue;
      const ans = largest ? cand[cand.length - 1] : cand[0];
      const cv = { even: ['chẵn', 'even'], odd: ['lẻ', 'odd'], distinct: ['có các chữ số khác nhau', 'with all different digits'], below: [`nhỏ hơn ${cap}`, `less than ${cap}`] };
      const adjVi = conds.filter((c) => c === 'even' || c === 'odd').map((c) => cv[c][0]).join(' ');
      const adjEn = conds.filter((c) => c === 'even' || c === 'odd').map((c) => cv[c][1]).join(' ');
      const tailVi = conds.filter((c) => c === 'distinct' || c === 'below').map((c) => cv[c][0]);
      const tailEn = conds.filter((c) => c === 'distinct' || c === 'below').map((c) => cv[c][1]);
      const dv = ds.length === 1 ? `${ds[0]}` : `${ds.slice(0, -1).join(', ')} và ${ds[ds.length - 1]}`;
      const de = ds.length === 1 ? `${ds[0]}` : `${ds.slice(0, -1).join(', ')} and ${ds[ds.length - 1]}`;
      // Lời giải: duyệt các bội của L từ phía cần tìm
      const steps = [];
      const start = largest ? Math.floor((cap - 1 > 999 ? 999 : cap - 1) / L) * L : Math.ceil(100 / L) * L;
      for (let n = start; steps.length < 6; n += largest ? -L : L) {
        if (n < 100 || n > 999) break;
        if (okk(n)) { steps.push(`<b>${n}</b> ✓`); break; }
        steps.push(`${n} ✗`);
      }
      return numQ('numth', [
        `Tìm số ${adjVi ? adjVi + ' ' : ''}${largest ? 'lớn nhất' : 'nhỏ nhất'} có ba chữ số chia hết cho ${ds.length > 1 ? 'cả ' : ''}${dv}${tailVi.length ? ', ' + tailVi.join(', ') : ''}.`,
        `Find the ${largest ? 'largest' : 'smallest'} 3-digit ${adjEn ? adjEn + ' ' : ''}number that is divisible by ${ds.length > 1 ? 'all of ' : ''}${de}${tailEn.length ? ' and ' + tailEn.join(' and ') : ''}.`,
      ], ans, [largest ? ans - L : ans + L, ans + (largest ? -1 : 1) * 2 * L, largest ? 999 : 100, ans + 1].filter((x) => x > 0),
      `${ds.length > 1 ? `Chia hết cho ${dv} nghĩa là chia hết cho BCNN = ${L}. ` : ''}Xét các bội của ${L} bắt đầu từ ${largest ? 'số lớn nhất' : 'số nhỏ nhất'} có thể: ${steps.join(', ')}. Đáp án: <b>${ans}</b>.`);
    }
  });

  // CĐ 16 — Phép toán mới: tìm quy luật từ ví dụ
  add('numth', function operationInfer(g) {
    const b = band(g);
    const P = [
      { d: 'a × b + a + b', f: (a, c) => a * c + a + c }, { d: 'a × a + b', f: (a, c) => a * a + c }, { d: 'a × b − a', f: (a, c) => a * c - a },
      { d: '(a + b) × 2', f: (a, c) => (a + c) * 2 }, { d: 'a × 2 + b', f: (a, c) => 2 * a + c }, { d: 'a × b + 1', f: (a, c) => a * c + 1 },
      { d: 'a + b × 3', f: (a, c) => a + 3 * c }, { d: 'b × b + a', f: (a, c) => c * c + a }, { d: 'a × b + b', f: (a, c) => a * c + c },
      { d: '(a + b) × (a − b)', f: (a, c) => (a + c) * (a - c), ok: (a, c) => a > c }, { d: 'a × a − b', f: (a, c) => a * a - c },
      { d: 'a + b + a × b × 2', f: (a, c) => a + c + 2 * a * c },
    ];
    const pool = b === 1 ? P.slice(3, 7) : P;
    for (;;) {
      const t = pick(pool), ok = t.ok || (() => true);
      const ex = [];
      while (ex.length < 3) { const a = rand(1, 7), c = rand(1, 6); if (ok(a, c) && !ex.some((e) => e[0] === a && e[1] === c)) ex.push([a, c]); }
      const qa = rand(3, 9), qc = rand(2, 8);
      if (!ok(qa, qc) || ex.some((e) => e[0] === qa && e[1] === qc)) continue;
      const vals = ex.map(([a, c]) => t.f(a, c)), ans = t.f(qa, qc);
      if (vals.some((v) => v < 0) || ans < 0) continue;
      const fits = P.filter((u) => ex.every(([a, c], i) => (u.ok || (() => true))(a, c) && u.f(a, c) === vals[i]));
      if (new Set(fits.map((u) => ((u.ok || (() => true))(qa, qc) ? u.f(qa, qc) : NaN))).size !== 1) continue;
      const exStr = ex.map(([a, c], i) => `${a} ★ ${c} = ${vals[i]}`).join('; ');
      return numQ('numth', [
        `Phép toán ★ được định nghĩa theo một quy luật: <b>${exStr}</b>. Tính <b>${qa} ★ ${qc}</b>.`,
        `The operation ★ follows a rule: <b>${exStr}</b>. Find the value of <b>${qa} ★ ${qc}</b>.`,
      ], ans, [ans + 1, qa * qc, qa + qc, ans - 2].filter((x) => x >= 0),
      `Thử với các ví dụ, ta tìm được quy luật: <b>a ★ b = ${t.d}</b>.<br>Kiểm tra: ${ex.map(([a, c], i) => `${t.d.replace(/a/g, a).replace(/b/g, c)} = ${vals[i]}`).join('; ')}.<br>Vậy ${qa} ★ ${qc} = ${t.d.replace(/a/g, qa).replace(/b/g, qc)} = <b>${ans}</b>.`);
    }
  });

  // Phép tính chữ (có trong đề thi thử, câu 13–15)
  add('numth', function cryptarithm(g) {
    const b = band(g);
    const T = [
      { e: 'AB + BA', v: (A, B) => 11 * (A + B), ask: ['A + B', 'A + B'], ans: (A, B) => A + B, ok: (A, B) => B > 0 },
      { e: 'AA × B', v: (A, B) => 11 * A * B, ask: ['A + B', 'A + B'], ans: (A, B) => A + B, ok: (A, B) => B > 1 },
      { e: 'AB × B', v: (A, B) => (10 * A + B) * B, ask: ['số AB', 'the number AB'], ans: (A, B) => 10 * A + B, ok: (A, B) => B > 1 },
      { e: 'AB + ABB', v: (A, B) => 10 * A + B + 100 * A + 11 * B, ask: ['số AB', 'the number AB'], ans: (A, B) => 10 * A + B, ok: () => true },
    ];
    const pool = b === 1 ? T.slice(0, 1) : T;
    for (;;) {
      const t = pick(pool), A = rand(1, 9), B = rand(0, 9);
      if (A === B || !t.ok(A, B)) continue;
      const n = t.v(A, B);
      const sols = [];
      for (let a = 1; a <= 9; a++) for (let c = 0; c <= 9; c++) if (a !== c && t.ok(a, c) && t.v(a, c) === n) sols.push([a, c]);
      const answers = new Set(sols.map(([a, c]) => t.ans(a, c)));
      if (answers.size !== 1) continue;
      const ans = t.ans(A, B);
      const expr = `<b>${t.e} = ${n}</b>`;
      return numQ('numth', [
        `Trong phép tính ${expr}, mỗi chữ cái thay cho một chữ số, hai chữ cái khác nhau thay cho hai chữ số khác nhau. Tìm ${t.ask[0]}.`,
        `In the calculation ${expr}, each letter stands for a digit, and different letters stand for different digits. Find ${t.ask[1]}.`,
      ], ans, [ans + 1, ans - 1, 10 * B + A, A * B].filter((x) => x >= 0 && x !== ans),
      `${t.e === 'AB + BA' ? `AB + BA = (10 × A + B) + (10 × B + A) = 11 × (A + B). Vậy A + B = ${n} : 11 = ${n / 11}.`
        : t.e === 'AA × B' ? `AA = 11 × A nên AA × B = 11 × A × B = ${n}, suy ra A × B = ${n / 11}. Thử các cặp chữ số: A = ${A}, B = ${B} (${11 * A} × ${B} = ${n}).`
        : `Thử các giá trị của A và B: chỉ có A = ${A}, B = ${B} thỏa mãn: ${t.e.replace(/A/g, A).replace(/B/g, B)} = ${n}.`} Đáp án: <b>${ans}</b>.`);
    }
  });

  // =====================================================================
  // HÌNH HỌC
  // =====================================================================

  // CĐ 44–45 — Đỉnh, cạnh, mặt: suy luận và tính tổng
  add('geo', function solidsSum(g) {
    const b = band(g);
    const isPyr = R() < 0.5, n = rand(3, b === 3 ? 30 : b === 2 ? 12 : 8);
    const V = isPyr ? n + 1 : 2 * n, E = isPyr ? 2 * n : 3 * n, F = isPyr ? n + 1 : n + 2;
    const Q = { V: [V, 'đỉnh', 'vertices'], E: [E, 'cạnh', 'edges'], F: [F, 'mặt', 'faces'] };
    const keys = ['V', 'E', 'F'], given = pick(keys), others = keys.filter((k) => k !== given);
    const sumAsk = b > 1 && R() < 0.5;
    const ans = sumAsk ? Q[others[0]][0] + Q[others[1]][0] : Q[others[0]][0];
    const nm = isPyr ? ['hình chóp', 'pyramid'] : ['hình lăng trụ', 'prism'];
    const derive = isPyr
      ? { V: `có ${V} đỉnh nên đáy có ${V} − 1 = ${n} cạnh`, E: `có ${E} cạnh (gồm ${n} cạnh đáy và ${n} cạnh bên) nên đáy có ${E} : 2 = ${n} cạnh`, F: `có ${F} mặt (1 đáy và ${n} mặt bên) nên đáy có ${F} − 1 = ${n} cạnh` }[given]
      : { V: `có ${V} đỉnh nên mỗi đáy có ${V} : 2 = ${n} cạnh`, E: `có ${E} cạnh nên mỗi đáy có ${E} : 3 = ${n} cạnh`, F: `có ${F} mặt (2 đáy và ${n} mặt bên) nên mỗi đáy có ${F} − 2 = ${n} cạnh` }[given];
    return numQ('geo', [
      `Một ${nm[0]} có ${Q[given][0]} ${Q[given][1]}. Hỏi ${sumAsk ? `tổng số ${Q[others[0]][1]} và số ${Q[others[1]][1]} của hình đó là bao nhiêu` : `hình đó có bao nhiêu ${Q[others[0]][1]}`}?`,
      `A ${nm[1]} has ${Q[given][0]} ${Q[given][2]}. ${sumAsk ? `What is the total number of its ${Q[others[0]][2]} and ${Q[others[1]][2]}` : `How many ${Q[others[0]][2]} does it have`}?`,
    ], ans, [Q[given][0], Q[others[1]][0], ans + 1, ans + 2].filter((x) => x !== ans),
    `Hình ${derive}. Khi đó hình có ${V} đỉnh, ${E} cạnh, ${F} mặt. Đáp án: <b>${ans}</b>.`);
  });

  /** Lưới ô vuông có nhiều ★ (ô [hàng, cột] tính từ 1). */
  function svgStars(m, n, stars) {
    const cell = Math.min(34, Math.floor(220 / Math.max(m, n))), pad = 6;
    let s = SVG(n * cell + 2 * pad, m * cell + 2 * pad);
    for (let r = 0; r <= m; r++) s += `<line x1="${pad}" y1="${pad + r * cell}" x2="${pad + n * cell}" y2="${pad + r * cell}" stroke="currentColor" stroke-width="2"/>`;
    for (let c = 0; c <= n; c++) s += `<line x1="${pad + c * cell}" y1="${pad}" x2="${pad + c * cell}" y2="${pad + m * cell}" stroke="currentColor" stroke-width="2"/>`;
    for (const [r, c] of stars) s += `<text x="${pad + (c - 0.5) * cell}" y="${pad + (r - 0.5) * cell}" font-size="${Math.round(cell * 0.62)}" text-anchor="middle" dominant-baseline="central" fill="${RED}">★</text>`;
    return s + '</svg>';
  }

  // CĐ 11, 12, 20 — Đếm hình vuông / hình chữ nhật chứa (các) ngôi sao
  add('geo', function starShapes(g) {
    const b = band(g);
    for (;;) {
      const m = rand(b === 1 ? 2 : 3, b === 3 ? 5 : 4), n = rand(m, b === 3 ? 6 : 5);
      const ns = b === 1 ? 1 : b === 2 ? rand(1, 2) : rand(1, 3);
      const stars = [];
      while (stars.length < ns) { const p = [rand(1, m), rand(1, n)]; if (!stars.some((q) => q[0] === p[0] && q[1] === p[1])) stars.push(p); }
      const squares = b === 1 ? true : R() < 0.5;
      const bySize = {};
      let ans = 0;
      for (let r1 = 1; r1 <= m; r1++) for (let r2 = r1; r2 <= m; r2++) for (let c1 = 1; c1 <= n; c1++) for (let c2 = c1; c2 <= n; c2++) {
        if (squares && r2 - r1 !== c2 - c1) continue;
        if (!stars.every(([r, c]) => r >= r1 && r <= r2 && c >= c1 && c <= c2)) continue;
        ans++;
        const key = `${r2 - r1 + 1}×${c2 - c1 + 1}`;
        bySize[key] = (bySize[key] || 0) + 1;
      }
      if (ans < 2) continue;
      const what = squares ? ['hình vuông', 'squares'] : ['hình chữ nhật (kể cả hình vuông)', 'rectangles (including squares)'];
      const cont = ns === 1 ? ['dấu ★', 'the ★'] : [`cả ${ns} dấu ★`, `all ${ns} stars`];
      const rmin = Math.min(...stars.map((s) => s[0])), rmax = Math.max(...stars.map((s) => s[0]));
      const cmin = Math.min(...stars.map((s) => s[1])), cmax = Math.max(...stars.map((s) => s[1]));
      const exp = squares
        ? `Đếm theo kích thước: ${Object.entries(bySize).map(([k, v]) => `${v} hình ${k}`).join(', ')}. Tổng: <b>${ans}</b>.`
        : `Hình chữ nhật phải chứa ${ns > 1 ? 'vùng nhỏ nhất bao các dấu ★ (từ hàng ' + rmin + ' đến ' + rmax + ', cột ' + cmin + ' đến ' + cmax + ')' : 'ô ★'}. Cạnh trái chọn ${cmin} cách, cạnh phải ${n - cmax + 1} cách, cạnh trên ${rmin} cách, cạnh dưới ${m - rmax + 1} cách: ${cmin} × ${n - cmax + 1} × ${rmin} × ${m - rmax + 1} = <b>${ans}</b>.`;
      return numQ('geo', [
        `Trong hình dưới đây có bao nhiêu ${what[0]} chứa ${cont[0]}?`,
        `How many ${what[1]} in the figure below contain ${cont[1]}?`,
      ], ans, [ans + 1, ans - 1, m * n, ans + m].filter((x) => x !== ans), exp, svgStars(m, n, stars));
    }
  });

  // CĐ 35–36 — Cắt hình vuông / hình chữ nhật thành các hình bằng nhau
  add('geo', function cutShapes(g) {
    const b = band(g);
    if (b === 1 || R() < 0.5) {
      const n = rand(2, b === 1 ? 3 : 6), S = n * rand(2, 9), small = S / n, ans = 4 * small;
      const cell = Math.floor(160 / n);
      let svg = SVG(n * cell + 12, n * cell + 12);
      for (let i = 0; i <= n; i++) {
        svg += `<line x1="6" y1="${6 + i * cell}" x2="${6 + n * cell}" y2="${6 + i * cell}" stroke="currentColor" stroke-width="${i % n ? 1.2 : 2.4}"/>`;
        svg += `<line x1="${6 + i * cell}" y1="6" x2="${6 + i * cell}" y2="${6 + n * cell}" stroke="currentColor" stroke-width="${i % n ? 1.2 : 2.4}"/>`;
      }
      svg += '</svg>';
      return numQ('geo', [
        `Một hình vuông cạnh ${S} cm được cắt thành ${n * n} hình vuông nhỏ bằng nhau (như hình). Tính chu vi mỗi hình vuông nhỏ (cm).`,
        `A square with a side length of ${S} cm is cut into ${n * n} identical small squares (see the figure). What is the perimeter of each small square (in cm)?`,
      ], ans, [4 * S, small, (4 * S) / (n * n) | 0, ans + 4].filter((x) => x > 0 && x !== ans),
      `${n * n} = ${n} × ${n} nên mỗi cạnh hình vuông lớn được chia thành ${n} phần bằng nhau. Cạnh hình nhỏ: ${S} : ${n} = ${small} cm. Chu vi: ${small} × 4 = <b>${ans}</b> cm.`, svg);
    }
    for (;;) {
      const k = pick([2, 3, 4, 6]), L = 12 * rand(1, 3), W = 6 * rand(1, 2);
      if (W >= L) continue;
      const opts = [];
      for (let p = 1; p <= k; p++) if (k % p === 0) { const q = k / p; if (L % p === 0 && W % q === 0) opts.push([p, q, L / p, W / q, 2 * (L / p + W / q)]); }
      const pers = [...new Set(opts.map((o) => o[4]))];
      if (pers.length < 2) continue;
      const max = R() < 0.65, ans = max ? Math.max(...pers) : Math.min(...pers);
      return numQ('geo', [
        `Một hình chữ nhật dài ${L} cm, rộng ${W} cm được cắt thành ${k} hình chữ nhật nhỏ bằng nhau bằng các đường thẳng song song với các cạnh. Chu vi ${max ? 'lớn nhất' : 'nhỏ nhất'} có thể của mỗi hình nhỏ là bao nhiêu cm?`,
        `A rectangle ${L} cm long and ${W} cm wide is cut into ${k} identical small rectangles by lines parallel to its sides. What is the ${max ? 'greatest' : 'least'} possible perimeter of each small rectangle (in cm)?`,
      ], ans, [...pers.filter((x) => x !== ans), 2 * (L + W), ans + 2],
      `Xét các cách cắt (chia chiều dài thành p phần, chiều rộng thành q phần, p × q = ${k}):<br>${opts.map(([p, q, a, c, P]) => `• ${p} × ${q}: mỗi hình ${a} cm × ${c} cm, chu vi ${P} cm`).join('<br>')}<br>Chu vi ${max ? 'lớn nhất' : 'nhỏ nhất'}: <b>${ans}</b> cm.`);
    }
  });

  // CĐ 37–38 — Biện luận chu vi và diện tích hình chữ nhật (cạnh là số tự nhiên)
  add('geo', function rectOptimize(g) {
    const b = band(g);
    if (R() < 0.5) {
      const Hh = rand(b === 3 ? 12 : 6, b === 3 ? 40 : 20), P = 2 * Hh, a = Math.floor(Hh / 2), c = Hh - a, ans = a * c;
      const pairs = [];
      for (let x = 1; x <= a; x++) pairs.push(`${x} × ${Hh - x} = ${x * (Hh - x)}`);
      const show = pairs.length > 5 ? [...pairs.slice(0, 2), '…', ...pairs.slice(-2)] : pairs;
      return numQ('geo', [
        `Một hình chữ nhật (có thể là hình vuông) có chu vi ${P} cm, độ dài các cạnh là số tự nhiên (cm). Diện tích lớn nhất có thể của hình đó là bao nhiêu cm²?`,
        `A rectangle (it may be a square) has a perimeter of ${P} cm, and its side lengths are whole numbers of centimetres. What is its greatest possible area (in cm²)?`,
      ], ans, [(a - 1) * (c + 1), Hh * 2, ans + 1, a * a + 1].filter((x) => x > 0 && x !== ans),
      `Nửa chu vi: dài + rộng = ${P} : 2 = ${Hh} cm. Các cặp cạnh và diện tích: ${show.join('; ')}. Hai cạnh càng gần nhau thì diện tích càng lớn: ${a} × ${c} = <b>${ans}</b> cm².`);
    }
    for (;;) {
      const S = pick([12, 16, 18, 20, 24, 30, 36, 40, 42, 48, 54, 60, 64, 72, 80, 90, 96, 100]);
      const pairs = [];
      for (let x = 1; x * x <= S; x++) if (S % x === 0) pairs.push([x, S / x, 2 * (x + S / x)]);
      if (pairs.length < 3) continue;
      const min = R() < 0.6, ans = min ? Math.min(...pairs.map((p) => p[2])) : Math.max(...pairs.map((p) => p[2]));
      return numQ('geo', [
        `Một hình chữ nhật (có thể là hình vuông) có diện tích ${S} cm², độ dài các cạnh là số tự nhiên (cm). Chu vi ${min ? 'nhỏ nhất' : 'lớn nhất'} có thể của hình đó là bao nhiêu cm?`,
        `A rectangle (it may be a square) has an area of ${S} cm², and its side lengths are whole numbers of centimetres. What is its ${min ? 'least' : 'greatest'} possible perimeter (in cm)?`,
      ], ans, pairs.map((p) => p[2]).filter((x) => x !== ans).concat([ans + 2, S]),
      `Các cặp (dài, rộng) có tích ${S}: ${pairs.map(([x, y, P]) => `${y} × ${x} → chu vi ${P}`).join('; ')}. Chu vi ${min ? 'nhỏ nhất khi hai cạnh gần nhau nhất' : 'lớn nhất khi chiều rộng bằng 1'}: <b>${ans}</b> cm.`);
    }
  });

  // CĐ 39 — Chu vi hình ghép (nhiều bố cục)
  add('geo', function compositePerimeter(g) {
    const b = band(g);
    const kinds = b === 1 ? ['grid', 'poly'] : b === 2 ? ['grid', 'poly', 'strips', 'bigsmall'] : ['grid', 'poly', 'strips', 'bigsmall', 'eight'];
    const kind = pick(kinds);
    const rectSvg = (w, h, inner) => SVG(w + 12, h + 12) + `<rect x="6" y="6" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="2.4"/>` + inner + '</svg>';
    const ln = (x1, y1, x2, y2) => `<line x1="${6 + x1}" y1="${6 + y1}" x2="${6 + x2}" y2="${6 + y2}" stroke="currentColor" stroke-width="1.6"/>`;
    if (kind === 'grid') {
      const r = rand(1, b === 1 ? 2 : 3), c = rand(r + 1, b === 1 ? 4 : 5), s = rand(2, 9), p = 4 * s, P = 2 * (r + c) * s;
      const u = Math.floor(200 / c);
      let inner = '';
      for (let i = 1; i < c; i++) inner += ln(i * u, 0, i * u, r * u);
      for (let j = 1; j < r; j++) inner += ln(0, j * u, c * u, j * u);
      const fig = rectSvg(c * u, r * u, inner);
      if (b === 1 || R() < 0.5) {
        return numQ('geo', [
          `${r * c} hình vuông bằng nhau, mỗi hình có chu vi ${p} cm, được xếp thành hình chữ nhật như hình dưới. Tính chu vi hình chữ nhật đó (cm).`,
          `${r * c} identical squares, each with a perimeter of ${p} cm, are arranged into a rectangle as shown below. What is the perimeter of the rectangle (in cm)?`,
        ], P, [p * r * c, P + 2 * s, (r + c) * s], `Cạnh mỗi hình vuông: ${p} : 4 = ${s} cm. Hình chữ nhật dài ${c} × ${s} = ${c * s} cm, rộng ${r} × ${s} = ${r * s} cm. Chu vi: (${c * s} + ${r * s}) × 2 = <b>${P}</b> cm.<br><i>Lưu ý: không cộng các cạnh nằm bên trong hình.</i>`, fig);
      }
      return numQ('geo', [
        `${r * c} hình vuông bằng nhau được xếp thành hình chữ nhật như hình dưới. Chu vi hình chữ nhật là ${P} cm. Tính chu vi mỗi hình vuông nhỏ (cm).`,
        `${r * c} identical squares are arranged into a rectangle as shown below. The perimeter of the rectangle is ${P} cm. What is the perimeter of each small square (in cm)?`,
      ], p, [s, P / (r * c) | 0, p + 4].filter((x) => x > 0 && x !== p), `Chu vi hình chữ nhật gồm ${2 * (r + c)} cạnh hình vuông nhỏ (${c} + ${r} + ${c} + ${r}). Cạnh nhỏ: ${P} : ${2 * (r + c)} = ${s} cm. Chu vi hình vuông nhỏ: ${s} × 4 = <b>${p}</b> cm.`, fig);
    }
    if (kind === 'poly') {
      // Hình ghép ngẫu nhiên từ n ô vuông bằng nhau
      for (;;) {
        const n = rand(4, b === 1 ? 5 : 7), cells = [[0, 0]];
        const has = (r, c) => cells.some((x) => x[0] === r && x[1] === c);
        while (cells.length < n) {
          const [r, c] = pick(cells), [dr, dc] = pick([[0, 1], [1, 0], [0, -1], [-1, 0]]);
          if (!has(r + dr, c + dc) && Math.abs(r + dr) < 3 && Math.abs(c + dc) < 4) cells.push([r + dr, c + dc]);
        }
        let edges = 0;
        for (const [r, c] of cells) for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) if (!has(r + dr, c + dc)) edges++;
        const minR = Math.min(...cells.map((x) => x[0])), minC = Math.min(...cells.map((x) => x[1]));
        const rows = Math.max(...cells.map((x) => x[0])) - minR + 1, cols = Math.max(...cells.map((x) => x[1])) - minC + 1;
        if (rows === 1 || cols === 1) continue;
        const u = 30, s = rand(2, 9), givenPer = b === 3 || R() < 0.4, p = 4 * s, ans = edges * s;
        let svg = SVG(cols * u + 12, rows * u + 12);
        for (const [r, c] of cells) svg += `<rect x="${6 + (c - minC) * u}" y="${6 + (r - minR) * u}" width="${u}" height="${u}" fill="none" stroke="currentColor" stroke-width="2"/>`;
        svg += '</svg>';
        return numQ('geo', [
          `Hình dưới đây được ghép từ ${n} hình vuông bằng nhau, mỗi hình vuông có ${givenPer ? `chu vi ${p} cm` : `cạnh ${s} cm`}. Tính chu vi của hình ghép (cm).`,
          `The figure below is made of ${n} identical squares. Each square has ${givenPer ? `a perimeter of ${p} cm` : `a side length of ${s} cm`}. What is the perimeter of the whole figure (in cm)?`,
        ], ans, [n * p, (edges + 2) * s, (edges - 2) * s, n * s].filter((x) => x > 0 && x !== ans),
        `${givenPer ? `Cạnh mỗi hình vuông: ${p} : 4 = ${s} cm. ` : ''}Đếm các cạnh nằm trên đường bao ngoài (không tính cạnh chung giữa hai ô): có ${edges} cạnh. Chu vi: ${edges} × ${s} = <b>${ans}</b> cm.<br><i>Lỗi hay gặp: lấy ${n} × ${p} = ${n * p} cm là cộng cả các cạnh nằm bên trong.</i>`, svg);
      }
    }
    if (kind === 'strips') {
      const k = rand(2, 5), t = rand(2, 6), S = k * t, P = 4 * S, ans = 2 * (S + t);
      const u = Math.floor(180 / k);
      let inner = '';
      for (let i = 1; i < k; i++) inner += ln(i * u, 0, i * u, k * u);
      return numQ('geo', [
        `Một hình vuông có chu vi ${P} cm được chia thành ${k} hình chữ nhật bằng nhau như hình dưới. Tính chu vi mỗi hình chữ nhật (cm).`,
        `A square with a perimeter of ${P} cm is divided into ${k} identical rectangles as shown below. What is the perimeter of each rectangle (in cm)?`,
      ], ans, [P / k, 2 * S, ans + 2 * t, 4 * t].filter((x) => x !== ans),
      `Cạnh hình vuông: ${P} : 4 = ${S} cm. Mỗi hình chữ nhật dài ${S} cm, rộng ${S} : ${k} = ${t} cm. Chu vi: (${S} + ${t}) × 2 = <b>${ans}</b> cm.`, rectSvg(k * u, k * u, inner));
    }
    if (kind === 'bigsmall') {
      const s = rand(2, 9), u = 34;
      if (R() < 0.5) {
        // hình vuông lớn cạnh 2s, bên phải là 2 hình vuông nhỏ cạnh s xếp chồng → HCN 3s × 2s
        const inner = ln(2 * u, 0, 2 * u, 2 * u) + ln(2 * u, u, 3 * u, u);
        const fig = rectSvg(3 * u, 2 * u, inner), Pbig = 8 * s, Prect = 10 * s;
        return R() < 0.5
          ? numQ('geo', [
            `Một hình vuông lớn và hai hình vuông nhỏ bằng nhau ghép thành hình chữ nhật như hình dưới. Chu vi hình vuông lớn là ${Pbig} cm. Tính chu vi hình chữ nhật (cm).`,
            `One big square and two identical small squares form a rectangle as shown below. The perimeter of the big square is ${Pbig} cm. What is the perimeter of the rectangle (in cm)?`,
          ], Prect, [Pbig + 8 * s, 12 * s, Pbig + 4 * s].filter((x) => x !== Prect), `Cạnh hình vuông lớn: ${Pbig} : 4 = ${2 * s} cm. Hai hình vuông nhỏ xếp chồng cao bằng cạnh hình vuông lớn nên cạnh nhỏ = ${2 * s} : 2 = ${s} cm. Hình chữ nhật dài ${2 * s} + ${s} = ${3 * s} cm, rộng ${2 * s} cm. Chu vi: (${3 * s} + ${2 * s}) × 2 = <b>${Prect}</b> cm.`, fig)
          : numQ('geo', [
            `Một hình vuông lớn và hai hình vuông nhỏ bằng nhau ghép thành hình chữ nhật như hình dưới. Chu vi hình chữ nhật là ${Prect} cm. Tính chu vi hình vuông lớn (cm).`,
            `One big square and two identical small squares form a rectangle as shown below. The perimeter of the rectangle is ${Prect} cm. What is the perimeter of the big square (in cm)?`,
          ], Pbig, [4 * s, Prect - 4 * s, 6 * s].filter((x) => x !== Pbig), `Gọi cạnh hình vuông nhỏ là 1 phần thì cạnh hình vuông lớn là 2 phần. Hình chữ nhật dài 3 phần, rộng 2 phần, chu vi = (3 + 2) × 2 = 10 phần = ${Prect} cm. Một phần: ${Prect} : 10 = ${s} cm. Cạnh hình vuông lớn: ${2 * s} cm, chu vi: <b>${Pbig}</b> cm.`, fig);
      }
      // hình vuông lớn cạnh 3s ở trên, 3 hình vuông nhỏ cạnh s xếp hàng ở dưới → HCN 3s × 4s
      const inner = ln(0, 3 * u, 3 * u, 3 * u) + ln(u, 3 * u, u, 4 * u) + ln(2 * u, 3 * u, 2 * u, 4 * u);
      const fig = SVG(3 * u + 12, 4 * u + 12) + `<rect x="6" y="6" width="${3 * u}" height="${4 * u}" fill="none" stroke="currentColor" stroke-width="2.4"/>` + inner + '</svg>';
      const p = 4 * s, ans = 14 * s;
      return numQ('geo', [
        `Một hình vuông lớn và ba hình vuông nhỏ bằng nhau ghép thành hình chữ nhật như hình dưới. Mỗi hình vuông nhỏ có chu vi ${p} cm. Tính chu vi hình chữ nhật (cm).`,
        `One big square and three identical small squares form a rectangle as shown below. Each small square has a perimeter of ${p} cm. What is the perimeter of the rectangle (in cm)?`,
      ], ans, [12 * s, 16 * s, 4 * p, ans + 2 * s].filter((x) => x !== ans),
      `Cạnh hình vuông nhỏ: ${p} : 4 = ${s} cm. Ba hình nhỏ xếp hàng dài bằng cạnh hình vuông lớn: ${3 * s} cm. Hình chữ nhật dài ${3 * s} + ${s} = ${4 * s} cm, rộng ${3 * s} cm. Chu vi: (${4 * s} + ${3 * s}) × 2 = <b>${ans}</b> cm.`, fig);
    }
    // 8 hình chữ nhật bằng nhau (dài gấp đôi rộng) xếp thành hình vuông
    const w = rand(2, 9), p = 6 * w, P = 16 * w, u = 24;
    let inner = ln(0, 2 * u, 4 * u, 2 * u);
    for (let i = 1; i < 4; i++) inner += ln(i * u, 0, i * u, 4 * u);
    const fig = rectSvg(4 * u, 4 * u, inner);
    return R() < 0.5
      ? numQ('geo', [
        `Tám hình chữ nhật bằng nhau được xếp thành một hình vuông như hình dưới. Mỗi hình chữ nhật có chu vi ${p} cm. Tính chu vi hình vuông (cm).`,
        `Eight identical rectangles are arranged into a square as shown below. Each rectangle has a perimeter of ${p} cm. What is the perimeter of the square (in cm)?`,
      ], P, [8 * p, 4 * p, 12 * w].filter((x) => x !== P), `Từ hình vẽ: chiều dài mỗi hình chữ nhật gấp đôi chiều rộng (2 hình đứng chồng bằng cạnh hình vuông, 4 hình đứng cạnh nhau cũng bằng cạnh hình vuông). Chu vi hình chữ nhật = (2 + 1) × 2 = 6 lần chiều rộng = ${p} cm → rộng ${w} cm. Cạnh hình vuông = 4 × ${w} = ${4 * w} cm, chu vi <b>${P}</b> cm.`, fig)
      : numQ('geo', [
        `Tám hình chữ nhật bằng nhau được xếp thành một hình vuông như hình dưới. Chu vi hình vuông là ${P} cm. Tính chu vi mỗi hình chữ nhật (cm).`,
        `Eight identical rectangles are arranged into a square as shown below. The perimeter of the square is ${P} cm. What is the perimeter of each rectangle (in cm)?`,
      ], p, [P / 8, P / 2, 4 * w].filter((x) => x !== p), `Cạnh hình vuông: ${P} : 4 = ${4 * w} cm = 4 lần chiều rộng hình chữ nhật → rộng ${w} cm, dài ${2 * w} cm. Chu vi hình chữ nhật: (${2 * w} + ${w}) × 2 = <b>${p}</b> cm.`, fig);
  });

  // CĐ 18, 22 — Đếm hình vuông / hình chữ nhật trong lưới khuyết
  add('geo', function irregularGrid(g) {
    const b = band(g);
    for (;;) {
      const m = rand(b === 1 ? 2 : 3, b === 3 ? 5 : 4), n = rand(m + 1, b === 3 ? 6 : 5);
      const on = Array.from({ length: m }, () => Array(n).fill(true));
      const removeN = rand(1, b === 1 ? 2 : 3);
      for (let k = 0; k < removeN; k++) {
        const edge = [];
        for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (on[r][c] && (r === 0 || c === 0 || r === m - 1 || c === n - 1)) edge.push([r, c]);
        const [r, c] = pick(edge);
        on[r][c] = false;
      }
      // liên thông
      const start = (() => { for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (on[r][c]) return [r, c]; })();
      const seen = new Set([start.join()]), st = [start];
      while (st.length) { const [r, c] = st.pop(); for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const a = r + dr, d = c + dc; if (a >= 0 && d >= 0 && a < m && d < n && on[a][d] && !seen.has(a + ',' + d)) { seen.add(a + ',' + d); st.push([a, d]); } } }
      const total = on.flat().filter(Boolean).length;
      if (seen.size !== total) continue;
      const squares = b === 1 || R() < 0.6;
      const bySize = {};
      let ans = 0;
      for (let r1 = 0; r1 < m; r1++) for (let r2 = r1; r2 < m; r2++) for (let c1 = 0; c1 < n; c1++) for (let c2 = c1; c2 < n; c2++) {
        if (squares && r2 - r1 !== c2 - c1) continue;
        let full = true;
        for (let r = r1; r <= r2 && full; r++) for (let c = c1; c <= c2; c++) if (!on[r][c]) { full = false; break; }
        if (!full) continue;
        ans++;
        const key = `${r2 - r1 + 1}×${c2 - c1 + 1}`;
        bySize[key] = (bySize[key] || 0) + 1;
      }
      if (squares && Object.keys(bySize).length < 2) continue;
      const u = Math.min(32, Math.floor(210 / n));
      let svg = SVG(n * u + 12, m * u + 12);
      for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (on[r][c]) svg += `<rect x="${6 + c * u}" y="${6 + r * u}" width="${u}" height="${u}" fill="none" stroke="currentColor" stroke-width="2"/>`;
      svg += '</svg>';
      const what = squares ? ['hình vuông', 'squares'] : ['hình chữ nhật (kể cả hình vuông)', 'rectangles (including squares)'];
      return numQ('geo', [
        `Hình dưới đây có tất cả bao nhiêu ${what[0]}?`,
        `How many ${what[1]} are there in the figure below?`,
      ], ans, [total, ans + 1, ans - 1, ans + 2].filter((x) => x !== ans),
      `Đếm theo kích thước (chỉ tính các hình nằm trọn trong phần có ô): ${Object.entries(bySize).map(([k, v]) => `${v} hình ${k}`).join(', ')}. Tổng: <b>${ans}</b>.`, svg);
    }
  });

  // CĐ 17 — Đếm đoạn thẳng
  add('geo', function segmentsCount(g) {
    const b = band(g);
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#2e86de"/>`;
    const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="2"/>`;
    const kind = b === 1 ? pick(['line', 'fan']) : pick(b === 2 ? ['line', 'tri', 'fan'] : ['tri', 'fan', 'tri']);
    let ans, svg, exp;
    if (kind === 'line') {
      const n = rand(3, 8);
      ans = C2(n);
      svg = SVG(240, 40) + line(10, 20, 230, 20) + Array.from({ length: n }, (_, i) => dot(10 + (220 * i) / (n - 1), 20)).join('') + '</svg>';
      exp = `Trên một đường thẳng có ${n} điểm. Mỗi đoạn thẳng được tạo bởi 2 trong ${n} điểm: ${n - 1} + ${n - 2} + ... + 1 = ${n} × ${n - 1} : 2 = <b>${ans}</b> đoạn.`;
    } else if (kind === 'tri') {
      const [p, q, r] = [rand(0, 3), rand(1, 3), rand(0, 3)];
      ans = C2(p + 2) + C2(q + 2) + C2(r + 2);
      const A = [120, 10], B = [12, 150], Cc = [228, 150];
      const pts = (P1, P2, k) => Array.from({ length: k }, (_, i) => [P1[0] + ((P2[0] - P1[0]) * (i + 1)) / (k + 1), P1[1] + ((P2[1] - P1[1]) * (i + 1)) / (k + 1)]);
      svg = SVG(240, 162) + line(...A, ...B) + line(...B, ...Cc) + line(...Cc, ...A)
        + [A, B, Cc, ...pts(A, B, p), ...pts(B, Cc, q), ...pts(Cc, A, r)].map(([x, y]) => dot(x, y)).join('') + '</svg>';
      exp = `Mỗi cạnh tam giác là một đường thẳng chứa các điểm: cạnh trái ${p + 2} điểm, cạnh đáy ${q + 2} điểm, cạnh phải ${r + 2} điểm (kể cả các đỉnh). Số đoạn thẳng trên mỗi cạnh: ${C2(p + 2)}, ${C2(q + 2)}, ${C2(r + 2)}. Tổng: <b>${ans}</b> đoạn.`;
    } else {
      const k = rand(3, b === 3 ? 7 : 5);
      ans = k + C2(k);
      const O = [120, 12];
      const base = Array.from({ length: k }, (_, i) => [14 + (212 * i) / (k - 1), 150]);
      svg = SVG(240, 162) + line(14, 150, 226, 150) + base.map(([x, y]) => line(...O, x, y)).join('') + [O, ...base].map(([x, y]) => dot(x, y)).join('') + '</svg>';
      exp = `Có ${k} đoạn thẳng nối điểm trên cùng với ${k} điểm ở đáy. Trên đường đáy có ${k} điểm tạo thành ${k} × ${k - 1} : 2 = ${C2(k)} đoạn. Tổng: ${k} + ${C2(k)} = <b>${ans}</b> đoạn.`;
    }
    return numQ('geo', [`Hình dưới đây có bao nhiêu đoạn thẳng?`, `How many line segments are there in the figure below?`], ans, [ans - 1, ans + 1, ans + 3, ans - 2].filter((x) => x > 0), exp, svg);
  });

  // CĐ 23–24 — Quan sát khối lập phương xếp chồng
  add('geo', function cubeViews(g) {
    const b = band(g);
    const rows = b === 1 ? 2 : rand(2, 3), cols = rand(2, b === 1 ? 3 : 4);
    // hàng sau (r = 0) cao hơn hoặc bằng mọi cột của hàng trước để thấy rõ mọi khối
    const h = [];
    let cap = b === 1 ? 3 : 4;
    for (let r = 0; r < rows; r++) {
      const lo = r === rows - 1 ? (b === 1 ? 1 : 0) : 1;
      const row = Array.from({ length: cols }, () => rand(lo, cap));
      h.push(row);
      cap = Math.max(1, Math.min(...row));
      if (r < rows - 1 && Math.max(...row) < 1) row[0] = 1;
    }
    const total = sum(h.flat());
    const top = h.flat().filter((x) => x > 0).length;
    const front = sum(Array.from({ length: cols }, (_, c) => Math.max(...h.map((row) => row[c]))));
    const right = sum(h.map((row) => Math.max(...row)));
    const kinds = b === 1 ? ['total'] : b === 2 ? ['total', 'top', 'total'] : ['total', 'top', 'front', 'right'];
    const kind = pick(kinds);
    const ans = { total, top, front, right }[kind];
    // Vẽ phép chiếu xiên: hàng sau dời lên trên – sang phải
    const s = 26, dx = 13, dy = 10, maxH = Math.max(...h.flat()), pad = 6;
    const W = cols * s + (rows - 1) * dx + dx + 2 * pad, Hh = maxH * s + (rows - 1) * dy + dy + 2 * pad;
    const base = pad + dy + (rows - 1) * dy + maxH * s;
    let svg = SVG(W, Hh);
    for (let r = 0; r < rows; r++) {
      const k = rows - 1 - r, ox = k * dx, oy = -k * dy;
      for (let c = 0; c < cols; c++) for (let l = 0; l < h[r][c]; l++) {
        const X = pad + c * s + ox, Y = base - l * s + oy;
        const st = 'stroke="#2f5d3a" stroke-width="1.2"';
        svg += `<rect x="${X}" y="${Y - s}" width="${s}" height="${s}" fill="#9ad0a0" ${st}/>`;
        svg += `<polygon points="${X},${Y - s} ${X + dx},${Y - s - dy} ${X + s + dx},${Y - s - dy} ${X + s},${Y - s}" fill="#c8ecc9" ${st}/>`;
        svg += `<polygon points="${X + s},${Y} ${X + s + dx},${Y - dy} ${X + s + dx},${Y - s - dy} ${X + s},${Y - s}" fill="#6fb47a" ${st}/>`;
      }
    }
    svg += '</svg>';
    const ask = {
      total: ['Có tất cả bao nhiêu khối lập phương?', 'How many cubes are there in total?'],
      top: ['Nếu nhìn từ trên xuống thì thấy bao nhiêu hình vuông?', 'How many squares can be seen when looking from the top?'],
      front: ['Nếu nhìn từ phía trước thì thấy bao nhiêu hình vuông?', 'How many squares can be seen when looking from the front?'],
      right: ['Nếu nhìn từ bên phải thì thấy bao nhiêu hình vuông?', 'How many squares can be seen when looking from the right side?'],
    }[kind];
    const table = h.map((row, r) => `${r === 0 ? 'hàng sau' : r === rows - 1 ? 'hàng trước' : 'hàng giữa'}: ${row.join(', ')}`).join('; ');
    const why = {
      total: `Cộng số khối của từng cột: ${h.flat().join(' + ')} = <b>${total}</b>.`,
      top: `Nhìn từ trên xuống, mỗi cột có ít nhất 1 khối cho 1 hình vuông: có <b>${top}</b> cột như vậy.`,
      front: `Nhìn từ phía trước, mỗi cột dọc (từ trái sang phải) cho số hình vuông bằng chồng cao nhất: ${Array.from({ length: cols }, (_, c) => Math.max(...h.map((row) => row[c]))).join(' + ')} = <b>${front}</b>.`,
      right: `Nhìn từ bên phải, mỗi hàng (từ sau ra trước) cho số hình vuông bằng chồng cao nhất của hàng: ${h.map((row) => Math.max(...row)).join(' + ')} = <b>${right}</b>.`,
    }[kind];
    return numQ('geo', [
      `Các khối lập phương giống nhau được xếp chồng lên nhau như hình dưới (mỗi khối ở tầng trên đều có khối đỡ ngay bên dưới). ${ask[0]}`,
      `Identical cubes are stacked as shown below (every cube on an upper layer sits directly on a cube below it). ${ask[1]}`,
    ], ans, [total, top, front, right, ans + 1, ans - 1].filter((x) => x > 0 && x !== ans),
    `Số khối ở từng cột (từ trái sang phải) — ${table}. ${why}`, svg);
  });

  // =====================================================================
  // TỔ HỢP
  // =====================================================================

  // CĐ 33 — Cho nhận: lấy của hai người để ba người bằng nhau
  add('comb', function takeTwo(g) {
    const [X, Y, Z] = shuffle(NAMES);
    const a = rand(2, 12), c = rand(2, 12), askY = R() < 0.6, ans = askY ? 2 * a + c : a + 2 * c;
    const who = askY ? Y : Z;
    return numQ('comb', [
      `Sau khi ${X} lấy của ${Y} ${a} cái kẹo và lấy của ${Z} ${c} cái kẹo thì ba bạn có số kẹo bằng nhau. Hỏi lúc đầu ${who} có nhiều hơn ${X} bao nhiêu cái kẹo?`,
      `After ${X} takes ${pl(a, 'candy', 'candies')} from ${Y} and ${pl(c, 'candy', 'candies')} from ${Z}, the three of them have the same number of candies. How many more candies did ${who} have than ${X} originally?`,
    ], ans, [a + c, askY ? a : c, askY ? a + 2 * c : 2 * a + c, ans + 1].filter((x) => x !== ans),
    `Gọi số kẹo lúc sau của mỗi bạn là S. Lúc đầu: ${X} có S − ${a} − ${c}; ${Y} có S + ${a}; ${Z} có S + ${c}.<br>${who} hơn ${X}: (S + ${askY ? a : c}) − (S − ${a} − ${c}) = <b>${ans}</b> cái.`);
  });

  // CĐ 47–49 — Lập số bằng quy tắc nhân (có lặp / không lặp / điều kiện)
  add('comb', function formNumbersRep(g) {
    const b = band(g);
    for (;;) {
      const k = rand(4, b === 3 ? 6 : 5);
      const ds = shuffle(R() < 0.5 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, k).sort((x, y) => x - y);
      const m = b === 3 && R() < 0.4 ? 4 : 3, rep = R() < 0.5;
      const cond = pick(['none', 'even', 'odd', 'div5', 'gt', 'lt']);
      const all = [];
      (function build(pre) {
        if (pre.length === m) { if (pre[0] !== 0) all.push(+pre.join('')); return; }
        for (const d of ds) if (rep || !pre.includes(d)) build([...pre, d]);
      })([]);
      let N = 0;
      if (cond === 'gt' || cond === 'lt') {
        const lo = 10 ** (m - 1);
        N = pick(ds.filter((d) => d > 0)) * lo + (R() < 0.5 ? 0 : rand(1, lo - 1));
      }
      const ok = (v) => ({ none: true, even: v % 2 === 0, odd: v % 2 === 1, div5: v % 5 === 0, gt: v > N, lt: v < N })[cond];
      const res = all.filter(ok), ans = res.length;
      if (ans < 3) continue;
      const cv = { none: ['', ''], even: ['chẵn ', 'even '], odd: ['lẻ ', 'odd '], div5: ['', ''], gt: ['', ''], lt: ['', ''] }[cond];
      const tailVi = { div5: ' chia hết cho 5', gt: ` lớn hơn ${N}`, lt: ` nhỏ hơn ${N}` }[cond] || '';
      const tailEn = { div5: ' that are divisible by 5', gt: ` greater than ${N}`, lt: ` less than ${N}` }[cond] || '';
      const w = NUM(m);
      // Lời giải: nhóm theo chữ số đầu (gt/lt) hoặc chữ số cuối (chẵn/lẻ/chia hết cho 5)
      let exp;
      if (cond === 'none') {
        const f = [];
        for (let i = 0; i < m; i++) f.push(i === 0 ? ds.filter((d) => d > 0).length - 0 : rep ? k : k - i);
        if (!rep && ds.includes(0)) { f[0] = k - 1; for (let i = 1; i < m; i++) f[i] = k - i; }
        if (!rep && !ds.includes(0)) for (let i = 0; i < m; i++) f[i] = k - i;
        exp = `${rep ? 'Các chữ số được lặp lại.' : 'Các chữ số phải khác nhau.'} Chữ số đầu tiên khác 0: ${f[0]} cách; ${f.slice(1).map((x, i) => `vị trí thứ ${i + 2}: ${x} cách`).join('; ')}. Số các số: ${f.join(' × ')} = <b>${ans}</b>.`;
      } else {
        const byLast = cond === 'gt' || cond === 'lt' ? (v) => String(v)[0] : (v) => String(v)[m - 1];
        const grp = {};
        for (const v of res) grp[byLast(v)] = (grp[byLast(v)] || 0) + 1;
        const label = cond === 'gt' || cond === 'lt' ? 'chữ số đầu' : 'chữ số tận cùng';
        exp = `${rep ? 'Các chữ số được lặp lại.' : 'Các chữ số phải khác nhau.'} Đếm theo ${label}: ${Object.entries(grp).map(([d, c]) => `${label} ${d}: ${c} số`).join('; ')}. Tổng: <b>${ans}</b> số.${(cond === 'gt' || cond === 'lt') && all.includes(N) ? ` (Lưu ý: chính số ${N} không được tính.)` : ''}`;
      }
      const dl = `<b>${ds.join(', ')}</b>`;
      return numQ('comb', [
        `Từ các chữ số ${dl} có thể lập được bao nhiêu số ${cv[0]}có ${w[0]} chữ số${tailVi}, ${rep ? 'các chữ số có thể lặp lại' : 'các chữ số khác nhau'}?`,
        `Using the digits ${dl}, how many ${m}-digit ${cv[1]}numbers${tailEn} can be formed${rep ? ' (digits may be repeated)' : ' with all different digits'}?`,
      ], ans, [all.length, ans + 1, ans - 1, ans + k].filter((x) => x !== ans), exp);
    }
  });
  const NUM = (m) => ({ 2: ['hai', 'two'], 3: ['ba', 'three'], 4: ['bốn', 'four'] })[m];

  // CĐ 40 — Trường hợp xấu nhất: đủ k vật mỗi màu / đủ các màu / k đỏ và j xanh
  add('comb', function worstColors(g) {
    const b = band(g);
    const CL = shuffle([['đỏ', 'red'], ['xanh', 'blue'], ['vàng', 'yellow'], ['trắng', 'white'], ['đen', 'black']]);
    const k = b === 3 ? rand(3, 4) : 3, cols = CL.slice(0, k);
    const kind = b === 1 ? 'all' : pick(['each', 'all', 'two']);
    const t = kind === 'all' ? 1 : rand(2, 4);
    const cnt = cols.map(() => rand(t + 1, b === 1 ? 8 : 15));
    const total = sum(cnt), list = cols.map((c, i) => [`${cnt[i]} viên bi ${c[0]}`, `${cnt[i]} ${c[1]} marbles`]);
    const listVi = list.map((x) => x[0]).join(', '), listEn = list.map((x) => x[1]).join(', ');
    if (kind === 'two') {
      const t2 = rand(2, 4), [c1, c2] = [0, 1];
      const w1 = total - cnt[c1] + t - 1, w2 = total - cnt[c2] + t2 - 1, ans = Math.max(w1, w2) + 1;
      return numQ('comb', [
        `Trong túi có ${listVi}. Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có ít nhất ${t} viên bi ${cols[c1][0]} và ${t2} viên bi ${cols[c2][0]}?`,
        `A bag contains ${listEn}. Without looking, what is the least number of marbles you must take out to be sure of getting at least ${t} ${cols[c1][1]} and ${t2} ${cols[c2][1]} marbles?`,
      ], ans, [t + t2, w1 + 1 === ans ? w2 + 1 : w1 + 1, total, ans - 1].filter((x) => x > 0 && x !== ans),
      `Trường hợp xấu nhất 1: lấy hết các bi không phải màu ${cols[c1][0]} (${total - cnt[c1]} viên) và ${t - 1} viên ${cols[c1][0]} → ${w1} viên mà chưa đủ ${t} viên ${cols[c1][0]}.<br>Trường hợp xấu nhất 2: lấy hết các bi không phải màu ${cols[c2][0]} (${total - cnt[c2]} viên) và ${t2 - 1} viên ${cols[c2][0]} → ${w2} viên.<br>Lấy nhiều hơn trường hợp xấu nhất 1 viên: ${Math.max(w1, w2)} + 1 = <b>${ans}</b>.`);
    }
    const mn = Math.min(...cnt), ans = total - mn + t;
    const minCol = cols[cnt.indexOf(mn)][0];
    return numQ('comb', [
      kind === 'all'
        ? `Trong túi có ${listVi}. Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có đủ cả ${k} màu?`
        : `Trong túi có ${listVi}. Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn mỗi màu có ít nhất ${t} viên?`,
      kind === 'all'
        ? `A bag contains ${listEn}. Without looking, what is the least number of marbles you must take out to be sure of getting all ${k} colours?`
        : `A bag contains ${listEn}. Without looking, what is the least number of marbles you must take out to be sure of getting at least ${t} marbles of each colour?`,
    ], ans, [k * t, total, ans - 1, total - Math.max(...cnt) + t].filter((x) => x > 0 && x !== ans),
    `Trường hợp xấu nhất: lấy hết các màu nhiều bi trước, màu ít bi nhất (${minCol}, ${mn} viên) chỉ được ${t - 1} viên: ${total - mn} + ${t - 1} = ${total - mn + t - 1} viên mà vẫn chưa đạt. Lấy thêm 1 viên nữa là chắc chắn: <b>${ans}</b>.`);
  });

  // CĐ 41 — Trường hợp xấu nhất: hai số có tổng S
  add('comb', function worstSum(g) {
    const b = band(g);
    const a = rand(1, b === 3 ? 20 : 5), bb = a + rand(b === 1 ? 8 : 12, b === 3 ? 60 : 25);
    const S = rand(2 * a + 3, 2 * bb - 3);
    const pairs = [], single = [];
    for (let x = a; x <= bb; x++) {
      const y = S - x;
      if (y >= a && y <= bb && y !== x) { if (x < y) pairs.push([x, y]); } else single.push(x);
    }
    if (!pairs.length) return worstSum(g);
    const ans = single.length + pairs.length + 1;
    const showP = pairs.length > 4 ? `(${pairs[0].join(', ')}), (${pairs[1].join(', ')}), …, (${pairs[pairs.length - 1].join(', ')})` : pairs.map((p) => `(${p.join(', ')})`).join(', ');
    return numQ('comb', [
      `Cho các số tự nhiên từ ${a} đến ${bb}. Phải chọn ra ít nhất bao nhiêu số để chắc chắn trong các số đã chọn có hai số có tổng bằng ${S}?`,
      `From the whole numbers ${a} to ${bb}, what is the least number of numbers you must choose to be sure that two of the chosen numbers add up to ${S}?`,
    ], ans, [pairs.length + 1, ans - 1, ans + 1, bb - a + 1].filter((x) => x > 0 && x !== ans),
    `Ghép các số có tổng ${S} thành cặp: ${showP} — có ${pairs.length} cặp. Còn ${single.length} số không ghép được cặp.<br>Trường hợp xấu nhất: chọn hết ${single.length} số không ghép cặp và mỗi cặp 1 số: ${single.length} + ${pairs.length} = ${single.length + pairs.length} số mà chưa có hai số nào tổng ${S}. Chọn thêm 1 số nữa là chắc chắn: <b>${ans}</b>.`);
  });

  // CĐ 42 — Trường hợp xấu nhất: hai số có hiệu d
  add('comb', function worstDiff(g) {
    const b = band(g);
    const a = 1, bb = rand(b === 3 ? 20 : 12, b === 3 ? 80 : 30), d = rand(2, Math.max(3, Math.floor(bb / 3)));
    const chains = [];
    for (let r = a; r < a + d; r++) { let L = 0; for (let x = r; x <= bb; x += d) L++; chains.push(L); }
    const maxPick = sum(chains.map((L) => Math.ceil(L / 2))), ans = maxPick + 1;
    return numQ('comb', [
      `Cho các số tự nhiên từ ${a} đến ${bb}. Phải chọn ra ít nhất bao nhiêu số để chắc chắn trong các số đã chọn có hai số hơn kém nhau ${d} đơn vị?`,
      `From the whole numbers ${a} to ${bb}, what is the least number of numbers you must choose to be sure that two of the chosen numbers differ by ${d}?`,
    ], ans, [Math.ceil(bb / 2) + 1, ans - 1, ans + 1, bb - d + 1].filter((x) => x > 0 && x !== ans),
    `Chia các số thành ${d} dãy, mỗi dãy gồm các số cách nhau ${d} (cùng số dư khi chia cho ${d}). Độ dài các dãy: ${chains.join(', ')}.<br>Trong một dãy dài L số, chọn xen kẽ được nhiều nhất ⌈L : 2⌉ số mà không có hai số hơn kém nhau ${d}: ${chains.map((L) => Math.ceil(L / 2)).join(' + ')} = ${maxPick} số.<br>Chọn thêm 1 số là chắc chắn: <b>${ans}</b>.`);
  });

  // CĐ 43 — Trường hợp xấu nhất: tích chia hết cho m (m = 2, 4, 9, 25)
  add('comb', function worstProduct(g) {
    const b = band(g);
    const m = b < 3 ? 2 : pick([2, 4, 9, 25]), p = { 2: 2, 4: 2, 9: 3, 25: 5 }[m];
    const a = rand(1, 20), bb = a + rand(10, m === 25 ? 60 : 35);
    const nums = Array.from({ length: bb - a + 1 }, (_, i) => a + i);
    let ans, exp;
    if (m === 2) {
      const odd = nums.filter((x) => x % 2).length;
      // Với m = 2: bất kỳ số chẵn nào ghép với số khác đều cho tích chẵn → tập không có cặp: chỉ toàn số lẻ, hoặc 1 số chẵn đứng một mình
      ans = odd + 1;
      exp = `Tích hai số chia hết cho 2 khi có ít nhất một số chẵn. Có ${odd} số lẻ trong dãy.<br>Trường hợp xấu nhất: chọn hết ${odd} số lẻ — tích hai số lẻ bất kỳ đều lẻ. Chọn thêm 1 số nữa (chắc chắn là số chẵn) thì tích của nó với một số đã chọn chia hết cho 2: <b>${ans}</b>.`;
    } else {
      const A = nums.filter((x) => x % p).length, B = nums.filter((x) => x % p === 0 && x % m).length, Cc = nums.length - A - B;
      const maxSet = Math.max(A + Math.min(1, B), 1);
      ans = maxSet + 1;
      exp = `Chia các số thành 3 nhóm: không chia hết cho ${p} (${A} số), chia hết cho ${p} nhưng không chia hết cho ${m} (${B} số), chia hết cho ${m} (${Cc} số).<br>Tích chia hết cho ${m} khi: có một số chia hết cho ${m}, hoặc cả hai số đều chia hết cho ${p}. Trường hợp xấu nhất: chọn hết ${A} số nhóm 1 và ${Math.min(1, B)} số nhóm 2 = ${maxSet} số. Chọn thêm 1 số là chắc chắn: <b>${ans}</b>.`;
    }
    return numQ('comb', [
      `Cho các số tự nhiên từ ${a} đến ${bb}. Phải chọn ra ít nhất bao nhiêu số để chắc chắn trong các số đã chọn có hai số có tích chia hết cho ${m}?`,
      `From the whole numbers ${a} to ${bb}, what is the least number of numbers you must choose to be sure that the product of two of the chosen numbers is divisible by ${m}?`,
    ], ans, [ans - 1, ans + 1, Math.ceil(nums.length / 2), nums.length].filter((x) => x > 0 && x !== ans), exp);
  });

  // CĐ 14 — Đếm đường đi có điều kiện (tránh / phải qua một điểm)
  add('comb', function gridPathsBlocked(g) {
    const b = band(g);
    const m = rand(2, b === 3 ? 4 : 3), n = rand(3, b === 3 ? 5 : 4);
    const px = rand(1, n - 1), py = rand(1, m - 1);
    const via = R() < 0.5;
    const total = binom(m + n, m), through = binom(px + py, px) * binom(n - px + m - py, n - px);
    const ans = via ? through : total - through;
    const cell = Math.min(36, Math.floor(200 / n)), pad = 18;
    let svg = SVG(n * cell + 2 * pad, m * cell + 2 * pad);
    for (let r = 0; r <= m; r++) svg += `<line x1="${pad}" y1="${pad + r * cell}" x2="${pad + n * cell}" y2="${pad + r * cell}" stroke="currentColor" stroke-width="2"/>`;
    for (let c = 0; c <= n; c++) svg += `<line x1="${pad + c * cell}" y1="${pad}" x2="${pad + c * cell}" y2="${pad + m * cell}" stroke="currentColor" stroke-width="2"/>`;
    svg += `<circle cx="${pad}" cy="${pad + m * cell}" r="5" fill="${RED}"/><text x="${pad - 14}" y="${pad + m * cell + 14}" font-size="14" fill="currentColor">A</text>`;
    svg += `<circle cx="${pad + n * cell}" cy="${pad}" r="5" fill="#2e86de"/><text x="${pad + n * cell + 4}" y="${pad - 4}" font-size="14" fill="currentColor">B</text>`;
    const X = pad + px * cell, Y = pad + (m - py) * cell;
    svg += via
      ? `<circle cx="${X}" cy="${Y}" r="6" fill="#f5a524"/><text x="${X + 6}" y="${Y - 6}" font-size="14" fill="currentColor">M</text>`
      : `<text x="${X}" y="${Y}" font-size="20" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="${RED}">✕</text>`;
    svg += '</svg>';
    const toP = binom(px + py, px), fromP = binom(n - px + m - py, n - px);
    return numQ('comb', [
      `Đi từ A đến B theo các đường kẻ của lưới, mỗi bước chỉ sang phải hoặc lên trên, ${via ? 'và phải đi qua điểm M' : 'và không được đi qua điểm ✕'}. Có bao nhiêu đường đi khác nhau?`,
      `Moving only right or up along the grid lines, how many different paths are there from A to B that ${via ? 'pass through point M' : 'do not pass through the point marked ✕'}?`,
    ], ans, [total, through, total - through, ans + 1].filter((x) => x > 0 && x !== ans),
    `Ghi số cách đi tới từng giao điểm (cộng số ở điểm bên trái và điểm bên dưới). Số đường từ A đến ${via ? 'M' : 'điểm ✕'}: ${toP}; từ đó đến B: ${fromP}. ${via ? `Đường phải qua M: ${toP} × ${fromP} = <b>${ans}</b>.` : `Tổng số đường từ A đến B: ${total}; số đường đi qua điểm ✕: ${toP} × ${fromP} = ${through}. Số đường không qua ✕: ${total} − ${through} = <b>${ans}</b>.`}`, svg);
  });
})(typeof window !== 'undefined' ? window : globalThis);
