const ext = typeof browser !== "undefined" ? browser : chrome;

ext.runtime.onInstalled.addListener(() => {
  console.log("YouTube Playlist Checker installed");
});
