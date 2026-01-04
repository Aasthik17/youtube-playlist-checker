const ext = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener("DOMContentLoaded", () => {
  const totalPlaylistsEl = document.getElementById("totalPlaylists");
  const videosCompletedEl = document.getElementById("videosCompleted");
  const clearBtn = document.getElementById("clearAllData");

  ext.storage.local.get(null, (data) => {
    const playlists = Object.keys(data);
    let completed = 0;

    playlists.forEach((pid) => {
      const vids = data[pid];
      Object.values(vids).forEach((v) => {
        if (v === true) completed++;
      });
    });

    totalPlaylistsEl.innerText = playlists.length;
    videosCompletedEl.innerText = completed;
  });

  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear all playlist data?")) return;
    ext.storage.local.clear(() => {
      totalPlaylistsEl.innerText = "0";
      videosCompletedEl.innerText = "0";
    });
  });
});
