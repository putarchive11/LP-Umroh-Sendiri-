const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ================= DATA ================= */
const editions = [
  {
    id: "paperback",
    name: "Paperback",
    cover: "cover-ivory",
    depth: 0.16,
    price: "Rp129.000",
    oldPrice: "Rp149.000",
    perks: [
      "412 halaman, kertas bookpaper",
      "Tanda tangan penulis (pre-order)",
      "Kode audiobook gratis",
    ],
  },
  {
    id: "hardcover",
    name: "Hardcover",
    cover: "cover-midnight",
    depth: 0.2,
    price: "Rp189.000",
    oldPrice: "Rp229.000",
    featured: true,
    perks: [
      "Sampul keras dengan foil emas",
      "Pembatas buku pita satin",
      "Tanda tangan + kode audiobook",
      "Poster peta Kotagede A3",
    ],
  },
  {
    id: "collector",
    name: "Collector",
    cover: "cover-crimson",
    depth: 0.24,
    price: "Rp349.000",
    oldPrice: "Rp399.000",
    perks: [
      "Edisi bernomor, terbatas 500 eks",
      "Pinggir halaman sprayed-edge",
      "Kain tenun lurik mini asli",
      "Semua bonus edisi Hardcover",
    ],
  },
];

// Each leaf has a front (right page) and a back (left page after flipping).
const leaves = [
  {
    front: { type: "cover" },
    back: {
      html: `<p style="margin-top:40%;text-align:center;font-style:italic">
        Untuk Ibu,<br/>yang mengajariku bahwa<br/>setiap simpul adalah doa.</p>`,
    },
  },
  {
    front: {
      html: `<span class="chapter">Bab Satu</span>
        <h4>Simpul Pertama</h4>
        <p class="drop">Malam itu alat tenun Nenek berbunyi sendiri. Laras berdiri
        di ambang pintu, memandangi benang merah yang bergerak tanpa tangan,
        menyusup di antara lungsin seperti ular kecil yang tahu jalan pulang.</p>
        <p>Ia ingin berteriak, tetapi yang keluar hanya bisikan nama neneknya
        — nama yang sudah tiga tahun tak pernah ia ucapkan.</p>`,
      folio: 1,
    },
    back: {
      html: `<p>Kain itu terus tumbuh. Motif yang muncul bukan lurik biasa: ada
        gambar pasar, sebuah gerbang tua, dan seorang perempuan yang memegang
        lentera. Laras mengenali wajah itu dari foto hitam-putih di lemari.</p>
        <p>“Nenek,” katanya lagi, kali ini lebih keras. Alat tenun berhenti.
        Keheningan jatuh seperti selimut basah.</p>
        <p>Di atas kain, di sudut paling bawah, tertenun sebuah tanggal:
        <i>12 Sura 1740</i>.</p>`,
      folio: 2,
    },
  },
  {
    front: {
      html: `<p>Ia menyentuh benang itu. Seketika udara berubah — bau kayu
        cendana, suara gamelan dari kejauhan, dan dingin tanah basah di
        telapak kakinya.</p>
        <p>Rumah Nenek lenyap. Di hadapannya berdiri gerbang tua yang sama
        persis dengan yang ada di kain, lengkap dengan lentera yang bergoyang
        pelan tertiup angin malam.</p>
        <p>Dan perempuan itu menoleh, seolah sudah menunggunya selama dua
        ratus tahun.</p>`,
      folio: 3,
    },
    back: {
      html: `<p>“Kau terlambat,” kata perempuan itu. Suaranya tenang, tapi
        matanya menyimpan badai. “Benangnya sudah mulai putus.”</p>
        <p>Laras mundur selangkah. “Siapa kamu?”</p>
        <p>Perempuan itu tersenyum tipis, lalu mengangkat lenteranya hingga
        cahayanya jatuh ke wajah Laras.</p>
        <p>“Aku yang pertama menenun waktu. Dan kau, Nak, adalah yang
        terakhir.”</p>`,
      folio: 4,
    },
  },
  {
    front: {
      html: `<p style="margin-top:30%;text-align:center;font-size:1.25em;font-style:italic">
        “Setiap helai benang menyimpan satu masa lalu. Jangan pernah menarik
        yang bukan milikmu.”</p>
        <p style="text-align:center;margin-top:1.5em" class="chapter">— Petuah Penenun</p>`,
      folio: 5,
    },
    back: {
      type: "end",
      html: `<span class="chapter" style="color:var(--gold-light)">Akhir Cuplikan</span>
        <h4>Ingin tahu kelanjutannya?</h4>
        <p>407 halaman lagi menunggumu.</p>
        <a href="#edisi" class="btn btn-gold">Pesan Sekarang</a>`,
    },
  },
];

/* ================= HELPERS ================= */
function coverMarkup(extraClass = "") {
  return `
    <div class="cover ${extraClass}">
      <div class="cover-frame">
        <span class="cover-kicker">Sebuah Novel</span>
        <svg class="cover-thread" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="44" />
          <circle cx="60" cy="60" r="30" />
          <path d="M10 60 C 35 20, 85 100, 110 60" />
          <path d="M60 10 C 20 35, 100 85, 60 110" />
        </svg>
        <h2 class="cover-title">Benang<br />Waktu</h2>
        <span class="cover-author">Ardhana Kirana</span>
      </div>
    </div>`;
}

function bookMarkup(coverClass, depthRatio) {
  return `
    <div class="book3d" style="--d: calc(var(--w) * ${depthRatio})">
      <div class="b-face b-front">
        ${coverMarkup(coverClass)}
        <div class="cover-inside"><p>Benang Waktu</p></div>
      </div>
      <div class="b-face b-first-page"></div>
      <div class="b-face b-back ${coverClass}"></div>
      <div class="b-face b-spine ${coverClass}">
        <span>BENANG WAKTU</span><small>W</small>
      </div>
      <div class="b-face b-pages b-pages-right"></div>
      <div class="b-face b-pages b-pages-top"></div>
      <div class="b-face b-pages b-pages-bottom"></div>
    </div>`;
}

const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* ================= NAV ================= */
const nav = document.getElementById("nav");
const navLinks = document.getElementById("navLinks");
const navToggle = document.getElementById("navToggle");

window.addEventListener(
  "scroll",
  () => nav.classList.toggle("scrolled", window.scrollY > 20),
  { passive: true },
);

navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") navLinks.classList.remove("open");
});

/* ================= HERO 3D BOOK ================= */
const heroStage = document.getElementById("heroStage");
const heroRig = document.getElementById("heroRig");
const heroBook = document.getElementById("heroBook");
const openBookBtn = document.getElementById("openBookBtn");

const rig = {
  rx: -8,
  ry: -30,
  targetRx: -8,
  targetRy: -30,
  dragging: false,
  lastX: 0,
  lastY: 0,
  idleSince: performance.now(),
};

heroStage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  rig.dragging = true;
  rig.lastX = event.clientX;
  rig.lastY = event.clientY;
  heroStage.classList.add("dragging");
  heroStage.setPointerCapture(event.pointerId);
});

heroStage.addEventListener("pointermove", (event) => {
  if (!rig.dragging) return;
  rig.targetRy += (event.clientX - rig.lastX) * 0.5;
  rig.targetRx = Math.max(
    -40,
    Math.min(40, rig.targetRx - (event.clientY - rig.lastY) * 0.3),
  );
  rig.lastX = event.clientX;
  rig.lastY = event.clientY;
});

function endDrag() {
  if (!rig.dragging) return;
  rig.dragging = false;
  rig.idleSince = performance.now();
  heroStage.classList.remove("dragging");
}

heroStage.addEventListener("pointerup", endDrag);
heroStage.addEventListener("pointercancel", endDrag);

openBookBtn.addEventListener("click", () => {
  const isOpen = heroBook.classList.toggle("open");
  openBookBtn.textContent = isOpen ? "Tutup Sampul" : "Buka Sampul";
  // Face the reader so the first page is visible.
  if (isOpen) {
    rig.targetRx = -6;
    rig.targetRy = Math.round(rig.targetRy / 360) * 360 + 18;
  }
  rig.idleSince = performance.now();
});

function animateRig(now) {
  const idle = !rig.dragging && now - rig.idleSince > 2500;

  if (idle && !prefersReducedMotion) {
    // Gentle sway around the nearest resting angle.
    const base = Math.round((rig.targetRy + 30) / 360) * 360 - 30;
    const sway = heroBook.classList.contains("open") ? 48 : 0;
    const swayTarget = base + sway + Math.sin(now / 1800) * 14;
    rig.targetRy += (swayTarget - rig.targetRy) * 0.02;
    rig.targetRx += (-8 - rig.targetRx) * 0.02;
  }

  // Tilt slightly as the hero scrolls away.
  const scrollTilt = Math.min(window.scrollY, 600) * 0.03;

  rig.rx += (rig.targetRx - rig.rx) * 0.12;
  rig.ry += (rig.targetRy - rig.ry) * 0.12;

  heroRig.style.setProperty("--rx", `${rig.rx + scrollTilt}deg`);
  heroRig.style.setProperty("--ry", `${rig.ry}deg`);

  requestAnimationFrame(animateRig);
}

requestAnimationFrame(animateRig);

/* ================= FLIPBOOK ================= */
const flipbook = document.getElementById("flipbook");
const flipPrev = document.getElementById("flipPrev");
const flipNext = document.getElementById("flipNext");
const flipStatus = document.getElementById("flipStatus");
let currentLeaf = 0; // number of leaves already flipped

function sideMarkup(side, face) {
  if (side.type === "cover") {
    return `<div class="leaf-side leaf-${face} leaf-cover">${coverMarkup("cover-midnight")}</div>`;
  }
  if (side.type === "end") {
    return `<div class="leaf-side leaf-${face} leaf-end cover-midnight">${side.html}</div>`;
  }
  const folio = side.folio ? `<span class="folio">${side.folio}</span>` : "";
  return `<div class="leaf-side leaf-${face}">${side.html}${folio}</div>`;
}

function buildFlipbook() {
  flipbook.innerHTML = "";

  leaves.forEach((leaf, index) => {
    const node = document.createElement("div");
    node.className = "leaf";
    node.innerHTML = sideMarkup(leaf.front, "front") + sideMarkup(leaf.back, "back");

    node.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      if (index === currentLeaf) flipTo(currentLeaf + 1);
      else if (index === currentLeaf - 1) flipTo(currentLeaf - 1);
    });

    flipbook.appendChild(node);
  });

  updateFlipbook();
}

function updateFlipbook() {
  const nodes = flipbook.querySelectorAll(".leaf");
  const total = nodes.length;

  nodes.forEach((node, index) => {
    const flipped = index < currentLeaf;
    node.classList.toggle("flipped", flipped);
    // Flipped leaves stack left (latest on top), unflipped stack right (first on top).
    node.style.zIndex = flipped ? index + 1 : total - index;
  });

  flipbook.classList.toggle("at-start", currentLeaf === 0);
  flipbook.classList.toggle("at-end", currentLeaf === total);

  flipPrev.disabled = currentLeaf === 0;
  flipNext.disabled = currentLeaf === total;

  if (currentLeaf === 0) flipStatus.textContent = "Sampul";
  else if (currentLeaf === total) flipStatus.textContent = "Akhir cuplikan";
  else flipStatus.textContent = `Halaman ${currentLeaf * 2 - 2 || "i"} – ${currentLeaf * 2 - 1}`;
}

let flipTimer;

function flipTo(target) {
  const total = leaves.length;
  if (target < 0 || target > total) return;

  // Keep the moving leaf above everything during its turn.
  const moving = flipbook.children[Math.min(currentLeaf, target)];
  currentLeaf = target;
  updateFlipbook();
  moving.style.zIndex = 100;
  clearTimeout(flipTimer);
  flipTimer = setTimeout(updateFlipbook, 1000);
}

flipPrev.addEventListener("click", () => flipTo(currentLeaf - 1));
flipNext.addEventListener("click", () => flipTo(currentLeaf + 1));

document.addEventListener("keydown", (event) => {
  const rect = flipbook.getBoundingClientRect();
  const inView = rect.top < window.innerHeight && rect.bottom > 0;
  if (!inView) return;
  if (event.key === "ArrowRight") flipTo(currentLeaf + 1);
  if (event.key === "ArrowLeft") flipTo(currentLeaf - 1);
});

buildFlipbook();

/* ================= EDITIONS ================= */
const editionGrid = document.getElementById("editionGrid");

editions.forEach((edition) => {
  const card = document.createElement("article");
  card.className = `edition tilt-card reveal${edition.featured ? " featured" : ""}`;

  card.innerHTML = `
    ${edition.featured ? '<span class="edition-badge">Terlaris</span>' : ""}
    <div class="edition-stage">${bookMarkup(edition.cover, edition.depth)}</div>
    <div class="edition-body">
      <h3>${edition.name}</h3>
      <div class="price">${edition.price}<small>${edition.oldPrice}</small></div>
      <ul>${edition.perks.map((perk) => `<li>${perk}</li>`).join("")}</ul>
      <button class="btn ${edition.featured ? "btn-gold" : "btn-ghost"}">
        Pesan ${edition.name}
      </button>
    </div>
  `;

  card.querySelector("button").addEventListener("click", () => {
    showToast(`✦ Edisi ${edition.name} ditambahkan ke keranjang`);
  });

  editionGrid.appendChild(card);
});

/* ================= TILT CARDS ================= */
const canHover = window.matchMedia("(hover: hover)").matches;

if (canHover && !prefersReducedMotion) {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
      card.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* ================= SCROLL REVEAL ================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".reveal").forEach((node, index) => {
  node.style.transitionDelay = `${(index % 4) * 80}ms`;
  revealObserver.observe(node);
});

/* ================= GOLD DUST BACKGROUND ================= */
const canvas = document.getElementById("dust");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.round(Math.min(90, window.innerWidth / 16));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: Math.random() * 0.8 + 0.2, // depth: closer particles are bigger & faster
    drift: Math.random() * Math.PI * 2,
  }));
}

function drawDust(now) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((p) => {
    p.y -= p.z * 0.25;
    p.x += Math.sin(now / 3000 + p.drift) * 0.15 * p.z;
    if (p.y < -10) {
      p.y = window.innerHeight + 10;
      p.x = Math.random() * window.innerWidth;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.z * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(236, 211, 160, ${p.z * 0.45})`;
    ctx.fill();
  });

  requestAnimationFrame(drawDust);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
if (!prefersReducedMotion) requestAnimationFrame(drawDust);
