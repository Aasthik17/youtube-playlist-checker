const ext = typeof browser !== "undefined" ? browser : chrome;

const CHECKER_ID = "yt-playlist-checker";
const FLOATING_BUTTON_ID = "ypc-floating-button";

function isPlaylistPage() {
  return new URL(window.location.href).searchParams.has("list");
}

function getPlaylistId() {
  return new URL(window.location.href).searchParams.get("list");
}

function getVideoItems() {
  return Array.from(document.querySelectorAll("ytd-playlist-video-renderer"));
}

function createFloatingButton() {
  if (document.getElementById(FLOATING_BUTTON_ID)) return;

  const btn = document.createElement("button");
  btn.id = FLOATING_BUTTON_ID;
  btn.innerText = "✓";

  btn.addEventListener("click", toggleChecklist);
  document.body.appendChild(btn);
}

function toggleChecklist() {
  const existing = document.getElementById(CHECKER_ID);
  if (existing) {
    existing.classList.toggle("ypc-minimized");
    return;
  }
  buildChecklist();
}

function buildChecklist() {
  const playlistId = getPlaylistId();
  if (!playlistId) return;

  const container = document.createElement("div");
  container.id = CHECKER_ID;

  container.innerHTML = `
    <div class="ypc-header">
      <h3>Playlist Checker</h3>
      <div class="ypc-controls">
        <button id="ypc-minimize">−</button>
      </div>
    </div>
    <div class="ypc-content">
      <div class="ypc-stats">
        <span id="ypc-progress">Loading...</span>
      </div>
      <div class="ypc-checklist"></div>
      <div class="ypc-footer">
        <button id="ypc-clear-all">Clear All</button>
        <button id="ypc-check-all">Check All</button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  document.getElementById("ypc-minimize").onclick = () =>
    container.classList.toggle("ypc-minimized");

  document.getElementById("ypc-clear-all").onclick = () =>
    updateAll(false);

  document.getElementById("ypc-check-all").onclick = () =>
    updateAll(true);

  renderChecklist(playlistId);
}

function renderChecklist(playlistId) {
  const items = getVideoItems();
  const checklist = document.querySelector(".ypc-checklist");

  ext.storage.local.get([playlistId], (res) => {
    const saved = res[playlistId] || {};

    checklist.innerHTML = "";
    let checkedCount = 0;

    items.forEach((item, index) => {
      const titleEl = item.querySelector("#video-title");
      if (!titleEl) return;

      const title = titleEl.innerText.trim();
      const id = titleEl.href;

      const isChecked = saved[id] === true;
      if (isChecked) checkedCount++;

      const row = document.createElement("div");
      row.className = "ypc-item" + (isChecked ? " ypc-checked" : "");

      row.innerHTML = `
        <input type="checkbox" ${isChecked ? "checked" : ""}>
        <label>
          <span class="ypc-number">${index + 1}.</span>
          <span class="ypc-title">${title}</span>
        </label>
      `;

      row.querySelector("input").onchange = (e) => {
        saved[id] = e.target.checked;
        ext.storage.local.set({ [playlistId]: saved });
        row.classList.toggle("ypc-checked", e.target.checked);
        updateProgress();
      };

      checklist.appendChild(row);
    });

    updateProgress();
  });
}

function updateAll(value) {
  const playlistId = getPlaylistId();
  const items = getVideoItems();

  const data = {};
  items.forEach((item) => {
    const link = item.querySelector("#video-title")?.href;
    if (link) data[link] = value;
  });

  ext.storage.local.set({ [playlistId]: data }, () => {
    document.querySelectorAll(".ypc-item input").forEach((cb) => {
      cb.checked = value;
      cb.closest(".ypc-item").classList.toggle("ypc-checked", value);
    });
    updateProgress();
  });
}

function updateProgress() {
  const total = document.querySelectorAll(".ypc-item").length;
  const done = document.querySelectorAll(".ypc-item.ypc-checked").length;
  document.getElementById("ypc-progress").innerText =
    `${done} / ${total} videos completed`;
}

const observer = new MutationObserver(() => {
  if (isPlaylistPage()) createFloatingButton();
});

observer.observe(document.body, { childList: true, subtree: true });
