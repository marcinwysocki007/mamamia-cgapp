import './style.css';

let wynVal = 2000;
let detailMode = 'normal'; // 'normal' | 'zapytania'
let detailApplied = false;
let profileSearching = true;
let totalPts = 680;
const PTS_MAX = 1000; // points to next level

function updatePtsDisplays(val) {
  const pct = Math.min(val / PTS_MAX * 100, 100).toFixed(1);
  const remaining = Math.max(PTS_MAX - val, 0);
  const homeText = document.getElementById('home-pts-text');
  const homeFill = document.getElementById('home-pts-fill');
  const profNum  = document.getElementById('profile-pts-number');
  const profSub  = document.getElementById('profile-pts-sub');
  const profFill = document.getElementById('profile-pts-fill');
  if (homeText) homeText.textContent = `${val} / ${PTS_MAX} pkt do Złotej`;
  if (homeFill) homeFill.style.width = pct + '%';
  if (profNum)  profNum.textContent  = val;
  if (profSub)  profSub.textContent  = `${val} punktów · jeszcze ${remaining} do Złotej`;
  if (profFill) profFill.style.width = pct + '%';
}

function addPoints(pts, anchorEl) {
  // floating badge near the level card
  const anchor = anchorEl || document.getElementById('home-pts-fill');
  if (anchor) {
    const rect = anchor.getBoundingClientRect();
    const phoneRect = document.querySelector('.phone').getBoundingClientRect();
    const badge = document.createElement('div');
    badge.className = 'pts-badge';
    badge.textContent = `+${pts} pkt ⭐`;
    badge.style.left = (rect.left - phoneRect.left + rect.width / 2 - 40) + 'px';
    badge.style.top  = (rect.top  - phoneRect.top  - 10) + 'px';
    document.querySelector('.phone').appendChild(badge);
    setTimeout(() => badge.remove(), 1500);
  }
  // animate counter
  const start = totalPts;
  const end   = totalPts + pts;
  totalPts    = end;
  const dur   = 800;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    updatePtsDisplays(current);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateDetailCTA() {
  const def  = document.getElementById('cta-default');
  const zap  = document.getElementById('cta-zapytania');
  const app  = document.getElementById('cta-applied');
  const pend = document.getElementById('cta-pending');
  const acc  = document.getElementById('cta-accepted-info');
  if (!def) return;
  const isAccepted = detailMode === 'accepted';
  const isPending  = detailMode === 'applied';
  def.style.display  = (!detailApplied && detailMode === 'normal')    ? 'block' : 'none';
  zap.style.display  = (!detailApplied && detailMode === 'zapytania') ? 'flex'  : 'none';
  app.style.display  = (detailApplied && !isAccepted && !isPending)   ? 'block' : 'none';
  if (pend) pend.style.display = isPending  ? 'flex' : 'none';
  if (acc)  acc.style.display  = isAccepted ? 'flex' : 'none';
}

const OVERLAY_EXEMPT = ['s-chat', 's-profile', 's-activity'];

window.go = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 's-detail') { detailMode = 'normal'; detailApplied = false; updateDetailCTA(); }
  // offline overlay logic
  const ov = document.getElementById('offline-overlay');
  if (ov) {
    if (!profileSearching && !OVERLAY_EXEMPT.includes(id)) {
      ov.classList.add('show');
    } else {
      ov.classList.remove('show');
    }
  }
};

window.goDetail = (mode = 'normal') => {
  detailMode = mode;
  detailApplied = false;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('s-detail').classList.add('active');
  updateDetailCTA();
};

window.applyFromDetail = () => {
  detailApplied = true;
  updateDetailCTA();
};

window.confirmApplyFromDetail = () => {
  closeApplyModal();
  applyFromDetail();
  go('s-home');
  setTimeout(() => {
    showToast('🎉 Aplikacja wysłana! Trzymamy kciuki! 💜');
    const anchor = document.getElementById('home-pts-fill');
    addPoints(5, anchor);
  }, 350);
};

window.undoApply = () => {
  detailApplied = false;
  updateDetailCTA();
};

window.openApplyModal = (btn) => {
  const card = btn.closest('.jcard');

  // ── Hero background (same gradient as card) ──
  const heroBg = card?.querySelector('.jhero-bg')?.style.background || 'linear-gradient(135deg,#C8DDD0,#A8C8B8,#88B0A0)';
  document.getElementById('apply-hero').style.background = heroBg;

  // ── City + distance ──
  document.getElementById('apply-city').textContent = card?.querySelector('.jhero-city')?.textContent || '';
  document.getElementById('apply-dist').textContent = card?.querySelector('.jhero-dist')?.textContent || '';

  // ── Difficulty + pay badges ──
  const diffEl = card?.querySelector('.badge-diff');
  const payEl  = card?.querySelector('.badge-pay');
  const diffDiv = document.getElementById('apply-diff');
  diffDiv.innerHTML = '';
  if (diffEl) {
    const d = document.createElement('div');
    d.className = diffEl.className;
    d.textContent = diffEl.textContent;
    diffDiv.appendChild(d);
  }
  if (payEl) {
    const p = document.createElement('div');
    p.className = payEl.className;
    p.textContent = payEl.textContent;
    diffDiv.appendChild(p);
  }

  // ── Salary + pts ──
  const sal = card?.querySelector('.meta-sal')?.textContent || '';
  const pts = card?.querySelector('.meta-pts')?.textContent || '';
  document.getElementById('apply-sal').textContent     = sal;
  document.getElementById('apply-pts-day').textContent = pts;

  // ── Departure date ──
  const date = card?.querySelector('.meta-val')?.textContent || '';
  document.getElementById('apply-date').textContent = date.replace('📅', '').trim();

  // ── Patients — rendered just like .jpats in the card ──
  const patNodes = card?.querySelectorAll('.pat-box') || [];
  const patsHTML = [...patNodes].map(p => {
    const emoji = p.querySelector('.pat-ico')?.textContent  || '👤';
    const age   = p.querySelector('.pat-age')?.textContent  || '';
    const mob   = p.querySelector('.pat-mob')?.textContent  || '';
    return `<div class="pat-box" style="flex:1;"><div class="pat-head"><div class="pat-ico">${emoji}</div><div class="pat-age">${age}</div></div><div class="pat-mob">${mob}</div></div>`;
  }).join('');
  document.getElementById('apply-pats').innerHTML = patsHTML;

  // ── Info rows: dla / nocne / język — copy exactly from card ──
  const irows = [...(card?.querySelectorAll('.irow') || [])];
  document.getElementById('apply-infos').innerHTML = irows
    .map(r => `<div class="irow">${r.innerHTML}</div>`)
    .join('');

  document.getElementById('apply-modal').classList.add('open');
};

window.closeApplyModal = () => {
  document.getElementById('apply-modal').classList.remove('open');
};

window.confirmApply = () => {
  closeApplyModal();
  go('s-home');
  setTimeout(() => {
    showToast('🎉 Aplikacja wysłana! Trzymamy kciuki! 💜');
    const anchor = document.getElementById('home-pts-fill');
    addPoints(5, anchor);
  }, 350);
};

window.closePointsModal = () => {}; // kept for profile screen compat

window.openApplyModalDetail = () => {
  // Hero — Baden-Württemberg warm tones
  document.getElementById('apply-hero').style.background = 'linear-gradient(135deg,#D0C8F0,#B0A8E0,#9090C8)';
  document.getElementById('apply-city').textContent  = 'Konstanz';
  document.getElementById('apply-dist').textContent  = '📍 ~680 km od Ciebie';

  // Badges
  const diffDiv = document.getElementById('apply-diff');
  diffDiv.innerHTML = '<div class="badge-diff diff-med">🔶 Średnie</div>';

  // Salary
  document.getElementById('apply-sal').textContent      = '€ 2.410';
  document.getElementById('apply-pts-day').textContent  = '⭐ 10 pkt / dzień';
  document.getElementById('apply-date').textContent     = '12.04.2026';

  // Patient
  document.getElementById('apply-pats').innerHTML =
    `<div class="pat-box" style="flex:1;max-width:calc(50% - 4px);">
      <div class="pat-ico">👵</div>
      <div class="pat-age">81 lat</div>
      <div class="pat-mob">mobilna</div>
    </div>`;

  // Info rows
  document.getElementById('apply-infos').innerHTML =
    `<div class="irow"><span class="iico">👤</span><span>dla: <b>opiekuna lub opiekunki</b></span></div>
     <div class="irow"><span class="iico">🌙</span><span>Nocne: <b>~1–2×/tydz.</b></span></div>
     <div class="irow"><span class="iico">🇩🇪</span><span>Język: <b>dobry</b></span></div>`;

  // Override confirm to also mark detail CTA
  document.querySelector('#apply-modal .btn-confirm').onclick = confirmApplyFromDetail;
  document.getElementById('apply-modal').classList.add('open');
};

window.showToast = (msg) => {
  const t = document.getElementById('toast');
  if (msg) t.textContent = msg;
  t.style.display = 'flex'; t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => { t.style.display = 'none'; }, 300);
  }, 3000);
};

function applySearchingUI(on) {
  const tog  = document.getElementById('search-toggle');
  const knob = document.getElementById('search-knob');
  const txt  = document.getElementById('search-status-text');
  const dot  = document.getElementById('search-status-dot');
  if (on) {
    if (tog)  tog.style.background  = '#00C07A';
    if (knob) knob.style.left       = '20px';
    if (txt)  { txt.style.color = 'var(--text-2)'; txt.textContent = 'Aktywna'; }
    if (dot)  dot.style.background = '#00C07A';
  } else {
    if (tog)  tog.style.background  = '#C5B8D0';
    if (knob) knob.style.left       = '2px';
    if (txt)  { txt.style.color = 'var(--text-3)'; txt.textContent = 'Nieaktywna'; }
    if (dot)  dot.style.background = '#C5B8D0';
  }
}

window.toggleSearching = () => {
  if (profileSearching) {
    // show confirmation modal — don't turn off yet
    document.getElementById('offline-modal').classList.add('open');
  } else {
    reactivateSearch();
  }
};

window.closeOfflineModal = () => {
  document.getElementById('offline-modal').classList.remove('open');
};

window.confirmOffline = () => {
  profileSearching = false;
  applySearchingUI(false);
  closeOfflineModal();
  const ov = document.getElementById('offline-overlay');
  if (ov) ov.classList.add('show');
};

window.reactivateSearch = () => {
  profileSearching = true;
  applySearchingUI(true);
  const ov = document.getElementById('offline-overlay');
  if (ov) ov.classList.remove('show');
  go('s-home');
};

window.openSheet      = () => { document.getElementById('overlay').classList.add('open'); document.getElementById('sheet').classList.add('open'); };
window.closeSheet     = () => { document.getElementById('overlay').classList.remove('open'); document.getElementById('sheet').classList.remove('open'); };

// ── CALENDAR ──────────────────────────────────────
const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
let calYear, calMonth, calSelected;

function calRender() {
  const today   = new Date(); today.setHours(0,0,0,0);
  const label   = document.getElementById('cal-month-label');
  const grid    = document.getElementById('cal-grid');
  if (!label || !grid) return;
  label.textContent = `${MONTHS_PL[calMonth]} ${calYear}`;

  // first day of month (0=Sun…6=Sat) → convert to Mon-based (0=Mon…6=Sun)
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDow; i++) html += `<div class="cal-day cal-empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const date  = new Date(calYear, calMonth, d);
    const isPast    = date < today;
    const isToday   = date.getTime() === today.getTime();
    const isSel     = calSelected && date.getTime() === calSelected.getTime();
    let cls = 'cal-day';
    if (isPast)  cls += ' cal-past';
    if (isToday) cls += ' cal-today';
    if (isSel)   cls += ' cal-selected';
    const onclick = isPast ? '' : `onclick="calSelect(${d})"`;
    html += `<div class="${cls}" ${onclick}>${d}</div>`;
  }
  grid.innerHTML = html;
}

window.openCalModal = () => {
  const today = new Date(); today.setHours(0,0,0,0);
  // parse current pill value
  const valEl = document.getElementById('date-pill-val');
  const parts = valEl ? valEl.textContent.split('.') : [];
  if (parts.length === 3) {
    calSelected = new Date(+parts[2], +parts[1]-1, +parts[0]);
    calSelected.setHours(0,0,0,0);
    if (calSelected < today) calSelected = null;
  } else { calSelected = null; }
  calYear  = calSelected ? calSelected.getFullYear()  : today.getFullYear();
  calMonth = calSelected ? calSelected.getMonth()     : today.getMonth();
  calRender();
  document.getElementById('cal-modal').classList.add('open');
};

window.closeCalModal = () => { document.getElementById('cal-modal').classList.remove('open'); };

window.calNav = (dir) => {
  calMonth += dir;
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  calRender();
};

window.calSelect = (d) => {
  calSelected = new Date(calYear, calMonth, d);
  calRender();
};

window.calConfirm = () => {
  if (!calSelected) { closeCalModal(); return; }
  const dd = String(calSelected.getDate()).padStart(2,'0');
  const mm = String(calSelected.getMonth()+1).padStart(2,'0');
  const yy = calSelected.getFullYear();
  const str = `${dd}.${mm}.${yy}`;
  const valEl = document.getElementById('date-pill-val');
  if (valEl) valEl.textContent = str;
  // update outdated state
  const pill = document.getElementById('date-pill');
  const warn = document.getElementById('date-pill-warn');
  const icon = document.getElementById('date-pill-icon');
  const today = new Date(); today.setHours(0,0,0,0);
  const isOutdated = calSelected < today;
  if (pill) pill.classList.toggle('outdated', isOutdated);
  if (warn) warn.style.display = isOutdated ? 'inline' : 'none';
  if (icon) icon.setAttribute('stroke', isOutdated ? '#CC6600' : 'var(--text-3)');
  closeCalModal();
};
window.openPhotoModal  = () => { document.getElementById('photo-modal').classList.add('open'); };
window.closePhotoModal = () => { document.getElementById('photo-modal').classList.remove('open'); };
window.openPointsModal = () => { document.getElementById('apply-success-modal').classList.add('open'); };
window.closePointsModal= () => { document.getElementById('apply-success-modal').classList.remove('open'); };
window.changeWyn      = (d) => {
  wynVal = Math.max(1000, Math.min(5000, wynVal + d));
  const inp = document.getElementById('wyn-val-input');
  if (inp) inp.value = wynVal;
};
window.toggleChip     = (el) => { el.classList.toggle('on'); };
window.toggleSingle   = (el) => { el.closest('.tchips').querySelectorAll('.tchip').forEach(c => c.classList.remove('on')); el.classList.add('on'); };

window.withdrawApply = () => {
  detailMode = 'normal';
  detailApplied = false;
  updateDetailCTA();
  const t = document.getElementById('toast');
  if (t) {
    t.style.display = 'flex'; t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    const orig = t.querySelector('span') || t;
    const prev = orig.textContent;
    if (t.querySelector('span')) t.querySelector('span').textContent = 'Aplikacja cofnięta';
    setTimeout(() => {
      t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => { t.style.display = 'none'; if (t.querySelector('span')) t.querySelector('span').textContent = prev; }, 300);
    }, 2000);
  }
  go('s-activity');
};

window.histReturnAnswer = (ans) => {
  document.getElementById('hist-return-btns').style.display = 'none';
  const txt = document.getElementById('hist-return-thanks-txt');
  const box = document.getElementById('hist-return-thanks');
  txt.textContent = ans === 'yes'
    ? '✓ Super! Twoja rekruterka dostanie tę informację i wróci do Ciebie.'
    : '✓ Rozumiem. Damy Ci znać o nowych zleceniach.';
  box.style.display = 'block';
};

window.returnAnswer = (ans) => {
  document.getElementById('return-btns').style.display = 'none';
  const txt = document.getElementById('return-thanks-txt');
  const box = document.getElementById('return-thanks');
  txt.textContent = ans === 'yes'
    ? '✓ Super! Twoja rekruterka dostanie tę informację i wróci do Ciebie.'
    : '✓ Rozumiem. Damy Ci znać o nowych zleceniach.';
  box.style.display = 'block';
};

window.actTab = (n) => {
  document.querySelectorAll('.act-tab').forEach((t, i) => t.classList.toggle('on', i === n));
  document.getElementById('act-panel-0').style.display = n === 0 ? 'block' : 'none';
  document.getElementById('act-panel-1').style.display = n === 1 ? 'block' : 'none';
};

window.toggleRejected = () => {
  const list = document.getElementById('rejected-list');
  const chev = document.getElementById('rejected-chev');
  const isOpen = list.style.display !== 'none';
  list.style.display = isOpen ? 'none' : 'flex';
  if (chev) chev.style.transform = isOpen ? '' : 'rotate(180deg)';
};

window.toggleDet = (hdr) => {
  const body = hdr.nextElementSibling;
  const chev = hdr.querySelector('.chevron');
  body.classList.toggle('open');
  if (chev) chev.classList.toggle('open');
};

// Check if availability date is outdated
(function() {
  const pill = document.getElementById('date-pill');
  const warn = document.getElementById('date-pill-warn');
  const icon = document.getElementById('date-pill-icon');
  if (!pill) return;
  const valEl = document.getElementById('date-pill-val');
  const dateStr = valEl ? valEl.textContent : '';
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const d = new Date(parts[2], parts[1] - 1, parts[0]);
    const isOutdated = d < new Date();
    pill.classList.toggle('outdated', isOutdated);
    if (warn) warn.style.display = isOutdated ? 'inline' : 'none';
    if (icon) icon.setAttribute('stroke', isOutdated ? '#CC6600' : 'var(--text-3)');
  }
})();

document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn-apply, .btn-confirm');
  if (!btn) return;
  const r = btn.getBoundingClientRect(); const sz = Math.max(r.width, r.height);
  const rpl = document.createElement('span'); rpl.className = 'ripple';
  rpl.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz/2}px;top:${e.clientY - r.top - sz/2}px;`;
  btn.appendChild(rpl); setTimeout(() => rpl.remove(), 600);
});
