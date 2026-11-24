/* Ứng dụng Luyện Toán TIMO — giao diện một trang, không cần máy chủ.
 *
 * Cấu trúc:
 *   Popup chọn lớp (lần đầu mở app, hoặc khi đổi lớp)
 *   🗺️ Lộ trình  — chuyên đề theo 5 chủ đề, mở khóa dần; mỗi chuyên đề: phương pháp → ví dụ → luyện 5 câu
 *   🔁 Ôn tập    — ôn câu sai, luyện tổng hợp, ôn theo chủ đề
 *   📝 Thi       — 10 bộ đề cố định mỗi lớp + đề ngẫu nhiên (25 câu, 60 phút)
 *   📖 Từ vựng   — từ vựng Toán tiếng Anh + đố từ
 *   👤 Tôi       — hồ sơ, kết quả, lịch sử thi, giới thiệu TIMO
 */
(function () {
  'use strict';
  const { TOPICS, generateFrom, generateExam } = window.TimoGen;
  const { VOCAB, VOCAB_GROUPS, glossFor } = window.TimoVocab;
  const { lessonsFor, allowedFor } = window.TimoCurriculum;
  const $app = document.getElementById('app');
  const $lang = document.getElementById('lang');
  const $gradeBtn = document.getElementById('grade-btn');

  const LESSON_LEN = 5;      // số câu luyện mỗi chuyên đề
  const PASS = 3;            // đúng từ 3/5 câu thì qua chuyên đề
  const MIX_LEN = 10;        // số câu một lượt ôn tập
  const EXAM_MINUTES = 60;
  const POINTS = 4;
  const EXAM_SETS = 10;      // số bộ đề cố định mỗi lớp
  const WRONG_MAX = 60;      // số câu sai lưu lại để ôn
  const LETTERS = ['A', 'B', 'C', 'D'];
  const topicById = (id) => TOPICS.find((t) => t.id === id);

  // ---------- Lưu trữ (an toàn khi trình duyệt chặn localStorage) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('timo:' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, val) { try { localStorage.setItem('timo:' + key, JSON.stringify(val)); } catch (e) { /* bỏ qua */ } },
  };
  /** Dữ liệu riêng cho từng lớp (tiến độ lộ trình, bộ đề, câu sai). */
  const gget = (key, fallback) => (store.get(key, {})[grade] ?? fallback);
  function gset(key, val) { const all = store.get(key, {}); all[grade] = val; store.set(key, all); }

  let grade = store.get('grade', 3);

  // ---------- Ngôn ngữ đề ----------
  // 'vi' | 'bi' (song ngữ) | 'gloss' (tiếng Anh + chú thích từ khó) | 'en'.
  // Câu hỏi luôn được vẽ đủ cả hai bản; CSS ẩn/hiện theo body[data-lang] nên đổi giữa chừng không mất bài.
  const LANGS = [['vi', 'Tiếng Việt'], ['bi', 'Song ngữ'], ['gloss', 'Anh + chú thích'], ['en', 'English']];
  // Mặc định: tiếng Anh + chú thích từ khó (giống cách trình bày của tài liệu ôn thi).
  // Chuyển một lần cho người dùng cũ đang để mặc định cũ.
  if (!store.get('langV2', false)) { store.set('lang', 'gloss'); store.set('langV2', true); }
  let lang = store.get('lang', 'gloss');
  function setLang(v) {
    lang = LANGS.some((l) => l[0] === v) ? v : 'gloss';
    $lang.value = lang;
    document.body.dataset.lang = lang;
    store.set('lang', lang);
  }
  setLang(lang);
  $lang.addEventListener('change', () => setLang($lang.value));

  const dual = (vi, en) => (en && en !== vi ? `<span class="l-en">${en}</span><span class="l-vi">${vi}</span>` : vi);
  const optLabel = (q, o) => dual(o, q.optLabels && q.optLabels[o]);
  function glossLine(q) {
    const g = glossFor(q.textEn);
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    return g.length ? `<div class="gloss">${g.map((w) => `${cap(w.en)}: ${cap(w.vi)}`).join('; ')}.</div>` : '';
  }
  /** Đề bài; num (nếu có) hiện thành nhãn "Bài N." ở đầu câu trong chế độ Anh + chú thích. */
  const qText = (q, num) => `<div class="q-text q-dual"><div class="l-en">${num ? `<b class="q-label">Bài ${num}.</b> ` : ''}${q.textEn}</div>${glossLine(q)}<div class="l-vi">${q.text}</div></div>`;
  const starStr = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

  // ---------- Kết quả & câu sai ----------
  function recordAnswer(q, correct) {
    const s = store.get('stats', {});
    const key = `${grade}:${q.topic}`;
    s[key] = s[key] || { right: 0, total: 0 };
    s[key].total++;
    if (correct) s[key].right++;
    store.set('stats', s);
    const wrong = gget('wrong', []).filter((w) => w.text !== q.text);
    if (!correct) wrong.unshift(q);
    gset('wrong', wrong.slice(0, WRONG_MAX));
  }

  // ---------- Hộp thoại trong trang ----------
  function ask(msg, okText = 'Đồng ý', cancelText = 'Hủy') {
    return new Promise((resolve) => {
      const back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><p>${msg}</p>
        <div class="modal-actions"><button class="btn" data-a="0">${cancelText}</button><button class="btn primary" data-a="1">${okText}</button></div></div>`;
      document.body.appendChild(back);
      back.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b && e.target !== back) return;
        back.remove();
        resolve(!!b && b.dataset.a === '1');
      });
      back.querySelector('[data-a="1"]').focus();
    });
  }

  /** Popup chọn lớp: bắt buộc ở lần mở đầu tiên, dùng lại khi đổi lớp. */
  function gradePopup(first) {
    return new Promise((resolve) => {
      let sel = first ? null : grade;
      let lsel = lang;
      const back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML = `
        <div class="modal onboard" role="dialog" aria-modal="true" aria-labelledby="ob-title">
          <h2 id="ob-title">${first ? 'Chào mừng em đến với Luyện Toán TIMO! 👋' : 'Đổi lớp'}</h2>
          <p>Em đang học <b>lớp mấy</b>? Lộ trình, bài luyện và đề thi sẽ được chọn theo đúng lớp của em.</p>
          <div class="grade-grid">${[1, 2, 3, 4, 5, 6].map((g) => `
            <button class="grade-opt${g === sel ? ' selected' : ''}" data-g="${g}"><b>${g}</b><span>Lớp ${g}</span></button>`).join('')}
          </div>
          ${first ? `<p class="ob-label">Hiển thị đề bài:</p>
          <div class="seg">${LANGS.map(([v, n]) => `<button class="seg-opt${v === lsel ? ' selected' : ''}" data-l="${v}">${n}</button>`).join('')}</div>` : ''}
          <p class="ob-sum" id="ob-sum"></p>
          <div class="modal-actions">
            ${first ? '' : '<button class="btn" data-a="0">Hủy</button>'}
            <button class="btn primary" id="ob-ok" disabled>Xác nhận</button>
          </div>
        </div>`;
      document.body.appendChild(back);
      const $ok = back.querySelector('#ob-ok'), $sum = back.querySelector('#ob-sum');
      function refresh() {
        back.querySelectorAll('.grade-opt').forEach((b) => b.classList.toggle('selected', +b.dataset.g === sel));
        back.querySelectorAll('.seg-opt').forEach((b) => b.classList.toggle('selected', b.dataset.l === lsel));
        $ok.disabled = !sel;
        if (sel) {
          const n = lessonsFor(sel).length;
          $sum.innerHTML = `Lớp ${sel}: <b>${n} chuyên đề</b> theo 5 chủ đề · <b>${EXAM_SETS} bộ đề</b> thi thử · đề ngẫu nhiên không giới hạn.`
            + (!first && sel !== grade ? '<br>Tiến độ của lớp cũ vẫn được giữ lại.' : '');
          $ok.textContent = `Xác nhận lớp ${sel}`;
        } else $sum.textContent = 'Chọn lớp để xem lộ trình.';
      }
      back.addEventListener('click', (e) => {
        const g = e.target.closest('[data-g]'), l = e.target.closest('[data-l]'), a = e.target.closest('[data-a]');
        if (g) { sel = +g.dataset.g; refresh(); }
        else if (l) { lsel = l.dataset.l; refresh(); }
        else if (a || (!first && e.target === back)) { back.remove(); resolve(false); }
      });
      $ok.addEventListener('click', () => {
        grade = sel;
        store.set('grade', grade);
        store.set('onboarded', true);
        if (first) setLang(lsel);
        updateGradeBtn();
        back.remove();
        resolve(true);
      });
      refresh();
    });
  }
  function updateGradeBtn() { $gradeBtn.innerHTML = `Lớp ${grade} <span aria-hidden="true">▾</span>`; }
  updateGradeBtn();

  // ---------- Điều hướng ----------
  let timer = null;
  let exam = null;
  const TAB_OF = { lesson: 'path', 'exam-intro': 'exams', exam: 'exams', result: 'exams', about: 'me' };

  function go(screen, arg) {
    if (screen !== 'exam' && timer) { clearInterval(timer); timer = null; }
    const tab = TAB_OF[screen] || screen;
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.go === tab));
    window.scrollTo(0, 0);
    const screens = { path, lesson, review, exams, 'exam-intro': examIntro, exam: examScreen, result, vocab, me, about };
    (screens[screen] || path)(arg);
  }
  async function leaveExamOk() {
    if (!exam || exam.done) return true;
    if (!(await ask('Em đang làm bài thi. Thoát ra sẽ mất bài làm. Em chắc chứ?', 'Thoát', 'Làm tiếp'))) return false;
    exam = null;
    return true;
  }
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-go]');
    if (!el || el.disabled) return;
    if (!(await leaveExamOk())) return;
    go(el.dataset.go, el.dataset.arg);
  });
  $gradeBtn.addEventListener('click', async () => {
    if (!(await leaveExamOk())) return;
    if (await gradePopup(false)) go('path');
  });

  // ---------- Bộ chạy câu hỏi dùng chung (chuyên đề, ôn tập) ----------
  function questionCard(q, num, selected) {
    const t = topicById(q.topic);
    return `
      <article class="card question">
        <div class="q-head"><span class="chip chip-${q.topic}">${t.icon} ${dual(t.name, t.en)}</span><span class="q-num">${dual(`Câu ${num}`, `Question ${num}`)}</span></div>
        ${qText(q, num)}
        ${q.svg ? `<div class="q-fig">${q.svg}</div>` : ''}
        <div class="opts">
          ${q.options.map((o, k) => `<button class="opt${selected === o ? ' selected' : ''}" data-val="${o}"><span class="letter">${LETTERS[k]}</span><span class="opt-label">${optLabel(q, o)}</span></button>`).join('')}
        </div>
      </article>`;
  }

  /** Chạy một lượt câu hỏi, chấm ngay từng câu, gọi onDone(số câu đúng) khi xong. */
  function runQuiz({ title, qs, onDone }) {
    let i = 0, right = 0;
    function render() {
      if (i >= qs.length) return onDone(right, qs.length);
      const q = qs[i];
      $app.innerHTML = `
        <div class="bar"><span>${title} · Lớp ${grade}</span><span>Câu ${i + 1}/${qs.length} · Đúng ${right}</span></div>
        <div class="progress"><div style="width:${(100 * i) / qs.length}%"></div></div>
        ${questionCard(q, i + 1)}
        <div id="feedback"></div>`;
      $app.querySelectorAll('.opt').forEach((btn) => btn.addEventListener('click', () => check(btn.dataset.val)));
    }
    function check(val) {
      const q = qs[i];
      const ok = val === q.answer;
      if (ok) right++;
      recordAnswer(q, ok);
      $app.querySelectorAll('.opt').forEach((b) => {
        b.disabled = true;
        if (b.dataset.val === q.answer) b.classList.add('correct');
        else if (b.dataset.val === val) b.classList.add('wrong');
      });
      document.getElementById('feedback').innerHTML = `
        <div class="feedback ${ok ? 'ok' : 'no'}">
          <h3>${ok ? '🎉 Chính xác!' : `😅 Chưa đúng. Đáp án là <b>${optLabel(q, q.answer)}</b>`}</h3>
          <div class="explain"><b>Lời giải:</b> ${q.explain}</div>
          <button class="btn primary" id="next">${i + 1 < qs.length ? 'Câu tiếp theo →' : 'Xem kết quả'}</button>
        </div>`;
      const next = document.getElementById('next');
      next.focus();
      next.addEventListener('click', () => { i++; render(); });
    }
    render();
  }

  function summaryCard(right, total, extra, actions) {
    const pct = Math.round((100 * right) / total);
    return `
      <section class="card center">
        <div class="big">${pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'}</div>
        <h2>Em làm đúng ${right}/${total} câu</h2>
        ${extra || ''}
        <div class="hero-actions">${actions}</div>
      </section>`;
  }

  // ---------- 🗺️ Lộ trình ----------
  /** Trạng thái các chuyên đề của lớp hiện tại: mở khóa lần lượt trong từng chủ đề. */
  function pathState() {
    const prog = gget('lessons', {});
    const list = lessonsFor(grade).map((l) => ({ ...l, stars: (prog[l.id] && prog[l.id].stars) || 0 }));
    const byTopic = {};
    for (const l of list) {
      const arr = (byTopic[l.topic] = byTopic[l.topic] || []);
      l.unlocked = arr.length === 0 || arr[arr.length - 1].stars > 0;
      l.index = arr.length;
      arr.push(l);
    }
    // Chuyên đề nên học tiếp: lần lượt theo vòng các chủ đề, ưu tiên chuyên đề đứng trước.
    let next = null;
    for (let k = 0; !next && k < 12; k++) {
      for (const t of TOPICS) {
        const l = (byTopic[t.id] || [])[k];
        if (l && l.unlocked && !l.stars) { next = l; break; }
      }
    }
    return { list, byTopic, next };
  }

  function path() {
    const { list, byTopic, next } = pathState();
    const done = list.filter((l) => l.stars > 0).length;
    const stars = list.reduce((a, l) => a + l.stars, 0);
    $app.innerHTML = `
      <section class="hero">
        <h1>Lộ trình TIMO lớp ${grade}</h1>
        <p>${list.length} chuyên đề theo 5 chủ đề. Mỗi chuyên đề: đọc phương pháp → xem ví dụ → luyện ${LESSON_LEN} câu. Đúng từ ${PASS}/${LESSON_LEN} câu để mở chuyên đề tiếp theo.</p>
        <div class="hero-progress">
          <div class="hp-bar"><div style="width:${(100 * done) / list.length}%"></div></div>
          <span>${done}/${list.length} chuyên đề · ★ ${stars}/${list.length * 3}</span>
        </div>
        <div class="hero-actions">
          ${next ? `<button class="btn primary" data-go="lesson" data-arg="${next.id}">▶ Học tiếp: ${next.title(grade)}</button>`
                 : '<button class="btn primary" data-go="exams">🎉 Đã xong lộ trình — Thi thử ngay</button>'}
        </div>
      </section>
      ${TOPICS.map((t) => {
        const ls = byTopic[t.id] || [];
        const d = ls.filter((l) => l.stars > 0).length;
        return `
        <section class="card unit unit-${t.id}">
          <header class="unit-head"><span class="u-icon">${t.icon}</span><span class="u-name">${t.name}<small>${t.en}</small></span><span class="u-count">${d}/${ls.length}</span></header>
          <div class="lessons">
            ${ls.map((l) => `
              <button class="lesson-row${l.stars ? ' done' : ''}${l.unlocked ? '' : ' locked'}" data-go="lesson" data-arg="${l.id}" ${l.unlocked ? '' : 'disabled aria-disabled="true"'}>
                <span class="l-idx">${l.unlocked ? l.index + 1 : '🔒'}</span>
                <span class="l-title">${l.title(grade)}</span>
                <span class="l-stars" aria-label="${l.stars} sao">${l.unlocked ? starStr(l.stars) : ''}</span>
              </button>`).join('')}
          </div>
        </section>`;
      }).join('')}`;
  }

  function lesson(id) {
    const { list, byTopic } = pathState();
    const l = list.find((x) => x.id === id);
    if (!l || !l.unlocked) return path();
    const t = topicById(l.topic);
    const [ex] = generateFrom([l.gen], grade, 1);
    $app.innerHTML = `
      <div class="bar"><button class="btn small back" data-go="path">← Lộ trình</button><span>${starStr(l.stars)}</span></div>
      <section class="card">
        <span class="chip chip-${l.topic}">${t.icon} ${t.name} · Chuyên đề ${l.index + 1}</span>
        <h2 class="lesson-title">${l.title(grade)}</h2>
        <div class="tip"><b>💡 Phương pháp</b><p>${l.tip}</p></div>
      </section>
      <section class="card">
        <h3>Ví dụ mẫu</h3>
        ${qText(ex)}
        ${ex.svg ? `<div class="q-fig">${ex.svg}</div>` : ''}
        <details class="solution"><summary>Xem đáp án và lời giải</summary>
          <p><b>Đáp án: ${optLabel(ex, ex.answer)}</b></p>
          <div class="explain">${ex.explain}</div>
        </details>
      </section>
      <button class="btn primary wide" id="start">Luyện tập ${LESSON_LEN} câu →</button>`;
    document.getElementById('start').addEventListener('click', () => {
      runQuiz({
        title: l.title(grade),
        qs: generateFrom([l.gen], grade, LESSON_LEN),
        onDone(right) {
          const stars = right >= 5 ? 3 : right >= 4 ? 2 : right >= PASS ? 1 : 0;
          const prog = gget('lessons', {});
          const old = prog[l.id] || { stars: 0, tries: 0 };
          prog[l.id] = { stars: Math.max(old.stars, stars), tries: old.tries + 1 };
          gset('lessons', prog);
          const after = pathState();
          const nextInTopic = (after.byTopic[l.topic] || [])[l.index + 1];
          const extra = stars
            ? `<p class="stars-big">${starStr(stars)}</p><p>${stars === 3 ? 'Tuyệt vời, em làm đúng hết!' : 'Em đã qua chuyên đề này. Làm lại để được 3 sao nhé!'}</p>`
            : `<p>Em cần đúng ít nhất ${PASS}/${LESSON_LEN} câu để qua chuyên đề. Đọc lại phương pháp rồi thử lại nhé!</p>`;
          const actions = stars
            ? `${nextInTopic ? `<button class="btn primary" data-go="lesson" data-arg="${nextInTopic.id}">Chuyên đề tiếp: ${nextInTopic.title(grade)} →</button>`
                             : after.next ? `<button class="btn primary" data-go="lesson" data-arg="${after.next.id}">Học tiếp: ${after.next.title(grade)} →</button>` : ''}
               <button class="btn" data-go="lesson" data-arg="${l.id}">Làm lại</button><button class="btn" data-go="path">Về lộ trình</button>`
            : `<button class="btn primary" data-go="lesson" data-arg="${l.id}">Thử lại</button><button class="btn" data-go="path">Về lộ trình</button>`;
          $app.innerHTML = summaryCard(right, LESSON_LEN, extra, actions);
        },
      });
    });
  }

  // ---------- 🔁 Ôn tập ----------
  function review() {
    const wrong = gget('wrong', []);
    const { list } = pathState();
    const learned = list.filter((l) => l.stars > 0);
    const s = store.get('stats', {});
    $app.innerHTML = `
      <h2 class="section-title">🔁 Ôn tập — Lớp ${grade}</h2>
      <section class="card review-card">
        <div><h3>❌ Ôn câu đã làm sai</h3>
        <p>${wrong.length ? `Em có <b>${wrong.length}</b> câu đã làm sai. Làm đúng câu nào thì câu đó được xóa khỏi danh sách.` : 'Chưa có câu sai nào. Giỏi lắm!'}</p></div>
        <button class="btn primary" id="r-wrong" ${wrong.length ? '' : 'disabled'}>Ôn ${Math.min(MIX_LEN, wrong.length) || ''} câu sai</button>
      </section>
      <section class="card review-card">
        <div><h3>🎯 Luyện tổng hợp</h3>
        <p>${MIX_LEN} câu trộn từ ${learned.length ? `<b>${learned.length}</b> chuyên đề em đã học` : 'tất cả chuyên đề của lớp'}.</p></div>
        <button class="btn primary" id="r-mix">Bắt đầu</button>
      </section>
      <section class="card">
        <h3>📚 Ôn theo chủ đề</h3>
        <p class="hint">${MIX_LEN} câu trộn các dạng trong chủ đề.</p>
        <div class="topics">
          ${TOPICS.map((t) => {
            const st = s[`${grade}:${t.id}`];
            const pct = st && st.total ? Math.round((100 * st.right) / st.total) : null;
            return `<button class="topic topic-${t.id}" data-t="${t.id}">
              <span class="t-icon">${t.icon}</span><span class="t-name">${t.name}</span><span class="t-en">${t.en}</span>
              <span class="t-stat">${pct === null ? 'Chưa luyện' : `Đúng ${pct}% (${st.total} câu)`}</span>
            </button>`;
          }).join('')}
        </div>
      </section>`;
    const again = (label, action) => `<button class="btn primary" id="again">${label}</button><button class="btn" data-go="review">Về Ôn tập</button>`;
    function start(title, qs) {
      runQuiz({
        title, qs,
        onDone(right, total) {
          $app.innerHTML = summaryCard(right, total, '', again('Ôn tiếp'));
          document.getElementById('again').addEventListener('click', () => review());
        },
      });
    }
    document.getElementById('r-wrong').addEventListener('click', () => start('Ôn câu sai', gget('wrong', []).slice(0, MIX_LEN)));
    document.getElementById('r-mix').addEventListener('click', () => {
      const names = (learned.length ? learned : list).map((l) => l.gen);
      start('Luyện tổng hợp', generateFrom(names, grade, MIX_LEN));
    });
    $app.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
      const names = list.filter((l) => l.topic === b.dataset.t).map((l) => l.gen);
      start(topicById(b.dataset.t).name, generateFrom(names, grade, MIX_LEN));
    }));
  }

  // ---------- 📝 Thi ----------
  function award(score) {
    if (score >= 88) return ['🥇', 'Huy chương Vàng'];
    if (score >= 72) return ['🥈', 'Huy chương Bạc'];
    if (score >= 56) return ['🥉', 'Huy chương Đồng'];
    if (score >= 40) return ['🎖️', 'Khuyến khích'];
    return ['💪', 'Cố gắng thêm nhé'];
  }
  const examLabel = (mode, setNo) => (mode === 'set' ? `Bộ đề số ${setNo}` : 'Đề ngẫu nhiên');

  function exams() {
    const sets = gget('sets', {});
    const hist = store.get('history', []).filter((h) => h.grade === grade).slice(0, 5);
    const doneSets = Object.keys(sets).length;
    $app.innerHTML = `
      <h2 class="section-title">📝 Thi thử — Lớp ${grade}</h2>
      <p class="hint">Mỗi đề 25 câu (5 câu mỗi chủ đề), ${EXAM_MINUTES} phút, mỗi câu ${POINTS} điểm.</p>
      <section class="card">
        <div class="card-head"><h3>📚 Thi theo bộ đề</h3><span class="hint">${doneSets}/${EXAM_SETS} đề đã làm</span></div>
        <p class="hint">Mỗi bộ đề cố định, làm lại vẫn là đúng đề đó — phù hợp để so sánh tiến bộ.</p>
        <div class="set-grid">
          ${Array.from({ length: EXAM_SETS }, (_, i) => {
            const n = i + 1, best = sets[n];
            return `<button class="set-card${best !== undefined ? ' done' : ''}" data-go="exam-intro" data-arg="set-${n}">
              <span class="set-no">Đề ${n}</span>
              <span class="set-best">${best === undefined ? 'Chưa làm' : `${award(best)[0]} ${best} điểm`}</span>
            </button>`;
          }).join('')}
        </div>
      </section>
      <section class="card review-card">
        <div><h3>🎲 Thi đề ngẫu nhiên</h3><p>Mỗi lần là một đề mới, không giới hạn số lần.</p></div>
        <button class="btn primary" data-go="exam-intro" data-arg="random">Tạo đề mới</button>
      </section>
      ${hist.length ? `<section class="card"><h3>Lần thi gần đây</h3>
        <table class="hist"><thead><tr><th>Ngày</th><th>Đề</th><th>Điểm</th><th>Thời gian</th></tr></thead><tbody>
        ${hist.map((h) => `<tr><td>${new Date(h.date).toLocaleDateString('vi-VN')}</td><td>${h.label || 'Đề ngẫu nhiên'}</td><td><b>${h.score}</b></td><td>${h.minutes} phút</td></tr>`).join('')}
        </tbody></table></section>` : ''}`;
  }

  function examIntro(arg) {
    const mode = arg && arg.startsWith('set-') ? 'set' : 'random';
    const setNo = mode === 'set' ? +arg.slice(4) : null;
    const best = mode === 'set' ? gget('sets', {})[setNo] : undefined;
    $app.innerHTML = `
      <div class="bar"><button class="btn small back" data-go="exams">← Thi thử</button><span></span></div>
      <section class="card">
        <h2>📝 ${examLabel(mode, setNo)} — Lớp ${grade}</h2>
        ${best !== undefined ? `<p>Điểm cao nhất của em: <b>${best}/100</b>. Cố gắng vượt qua nhé!</p>` : ''}
        <ul class="rules">
          <li><b>25 câu</b> trắc nghiệm, chia đều 5 chủ đề: Tư duy logic, Số học, Lý thuyết số, Hình học, Tổ hợp.</li>
          <li>Thời gian: <b>${EXAM_MINUTES} phút</b>. Hết giờ bài sẽ tự nộp.</li>
          <li>Mỗi câu đúng được <b>${POINTS} điểm</b>, tối đa <b>100</b>. Câu sai hoặc bỏ trống không bị trừ điểm.</li>
          <li>Em có thể chuyển qua lại giữa các câu và đổi đáp án trước khi nộp bài.</li>
          <li>Chuẩn bị giấy nháp và bút chì. Không dùng máy tính bỏ túi.</li>
        </ul>
        <button class="btn primary" id="start">Bắt đầu làm bài</button>
      </section>`;
    document.getElementById('start').addEventListener('click', () => {
      const seed = mode === 'set' ? grade * 7919 + setNo * 104729 : undefined;
      exam = { qs: generateExam(grade, allowedFor(grade), seed), answers: {}, cur: 0, end: Date.now() + EXAM_MINUTES * 60000, done: false, grade, mode, setNo };
      go('exam');
    });
  }

  function examScreen() {
    if (!exam) return exams();
    function tick() {
      const left = Math.max(0, exam.end - Date.now());
      const el = document.getElementById('timer');
      if (el) {
        const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
        el.textContent = `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        el.classList.toggle('urgent', left < 5 * 60000);
      }
      if (left <= 0) submit(true);
    }
    function render() {
      const q = exam.qs[exam.cur];
      const answered = Object.keys(exam.answers).length;
      $app.innerHTML = `
        <div class="bar"><span id="timer" class="timer"></span><span>${examLabel(exam.mode, exam.setNo)} · Đã làm ${answered}/25</span></div>
        <div class="nav-grid">${exam.qs.map((x, k) => `<button class="nav-q${k === exam.cur ? ' cur' : ''}${exam.answers[k] !== undefined ? ' done' : ''}" data-q="${k}">${k + 1}</button>`).join('')}</div>
        ${questionCard(q, exam.cur + 1, exam.answers[exam.cur])}
        <div class="exam-actions">
          <button class="btn" id="prev" ${exam.cur === 0 ? 'disabled' : ''}>← Câu trước</button>
          ${exam.cur < 24 ? '<button class="btn" id="nextq">Câu sau →</button>' : ''}
          <button class="btn primary" id="submit">Nộp bài</button>
        </div>`;
      tick();
      $app.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        exam.answers[exam.cur] = b.dataset.val;
        if (exam.cur < 24) exam.cur++;
        render();
      }));
      $app.querySelectorAll('.nav-q').forEach((b) => b.addEventListener('click', () => { exam.cur = +b.dataset.q; render(); }));
      document.getElementById('prev').addEventListener('click', () => { exam.cur--; render(); });
      const nextq = document.getElementById('nextq');
      if (nextq) nextq.addEventListener('click', () => { exam.cur++; render(); });
      document.getElementById('submit').addEventListener('click', () => {
        const left = 25 - Object.keys(exam.answers).length;
        ask(left ? `Em còn ${left} câu chưa làm. Nộp bài luôn chứ?` : 'Em nộp bài nhé?', 'Nộp bài', 'Làm tiếp').then((ok) => ok && submit(false));
      });
    }
    function submit(timeout) {
      if (exam.done) return;
      exam.done = true;
      document.querySelectorAll('.modal-back').forEach((m) => m.remove());
      clearInterval(timer); timer = null;
      exam.qs.forEach((q, k) => recordAnswer(q, exam.answers[k] === q.answer));
      const right = exam.qs.filter((q, k) => exam.answers[k] === q.answer).length;
      const score = right * POINTS;
      const used = Math.min(EXAM_MINUTES * 60000, EXAM_MINUTES * 60000 - (exam.end - Date.now()));
      const hist = store.get('history', []);
      hist.unshift({ date: new Date().toISOString(), grade: exam.grade, score, right, minutes: Math.round(used / 60000), label: examLabel(exam.mode, exam.setNo) });
      store.set('history', hist.slice(0, 50));
      if (exam.mode === 'set') {
        const sets = gget('sets', {});
        exam.prevBest = sets[exam.setNo];
        sets[exam.setNo] = Math.max(sets[exam.setNo] ?? 0, score);
        gset('sets', sets);
      }
      exam.timeout = timeout;
      go('result');
    }
    render();
    timer = setInterval(tick, 1000);
  }

  function result() {
    if (!exam || !exam.done) return exams();
    const right = exam.qs.filter((q, k) => exam.answers[k] === q.answer).length;
    const score = right * POINTS;
    const [icon, label] = award(score);
    const byTopic = TOPICS.map((t) => {
      const idx = exam.qs.map((q, k) => k).filter((k) => exam.qs[k].topic === t.id);
      return { t, total: idx.length, right: idx.filter((k) => exam.answers[k] === exam.qs[k].answer).length };
    });
    const weakest = byTopic.slice().sort((a, b) => a.right / a.total - b.right / b.total)[0];
    const newBest = exam.mode === 'set' && (exam.prevBest === undefined || score > exam.prevBest);
    $app.innerHTML = `
      <section class="card center">
        ${exam.timeout ? '<p class="note">⏰ Hết giờ — bài đã được nộp tự động.</p>' : ''}
        <p class="hint">${examLabel(exam.mode, exam.setNo)} · Lớp ${exam.grade}</p>
        <div class="big">${icon}</div>
        <h2>${score}/100 điểm</h2>
        <p>Đúng ${right}/25 câu · <b>${label}</b> <small>(mức tham khảo)</small></p>
        ${newBest && exam.prevBest !== undefined ? `<p class="note">🎉 Kỷ lục mới! (trước đây: ${exam.prevBest} điểm)</p>` : ''}
      </section>
      <section class="card">
        <h3>Kết quả theo chủ đề</h3>
        ${byTopic.map((x) => `
          <div class="topic-row">
            <span>${x.t.icon} ${x.t.name}</span>
            <div class="meter"><div class="meter-fill fill-${x.t.id}" style="width:${(100 * x.right) / x.total}%"></div></div>
            <b>${x.right}/${x.total}</b>
          </div>`).join('')}
        <p class="hint">Gợi ý: ôn thêm chủ đề <b>${weakest.t.name}</b>. Các câu sai đã được lưu vào mục Ôn tập.</p>
      </section>
      <h2 class="section-title">Xem lại bài làm</h2>
      ${exam.qs.map((q, k) => {
        const a = exam.answers[k];
        const ok = a === q.answer;
        return `<details class="card review ${ok ? 'ok' : 'no'}">
          <summary>${ok ? '✅' : a === undefined ? '⬜' : '❌'} Câu ${k + 1} · ${topicById(q.topic).name} — Em chọn: <b>${a === undefined ? 'bỏ trống' : optLabel(q, a)}</b>${ok ? '' : ` · Đáp án: <b>${optLabel(q, q.answer)}</b>`}</summary>
          ${qText(q)}
          ${q.svg ? `<div class="q-fig">${q.svg}</div>` : ''}
          <div class="explain"><b>Lời giải:</b> ${q.explain}</div>
        </details>`;
      }).join('')}
      <div class="hero-actions">
        ${exam.mode === 'set' ? `<button class="btn primary" data-go="exam-intro" data-arg="set-${exam.setNo}">Làm lại ${examLabel('set', exam.setNo)}</button>` : '<button class="btn primary" data-go="exam-intro" data-arg="random">Làm đề ngẫu nhiên khác</button>'}
        <button class="btn" data-go="review">Ôn câu sai</button>
        <button class="btn" data-go="exams">Về Thi thử</button>
      </div>`;
    exam = null;
  }

  // ---------- 📖 Từ vựng ----------
  function vocab() {
    $app.innerHTML = `
      <section class="card vocab-hero">
        <h2>📖 Từ vựng Toán tiếng Anh</h2>
        <p>Những từ hay gặp trong đề TIMO, chia theo chủ đề. Học xong thì chơi đố từ 10 câu nhé!</p>
        <button class="btn primary" id="vquiz">🎯 Đố từ vựng</button>
      </section>
      ${VOCAB_GROUPS.map((g) => `
        <details class="card vocab-group"${g.id === 'general' ? ' open' : ''}>
          <summary><span>${g.icon} ${g.name}</span><span class="count">${VOCAB[g.id].length} từ</span></summary>
          <div class="vocab-list">
            ${VOCAB[g.id].map((w) => `
              <div class="word">
                <div class="w-en">${w.en}</div>
                <div class="w-vi">${w.vi}</div>
                ${w.ex ? `<div class="w-ex">${w.ex}</div>` : ''}
              </div>`).join('')}
          </div>
        </details>`).join('')}`;
    document.getElementById('vquiz').addEventListener('click', vocabQuiz);
  }

  function vocabQuiz() {
    const all = VOCAB_GROUPS.flatMap((g) => VOCAB[g.id]);
    const mix = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
    const items = mix(all).slice(0, 10).map((w) => {
      const toVi = Math.random() < 0.6;
      const others = mix(all.filter((x) => x !== w)).slice(0, 3);
      const key = toVi ? 'vi' : 'en';
      return {
        prompt: toVi ? `“<b>${w.en}</b>” nghĩa là gì?` : `“<b>${w.vi}</b>” trong tiếng Anh là gì?`,
        answer: w[key], options: mix([w, ...others]).map((x) => x[key]), word: w,
      };
    });
    let i = 0, right = 0;
    function render() {
      if (i >= items.length) {
        $app.innerHTML = summaryCard(right, items.length, '', '<button class="btn primary" id="again">Đố tiếp</button><button class="btn" data-go="vocab">Xem bảng từ</button>');
        document.getElementById('again').addEventListener('click', vocabQuiz);
        return;
      }
      const it = items[i];
      $app.innerHTML = `
        <div class="bar"><span>Đố từ vựng</span><span>Câu ${i + 1}/${items.length} · Đúng ${right}</span></div>
        <div class="progress"><div style="width:${(100 * i) / items.length}%"></div></div>
        <article class="card question">
          <div class="q-text">${it.prompt}</div>
          <div class="opts">${it.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="letter">${LETTERS[k]}</span><span>${o}</span></button>`).join('')}</div>
        </article>
        <div id="feedback"></div>`;
      $app.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        const ok = it.options[+b.dataset.k] === it.answer;
        if (ok) right++;
        $app.querySelectorAll('.opt').forEach((x) => {
          x.disabled = true;
          if (it.options[+x.dataset.k] === it.answer) x.classList.add('correct');
          else if (x === b) x.classList.add('wrong');
        });
        document.getElementById('feedback').innerHTML = `
          <div class="feedback ${ok ? 'ok' : 'no'}">
            <h3>${ok ? '🎉 Chính xác!' : '😅 Chưa đúng.'}</h3>
            <div class="explain"><b>${it.word.en}</b> = ${it.word.vi}${it.word.ex ? `<br><i>Ví dụ: ${it.word.ex}</i>` : ''}</div>
            <button class="btn primary" id="next">${i + 1 < items.length ? 'Câu tiếp theo →' : 'Xem kết quả'}</button>
          </div>`;
        const next = document.getElementById('next');
        next.focus();
        next.addEventListener('click', () => { i++; render(); });
      }));
    }
    render();
  }

  // ---------- 👤 Tôi ----------
  function me() {
    const s = store.get('stats', {});
    const hist = store.get('history', []).filter((h) => h.grade === grade);
    const { list } = pathState();
    const done = list.filter((l) => l.stars > 0).length;
    const sets = gget('sets', {});
    const bestExam = hist.reduce((m, h) => Math.max(m, h.score), 0);
    $app.innerHTML = `
      <section class="card profile">
        <div class="avatar">${grade}</div>
        <div class="p-info"><h2>Lớp ${grade}</h2><p class="hint">Đề hiển thị: ${LANGS.find((l) => l[0] === lang)[1]}</p></div>
        <button class="btn small" id="change-grade">Đổi lớp</button>
      </section>
      <section class="card">
        <h3>Tổng quan</h3>
        <div class="kpis">
          <div><b>${done}/${list.length}</b><span>Chuyên đề đã qua</span></div>
          <div><b>${Object.keys(sets).length}/${EXAM_SETS}</b><span>Bộ đề đã làm</span></div>
          <div><b>${hist.length ? bestExam : '—'}</b><span>Điểm thi cao nhất</span></div>
          <div><b>${gget('wrong', []).length}</b><span>Câu sai cần ôn</span></div>
        </div>
      </section>
      <section class="card">
        <h3>Tỉ lệ đúng theo chủ đề</h3>
        ${TOPICS.map((t) => {
          const st = s[`${grade}:${t.id}`] || { right: 0, total: 0 };
          const pct = st.total ? Math.round((100 * st.right) / st.total) : 0;
          return `<div class="topic-row"><span>${t.icon} ${t.name}</span><div class="meter"><div class="meter-fill fill-${t.id}" style="width:${pct}%"></div></div><b>${st.total ? pct + '%' : '—'}</b></div>`;
        }).join('')}
      </section>
      <section class="card">
        <h3>Lịch sử thi thử</h3>
        ${hist.length ? `<table class="hist"><thead><tr><th>Ngày</th><th>Đề</th><th>Điểm</th><th>Thời gian</th></tr></thead><tbody>
          ${hist.slice(0, 20).map((h) => `<tr><td>${new Date(h.date).toLocaleDateString('vi-VN')}</td><td>${h.label || 'Đề ngẫu nhiên'}</td><td><b>${h.score}</b></td><td>${h.minutes} phút</td></tr>`).join('')}
        </tbody></table>` : '<p class="hint">Chưa có bài thi thử nào.</p>'}
      </section>
      <section class="card links">
        <button class="btn" data-go="about">ℹ️ TIMO là gì?</button>
        <button class="btn" id="reset">Xóa dữ liệu lớp ${grade}</button>
      </section>`;
    document.getElementById('change-grade').addEventListener('click', async () => { if (await gradePopup(false)) go('path'); });
    document.getElementById('reset').addEventListener('click', () => {
      ask(`Xóa toàn bộ tiến độ lộ trình, bộ đề, câu sai và lịch sử thi của lớp ${grade}?`, 'Xóa', 'Hủy').then((ok) => {
        if (!ok) return;
        ['lessons', 'sets', 'wrong'].forEach((k) => gset(k, k === 'wrong' ? [] : {}));
        const st = store.get('stats', {});
        TOPICS.forEach((t) => delete st[`${grade}:${t.id}`]);
        store.set('stats', st);
        store.set('history', store.get('history', []).filter((h) => h.grade !== grade));
        me();
      });
    });
  }

  function about() {
    $app.innerHTML = `
      <div class="bar"><button class="btn small back" data-go="me">← Tôi</button><span></span></div>
      <section class="card prose">
        <h2>ℹ️ Toán TIMO là gì?</h2>
        <p><b>TIMO</b> (Thailand International Mathematical Olympiad — Olympic Toán học Quốc tế Thái Lan) là kỳ thi Toán quốc tế dành cho học sinh tiểu học và trung học cơ sở, được tổ chức tại nhiều quốc gia. Tại Việt Nam, đề thi được in <b>song ngữ Anh – Việt</b>.</p>
        <h3>Các vòng thi</h3>
        <ul>
          <li><b>Vòng loại (Heat Round)</b>: thi tại Việt Nam, 25 câu, mỗi câu 4 điểm.</li>
          <li><b>Vòng Quốc gia</b>: 25 câu, mỗi câu 4 điểm.</li>
          <li><b>Vòng Quốc tế (Final Round)</b>: thi tại Thái Lan, 30 câu, mỗi câu 5 điểm.</li>
        </ul>
        <h3>5 chủ đề kiến thức</h3>
        <div class="about-topics">
          <div><b>🧩 Tư duy logic</b><br>Quy luật dãy số, dãy hình, dãy đan xen, sắp xếp thứ tự, ngày – tháng, trồng cây, bài toán tuổi.</div>
          <div><b>➕ Số học</b><br>Tính nhanh, tìm số chưa biết, trung bình cộng, tổng – hiệu, tổng – tỉ, gà – chó.</div>
          <div><b>🔢 Lý thuyết số</b><br>Chia hết, chia có dư, phép toán mới, tổng chữ số, đánh số trang, chữ số tận cùng.</div>
          <div><b>📐 Hình học</b><br>Chu vi – diện tích, đếm hình, hình chóp – lăng trụ, lập phương sơn màu, góc.</div>
          <div><b>🎲 Tổ hợp</b><br>Quy tắc nhân, xếp hàng, lập số, bắt tay, cho và nhận, Dirichlet, đường đi.</div>
        </div>
        <h3>Cách học hiệu quả với app</h3>
        <ul>
          <li><b>Lộ trình</b>: học lần lượt từng chuyên đề — đọc phương pháp, xem ví dụ, rồi luyện 5 câu.</li>
          <li><b>Ôn tập</b>: làm lại các câu sai cho đến khi đúng hết.</li>
          <li><b>Thi thử</b>: làm bộ đề cố định để theo dõi tiến bộ; đề ngẫu nhiên để luyện thêm.</li>
          <li>Đọc đề tiếng Anh: bắt đầu với <b>Song ngữ</b> → <b>Anh + chú thích</b> → <b>English</b>.</li>
        </ul>
        <h3>Mẹo làm bài</h3>
        <ul>
          <li>Đọc kỹ đề, gạch chân dữ kiện quan trọng ("cả hai đầu", "khác nhau", "ít nhất").</li>
          <li>Vẽ sơ đồ đoạn thẳng cho bài toán tổng – hiệu, tổng – tỉ, cho và nhận.</li>
          <li>Đếm hình theo kích thước để không sót, không trùng.</li>
          <li>Khoảng 2 phút mỗi câu; câu khó để lại làm sau.</li>
        </ul>
        <p class="hint">Thể thức thi có thể thay đổi theo từng năm — xem thông báo chính thức của Ban tổ chức. Mức huy chương trong app chỉ mang tính tham khảo. Ứng dụng không liên kết với Ban tổ chức TIMO.</p>
      </section>`;
  }

  // ---------- Khởi động ----------
  if (!store.get('onboarded', false)) {
    $app.innerHTML = '<section class="card center"><div class="big">👋</div><h2>Chào em!</h2><p>Chọn lớp để bắt đầu lộ trình học.</p></section>';
    gradePopup(true).then(() => go('path'));
  } else {
    go('path');
  }
})();
