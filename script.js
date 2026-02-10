// ====== EDIT WORKS HERE (add more later) ======
const YT_URL = "https://www.youtube.com/watch?v=xvFZjo5PgG0";
const YT_ID = "xvFZjo5PgG0"; // replace later

// Each image work: file in /images + share page in /view/<view>.html
const WORKS = [
  { type: "image", artist: "Brandon Andrade", file: "brandonandrade1.jpg", caption: "Brandon Andrade — work 1", view: "brandonandrade1.html" },
  { type: "image", artist: "D4IKON",          file: "d4ikon1.jpg",         caption: "D4IKON — work 1",          view: "d4ikon1.html" },
  { type: "image", artist: "Gambit_one",      file: "gambitone1.jpg",      caption: "Gambit_one — work 1",      view: "gambitone1.html" },
  { type: "image", artist: "Hunter Pacheco",  file: "hunterpacheco1.jpg",  caption: "Hunter Pacheco — work 1",  view: "hunterpacheco1.html" },
  { type: "image", artist: "Jasmine Phan",    file: "jasminephan1.jpg",    caption: "Jasmine Phan — work 1",    view: "jasminephan1.html" },
  { type: "image", artist: "Mariah Hall",     file: "mariahhall1.jpg",     caption: "Mariah Hall — work 1",     view: "mariahhall1.html" },
  { type: "video", artist: "DanyoInaki",      youtubeId: YT_ID,            caption: "DanyoInaki — video",        shareUrl: YT_URL }
];

// ===== HELPERS =====
function siteOrigin() {
  return window.location.origin;
}

function viewUrlFor(work) {
  return `${siteOrigin()}/view/${work.view}`;
}

async function shareLink(url, text = "") {
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, text, url });
      return;
    }
  } catch (_) {}

  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied.");
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    alert("Link copied.");
  }
}

function uniqArtists(works) {
  return [...new Set(works.map(w => w.artist))];
}

function youtubeEmbedUrl(id, { autoplay=false, mute=false, loop=false, controls=true } = {}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: autoplay ? "1" : "0",
    mute: mute ? "1" : "0",
    controls: controls ? "1" : "0"
  });

  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

// ===== NAV ACTIVE STATE =====
function setActiveNav(){
  const page = document.body?.dataset?.page;
  if (!page) return;

  document.querySelectorAll(".navlink").forEach(link => {
    link.classList.remove("is-active");

    const href = link.getAttribute("href");

    if (
      (page === "home" && href === "index.html") ||
      (page === "gallery" && href === "gallery.html")
    ) {
      link.classList.add("is-active");
    }
  });
}

// ===== HOME RENDER =====
function renderHome() {
  const feed = document.getElementById("homeFeed");
  if (!feed) return;

  WORKS.forEach(work => {
    const item = document.createElement("section");
    item.className = "home-item";

    const media = document.createElement("div");
    media.className = "home-media";

    if (work.type === "image") {
      const img = document.createElement("img");
      img.src = `images/${work.file}`;
      img.alt = "";
      media.appendChild(img);
    } else {
      const wrap = document.createElement("div");
      wrap.className = "ytwrap";
      const iframe = document.createElement("iframe");
      iframe.src = youtubeEmbedUrl(work.youtubeId, { autoplay: true, mute: true, loop: true, controls: false });
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      wrap.appendChild(iframe);
      media.appendChild(wrap);
    }

    const caption = document.createElement("div");
    caption.className = "home-caption";
    caption.textContent = work.caption || "";

    const actions = document.createElement("div");
    actions.className = "actions";

    const btn = document.createElement("button");
    btn.className = "sharebtn";
    btn.textContent = "Share";

    btn.onclick = async () => {
      await shareLink(
        work.type === "image" ? viewUrlFor(work) : work.shareUrl
      );
    };

    actions.appendChild(btn);
    item.append(media, caption, actions);
    feed.appendChild(item);
  });
}

// ===== GALLERY =====
let currentFilter = "all";
let currentWork = null;

function renderFilters() {
  const holder = document.getElementById("artistFilters");
  if (!holder) return;

  uniqArtists(WORKS).sort().forEach(name => {
    const btn = document.createElement("button");
    btn.className = "filterbtn";
    btn.dataset.filter = name;
    btn.textContent = name;
    btn.onclick = () => setFilter(name);
    holder.appendChild(btn);
  });

  document.querySelector('[data-filter="all"]')?.addEventListener("click", () => setFilter("all"));
}

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filterbtn").forEach(b => b.classList.remove("is-active"));
  document.querySelector(`.filterbtn[data-filter="${CSS.escape(filter)}"]`)?.classList.add("is-active");

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("worksGrid");
  if (!grid) return;

  grid.innerHTML = "";

  WORKS
    .filter(w => currentFilter === "all" || w.artist === currentFilter)
    .forEach(work => {
      const tile = document.createElement("div");
      tile.className = "tile";

      const thumb = document.createElement("div");
      thumb.className = "thumb";

      if (work.type === "image") {
        const img = document.createElement("img");
        img.src = `images/${work.file}`;
        thumb.appendChild(img);
      } else {
        const box = document.createElement("div");
        box.textContent = "VIDEO";
        box.style.aspectRatio = "16/9";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        thumb.appendChild(box);
      }

      tile.appendChild(thumb);

      if (work.type === "video") {
        const label = document.createElement("div");
        label.className = "vlabel";
        label.textContent = work.artist;
        tile.appendChild(label);
      }

      tile.onclick = () => openLightbox(work);
      grid.appendChild(tile);
    });
}

// ===== LIGHTBOX =====
function openLightbox(work) {
  const lb = document.getElementById("lightbox");
  const media = document.getElementById("lbMedia");
  const share = document.getElementById("lbShare");

  currentWork = work;
  media.innerHTML = "";

  if (work.type === "image") {
    const img = document.createElement("img");
    img.src = `images/${work.file}`;
    media.appendChild(img);
  } else {
    const wrap = document.createElement("div");
    wrap.className = "ytwrap";
    const iframe = document.createElement("iframe");
    iframe.src = youtubeEmbedUrl(work.youtubeId, { controls: true });
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    wrap.appendChild(iframe);
    media.appendChild(wrap);
  }

  share.onclick = () =>
    shareLink(work.type === "image" ? viewUrlFor(work) : work.shareUrl);

  lb.style.display = "flex";
  document.body.style.overflow = "hidden";

  document.getElementById("lbClose").onclick = closeLightbox;
  window.addEventListener("keydown", e => e.key === "Escape" && closeLightbox(), { once: true });
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
  document.getElementById("lbMedia").innerHTML = "";
  document.body.style.overflow = "";
  currentWork = null;
}

// ===== COUNTDOWN =====
function startCountdown(targetDate){
  const el = document.getElementById("countdownTime");
  if (!el) return;

  function tick(){
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0){
      el.textContent = "00:00:00";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    el.textContent =
      `${String(hours).padStart(2,"0")}:` +
      `${String(minutes).padStart(2,"0")}:` +
      `${String(seconds).padStart(2,"0")}`;
  }

  tick();
  setInterval(tick, 1000);
}



// ===== INIT =====
(function init(){
  setActiveNav();
  startCountdown(new Date("2026-02-21T14:00:00-08:00").getTime());
  const page = document.body?.dataset?.page;
  if (page === "home") renderHome();
  if (page === "gallery") {
    renderFilters();
    renderGrid();
  }
})();
