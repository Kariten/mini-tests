(() => {
  'use strict';
  const data = window.QUESTIONNAIRE;
  const share = window.TEST_SHARE;
  // 新版题库在中间插入了题目，使用独立版本避免旧编号答案错位。
  const storageKey = 'before-we-go-preferences-v2';
  const answerLabels = { yes: '完全可以', no: '不能接受', explain: '需要说明' };
  const explanationLimit = 300;
  const palette = {
    food: { color: '#b94c00', tint: '#fff0d4', line: '#f0c17a' },
    space: { color: '#7442c8', tint: '#efe5ff', line: '#cbb2f5' },
    experience: { color: '#c02b6b', tint: '#ffe3ee', line: '#f1a6c7' },
    outing: { color: '#087b61', tint: '#dff8ec', line: '#8dd7bc' }
  };
  const icons = {
    all: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
    food: '<path d="M5 3v7q0 3 3 3V3M5 7h3m0 6v8M17 3q-4 6-2 10h3V3m0 10v8"/>',
    space: '<path d="M3 19V7m18 12V9M3 15h18M3 10h5q3 0 3 5m0-5h7q3 0 3 3"/><path d="M4 19h16"/>',
    experience: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 2-3h4l2 3"/><circle cx="12" cy="13" r="3.5"/>',
    outing: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15"/>'
  };
  const icon = id => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg>`;
  const groups = data.groups;
  let number = 0;
  groups.forEach(group => group.questions.forEach(q => {
    q.number = ++number;
    q.id = `q${String(q.number).padStart(2, '0')}`;
    q.group = group.id;
  }));
  const questions = groups.flatMap(g => g.questions);
  let state = { name: '', answers: {}, explanations: {} };
  let editingQuestion = '';
  let category = 'all';
  let onlyUnanswered = false;
  let storageAvailable = true;
  let toastTimer;
  const $ = id => document.getElementById(id);
  document.querySelectorAll('[data-question-count]').forEach(element => { element.textContent = questions.length; });
  document.querySelector('meta[name="description"]').content = document.querySelector('meta[name="description"]').content.replace(/^\d+/, questions.length);
  $('result-image').alt = `包含全部 ${questions.length} 道题及所选偏好的结果长图`;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      state.name = typeof saved.name === 'string' ? saved.name.slice(0, 24) : '';
      for (const q of questions) {
        const answer = saved.answers?.[q.id];
        if (answer === 'yes' || answer === 'no' || answer === 'explain') state.answers[q.id] = answer;
        if (typeof saved.explanations?.[q.id] === 'string') state.explanations[q.id] = saved.explanations[q.id].slice(0, explanationLimit);
      }
    }
  } catch { storageAvailable = false; }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { storageAvailable = false; }
    $('storage-status').textContent = storageAvailable
      ? '填写内容自动保存在当前浏览器'
      : '浏览器未允许自动保存，离开前记得导出结果图';
  }
  function notify(message) {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3600);
  }
  function isAnswered(q) {
    const answer = state.answers[q.id];
    return answer === 'yes' || answer === 'no' || (answer === 'explain' && Boolean(state.explanations[q.id]?.trim()));
  }
  function updateProgress() {
    const answered = questions.filter(isAnswered).length;
    $('progress-count').innerHTML = `${answered} <span>/ ${questions.length}</span>`;
    $('progress-fill').style.width = `${answered / questions.length * 100}%`;
    document.querySelector('.progress-track').setAttribute('aria-valuenow', answered);
    document.querySelector('.progress-track').setAttribute('aria-valuemax', questions.length);
    $('dock-progress').textContent = `已填写 ${answered} / ${questions.length} 题`;
    document.querySelectorAll('.category-button').forEach(button => {
      const id = button.dataset.group;
      const items = id === 'all' ? questions : questions.filter(q => q.group === id);
      const count = items.filter(isAnswered).length;
      button.querySelector('.category-count').textContent = `${count} / ${items.length}`;
      button.classList.toggle('active', id === category);
      button.setAttribute('aria-pressed', String(id === category));
    });
    document.querySelectorAll('.question-group').forEach(section => {
      const group = groups.find(g => g.id === section.dataset.group);
      section.querySelector('.group-total').textContent = `${group.questions.filter(isAnswered).length} / ${group.questions.length} 已答`;
    });
  }
  function questionMarkup(q) {
    const current = state.answers[q.id];
    return `<div class="question-row${current ? ' answered' : ''}" id="row-${q.id}" data-question="${q.id}">
      <span class="question-number" aria-hidden="true">${String(q.number).padStart(2, '0')}</span>
      <fieldset class="question-copy"><legend id="label-${q.id}">${q.text}</legend>${q.note ? `<p class="question-note" id="note-${q.id}">${q.note}</p>` : ''}
      </fieldset>
      <div class="answer-controls" role="radiogroup" aria-labelledby="label-${q.id}"${q.note ? ` aria-describedby="note-${q.id}"` : ''}>
        <label class="answer-option"><input type="radio" name="${q.id}" value="yes" aria-label="${answerLabels.yes}"${current === 'yes' ? ' checked' : ''}><span>${answerLabels.yes}</span></label>
        <label class="answer-option"><input type="radio" name="${q.id}" value="no" aria-label="${answerLabels.no}"${current === 'no' ? ' checked' : ''}><span>${answerLabels.no}</span></label>
        <label class="answer-option"><input type="radio" name="${q.id}" value="explain" aria-label="${answerLabels.explain}" aria-controls="detail-${q.id}"${current === 'explain' ? ' checked' : ''}><span>${answerLabels.explain}</span></label>
        <button class="clear-answer" type="button" data-clear="${q.id}" aria-label="清除第 ${q.number} 题的选择" title="清除本题选择"${current ? '' : ' tabindex="-1"'}>×</button>
      </div>
      <div class="answer-detail" id="detail-${q.id}"${current === 'explain' ? '' : ' hidden'}>
        <div class="detail-heading"><label for="explanation-${q.id}">详细说明</label><span class="detail-count"></span></div>
        <textarea id="explanation-${q.id}" data-explanation="${q.id}" aria-label="第 ${q.number} 题的详细说明" maxlength="${explanationLimit}" rows="3" placeholder="写下你的具体想法或接受条件……"></textarea>
      </div>
    </div>`;
  }
  function renderQuestions() {
    $('question-list').innerHTML = groups.map(g => `<section class="question-group" data-group="${g.id}" aria-labelledby="heading-${g.id}"><div class="group-heading"><span class="group-icon">${icon(g.icon)}</span><div><h3 id="heading-${g.id}">${g.title}</h3><p>${g.description}</p></div><span class="group-total"></span></div><div>${g.questions.map(questionMarkup).join('')}</div></section>`).join('');
    // 用户输入只通过 value/textContent 回填，不拼入 HTML。
    questions.forEach(q => {
      const row = $('row-' + q.id);
      row.querySelector('textarea').value = state.explanations[q.id] || '';
      row.querySelector('.detail-count').textContent = `${(state.explanations[q.id] || '').length} / ${explanationLimit}`;
    });
    applyFilter();
    updateProgress();
  }
  function applyFilter() {
    let visibleCount = 0;
    document.querySelectorAll('.question-group').forEach(section => {
      let count = 0;
      section.querySelectorAll('.question-row').forEach(row => {
        const q = questions.find(item => item.id === row.dataset.question);
        const visible = (category === 'all' || section.dataset.group === category) && (!onlyUnanswered || !isAnswered(q) || editingQuestion === q.id);
        row.hidden = !visible;
        if (visible) count++;
      });
      section.hidden = count === 0;
      visibleCount += count;
    });
    const currentGroup = groups.find(g => g.id === category);
    const total = currentGroup ? currentGroup.questions.length : questions.length;
    $('list-title').innerHTML = `${currentGroup ? currentGroup.title : '全部题目'}<span>${onlyUnanswered ? visibleCount : total}</span>`;
    $('list-subtitle').textContent = onlyUnanswered ? `还有 ${visibleCount} 道题等你选择，按自己的习惯回答就好。` : (currentGroup?.description || '把每一件旅行小事，变成彼此的共识。');
    $('empty-state').hidden = visibleCount !== 0;
  }
  $('respondent').value = state.name;
  $('respondent').addEventListener('input', event => { state.name = event.target.value; save(); });
  $('category-nav').innerHTML = [{ id: 'all', title: '全部题目', icon: 'all' }, ...groups].map(g => `<button class="category-button" data-group="${g.id}" aria-pressed="${g.id === category}"><span class="nav-icon">${icon(g.icon)}</span><span>${g.title}</span><span class="category-count"></span></button>`).join('');
  $('category-nav').addEventListener('click', event => {
    const button = event.target.closest('.category-button');
    if (!button) return;
    category = button.dataset.group;
    applyFilter();
    updateProgress();
    if (matchMedia('(max-width:760px)').matches) $('list-title').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  $('unanswered-filter').addEventListener('change', event => { onlyUnanswered = event.target.checked; applyFilter(); });
  $('question-list').addEventListener('change', event => {
    const target = event.target;
    if (!target.matches('input[type="radio"]')) return;
    state.answers[target.name] = target.value;
    const row = target.closest('.question-row');
    row.classList.add('answered');
    row.querySelector('.clear-answer').removeAttribute('tabindex');
    const needsExplanation = target.value === 'explain';
    row.querySelector('.answer-detail').hidden = !needsExplanation;
    editingQuestion = needsExplanation ? target.name : '';
    save();
    updateProgress();
    if (needsExplanation) {
      if (onlyUnanswered) applyFilter();
      row.querySelector('textarea').focus();
    } else if (onlyUnanswered) {
      const remaining = [...document.querySelectorAll('.question-row')].filter(r => !r.hidden && r !== row);
      const next = remaining.find(r => Number(r.dataset.question.slice(1)) > Number(target.name.slice(1))) || remaining[0];
      applyFilter();
      if (next) next.querySelector('input').focus({ preventScroll: true });
      else $('unanswered-filter').focus({ preventScroll: true });
    }
  });
  $('question-list').addEventListener('input', event => {
    const target = event.target;
    if (!target.matches('textarea[data-explanation]')) return;
    const id = target.dataset.explanation;
    state.explanations[id] = target.value.slice(0, explanationLimit);
    target.closest('.question-row').querySelector('.detail-count').textContent = `${state.explanations[id].length} / ${explanationLimit}`;
    save(); updateProgress();
  });
  $('question-list').addEventListener('focusin', event => {
    const row = event.target.closest('.question-row');
    if (row && state.answers[row.dataset.question] === 'explain') editingQuestion = row.dataset.question;
  });
  $('question-list').addEventListener('focusout', event => {
    const row = event.target.closest('.question-row');
    if (!row || row.contains(event.relatedTarget) || editingQuestion !== row.dataset.question) return;
    editingQuestion = '';
    if (onlyUnanswered) applyFilter();
  });
  $('question-list').addEventListener('click', event => {
    const button = event.target.closest('[data-clear]');
    if (!button) return;
    const id = button.dataset.clear;
    delete state.answers[id];
    delete state.explanations[id];
    if (editingQuestion === id) editingQuestion = '';
    const row = $('row-' + id);
    row.querySelectorAll('input').forEach(input => { input.checked = false; });
    row.classList.remove('answered');
    row.querySelector('.answer-detail').hidden = true;
    row.querySelector('textarea').value = '';
    row.querySelector('.detail-count').textContent = `0 / ${explanationLimit}`;
    button.tabIndex = -1;
    row.querySelector('input').focus({ preventScroll: true });
    save(); updateProgress(); applyFilter();
  });
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  $('reset-button').addEventListener('click', () => $('reset-dialog').showModal());
  $('confirm-reset').addEventListener('click', () => {
    state = { name: '', answers: {}, explanations: {} };
    editingQuestion = '';
    $('respondent').value = '';
    category = 'all'; onlyUnanswered = false; $('unanswered-filter').checked = false;
    save(); renderQuestions(); $('reset-dialog').close(); notify('已清空，可以重新填写了。');
  });

  // 用原生 Canvas 排版；不依赖外链、字体下载或页面截图服务，双击 HTML 也能导出。
  function font(ctx, size, weight = 400) {
    ctx.font = `${weight} ${size}px "Microsoft YaHei", "PingFang SC", system-ui, sans-serif`;
  }
  function wrap(ctx, text, maxWidth) {
    const lines = []; let line = '';
    for (const char of Array.from(text)) {
      if (char === '\n') { lines.push(line); line = ''; continue; }
      if (line && ctx.measureText(line + char).width > maxWidth) {
        // 句末标点与前一个字同行，避免结果图中单独出现一行问号。
        if (/^[，。！？；：、）》】,.!?;:]$/.test(char) && Array.from(line).length > 1) {
          const chars = Array.from(line);
          const last = chars.pop();
          lines.push(chars.join('')); line = last + char;
        } else { lines.push(line); line = char; }
      }
      else line += char;
    }
    if (line) lines.push(line);
    return lines;
  }
  function roundRect(ctx, x, y, w, h, radius, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  async function createResult() {
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    const width = 1272, colWidth = 605, gap = 22, left = 64, cardInset = 20;
    const answerWidth = 126;
    const textWidth = colWidth - 52 - answerWidth - 36;
    const layouts = groups.map(g => {
      const items = g.questions.map(q => {
        font(ctx, 23, 500); const lines = wrap(ctx, q.text, textWidth);
        const explanation = state.answers[q.id] === 'explain' ? (state.explanations[q.id]?.trim() || '暂未填写') : '';
        font(ctx, 18); const notes = explanation ? wrap(ctx, `说明：${explanation}`, colWidth - 52 - 20) : [];
        return { q, lines, notes, height: Math.max(116, 36 + lines.length * 35 + (notes.length ? 9 + notes.length * 27 : 0)) };
      });
      const rows = [];
      for (let n = 0; n < items.length; n += 2) rows.push({ items: items.slice(n, n + 2), height: Math.max(...items.slice(n, n + 2).map(i => i.height)) });
      return { g, rows, height: 106 + rows.reduce((h, row) => h + row.height + 14, 0) + 12 };
    });
    const qrScale = 5;
    const qrSize = share.modules.length * qrScale;
    const resultHeight = 325 + layouts.reduce((h, g) => h + g.height + 25, 0) + qrSize + 84;
    canvas.height = resultHeight;
    ctx.fillStyle = '#fff8f2'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = 'top';
    font(ctx, 19, 600); ctx.fillStyle = '#a84b2f'; ctx.fillText('BEFORE WE GO  /  一起出发前', left, 49);
    font(ctx, 49, 650); ctx.fillStyle = '#352d2b'; ctx.fillText('我的旅行偏好', left, 98);
    const name = state.name.trim() || '未署名';
    font(ctx, 27, 500); ctx.fillStyle = '#cc402b'; ctx.fillText(name, left, 176);
    const answered = questions.filter(isAnswered).length;
    const date = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    font(ctx, 19); ctx.fillStyle = '#8b7d6b'; ctx.fillText(`已填写 ${answered} / ${questions.length} 题  ·  ${date}`, left, 221);
    ctx.fillStyle = '#8b7d6b'; ctx.fillText(`${answerLabels.yes} / ${answerLabels.no} / ${answerLabels.explain}    未答 = 尚未选择`, left, 257);
    roundRect(ctx, 1160, 61, 175, 64, 16, '#ffe5dc');
    font(ctx, 19, 600); ctx.fillStyle = '#a73422'; ctx.textAlign = 'center'; ctx.fillText(`${questions.length} 个小习惯`, 1247, 82); ctx.textAlign = 'left';
    let y = 325;
    for (const layout of layouts) {
      const { g, rows, height } = layout;
      const p = palette[g.id];
      roundRect(ctx, left, y, width, height, 23, p.tint, p.line);
      roundRect(ctx, left + 25, y + 30, 6, 32, 3, p.color);
      font(ctx, 29, 600); ctx.fillStyle = p.color; ctx.fillText(g.title, left + 48, y + 29);
      font(ctx, 18); ctx.fillStyle = p.color; ctx.textAlign = 'right';
      ctx.fillText(`${g.questions.length} 道题`, left + width - 28, y + 38); ctx.textAlign = 'left';
      let rowY = y + 90;
      for (const row of rows) {
        row.items.forEach((item, column) => {
          const x = left + cardInset + column * (colWidth + gap);
          roundRect(ctx, x, rowY, colWidth, row.height, 13, '#ffffff');
          font(ctx, 16, 600); ctx.fillStyle = p.color; ctx.fillText(String(item.q.number).padStart(2, '0'), x + 16, rowY + 24);
          font(ctx, 23, 500); ctx.fillStyle = '#403a32';
          item.lines.forEach((line, index) => ctx.fillText(line, x + 52, rowY + 20 + index * 35));
          font(ctx, 18); ctx.fillStyle = '#756b65';
          item.notes.forEach((line, index) => ctx.fillText(line, x + 52, rowY + 26 + item.lines.length * 35 + index * 27));
          const answer = state.answers[item.q.id];
          const pillX = x + colWidth - answerWidth - 19, pillY = rowY + 20 + (Math.max(43, item.lines.length * 35) - 43) / 2;
          roundRect(ctx, pillX, pillY, answerWidth, 43, 10, answer === 'yes' ? p.color : answer ? p.tint : '#f1ede6', answer === 'explain' ? p.color : answer === 'no' ? p.line : null);
          font(ctx, answer ? 21 : 18, 600); ctx.fillStyle = answer === 'yes' ? '#ffffff' : answer ? p.color : '#a29483';
          ctx.textAlign = 'center'; ctx.fillText(answerLabels[answer] || '未答', pillX + answerWidth / 2, pillY + 10); ctx.textAlign = 'left';
        });
        rowY += row.height + 14;
      }
      y += height + 25;
    }
    font(ctx, 22, 500); ctx.fillStyle = '#8b7961'; ctx.fillText('偏好不同很正常，提前说好就更从容。', left, y + qrSize / 2 - 34);
    font(ctx, 16); ctx.fillStyle = '#aa9e8c'; ctx.fillText('仅记录个人偏好 · 供旅伴逐题对照', left, y + qrSize / 2 + 9);
    // 二维码含四模块白边，直接逐格绘制，离线导出也无需加载图片。
    const qrX = canvas.width - left - qrSize;
    const qrY = y + 6;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#292722';
    share.modules.forEach((row, rowIndex) => {
      for (let column = 0; column < row.length; column++) {
        if (row[column] === '1') ctx.fillRect(qrX + column * qrScale, qrY + rowIndex * qrScale, qrScale, qrScale);
      }
    });
    font(ctx, 21, 600); ctx.fillStyle = '#6f5d48'; ctx.textAlign = 'center';
    ctx.fillText('扫码填写同款', qrX + qrSize / 2, qrY + qrSize + 14); ctx.textAlign = 'left';
    // 使用真实 PNG 图片供手机浏览器长按保存，预览期间不回收图片地址。
    return { imageUrl: canvas.toDataURL('image/png'), answered };
  }
  function resultFilename() {
    const safeName = (state.name.trim() || '我的').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `${safeName}-旅行偏好清单-${date}.png`;
  }
  function setBusy(busy) {
    $('export-button').disabled = busy;
    $('export-button').setAttribute('aria-busy', String(busy));
    $('export-button').querySelector('span').textContent = busy ? '正在生成图片…' : '生成结果长图';
  }
  async function showPreview(imageUrl, answered) {
    $('result-image').src = imageUrl;
    $('save-preview-link').href = imageUrl;
    $('save-preview-link').download = resultFilename();
    await $('result-image').decode();
    $('result-description').textContent = `已填写 ${answered} / ${questions.length} 题 · ${answered < questions.length ? '未选择的题目已标为「未答」' : '全部偏好都在这里了'}`;
    $('result-dialog').showModal();
    document.querySelector('.result-image-wrap').scrollTop = 0;
  }
  async function exportResult() {
    setBusy(true);
    try {
      const result = await createResult();
      await showPreview(result.imageUrl, result.answered);
    } catch (error) {
      console.error('结果图生成失败', error);
      notify('图片生成未完成，请重试或换用最新版 Chrome / Edge。');
    } finally { setBusy(false); }
  }
  $('export-button').addEventListener('click', exportResult);
  renderQuestions();
  save();
})();
