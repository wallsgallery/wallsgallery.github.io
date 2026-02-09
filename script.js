// ====== EDIT WORKS HERE ======
const YT_URL = "https://www.youtube.com/watch?v=xvFZjo5PgG0";
const YT_ID = "xvFZjo5PgG0";

const WORKS = [
  { type: "image", artist: "Brandon Andrade", file: "brandonandrade1.jpg", caption: "Brandon Andrade — work 1", view: "brandonandrade1.html" },
  { type: "image", artist: "D4IKON", file: "d4ikon1.jpg", caption: "D4IKON — work 1", view: "d4ikon1.html" },
  { type: "image", artist: "Gambit_one", file: "gambitone1.jpg", caption: "Gambit_one — work 1", view: "gambitone1.html" },
  { type: "image", artist: "Hunter Pacheco", file: "hunterpacheco1.jpg", caption: "Hunter Pacheco — work 1", view: "hunterpacheco1.html" },
  { type: "image", artist: "Jasmine Phan", file: "jasminephan1.jpg", caption: "Jasmine Phan — work 1", view: "jasminephan1.html" },
  { type: "image", artist: "Mariah Hall", file: "mariahhall1.jpg", caption: "Mariah Hall — work 1", view: "mariahhall1.html" },
  { type: "video", artist: "DanyoInaki", youtubeId: YT_ID, caption: "DanyoInaki — video", shareUrl: YT_URL }
];

// ===== HELPERS =====
function siteOrigin() {
  return window.location.origin;
}

function viewUrlFor(work) {
  return `${siteOrigin()}/view/${work.view}`;
}

async function shareLink(url) {
  try {
    if (navigator.share) {
      await navigator.share({ url });
      return;
    }
  } catch {}

  await navigator.clipboard.writeText(url);
  alert("Link copied.");
}

function uniqArtists(works) {
  return [...new Set(works.map(w => w.artist))];
}

function youtubeEmbedUrl(id, opts = {}) {
  const p = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    autoplay: opts.autoplay ? "1" : "0",
    mute: opts.mute ? "1" : "0",
    controls: opts.controls ? "1" : "0"
  });

  if (opts.loop) {
    p.set("loop", "1");
    p.set("playlist", id);
  }

  return `https://www.youtube.com/embed/${id}?${p}`;
}

// ===== NAV ACTIVE =====
function setActiveNav() {
  const path = location.pathname;

  document.querySelectorAll(".navlink").forEach(link => {
    link.classList.remove("is-active");

    const href = link.getAttribute("href");

    if (
      (href === "index.html" && (path === "/" || path.endsWith("index.html"))) ||
      (href === "gallery.html" && path.endsWith("gallery.html"))
    ) {
      link.classList.add("is-active");
    }
  });
}

// ===== HOME =====
function renderHome() {
  const feed = document.getElementById("homeFeed");
  if (!feed) return;

  WORKS.forEach(work => {
    const item = document.createElement("section");
    item.className = "home-item";

    const media = document.createElement("div");
    media.className = "home-media";

    if (work.type === "image") {
      media.innerHTML = `<img src="images/${work.file}" alt="">`;
    } else {
      media.innerHTML = `
        <div class="ytwrap">
          <iframe src="${youtubeEmbedUrl(work.youtubeId, { autoplay:true, mute:true, loop:true })}"
                  allow="autoplay; encrypted-media"
                  allowfullscreen></iframe>
        </div>`;
    }

    const caption = document.createElement("div");
    caption.className = "home-caption";
    caption.textContent = work.caption;

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.innerHTML = `<button class="sharebtn">Share</button>`;
    actions.firstChild.onclick = () =>
      shareLink(work.type === "image" ? viewUrlFor(work) : work.shareUrl);

    item.append(media, caption, actions);
    feed.appendChild(item);
  });
}

// ===== GALLERY =====
let currentFilter = "all";

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

  document.querySelector('[data-filter="all"]')?.onclick =
    () => setFilter("all");
}

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filterbtn")
    .forEach(b => b.classList.remove("is-active"));

  document
    .querySelector(`.filterbtn[data-filter="${filter}"]`)
    ?.classList.add("is-active");

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

      tile.innerHTML =
        work.type === "image"
          ? `<div class="thumb"><img src="images/${work.file}" alt=""></div>`
          : `<div class="thumb"><div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;">VIDEO</div></div>`;

      tile.onclick = () => openLightbox(work);
      grid.appendChild(tile);
    });
}

// ===== LIGHTBOX =====
function openLightbox(work) {
  const lb = document.getElementById("lightbox");
  const media = document.getElementById("lbMedia");

  media.innerHTML =
    work.type === "image"
      ? `<img src="images/${work.file}" alt="">`
      : `<div class="ytwrap"><iframe src="${youtubeEmbedUrl(work.youtubeId,{controls:true})}" allowfullscreen></iframe></div>`;

  document.getElementById("lbShare").onclick =
    () => shareLink(work.type === "image" ? viewUrlFor(work) : work.shareUrl);

  lb.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.getElementById("lbClose").onclick = closeLightbox;
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
  document.getElementById("lbMedia").innerHTML = "";
  document.body.style.overflow = "";
}

// ===== INIT =====
(function () {
  setActiveNav();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "gallery") {
    renderFilters();
    renderGrid();
  }
})();

