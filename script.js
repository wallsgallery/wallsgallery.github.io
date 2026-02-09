// ====== EDIT WORKS HERE (add more later) ======
const YT_URL = "https://www.youtube.com/watch?v=xvFZjo5PgG0";
const YT_ID = "xvFZjo5PgG0"; // replace later

// Each image work: file in /images + share page in /view/<view>.html
// Naming rule you chose: artistname + number (no spaces/hyphens)
const WORKS = [
  { type: "image", artist: "Brandon Andrade", file: "brandonandrade1.jpg", caption: "Brandon Andrade — work 1", view: "brandonandrade1.html" },
  { type: "image", artist: "D4IKON",          file: "d4ikon1.jpg",         caption: "D4IKON — work 1",          view: "d4ikon1.html" },
  { type: "image", artist: "Gambit_one",      file: "gambitone1.jpg",      caption: "Gambit_one — work 1",      view: "gambitone1.html" },
  { type: "image", artist: "Hunter Pacheco",  file: "hunterpacheco1.jpg",  caption: "Hunter Pacheco — work 1",  view: "hunterpacheco1.html" },
  { type: "image", artist: "Jasmine Phan",    file: "jasminephan1.jpg",    caption: "Jasmine Phan — work 1",    view: "jasminephan1.html" },
  { type: "image", artist: "Mariah Hall",     file: "mariahhall1.jpg",     caption: "Mariah Hall — work 1",     view: "mariahhall1.html" },

  // Video (YouTube). Home: muted looping embed. Gallery: playable embed with audio possible.
  { type: "video", artist: "DanyoInaki",      youtubeId: YT_ID,            caption: "DanyoInaki — video",        shareUrl: YT_URL }
];

// ===== helpers =====
function siteOrigin() {
  // Works on GitHub Pages and local testing
  return window.location.origin;
}

function viewUrlFor(work) {
  return `${siteOrigin()}/view/${work.view}`;
}

async function shareLink(url, text = "") {
  // Web Share API (best on mobile), fallback to clipboard
  try {
    if (navigator.share) {
      await navigator.share({ title: document.title, text, url });
      return;
    }
  } catch (_) {
    // user canceled or share failed -> fallback
  }

  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied.");
  } catch (_) {
    // older fallback
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
  const set = new Set();
  for (const w of works) set.add(w.artist);
  return Array.from(set);
}

function youtubeEmbedUrl(id, { autoplay=false, mute=false, loop=false, controls=true } = {}) {
  const params = new URLSearchParams();
  params.set("rel", "0");
  params.set("modestbranding", "1");
  params.set("playsinline", "1");

  params.set("autoplay", autoplay ? "1" : "0");
  params.set("mute", mute ? "1" : "0");
  params.set("controls", controls ? "1" : "0");

  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id); // required by YouTube for looping a single video
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

// ===== HOME RENDER =====
function renderHome() {
  const feed = document.getElementById("homeFeed");
  if (!feed) return;

  // Home order: show all works in declared order (video included)
  for (const work of WORKS) {
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
      // Muted looping embed (no audio) per your requirement
      const wrap = document.createElement("div");
      wrap.className = "ytwrap";
      const iframe = document.createElement("iframe");
      iframe.src = youtubeEmbedUrl(work.youtubeId, { autoplay: true, mute: true, loop: true, controls: false });
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.title = "Video";
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
    btn.type = "button";
    btn.textContent = "Share";

    btn.addEventListener("click", async () => {
      if (work.type === "image") {
        await shareLink(viewUrlFor(work), "");
      } else {
        await shareLink(work.shareUrl, "");
      }
    });

    actions.appendChild(btn);

    item.appendChild(media);
    item.appendChild(caption);
    item.appendChild(actions);

    feed.appendChild(item);
  }
}

// ===== GALLERY RENDER + FILTER + LIGHTBOX =====
let currentFilter = "all";
let currentWork = null;

function renderFilters() {
  const holder = document.getElementById("artistFilters");
  if (!holder) return;

  const artists = uniqArtists(WORKS);
  artists.sort((a,b) => a.localeCompare(b));

  for (const name of artists) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filterbtn";
    btn.dataset.filter = name;
    btn.textContent = name;

    btn.addEventListener("click", () => setFilter(name));
    holder.appendChild(btn);
  }

  // hook "All"
  const allBtn = document.querySelector('.filterbtn[data-filter="all"]');
  if (allBtn) allBtn.addEventListener("click", () => setFilter("all"));
}

function setFilter(filter) {
  currentFilter = filter;

  // active styles
  document.querySelectorAll(".filterbtn").forEach(b => b.classList.remove("is-active"));
  const active = document.querySelector(`.filterbtn[data-filter="${CSS.escape(filter)}"]`);
  if (active) active.classList.add("is-active");

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("worksGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = WORKS.filter(w => currentFilter === "all" ? true : w.artist === currentFilter);

  for (const work of filtered) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.artist = work.artist;

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    if (work.type === "image") {
      const img = document.createElement("img");
      img.src = `images/${work.file}`;
      img.alt = "";
      thumb.appendChild(img);
    } else {
      // lightweight preview: just a labeled box (you can replace with a thumbnail later)
      const box = document.createElement("div");
      box.style.aspectRatio = "16/9";
      box.style.display = "flex";
      box.style.alignItems = "center";
      box.style.justifyContent = "center";
      box.style.background = "rgba(0,0,0,0.06)";
      box.style.fontSize = "0.95rem";
      box.style.letterSpacing = "0.04em";
      box.textContent = "VIDEO";
      thumb.appendChild(box);
    }

    tile.appendChild(thumb);

    if (work.type === "video") {
      const vlabel = document.createElement("div");
      vlabel.className = "vlabel";
      vlabel.textContent = work.artist;
      tile.appendChild(vlabel);
    }

    tile.addEventListener("click", () => openLightbox(work));
    grid.appendChild(tile);
  }
}

function openLightbox(work) {
  const lb = document.getElementById("lightbox");
  const media = document.getElementById("lbMedia");
  const share = document.getElementById("lbShare");
  const close = document.getElementById("lbClose");
  if (!lb || !media || !share || !close) return;

  currentWork = work;

  media.innerHTML = "";
  if (work.type === "image") {
    const img = document.createElement("img");
    img.src = `images/${work.file}`;
    img.alt = "";
    media.appendChild(img);
  } else {
    // Playable (audio possible). Autoplay is off by default (browser-friendly).
    const wrap = document.createElement("div");
    wrap.className = "ytwrap";
    const iframe = document.createElement("iframe");
    iframe.src = youtubeEmbedUrl(work.youtubeId, { autoplay: false, mute: false, loop: false, controls: true });
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = "Video";
    wrap.appendChild(iframe);
    media.appendChild(wrap);
  }

  share.onclick = async () => {
    if (!currentWork) return;
    if (currentWork.type === "image") {
      await shareLink(viewUrlFor(currentWork), "");
    } else {
      await shareLink(currentWork.shareUrl, "");
    }
  };

  const closeFn = () => closeLightbox();
  close.onclick = closeFn;

  lb.style.display = "flex";
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  }, { once: true });

  window.addEventListener("keydown", onEscOnce, { once: true });
}

function onEscOnce(e) {
  if (e.key === "Escape") closeLightbox();
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  const media = document.getElementById("lbMedia");
  if (!lb || !media) return;

  lb.style.display = "none";
  lb.setAttribute("aria-hidden", "true");
  media.innerHTML = "";
  currentWork = null;
  document.body.style.overflow = "";
}

// ===== INIT =====
(function init(){
  const page = document.body?.dataset?.page;

  if (page === "home") {
    renderHome();
  }

  if (page === "gallery") {
    renderFilters();
    renderGrid();
  }
})();

