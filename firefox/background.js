// background.js - Background script for YouTube Playlist Checker (Firefox version)

// Use browser API for Firefox compatibility
const browserAPI = (typeof browser !== 'undefined' ? browser : chrome);

// Listen for installation
browserAPI.runtime.onInstalled.addListener(() => {
  console.log('YouTube Playlist Checker installed successfully!');
});

// Handle any messages from content scripts if needed
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStorageData') {
    browserAPI.storage.local.get(request.key).then((result) => {
      sendResponse(result);
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'setStorageData') {
    browserAPI.storage.local.set(request.data).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});