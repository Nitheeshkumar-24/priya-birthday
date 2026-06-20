// ===== CLOUD SCENE =====
const CLOUD_COUNT = 14;
let cloudsRemaining = CLOUD_COUNT;

const cloudColors = [
  ['#e8e4f0', '#b8b0d8'],
  ['#f0e4ee', '#d4b8d0'],
  ['#dce4f0', '#aab8d8'],
  ['#ece8e0', '#c8c0a8'],
  ['#e0e8e8', '#a8c0c0'],
];

function spawnStars() {
  const layer = document.getElementById('stars-layer');
  if (!layer) return;
  const count = 90;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = (Math.random() * 2 + 0.8).toFixed(1);
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = (Math.random() * 100) + '%';
    star.style.top = (Math.random() * 70) + '%';
    star.style.animationDuration = (2 + Math.random() * 3).toFixed(1) + 's';
    star.style.animationDelay = (Math.random() * 4).toFixed(1) + 's';
    layer.appendChild(star);
  }
}

function makeCloudSVG(w, h, colorPair) {
  const [c1, c2] = colorPair;
  return `<svg width="${w}" height="${h}" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </radialGradient>
    </defs>
    <g filter="url(#shadow)">
      <ellipse cx="100" cy="80" rx="90" ry="38" fill="url(#cg)" stroke="rgba(200,200,255,0.3)" stroke-width="1"/>
      <ellipse cx="70" cy="65" rx="52" ry="42" fill="url(#cg)" stroke="rgba(200,200,255,0.2)" stroke-width="1"/>
      <ellipse cx="120" cy="62" rx="46" ry="40" fill="url(#cg)" stroke="rgba(200,200,255,0.2)" stroke-width="1"/>
      <ellipse cx="95" cy="52" rx="38" ry="36" fill="url(#cg)"/>
    </g>
  </svg>`;
}

function spawnClouds() {
  const container = document.getElementById('clouds-container');
  container.innerHTML = '';

  // Build a grid that fully tiles the viewport (cols x rows), each cell
  // gets one cloud with slight random jitter so it still looks natural
  // but guarantees 100% screen coverage with no gaps.
  const COLS = 5;
  const ROWS = 4;
  const cellW = 100 / COLS;
  const cellH = 100 / ROWS;

  let cloudIndex = 0;
  const allClouds = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const jitterX = (Math.random() - 0.5) * cellW * 0.4;
      const jitterY = (Math.random() - 0.5) * cellH * 0.4;
      const x = c * cellW + jitterX - 4; // -4 to overlap edges, avoid gaps
      const y = r * cellH + jitterY - 4;
      const w = cellW * 13 + 40; // oversize so clouds overlap and cover fully
      const h = cellH * 13 + 30;

      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.style.left = x + '%';
      cloud.style.top = y + '%';
      cloud.style.width = w + 'px';
      cloud.style.zIndex = (r + c) % 2 === 0 ? 3 : 2;
      cloud.style.opacity = (0.92 + Math.random() * 0.08).toFixed(2);

      const colorPair = cloudColors[cloudIndex % cloudColors.length];
      cloud.innerHTML = makeCloudSVG(w, h, colorPair);

      // Very subtle drift so it feels alive but never opens gaps
      const driftDur = (18 + Math.random() * 10).toFixed(1);
      const driftDelay = (Math.random() * 6).toFixed(1);
      cloud.style.animation = `cloudDrift ${driftDur}s ease-in-out ${driftDelay}s infinite alternate`;

      cloud.addEventListener('click', (e) => popCloud(cloud, e));
      container.appendChild(cloud);
      allClouds.push(cloud);
      cloudIndex++;
    }
  }

  cloudsRemaining = allClouds.length;

  // Inject subtle drift keyframes (small movement only, no gaps revealed)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cloudDrift {
      0%   { transform: translate(0, 0) scale(1); }
      50%  { transform: translate(4px, -4px) scale(1.01); }
      100% { transform: translate(-3px, 3px) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

function popCloud(cloud, event) {
  if (cloud.classList.contains('pop')) return;
  cloud.classList.add('pop');
  cloud.style.pointerEvents = 'none';

  // Determine whether this cloud is left-of-center or right-of-center
  // so it flies outward toward that side, parting like curtains.
  const rect = cloud.getBoundingClientRect();
  const cloudCenterX = rect.left + rect.width / 2;
  const screenCenterX = window.innerWidth / 2;
  const goingRight = cloudCenterX >= screenCenterX;

  const flyDistance = window.innerWidth * 0.9;
  const tx = goingRight ? flyDistance : -flyDistance;
  const rot = goingRight ? 25 : -25;

  cloud.style.setProperty('--fly-x', tx + 'px');
  cloud.style.setProperty('--fly-rot', rot + 'deg');
  cloud.style.animation = 'cloudPartFly 0.6s cubic-bezier(0.4,0,0.6,1) forwards';

  // Spawn pop particles
  spawnParticles(cloud);

  cloud.addEventListener('animationend', () => {
    cloud.remove();
    cloudsRemaining--;
    if (cloudsRemaining <= 0) {
      setTimeout(showCardScreen, 300);
    }
  }, { once: true });
}

function spawnParticles(cloud) {
  const rect = cloud.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#ff6b9d', '#ffd700', '#a8edea', '#ff9a9e', '#b8f4b8', '#c3b1e1'];

  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    const angle = (i / 8) * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    p.style.cssText = `
      position: fixed;
      left: ${cx}px; top: ${cy}px;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      transition: transform 0.5s ease-out, opacity 0.5s ease-out;
    `;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 500);
  }
}

// ===== CARD SCREEN =====
function showCardScreen() {
  const cloudScreen = document.getElementById('cloud-screen');
  cloudScreen.style.transition = 'opacity 0.8s ease';
  cloudScreen.style.opacity = '0';
  setTimeout(() => {
    cloudScreen.classList.add('hidden');
    const cardScreen = document.getElementById('card-screen');
    cardScreen.classList.remove('hidden');
    document.getElementById('photobook-btn').classList.remove('hidden');
    spawnConfetti();
  }, 800);
}

function spawnConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#e91e8c', '#f7b733', '#e8b4bc', '#a8275f', '#fff3c4', '#ff9a76', '#c9a8e0'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 4) + 's';
    piece.style.animationDelay = (Math.random() * 5) + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (8 + Math.random() * 10) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.opacity = (0.7 + Math.random() * 0.3).toString();
    container.appendChild(piece);
  }
}

// ===== ENVELOPE =====
function openEnvelope() {
  const env = document.getElementById('envelope');
  if (env.classList.contains('open')) return;
  env.classList.add('open');
  env.style.pointerEvents = 'none';

  // After envelope opens, show letter
  setTimeout(showLetterScreen, 700);
}

// ===== LETTER SCREEN =====
const FLOAT_EMOJIS = ['🎂','🎉','🌹','✨','💖','🎈','🌟','💌','🥳','🎊','💕','🌸','🦋','🍰','🎁'];

function showLetterScreen() {
  document.getElementById('card-screen').classList.add('hidden');
  const ls = document.getElementById('letter-screen');
  ls.classList.remove('hidden');
  spawnFloatingEmojis();
}

function spawnFloatingEmojis() {
  const container = document.getElementById('floating-emojis');
  container.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'float-emoji';
    el.textContent = FLOAT_EMOJIS[i % FLOAT_EMOJIS.length];
    el.style.left = (2 + Math.random() * 94) + '%';
    el.style.animationDuration = (6 + Math.random() * 8) + 's';
    el.style.animationDelay = (Math.random() * 8) + 's';
    el.style.fontSize = (1.2 + Math.random() * 1.2) + 'rem';
    container.appendChild(el);
  }
}

function backToCard() {
  document.getElementById('letter-screen').classList.add('hidden');
  const cs = document.getElementById('card-screen');
  cs.classList.remove('hidden');
  // Reset envelope
  const env = document.getElementById('envelope');
  env.classList.remove('open');
  env.style.pointerEvents = '';
}

// ===== PHOTO BOOK =====
const TOTAL_PHOTOS = 18;
const PHOTOS_PER_SPREAD = 2;

// Build pages data: cover + 9 spreads (18 photos)
// currentPage: 0 = cover, 1..9 = spreads
let currentSpread = 0;

// Total spreads = cover (0) + ceil(TOTAL_PHOTOS / 2) = 10 spreads (0-9)
const totalSpreads = 1 + Math.ceil(TOTAL_PHOTOS / PHOTOS_PER_SPREAD); // 10

function buildSpread(index) {
  const spread = document.getElementById('book-spread');
  spread.innerHTML = '';

  if (index === 0) {
    // Cover
    spread.innerHTML = `
      <div class="book-page book-cover">
        <div class="cover-shimmer"></div>
        <div class="cover-content">
          <span class="cover-emoji">📸</span>
          <h2>Our Memories</h2>
          <div class="cover-divider"></div>
          <p>Priyadarshini's Birthday Album</p>
          <p class="cover-tag">21st Birthday Special</p>
        </div>
      </div>
      <div class="book-spine"></div>
      <div class="book-page right-page cover-quote-page">
        <div class="cover-quote-content">
          <span class="quote-mark">&ldquo;</span>
          <p class="cover-quote-text">
            Every picture tells a story,<br>and every story with you<br>is my favorite one.
          </p>
        </div>
      </div>
    `;
    return;
  }

  // Photo spread
  const leftPhotoIdx = (index - 1) * 2;
  const rightPhotoIdx = leftPhotoIdx + 1;

  function photoSlot(photoIdx) {
    if (photoIdx >= TOTAL_PHOTOS) {
      return `<div style="display:flex;align-items:center;justify-content:center;flex:1;color:#ddd;font-size:2rem;">🌸</div>`;
    }
    const imgSrc = `/static/images/photo${photoIdx + 1}.jpg`;
    return `
      <div class="photo-frame">
        <img src="${imgSrc}"
             alt="Memory ${photoIdx + 1}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="photo-placeholder" style="display:none; position:absolute; inset:0;">
          <span class="icon">📷</span>
          <span>Photo ${photoIdx + 1}</span>
          <span style="font-size:0.65rem; color:#ccc;">Add photo${photoIdx + 1}.jpg</span>
        </div>
      </div>
      <div class="photo-caption">Memory #${photoIdx + 1}</div>
    `;
  }

  spread.innerHTML = `
    <div class="book-page left-page">
      ${photoSlot(leftPhotoIdx)}
      <div class="page-number">${leftPhotoIdx + 1}</div>
    </div>
    <div class="book-spine"></div>
    <div class="book-page right-page">
      ${rightPhotoIdx < TOTAL_PHOTOS ? photoSlot(rightPhotoIdx) : `<div style="display:flex;align-items:center;justify-content:center;flex:1;"><span style="font-size:3rem;">💖</span></div>`}
      ${rightPhotoIdx < TOTAL_PHOTOS ? `<div class="page-number">${rightPhotoIdx + 1}</div>` : ''}
    </div>
  `;
}

function openPhotoBook() {
  document.getElementById('photobook-modal').classList.remove('hidden');
  currentSpread = 0;
  buildSpread(0);
  updateIndicator();
}

function closePhotoBook() {
  document.getElementById('photobook-modal').classList.add('hidden');
}

function nextPage() {
  if (currentSpread >= totalSpreads - 1) return;
  const spread = document.getElementById('book-spread');
  spread.style.animation = 'none';
  spread.classList.add('page-flip-out-left');
  setTimeout(() => {
    spread.classList.remove('page-flip-out-left');
    currentSpread++;
    buildSpread(currentSpread);
    spread.classList.add('page-flip-in-right');
    setTimeout(() => spread.classList.remove('page-flip-in-right'), 350);
    updateIndicator();
  }, 280);
}

function prevPage() {
  if (currentSpread <= 0) return;
  const spread = document.getElementById('book-spread');
  spread.classList.add('page-flip-out-right');
  setTimeout(() => {
    spread.classList.remove('page-flip-out-right');
    currentSpread--;
    buildSpread(currentSpread);
    spread.classList.add('page-flip-in-left');
    setTimeout(() => spread.classList.remove('page-flip-in-left'), 350);
    updateIndicator();
  }, 280);
}

function updateIndicator() {
  const indicator = document.getElementById('pb-indicator');
  if (currentSpread === 0) {
    indicator.textContent = 'Cover';
  } else {
    indicator.textContent = `Spread ${currentSpread} of ${totalSpreads - 1}`;
  }
  document.getElementById('pb-prev').style.opacity = currentSpread === 0 ? '0.3' : '1';
  document.getElementById('pb-next').style.opacity = currentSpread === totalSpreads - 1 ? '0.3' : '1';
}

// Keyboard support for photo book
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('photobook-modal');
  if (!modal.classList.contains('hidden')) {
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === 'Escape') closePhotoBook();
  }
});

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  spawnStars();
  spawnClouds();
  initParallax();
});

function initParallax() {
  const moon = document.getElementById('moon');
  const stars = document.getElementById('stars-layer');
  const cloudScreen = document.getElementById('cloud-screen');
  if (!cloudScreen) return;

  cloudScreen.addEventListener('mousemove', (e) => {
    const xRatio = (e.clientX / window.innerWidth - 0.5);
    const yRatio = (e.clientY / window.innerHeight - 0.5);
    if (moon) moon.style.transform = `translateX(calc(-50% + ${xRatio * -14}px)) translateY(${yRatio * -10}px)`;
    if (stars) stars.style.transform = `translate(${xRatio * -8}px, ${yRatio * -6}px)`;
  });
}
