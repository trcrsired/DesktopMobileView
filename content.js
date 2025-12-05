// content.js
// Purpose: Apply global/site-specific desktop/mobile mode and zoom rules based on a user-editable config.
// Storage: Uses chrome.storage.sync with a 'config' object:
// {
//   global: { mode: "mobile"|"desktop", zoomScale: number(1.0-5.0) },
//   sites:  { "<domain>": { mode, zoomScale, rule } }
// }
// Rules:
// - desktopOnly: skip logic on mobile UA; only apply when UA looks desktop
// - forceDesktop: warn the user if mobile mode is chosen (sites often push app installs)

(function() {
  const DEBUGMOBILE = false;

  // Debug helper: show alert messages when DEBUGMOBILE is true
  function debug(msg) {
    if (DEBUGMOBILE)
    {
      alert("[DesktopMobileView] " + msg);
    }
    else
    {
      console.log(msg);
    }
  }

  // Apply zoom scaling to the entire document
  function applyZoom(scale) {
    document.documentElement.style.zoom = scale;
    debug("Applied zoom scale: " + scale);
  }

  // Detect if current UA string indicates a mobile device
  function isMobileUA() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("android") || ua.includes("iphone") || ua.includes("mobile");
  }

  // Resolve settings: only apply global defaults if site is listed
  function resolveSettings(config, host) {
    let mode = null;
    let zoom = null;
    let rule = "";

    for (const site in config.sites) {
      const regex = new RegExp(`(^|\\.)${site.replace(/\./g, "\\.")}$`, "i");
      if (regex.test(host)) {
        const s = config.sites[site];
        mode = s.mode || config.global.mode;
        // If site has zoomScale, use it; otherwise use global defaults
        if (s.zoomScale != null) {
          zoom = s.zoomScale;
        } else {
          zoom = (mode === "desktop" ? config.global.desktopZoomScale : config.global.mobileZoomScale);
        }
        rule = s.rule || "";
        debug("Matched site " + site + " → mode=" + mode + " zoom=" + zoom + " rule=" + rule);
        break; // stop after first match
      }
    }

    // If no site matched, return null (means: do nothing)
    if (!mode) return null;

    return { mode, zoom, rule };
  }

  // Apply rules and actions: warnings and zoom
  function applyLogicForHost(settings, host) {
    if (!settings) {
      debug("No site-specific settings for " + host + " → skip.");
      return;
    }

    const { mode, zoom, rule } = settings;

    // Rule: desktopOnly → skip on mobile UA
    if (rule === "desktopOnly" && isMobileUA()) {
      debug(host + " mobile UA detected → skip processing (desktopOnly rule).");
      return;
    }

    // Rule: forceDesktop → warn user when mobile mode is chosen
    if (rule === "forceDesktop" && mode === "mobile") {
      alert("[DesktopMobileView] Warning: " + host +
            " often forces mobile users to install their app. " +
            "Switch to Desktop mode for better experience.");
    }

    // Apply zoom for both desktop and mobile modes
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => applyZoom(zoom));
    } else {
      applyZoom(zoom);
    }
    debug("Applied zoom for mode=" + mode + " scale=" + zoom);
  }

  // Main bootstrap
  try {
    const host = window.location.hostname;
    loadConfig(function(config) {
      const settings = resolveSettings(config, host);
      if (settings) {
        debug("Resolved settings → host=" + host + " mode=" + settings.mode + " zoom=" + settings.zoom + " rule=" + settings.rule);
        applyLogicForHost(settings, host);
      } else {
        debug("Host " + host + " not in config → no changes applied.");
      }
    });
  } catch (err) {
    alert("[DesktopMobileView] Error: " + err);
  }

})();
