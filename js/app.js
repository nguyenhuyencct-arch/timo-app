/* Ứng dụng Luyện Toán TIMO — giao diện một trang, không cần máy chủ. */
(function () {
  'use strict';
  const { TOPICS, generateSet, generateExam } = window.TimoGen;
  const { VOCAB, VOCAB_GROUPS } = window.TimoVocab;
  const $app = document.getElementById('app');
  const $grade = document.getElementById('grade');
  const $lang = document.getElementById('lang');

  const PRACTICE_LEN = 10;
  const EXAM_MINUTES = 60;
  const POINTS = 4;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const topicById = (id) => TOPICS.find((t) => t.id === id);

  // ---------- Lưu trữ (an toàn khi trình duyệt chặn localStorage) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('timo:' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, val) { try { localStorage.setItem('timo:' + key, JSON.stringify(val)); } catch (e) { /* bỏ qua */ } },
  };

  let grade = store.get('grade', 3);
  $grade.value = grade;
  $grade.addEventListener('change', () => { grade = +$grade.value; store.set('grade', grade); go('home'); });

  // Ngôn ngữ đề: 'vi' | 'bi' (song ngữ, như đề TIMO tại Việt Nam) | 'en'.
  // Câu hỏi luôn được vẽ đủ cả hai bản; CSS ẩn/hiện theo body[data-lang] nên đổi giữa chừng không mất bài.
  let lang = store.get('lang', 'bi');
  function setLang(v) {
    lang = ['vi', 'bi', 'en'].includes(v) ? v : 'bi';
    $lang.value = lang;
    document.body.dataset.lang = lang;
    store.set('lang', lang);
  }
  setLang(lang);
  $lang.addEventListener('change', () => setLang($lang.value));

  /** Văn bản hai ngôn ngữ: phần tiếng Anh đứng trước như trên đề thi. */
  const dual = (vi, en) => (en && en !== vi ? `<span class="l-en">${en}</span><span class="l-vi">${vi}</span>` : vi);
  const optLabel = (q, o) => dual(o, q.optLabels && q.optLabels[o]);

  function recordAnswer(topic, correct) {
    const s = store.get('stats', {});
    const key = `${grade}:${topic}`;
    s[key] = s[key] || { right: 0, total: 0 };
    s[key].total++;
    if (correct) s[key].right++;
    store.set('stats', s);
  }

  // ---------- Điều hướng ----------
  let timer = null;
  let exam = null;

  function go(screen, arg) {
    if (screen !== 'exam' && timer) { clearInterval(timer); timer = null; }
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.go === screen));
    window.scrollTo(0, 0);
    ({ home, practice, 'exam-intro': examIntro, exam: examScreen, result, stats, vocab, about }[screen] || home)(arg);
  }
  /** Hộp xác nhận vẽ trong trang (thay cho hộp thoại của trình duyệt, vốn bị chặn ở một số nơi nhúng). */
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

  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-go]');
    if (!el) return;
    if (exam && !exam.done) {
      if (!(await ask('Em đang làm bài thi. Thoát ra sẽ mất bài làm. Em chắc chứ?', 'Thoát', 'Làm tiếp'))) return;
      exam = null;
    }
    go(el.dataset.go, el.dataset.arg);
  });

  // ---------- Trang chủ ----------
  function home() {
    const s = store.get('stats', {});
    $app.innerHTML = `
      <section class="hero">
        <h1>Chào em! Cùng luyện Toán TIMO lớp ${grade} nhé 🎉</h1>
        <p>Chọn một chủ đề để luyện tập ${PRACTICE_LEN} câu có lời giải, hoặc làm bài thi thử 25 câu như đề thật.</p>
        <div class="hero-actions">
          <button class="btn primary" data-go="exam-intro">📝 Thi thử 25 câu</button>
          <button class="btn" data-go="practice" data-arg="mix">🎯 Luyện tổng hợp</button>
        </div>
      </section>
      <h2 class="section-title">Luyện theo chủ đề</h2>
      <div class="topics">
        ${TOPICS.map((t) => {
          const st = s[`${grade}:${t.id}`];
          const pct = st && st.total ? Math.round((100 * st.right) / st.total) : null;
          return `<button class="topic topic-${t.id}" data-go="practice" data-arg="${t.id}">
            <span class="t-icon">${t.icon}</span>
            <span class="t-name">${t.name}</span>
            <span class="t-en">${t.en}</span>
            <span class="t-stat">${pct === null ? 'Chưa luyện' : `Đúng ${pct}% (${st.total} câu)`}</span>
          </button>`;
        }).join('')}
      </div>`;
  }

  // ---------- Luyện tập ----------
  function practice(topicId) {
    let qs;
    if (topicId === 'mix') {
      qs = [];
      TOPICS.forEach((t) => qs.push(...generateSet(t.id, grade, 2)));
      qs = qs.sort(() => Math.random() - 0.5);
    } else qs = generateSet(topicId, grade, PRACTICE_LEN);
    const title = topicId === 'mix' ? 'Luyện tổng hợp' : topicById(topicId).name;
    let i = 0, right = 0;

    function render() {
      if (i >= qs.length) return summary();
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
      recordAnswer(q.topic, ok);
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
    function summary() {
      const pct = Math.round((100 * right) / qs.length);
      $app.innerHTML = `
        <section class="card center">
          <div class="big">${pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
          <h2>Em làm đúng ${right}/${qs.length} câu</h2>
          <p>${pct >= 80 ? 'Xuất sắc! Em hãy thử thi thử nhé.' : pct >= 50 ? 'Khá tốt! Luyện thêm để giỏi hơn nữa.' : 'Không sao, hãy đọc kỹ lời giải và luyện lại nhé!'}</p>
          <div class="hero-actions">
            <button class="btn primary" data-go="practice" data-arg="${topicId}">Luyện tiếp</button>
            <button class="btn" data-go="home">Về trang chủ</button>
          </div>
        </section>`;
    }
    render();
  }

  function questionCard(q, num, selected) {
    return `
      <article class="card question">
        <div class="q-head"><span class="chip chip-${q.topic}">${topicById(q.topic).icon} ${dual(topicById(q.topic).name, topicById(q.topic).en)}</span><span class="q-num">${dual(`Câu ${num}`, `Question ${num}`)}</span></div>
        ${qText(q)}
        ${q.svg ? `<div class="q-fig">${q.svg}</div>` : ''}
        <div class="opts">
          ${q.options.map((o, k) => `<button class="opt${selected === o ? ' selected' : ''}" data-val="${o}"><span class="letter">${LETTERS[k]}</span><span class="opt-label">${optLabel(q, o)}</span></button>`).join('')}
        </div>
      </article>`;
  }

  const qText = (q) => `<div class="q-text q-dual"><div class="l-en">${q.textEn}</div><div class="l-vi">${q.text}</div></div>`;

  // ---------- Thi thử ----------
  function examIntro() {
    $app.innerHTML = `
      <section class="card">
        <h2>📝 Thi thử TIMO — Lớp ${grade}</h2>
        <ul class="rules">
          <li><b>25 câu</b> trắc nghiệm, chia đều 5 chủ đề: Tư duy logic, Số học, Lý thuyết số, Hình học, Tổ hợp (mỗi chủ đề 5 câu).</li>
          <li>Thời gian: <b>${EXAM_MINUTES} phút</b>. Hết giờ bài sẽ tự nộp.</li>
          <li>Mỗi câu đúng được <b>${POINTS} điểm</b>, tổng điểm tối đa là <b>100</b>. Câu sai hoặc bỏ trống không bị trừ điểm.</li>
          <li>Em có thể chuyển qua lại giữa các câu và đổi đáp án trước khi nộp bài.</li>
          <li>Có giấy nháp và bút chì bên cạnh nhé! Không dùng máy tính bỏ túi.</li>
        </ul>
        <button class="btn primary" id="start">Bắt đầu làm bài</button>
      </section>`;
    document.getElementById('start').addEventListener('click', () => {
      exam = { qs: generateExam(grade), answers: {}, cur: 0, end: Date.now() + EXAM_MINUTES * 60000, done: false, grade };
      go('exam');
    });
  }

  function examScreen() {
    if (!exam) return examIntro();
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
        <div class="bar"><span id="timer" class="timer"></span><span>Đã làm ${answered}/25</span></div>
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
      const prev = document.getElementById('prev'), nextq = document.getElementById('nextq');
      prev.addEventListener('click', () => { exam.cur--; render(); });
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
      exam.qs.forEach((q, k) => recordAnswer(q.topic, exam.answers[k] === q.answer));
      const right = exam.qs.filter((q, k) => exam.answers[k] === q.answer).length;
      const used = Math.min(EXAM_MINUTES * 60000, EXAM_MINUTES * 60000 - (exam.end - Date.now()));
      const hist = store.get('history', []);
      hist.unshift({ date: new Date().toISOString(), grade: exam.grade, score: right * POINTS, right, minutes: Math.round(used / 60000) });
      store.set('history', hist.slice(0, 30));
      exam.timeout = timeout;
      go('result');
    }
    render();
    timer = setInterval(tick, 1000);
  }

  function award(score) {
    if (score >= 88) return ['🥇', 'Huy chương Vàng'];
    if (score >= 72) return ['🥈', 'Huy chương Bạc'];
    if (score >= 56) return ['🥉', 'Huy chương Đồng'];
    if (score >= 40) return ['🎖️', 'Khuyến khích'];
    return ['💪', 'Cố gắng thêm nhé'];
  }

  function result() {
    if (!exam || !exam.done) return home();
    const right = exam.qs.filter((q, k) => exam.answers[k] === q.answer).length;
    const score = right * POINTS;
    const [icon, label] = award(score);
    const byTopic = TOPICS.map((t) => {
      const idx = exam.qs.map((q, k) => k).filter((k) => exam.qs[k].topic === t.id);
      return { t, total: idx.length, right: idx.filter((k) => exam.answers[k] === exam.qs[k].answer).length };
    });
    $app.innerHTML = `
      <section class="card center">
        ${exam.timeout ? '<p class="note">⏰ Hết giờ — bài đã được nộp tự động.</p>' : ''}
        <div class="big">${icon}</div>
        <h2>${score}/100 điểm</h2>
        <p>Đúng ${right}/25 câu · <b>${label}</b> <small>(mức tham khảo)</small></p>
      </section>
      <section class="card">
        <h3>Kết quả theo chủ đề</h3>
        ${byTopic.map((x) => `
          <div class="topic-row">
            <span>${x.t.icon} ${x.t.name}</span>
            <div class="meter"><div class="meter-fill fill-${x.t.id}" style="width:${(100 * x.right) / x.total}%"></div></div>
            <b>${x.right}/${x.total}</b>
          </div>`).join('')}
        <p class="hint">Gợi ý: luyện thêm chủ đề có kết quả thấp nhất.</p>
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
      <div class="hero-actions"><button class="btn primary" data-go="exam-intro">Thi lại đề mới</button><button class="btn" data-go="home">Về trang chủ</button></div>`;
    exam = null;
  }

  // ---------- Thống kê ----------
  function stats() {
    const s = store.get('stats', {});
    const hist = store.get('history', []);
    $app.innerHTML = `
      <section class="card">
        <h2>📊 Kết quả luyện tập — Lớp ${grade}</h2>
        ${TOPICS.map((t) => {
          const st = s[`${grade}:${t.id}`] || { right: 0, total: 0 };
          const pct = st.total ? Math.round((100 * st.right) / st.total) : 0;
          return `<div class="topic-row"><span>${t.icon} ${t.name}</span><div class="meter"><div class="meter-fill fill-${t.id}" style="width:${pct}%"></div></div><b>${st.total ? pct + '%' : '—'}</b></div>`;
        }).join('')}
      </section>
      <section class="card">
        <h3>Lịch sử thi thử</h3>
        ${hist.length ? `<table class="hist"><thead><tr><th>Ngày</th><th>Lớp</th><th>Điểm</th><th>Thời gian</th></tr></thead><tbody>
          ${hist.map((h) => `<tr><td>${new Date(h.date).toLocaleDateString('vi-VN')}</td><td>${h.grade}</td><td><b>${h.score}</b></td><td>${h.minutes} phút</td></tr>`).join('')}
        </tbody></table>` : '<p class="hint">Chưa có bài thi thử nào.</p>'}
        <button class="btn small" id="reset">Xóa dữ liệu</button>
      </section>`;
    document.getElementById('reset').addEventListener('click', () => {
      ask('Xóa toàn bộ kết quả luyện tập và lịch sử thi?', 'Xóa', 'Hủy').then((ok) => { if (ok) { store.set('stats', {}); store.set('history', []); stats(); } });
    });
  }

  // ---------- Từ vựng ----------
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
      const toVi = Math.random() < 0.6; // hỏi nghĩa tiếng Việt nhiều hơn
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
        $app.innerHTML = `<section class="card center"><div class="big">${right >= 8 ? '🏆' : right >= 5 ? '👍' : '💪'}</div>
          <h2>Em đúng ${right}/${items.length} từ</h2>
          <div class="hero-actions"><button class="btn primary" id="again">Đố tiếp</button><button class="btn" data-go="vocab">Xem bảng từ</button></div></section>`;
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

  // ---------- Giới thiệu TIMO ----------
  function about() {
    $app.innerHTML = `
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
          <div><b>🧩 Tư duy logic</b><br>Quy luật dãy số, bài toán tuổi, sắp xếp thứ tự, ngày trong tuần, trồng cây – cưa gỗ.</div>
          <div><b>➕ Số học</b><br>Tính nhanh, tìm số chưa biết, tổng – hiệu, tổng – tỉ, gà – chó, trung bình cộng, phần trăm.</div>
          <div><b>🔢 Lý thuyết số</b><br>Chia hết, phép chia có dư, đánh số trang, tổng chữ số, chữ số tận cùng, ước số.</div>
          <div><b>📐 Hình học</b><br>Chu vi – diện tích, đếm hình, khối lập phương sơn màu, góc trong tam giác.</div>
          <div><b>🎲 Tổ hợp</b><br>Quy tắc nhân, bắt tay, lập số, nguyên lý Dirichlet, đếm đường đi.</div>
        </div>
        <h3>Mẹo làm bài</h3>
        <ul>
          <li>Đọc kỹ đề, gạch chân dữ kiện quan trọng (ví dụ "cả hai đầu", "khác nhau", "ít nhất").</li>
          <li>Vẽ hình hoặc sơ đồ đoạn thẳng cho bài toán tổng – hiệu, tổng – tỉ.</li>
          <li>Với bài đếm hình, đếm theo kích thước để không sót, không trùng.</li>
          <li>Phân bổ thời gian: khoảng 2 phút mỗi câu, câu khó để lại làm sau.</li>
        </ul>
        <h3>Học cùng tiếng Anh</h3>
        <p>Điểm thi chỉ tính đáp án Toán, nhưng quen đọc đề tiếng Anh giúp em đọc nhanh hơn và tự tin khi thi các vòng cao. Gợi ý:</p>
        <ul>
          <li>Chọn <b>Song ngữ</b> ở góc trên để đề hiện cả tiếng Anh và tiếng Việt, giống đề thi thật.</li>
          <li>Khi đã quen, thử chế độ <b>English</b> và chỉ xem bản tiếng Việt khi cần.</li>
          <li>Học <button class="link" data-go="vocab">từ vựng Toán tiếng Anh</button> theo từng chủ đề và chơi trò đố từ.</li>
        </ul>
        <p class="hint">Thông tin về cấu trúc và thể thức thi có thể thay đổi theo từng năm. Phụ huynh nên xem thông báo chính thức của Ban tổ chức. Mức huy chương trong ứng dụng chỉ mang tính tham khảo.</p>
      </section>`;
  }

  go('home');
})();
