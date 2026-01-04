// popup.js - Popup script for YouTube Playlist Checker (Firefox version)

// Use browser API for Firefox compatibility
const storage = (typeof browser !== 'undefined' ? browser : chrome).storage;

// Load statistics
async function loadStats() {
  return new Promise((resolve) => {
    storage.local.get(null, (data) => {
      let totalPlaylists = 0;
      let videosCompleted = 0;
      
      Object.keys(data).forEach(key => {
        if (!key.includes('_hidden') && !key.includes('_minimized') && data[key].videos) {
          totalPlaylists++;
          videosCompleted += data[key].videos.filter(v => v.checked).length;
        }
      });
      
      document.getElementById('totalPlaylists').textContent = totalPlaylists;
      document.getElementById('videosCompleted').textContent = videosCompleted;
      resolve();
    });
  });
}

// Clear all data
document.getElementById('clearAllData').addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all checklist data? This cannot be undone.')) {
    await storage.local.clear();
    await loadStats();
    alert('All data has been cleared!');
  }
});

// Load stats on popup open
loadStats();