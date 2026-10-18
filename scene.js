import * as THREE from "three";

const canvas = document.getElementById("bookScene");
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Ukuran buku (satuan dunia 3D)
const W = 3; // lebar
const H = 4.2; // tinggi
const T = 0.62; // tebal total
const CT = 0.06; // tebal sampul

const GOLD_STOPS = ["#f8e3ad", "#d6a24d", "#f5d68f", "#b98331"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  GOLD_STOPS.forEach((c, i) => g.addColorStop(i / (GOLD_STOPS.length - 1), c));
  return g;
}

function spacing(ctx, px) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraphs(ctx, paragraphs, x, y, maxWidth, lineHeight, gap = lineHeight * 0.6) {
  for (const p of paragraphs) {
    for (const line of wrapLines(ctx, p, maxWidth)) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    y += gap;
  }
  return y;
}

function grain(ctx, w, h, amount, alpha) {
  const rand = seeded(11);
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rand() * alpha})`;
    ctx.fillRect(rand() * w, rand() * h, 1.6, 1.6);
  }
}

function navyBackground(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#1d335c");
  bg.addColorStop(1, "#0a1426");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 9000, 0.035);
}

function goldFrame(ctx, w, h) {
  ctx.strokeStyle = goldGradient(ctx, 0, 0, w, h);
  ctx.lineWidth = 4;
  ctx.strokeRect(44, 44, w - 88, h - 88);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(62, 62, w - 124, h - 124);
  ctx.fillStyle = goldGradient(ctx, 0, 0, w, h);
  for (const [x, y] of [
    [44, 44],
    [w - 44, 44],
    [44, h - 44],
    [w - 44, h - 44],
  ]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-11, -11, 22, 22);
    ctx.restore();
  }
}

function drawLantern(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  const metal = goldGradient(ctx, -100, -240, 100, 180);

  // Ring
  ctx.strokeStyle = metal;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, -226, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Tutup atas
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.moveTo(-72, -150);
  ctx.lineTo(72, -150);
  ctx.lineTo(28, -202);
  ctx.lineTo(-28, -202);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-96, -152, 192, 22);

  // Kaca bercahaya
  const glass = ctx.createRadialGradient(0, 30, 10, 0, 10, 170);
  glass.addColorStop(0, "#fff8dc");
  glass.addColorStop(0.35, "#ffd07a");
  glass.addColorStop(1, "rgba(230,130,40,0.75)");
  ctx.fillStyle = glass;
  ctx.fillRect(-80, -130, 160, 244);

  // Api
  ctx.save();
  ctx.shadowColor = "rgba(255,170,60,1)";
  ctx.shadowBlur = 60;
  ctx.fillStyle = "#fffdf5";
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.quadraticCurveTo(40, 25, 0, 62);
  ctx.quadraticCurveTo(-40, 25, 0, -40);
  ctx.fill();
  ctx.restore();

  // Rangka
  ctx.strokeStyle = metal;
  ctx.lineWidth = 7;
  for (const x of [-80, -27, 27, 80]) {
    ctx.beginPath();
    ctx.moveTo(x, -130);
    ctx.lineTo(x, 114);
    ctx.stroke();
  }

  // Alas
  ctx.fillStyle = metal;
  ctx.fillRect(-96, 112, 192, 22);
  ctx.beginPath();
  ctx.moveTo(-70, 134);
  ctx.lineTo(70, 134);
  ctx.lineTo(44, 170);
  ctx.lineTo(-44, 170);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Tekstur kanvas                                                      */
/* ------------------------------------------------------------------ */

const drawCover = (ctx, w, h) => {
  navyBackground(ctx, w, h);

  const rand = seeded(7);
  for (let i = 0; i < 110; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.64;
    ctx.fillStyle = `rgba(247,220,160,${0.2 + rand() * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, y, rand() * 2.2 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const glow = ctx.createRadialGradient(w / 2, 600, 10, w / 2, 600, 440);
  glow.addColorStop(0, "rgba(255,200,120,0.6)");
  glow.addColorStop(0.4, "rgba(255,170,80,0.18)");
  glow.addColorStop(1, "rgba(255,170,80,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  goldFrame(ctx, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = goldGradient(ctx, 300, 0, 724, 0);
  ctx.font = '600 28px "Inter", sans-serif';
  spacing(ctx, 12);
  ctx.fillText("SEBUAH NOVEL", w / 2, 160);

  drawLantern(ctx, w / 2, 600, 1.22);

  ctx.fillStyle = goldGradient(ctx, 150, 900, 874, 1160);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  spacing(ctx, 6);
  ctx.font = '700 150px "Playfair Display", serif';
  ctx.fillText("LENTERA", w / 2, 1030);
  spacing(ctx, 0);
  ctx.font = 'italic 400 104px "Playfair Display", serif';
  ctx.fillText("Terakhir", w / 2, 1140);
  ctx.shadowColor = "transparent";

  ctx.fillStyle = goldGradient(ctx, 380, 0, 644, 0);
  ctx.fillRect(w / 2 - 110, 1210, 220, 2);
  ctx.font = '600 34px "Inter", sans-serif';
  spacing(ctx, 10);
  ctx.fillText("NARA WIJAYA", w / 2, 1296);
};

const drawBack = (ctx, w, h) => {
  navyBackground(ctx, w, h);
  goldFrame(ctx, w, h);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f3d894";
  ctx.font = 'italic 400 50px "Playfair Display", serif';
  drawParagraphs(
    ctx,
    ["“Setiap cahaya menyimpan satu kenangan. Dan seseorang telah mencurinya.”"],
    w / 2,
    230,
    w - 260,
    68
  );

  ctx.fillStyle = "rgba(236,230,217,0.88)";
  ctx.font = '400 31px "Inter", sans-serif';
  const y = drawParagraphs(
    ctx,
    [
      "Di Tanjung Seruni, mercusuar tua menyala setiap malam selama dua ratus tahun. Lalu suatu malam cahayanya padam — dan esok harinya tak seorang pun ingat nama ayah Arsa.",
      "Bersama camar yang bisa membaca dan pencuri kenangan yang menyesal, Arsa harus menyalakan lentera terakhir sebelum seluruh kota lupa siapa diri mereka.",
    ],
    w / 2,
    470,
    w - 240,
    50,
    30
  );

  ctx.fillStyle = goldGradient(ctx, 380, 0, 644, 0);
  ctx.fillRect(w / 2 - 110, y + 10, 220, 2);

  // Barcode
  const bx = w - 380;
  const by = h - 300;
  ctx.fillStyle = "#f6f1e6";
  ctx.fillRect(bx, by, 290, 180);
  const rand = seeded(3);
  ctx.fillStyle = "#111";
  for (let x = bx + 20; x < bx + 270; ) {
    const bw = 2 + Math.floor(rand() * 5);
    ctx.fillRect(x, by + 20, bw, 110);
    x += bw + 2 + Math.floor(rand() * 4);
  }
  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillText("ISBN 978-000-0000-00-0", bx + 145, by + 160);

  ctx.textAlign = "left";
  ctx.fillStyle = goldGradient(ctx, 100, 0, 400, 0);
  ctx.font = '600 26px "Inter", sans-serif';
  spacing(ctx, 8);
  ctx.fillText("AKSARA SENJA", 110, h - 150);
  spacing(ctx, 0);
  ctx.font = '400 24px "Inter", sans-serif';
  ctx.fillStyle = "rgba(236,230,217,0.6)";
  ctx.fillText("Fiksi · Fantasi", 110, h - 112);
};

const drawSpine = (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, w, 0);
  bg.addColorStop(0, "#08111f");
  bg.addColorStop(0.5, "#223b67");
  bg.addColorStop(1, "#08111f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 1200, 0.04);

  ctx.fillStyle = goldGradient(ctx, 0, 0, w, 0);
  for (const y of [60, 84, h - 90, h - 66]) ctx.fillRect(12, y, w - 24, 4);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = goldGradient(ctx, -500, 0, 500, 0);
  ctx.font = '700 60px "Playfair Display", serif';
  spacing(ctx, 4);
  ctx.fillText("LENTERA TERAKHIR", -110, 0);
  ctx.font = '600 26px "Inter", sans-serif';
  spacing(ctx, 6);
  ctx.fillText("NARA WIJAYA", 440, 0);
  ctx.restore();
};

const paperBase = (ctx, w, h, gutterLeft = true) => {
  ctx.fillStyle = "#f4ecd8";
  ctx.fillRect(0, 0, w, h);
  const g = gutterLeft ? ctx.createLinearGradient(0, 0, 140, 0) : ctx.createLinearGradient(w, 0, w - 140, 0);
  g.addColorStop(0, "rgba(90,65,30,0.28)");
  g.addColorStop(1, "rgba(90,65,30,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const drawFirstPage = (ctx, w, h) => {
  paperBase(ctx, w, h);
  ctx.textAlign = "center";
  ctx.fillStyle = "#a88550";
  ctx.font = '600 28px "Inter", sans-serif';
  spacing(ctx, 10);
  ctx.fillText("BAB SATU", w / 2, 250);
  spacing(ctx, 0);
  ctx.fillStyle = "#1c2a47";
  ctx.font = '700 70px "Playfair Display", serif';
  ctx.fillText("Kota yang Lupa", w / 2, 360);
  ctx.fillText("Cara Bermimpi", w / 2, 445);
  ctx.fillStyle = "#a88550";
  ctx.font = '400 34px "Playfair Display", serif';
  ctx.fillText("✦", w / 2, 520);

  ctx.textAlign = "left";
  ctx.fillStyle = "#3b3127";
  ctx.font = '400 34px "Playfair Display", serif';
  drawParagraphs(
    ctx,
    [
      "Malam itu, mercusuar di ujung Tanjung Seruni menyala untuk terakhir kalinya. Arsa melihatnya dari jendela loteng — cahaya keemasan yang berputar pelan, menyapu atap-atap kota seperti tangan seorang ibu yang menidurkan anaknya.",
      "Lalu, tanpa suara, cahaya itu padam.",
      "Keesokan paginya, tak seorang pun di kota ingat nama ayahnya.",
    ],
    130,
    620,
    w - 240,
    54,
    26
  );
  ctx.textAlign = "center";
  ctx.fillStyle = "#8b7a60";
  ctx.font = '400 26px "Playfair Display", serif';
  ctx.fillText("1", w / 2, h - 80);
};

const drawLeaf = (ctx, w, h) => {
  paperBase(ctx, w, h);
  const rand = seeded(21);
  ctx.fillStyle = "rgba(60,45,25,0.16)";
  for (let y = 150; y < h - 150; y += 54) {
    if (rand() < 0.08) continue; // jeda paragraf
    const lw = rand() < 0.15 ? (w - 260) * (0.3 + rand() * 0.5) : w - 260;
    ctx.fillRect(130, y, lw, 14);
  }
};

const drawEndpaper = (withPlate) => (ctx, w, h) => {
  ctx.fillStyle = "#152747";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(231,194,125,0.3)";
  for (let y = 30; y < h; y += 64) {
    for (let x = (y / 64) % 2 ? 62 : 30; x < w; x += 64) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }
  }
  if (!withPlate) return;
  const pw = 520;
  const ph = 340;
  const px = (w - pw) / 2;
  const py = (h - ph) / 2;
  ctx.fillStyle = "#f4ecd8";
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = "#a88550";
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 16, py + 16, pw - 32, ph - 32);
  ctx.textAlign = "center";
  ctx.fillStyle = "#7a5a2c";
  ctx.font = 'italic 400 64px "Playfair Display", serif';
  ctx.fillText("Ex Libris", w / 2, py + 150);
  ctx.fillRect(w / 2 - 150, py + 220, 300, 2);
  ctx.font = '600 20px "Inter", sans-serif';
  spacing(ctx, 6);
  ctx.fillStyle = "#8b7a60";
  ctx.fillText("BUKU INI MILIK", w / 2, py + 270);
};

const drawEdges = (vertical) => (ctx, w, h) => {
  ctx.fillStyle = "#efe5cf";
  ctx.fillRect(0, 0, w, h);
  const rand = seeded(vertical ? 5 : 9);
  const n = vertical ? w : h;
  for (let i = 0; i < n; i += 2) {
    ctx.fillStyle = `rgba(120,95,60,${0.05 + rand() * 0.14})`;
    if (vertical) ctx.fillRect(i, 0, 1, h);
    else ctx.fillRect(0, i, w, 1);
  }
};

const drawGlow = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,190,110,0.55)");
  g.addColorStop(0.35, "rgba(255,160,80,0.18)");
  g.addColorStop(1, "rgba(255,160,80,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const drawDot = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,230,180,0.8)");
  g.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

async function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    console.warn("WebGL tidak tersedia, memakai buku CSS 3D.", err);
    root.classList.add("no-webgl");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Tunggu font agar teks di sampul tergambar dengan benar.
  await Promise.race([
    Promise.all([
      document.fonts.load('700 100px "Playfair Display"'),
      document.fonts.load('italic 400 100px "Playfair Display"'),
      document.fonts.load('400 30px "Playfair Display"'),
      document.fonts.load('600 30px "Inter"'),
      document.fonts.load('400 30px "Inter"'),
    ]),
    new Promise((r) => setTimeout(r, 2500)),
  ]).catch(() => {});

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (w, h, draw) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  /* Lampu */
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x0b1426, 1.1));
  const key = new THREE.DirectionalLight(0xfff0dd, 2.4);
  key.position.set(5, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x86a8ff, 1.6);
  rim.position.set(-6, 2, -5);
  scene.add(rim);
  const warm = new THREE.PointLight(0xffb45a, 25, 20, 2);
  scene.add(warm);

  /* Material */
  const coverTex = tex(1024, 1434, drawCover);
  const backTex = tex(1024, 1434, drawBack);
  const spineTex = tex(160, 1434, drawSpine);
  const firstTex = tex(1024, 1434, drawFirstPage);
  const leafTex = tex(512, 717, drawLeaf);
  const endFrontTex = tex(1024, 1434, drawEndpaper(true));
  const endBackTex = tex(1024, 1434, drawEndpaper(false));
  const edgeVTex = tex(256, 512, drawEdges(true));
  const edgeHTex = tex(512, 256, drawEdges(false));

  const std = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.05, ...opts });
  const coverEdge = std({ color: 0x14254a, roughness: 0.5 });
  const paperEdgeV = std({ map: edgeVTex, roughness: 0.9 });
  const paperEdgeH = std({ map: edgeHTex, roughness: 0.9 });

  /* Buku */
  const book = new THREE.Group();

  // Box face order: +x, -x, +y, -y, +z, -z
  const frontPivot = new THREE.Group();
  frontPivot.position.set(-W / 2, 0, T / 2 - CT / 2);
  const front = new THREE.Mesh(new THREE.BoxGeometry(W, H, CT), [
    coverEdge,
    coverEdge,
    coverEdge,
    coverEdge,
    std({ map: coverTex, roughness: 0.45, metalness: 0.12 }),
    std({ map: endFrontTex, roughness: 0.8 }),
  ]);
  front.position.x = W / 2;
  frontPivot.add(front);
  book.add(frontPivot);

  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, CT), [
    coverEdge,
    coverEdge,
    coverEdge,
    coverEdge,
    std({ map: endBackTex, roughness: 0.8 }),
    std({ map: backTex, roughness: 0.45, metalness: 0.12 }),
  ]);
  back.position.z = -T / 2 + CT / 2;
  book.add(back);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(CT, H, T), [
    coverEdge,
    std({ map: spineTex, roughness: 0.45, metalness: 0.12 }),
    coverEdge,
    coverEdge,
    coverEdge,
    coverEdge,
  ]);
  spine.position.x = -W / 2 - CT / 2;
  book.add(spine);

  const PW = W - 0.12;
  const PH = H - 0.14;
  const PD = T - 2 * CT - 0.04;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, PD), [
    paperEdgeV,
    paperEdgeV,
    paperEdgeH,
    paperEdgeH,
    std({ map: firstTex, roughness: 0.85 }),
    std({ color: 0xf4ecd8, roughness: 0.9 }),
  ]);
  pages.position.x = -W / 2 + PW / 2;
  book.add(pages);

  // Lembaran halaman yang ikut terbuka/berkibar
  const leafMat = std({ map: leafTex, roughness: 0.85, side: THREE.DoubleSide });
  const LW = PW - 0.02;
  const LH = PH - 0.02;
  const leaves = [];
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.PlaneGeometry(LW, LH, 24, 1);
    geo.translate(LW / 2, 0, 0);
    const pivot = new THREE.Group();
    pivot.position.set(-W / 2, 0, PD / 2 + 0.003 * (i + 1));
    const mesh = new THREE.Mesh(geo, leafMat);
    pivot.add(mesh);
    book.add(pivot);
    leaves.push({
      pivot,
      geo,
      baseX: Float32Array.from(geo.attributes.position.array.filter((_, k) => k % 3 === 0)),
      // sudut akhir tiap lembar saat buku terbuka penuh (radian)
      target: [2.98, 2.9, 2.8, 2.66, 0][i],
      flutter: i === 4,
      angle: 0,
    });
  }

  const rig = new THREE.Group();
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex(256, 256, drawGlow),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8,
    })
  );
  halo.scale.set(10, 10, 1);
  halo.position.z = -2;
  rig.add(halo);
  rig.add(book);
  scene.add(rig);

  /* Partikel debu emas */
  const P = window.innerWidth < 700 ? 220 : 480;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(P * 3);
  const pSpeed = new Float32Array(P);
  const prand = seeded(42);
  for (let i = 0; i < P; i++) {
    pPos[i * 3] = (prand() - 0.5) * 22;
    pPos[i * 3 + 1] = (prand() - 0.5) * 16;
    pPos[i * 3 + 2] = (prand() - 0.5) * 10 - 1;
    pSpeed[i] = 0.08 + prand() * 0.25;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      size: 0.07,
      map: tex(64, 64, drawDot),
      color: 0xf3cf8a,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(particles);

  /* Kertas melayang di latar belakang */
  const floaters = [];
  const fMat = new THREE.MeshStandardMaterial({
    map: leafTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
    roughness: 0.9,
  });
  const fGeo = new THREE.PlaneGeometry(0.75, 1.05);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(fGeo, fMat);
    const side = i % 2 ? 1 : -1;
    m.position.set(side * (4 + prand() * 5), (prand() - 0.5) * 14, -3 - prand() * 5);
    m.rotation.set(prand() * 6, prand() * 6, prand() * 6);
    floaters.push({ mesh: m, speed: 0.12 + prand() * 0.2, spin: (prand() - 0.5) * 0.6 });
    scene.add(m);
  }

  /* ---------------- Keyframe dari atribut data-book ---------------- */
  const sections = [...document.querySelectorAll("[data-book]")];
  let frames = [];
  let isMobile = false;

  const parse = (str) => {
    const [kx, ky, ry, rx, open, scale, opacity] = str.trim().split(/\s+/).map(Number);
    return { kx, ky, ry, rx, open, scale, opacity };
  };

  function measure() {
    isMobile = window.innerWidth < 860;
    const vh = window.innerHeight;
    frames = sections.map((el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const start = top - vh * 0.5;
      const end = Math.max(start, top + rect.height - vh);
      return { start, end, ...parse((isMobile && el.dataset.bookM) || el.dataset.book) };
    });
  }

  const KEYS = ["kx", "ky", "ry", "rx", "open", "scale", "opacity"];
  const smooth = (t) => t * t * (3 - 2 * t);

  function targetAt(y) {
    if (y <= frames[0].end) return frames[0];
    for (let i = 0; i < frames.length - 1; i++) {
      const a = frames[i];
      const b = frames[i + 1];
      if (y <= b.start) {
        const t = smooth(THREE.MathUtils.clamp((y - a.end) / Math.max(1, b.start - a.end), 0, 1));
        const out = {};
        for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t;
        return out;
      }
      if (y <= b.end) return b;
    }
    return frames[frames.length - 1];
  }

  /* ---------------- Interaksi ---------------- */
  const pointer = { x: 0, y: 0 };
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  const stage = document.getElementById("heroStage");
  let dragRy = 0;
  let dragging = false;
  let lastX = 0;
  let lastDragTime = 0;
  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dragRy += (e.clientX - lastX) * 0.012;
    lastX = e.clientX;
    lastDragTime = performance.now();
  });
  const endDrag = () => {
    dragging = false;
    stage.classList.remove("is-dragging");
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  /* ---------------- Resize ---------------- */
  let halfH = 1;
  let halfW = 1;
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
    measure();
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("load", measure);
  new ResizeObserver(measure).observe(document.body);

  /* ---------------- Loop ---------------- */
  const cur = { ...frames[0], opacity: 0 };
  const tilt = { x: 0, y: 0 };
  const clock = new THREE.Clock();
  root.classList.add("webgl");
  root.classList.remove("no-webgl");

  function bendLeaf(leaf, amount) {
    const pos = leaf.geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = leaf.baseX[i] / LW;
      pos.setZ(i, Math.sin(u * Math.PI) * amount * (0.6 + u * 0.4));
    }
    pos.needsUpdate = true;
    leaf.geo.computeVertexNormals();
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const target = targetAt(window.scrollY);
    const damp = 1 - Math.exp(-dt * 4);

    for (const k of KEYS) {
      let goal = target[k];
      if (k === "open" && document.body.classList.contains("book-open")) goal = Math.max(goal, 1);
      cur[k] += (goal - cur[k]) * damp;
    }

    if (!dragging && performance.now() - lastDragTime > 1800) dragRy *= 1 - Math.min(1, dt * 1.5);
    tilt.x += (pointer.x - tilt.x) * damp;
    tilt.y += (pointer.y - tilt.y) * damp;

    canvas.style.opacity = cur.opacity.toFixed(3);

    const motion = reduceMotion ? 0 : 1;
    rig.position.set(cur.kx * halfW, cur.ky * halfH + Math.sin(t * 0.9) * 0.1 * motion, 0);
    rig.scale.setScalar(cur.scale);
    book.rotation.set(
      cur.rx + tilt.y * 0.15 + Math.sin(t * 0.6) * 0.03 * motion,
      cur.ry + dragRy + tilt.x * 0.3,
      Math.sin(t * 0.7) * 0.025 * motion
    );

    // Buka sampul & lembaran
    const open = THREE.MathUtils.clamp(cur.open, 0, 1);
    frontPivot.rotation.y = -open * 3.05;
    leaves.forEach((leaf, i) => {
      const delay = THREE.MathUtils.clamp(open * 1.25 - i * 0.06, 0, 1);
      let angle = leaf.target * delay;
      if (leaf.flutter) angle = delay * (1.5 + Math.sin(t * 0.9) * 0.35 * motion);
      leaf.pivot.rotation.y = -angle;
      const bend = Math.sin(angle) * 0.28;
      if (Math.abs(bend - leaf.angle) > 0.002) {
        bendLeaf(leaf, bend);
        leaf.angle = bend;
      }
    });

    warm.position.set(
      rig.position.x + Math.cos(t * 0.5) * 3.5,
      rig.position.y + 1.5,
      3 + Math.sin(t * 0.5) * 1.5
    );
    halo.material.opacity = 0.55 + Math.sin(t * 1.3) * 0.12 * motion;

    // Partikel & kertas melayang (dengan parallax scroll)
    const par = window.scrollY * 0.0012;
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < P; i++) {
      arr[i * 3 + 1] += pSpeed[i] * dt * motion;
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.002 * motion;
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
    }
    pGeo.attributes.position.needsUpdate = true;
    particles.position.y = par;

    for (const f of floaters) {
      f.mesh.position.y += f.speed * dt * motion;
      if (f.mesh.position.y > 9) f.mesh.position.y = -9;
      f.mesh.rotation.x += f.spin * dt * motion;
      f.mesh.rotation.y += f.spin * 0.7 * dt * motion;
    }

    if (cur.opacity > 0.01) renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

init().catch((err) => {
  console.warn("Gagal memuat scene 3D.", err);
  root.classList.add("no-webgl");
});
