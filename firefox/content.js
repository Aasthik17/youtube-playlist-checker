// content.js - Main content script for YouTube Playlist Checker (Firefox version)

// Use browser API instead of chrome API for better Firefox compatibility
const storage = (typeof browser !== 'undefined' ? browser : chrome).storage;

let checklistPanel = null;
let currentPlaylistId = null;
let checklistData = {};

// Extract playlist ID from URL
function getPlaylistId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('list');
}

// Extract video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Parse playlist videos from the page
function getPlaylistVideos() {
  const videos = [];
  
  // Try to get videos from the playlist panel (when watching a video in playlist)
  let videoElements = document.querySelectorAll('ytd-playlist-panel-video-renderer');
  
  // If not in playlist view, try to get from playlist page
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-playlist-video-renderer');
  }
  
  videoElements.forEach((el, index) => {
    const titleElement = el.querySelector('#video-title');
    if (titleElement) {
      const videoId = el.querySelector('a')?.href?.match(/[?&]v=([^&]+)/)?.[1];
      videos.push({
        index: index + 1,
        title: titleElement.textContent.trim(),
        videoId: videoId || `video-${index}`,
        checked: false
      });
    }
  });
  
  return videos;
}

// Create the checklist UI
function createChecklistUI() {
  if (checklistPanel) {
    checklistPanel.remove();
  }
  
  const panel = document.createElement('div');
  panel.id = 'yt-playlist-checker';
  panel.innerHTML = `
    <div class="ypc-header">
      <h3>Playlist Checklist</h3>
      <div class="ypc-controls">
        <button id="ypc-minimize" title="Minimize">−</button>
        <button id="ypc-close" title="Close">×</button>
      </div>
    </div>
    <div class="ypc-content">
      <div class="ypc-stats">
        <span id="ypc-progress">0/0 completed</span>
      </div>
      <div id="ypc-checklist" class="ypc-checklist"></div>
      <div class="ypc-footer">
        <button id="ypc-clear-all">Clear All</button>
        <button id="ypc-check-all">Check All</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  checklistPanel = panel;
  
  // Add event listeners
  document.getElementById('ypc-close').addEventListener('click', () => {
    checklistPanel.style.display = 'none';
    const data = {};
    data[`${currentPlaylistId}_hidden`] = true;
    storage.local.set(data);
  });
  
  document.getElementById('ypc-minimize').addEventListener('click', () => {
    const content = panel.querySelector('.ypc-content');
    const minimizeBtn = document.getElementById('ypc-minimize');
    const isMinimized = panel.classList.contains('ypc-minimized');
    
    if (isMinimized) {
      // Expanding
      panel.classList.remove('ypc-minimized');
      content.style.display = 'flex';
      minimizeBtn.textContent = '−';
      // Store state
      const data = {};
      data[`${currentPlaylistId}_minimized`] = false;
      storage.local.set(data);
    } else {
      // Minimizing
      panel.classList.add('ypc-minimized');
      content.style.display = 'none';
      minimizeBtn.textContent = '+';
      // Store state
      const data = {};
      data[`${currentPlaylistId}_minimized`] = true;
      storage.local.set(data);
    }
  });
  
  document.getElementById('ypc-clear-all').addEventListener('click', clearAllChecks);
  document.getElementById('ypc-check-all').addEventListener('click', checkAll);
  
  // Make panel draggable
  makeDraggable(panel);
}

// Make the panel draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = element.querySelector('.ypc-header');
  
  header.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Populate the checklist with videos
function populateChecklist(videos) {
  const checklistContainer = document.getElementById('ypc-checklist');
  if (!checklistContainer) return;
  
  checklistContainer.innerHTML = '';
  
  videos.forEach((video, index) => {
    const item = document.createElement('div');
    item.className = 'ypc-item';
    if (video.checked) {
      item.classList.add('ypc-checked');
    }
    
    item.innerHTML = `
      <input type="checkbox" id="ypc-video-${index}" ${video.checked ? 'checked' : ''}>
      <label for="ypc-video-${index}">
        <span class="ypc-number">${video.index}.</span>
        <span class="ypc-title">${video.title}</span>
      </label>
    `;
    
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => {
      video.checked = checkbox.checked;
      if (checkbox.checked) {
        item.classList.add('ypc-checked');
      } else {
        item.classList.remove('ypc-checked');
      }
      saveChecklistData();
      updateProgress();
    });
    
    checklistContainer.appendChild(item);
  });
  
  updateProgress();
}

// Update progress counter
function updateProgress() {
  const progressElement = document.getElementById('ypc-progress');
  if (!progressElement || !checklistData.videos) return;
  
  const checkedCount = checklistData.videos.filter(v => v.checked).length;
  const totalCount = checklistData.videos.length;
  progressElement.textContent = `${checkedCount}/${totalCount} completed`;
}

// Save checklist data to storage
async function saveChecklistData() {
  if (!currentPlaylistId || !checklistData.videos) return;
  
  const storageData = {};
  storageData[currentPlaylistId] = checklistData;
  await storage.local.set(storageData);
}

// Load checklist data from storage
async function loadChecklistData() {
  if (!currentPlaylistId) return null;
  
  return new Promise((resolve) => {
    storage.local.get(currentPlaylistId, (result) => {
      resolve(result[currentPlaylistId] || null);
    });
  });
}

// Clear all checks
function clearAllChecks() {
  if (!checklistData.videos) return;
  
  checklistData.videos.forEach(video => {
    video.checked = false;
  });
  
  populateChecklist(checklistData.videos);
  saveChecklistData();
}

// Check all items
function checkAll() {
  if (!checklistData.videos) return;
  
  checklistData.videos.forEach(video => {
    video.checked = true;
  });
  
  populateChecklist(checklistData.videos);
  saveChecklistData();
}

// Initialize or update the checklist
async function initializeChecklist() {
  const playlistId = getPlaylistId();
  
  if (!playlistId) {
    if (checklistPanel) {
      checklistPanel.style.display = 'none';
    }
    return;
  }
  
  currentPlaylistId = playlistId;
  
  // Check if panel should be hidden or minimized
  const keys = [`${playlistId}_hidden`, `${playlistId}_minimized`];
  
  return new Promise((resolve) => {
    storage.local.get(keys, async (result) => {
      const isHidden = result[`${playlistId}_hidden`];
      const isMinimized = result[`${playlistId}_minimized`];
      
      // Load existing data
      const savedData = await loadChecklistData();
      const currentVideos = getPlaylistVideos();
      
      if (currentVideos.length === 0) {
        // Videos not loaded yet, retry after delay
        setTimeout(initializeChecklist, 1000);
        return;
      }
      
      if (savedData && savedData.videos) {
        // Merge saved state with current videos
        checklistData.videos = currentVideos.map(video => {
          const savedVideo = savedData.videos.find(
            sv => sv.videoId === video.videoId || sv.title === video.title
          );
          return {
            ...video,
            checked: savedVideo ? savedVideo.checked : false
          };
        });
      } else {
        checklistData.videos = currentVideos;
      }
      
      if (!checklistPanel) {
        createChecklistUI();
        // Apply minimized state after creation
        if (isMinimized) {
          const content = checklistPanel.querySelector('.ypc-content');
          const minimizeBtn = document.getElementById('ypc-minimize');
          checklistPanel.classList.add('ypc-minimized');
          content.style.display = 'none';
          minimizeBtn.textContent = '+';
        }
      } else {
        checklistPanel.style.display = isHidden ? 'none' : 'block';
      }
      
      populateChecklist(checklistData.videos);
      saveChecklistData();
      resolve();
    });
  });
}

// Add floating button to open checklist
function addFloatingButton() {
  const existingButton = document.getElementById('ypc-floating-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  const button = document.createElement('button');
  button.id = 'ypc-floating-button';
  button.innerHTML = '✓';
  button.title = 'Open Playlist Checklist';
  
  button.addEventListener('click', async () => {
    if (checklistPanel) {
      checklistPanel.style.display = 'block';
      // Remove the hidden flag
      const playlistId = getPlaylistId();
      if (playlistId) {
        await storage.local.remove(`${playlistId}_hidden`);
      }
    } else {
      initializeChecklist();
    }
  });
  
  document.body.appendChild(button);
}

// Watch for URL changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      const playlistId = getPlaylistId();
      if (playlistId) {
        addFloatingButton();
        initializeChecklist();
      } else {
        // Hide checklist if not on a playlist
        if (checklistPanel) {
          checklistPanel.style.display = 'none';
        }
        const floatingButton = document.getElementById('ypc-floating-button');
        if (floatingButton) {
          floatingButton.style.display = 'none';
        }
      }
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Initial setup
setTimeout(() => {
  const playlistId = getPlaylistId();
  if (playlistId) {
    addFloatingButton();
    initializeChecklist();
  }
}, 2000);