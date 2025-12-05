// config.js
// Centralized configuration utilities

// Return default configuration object
function getDefaultConfig() {
  return {
    device: (screen.width <= 800 ? "mobile" : "desktop"), // user-adjustable device type
    global: {
      desktopZoomScale: 1.0, // default zoom when using desktop mode
      mobileZoomScale: 2.0   // default zoom when using mobile mode
    },
    sites: {
      "youtube.com": { mode: "desktop", zoomScale: 2.0, rule: "desktopOnly" },
      "youtu.be":    { mode: "desktop", zoomScale: 2.0, rule: "desktopOnly" },
      "spotify.com": { mode: "desktop", zoomScale: 2.0, rule: "forceDesktop" },
      "tiktok.com":  { mode: "desktop", zoomScale: 2.0, rule: "forceDesktop" },
      "bilibili.com":  { mode: "desktop", zoomScale: 2.0, rule: "forceDesktop" },
      "douyin.com": { mode: "desktop", zoomScale: 2.0, rule: "forceDesktop" },
      "xiaohongshu.com": { mode: "desktop", zoomScale: 2.0, rule: "forceDesktop" },
    }
  };
}

// Load config or initialize defaults if missing
// Load config or initialize defaults if missing
function loadConfig(callback) {
  chrome.storage.sync.get({ config: null }, function(items) {
    const defaultConfig = getDefaultConfig();

    if (!items.config) {
      // Nothing saved yet → use defaults
      chrome.storage.sync.set({ config: defaultConfig }, function() {
        callback(defaultConfig);
      });
    } else {
      // Merge defaults with stored config
      const stored = items.config;

      // Ensure global keys exist
      stored.global = Object.assign({}, defaultConfig.global, stored.global);

      // Ensure sites include all defaults
      stored.sites = Object.assign({}, defaultConfig.sites, stored.sites);

      chrome.storage.sync.set({ config: stored }, function() {
        callback(stored);
      });
    }
  });
}

// Save config
function saveConfig(config, callback) {
  chrome.storage.sync.set({ config }, callback);
}

// Reset to defaults
function resetConfig(callback) {
  const defaultConfig = getDefaultConfig();
  saveConfig(defaultConfig, function() {
    callback(defaultConfig);
  });
}
