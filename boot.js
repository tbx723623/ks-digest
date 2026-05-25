(function () {
  try {
    const root = document.documentElement;
    const schemeStorageKey = "ksThemeScheme";
    const accentStorageKey = "ksThemeAccent";
    const accentList = ["amber", "mint", "coral", "sky", "forest"];
    let scheme = localStorage.getItem(schemeStorageKey);
    let accent = localStorage.getItem(accentStorageKey);
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;

    if (scheme !== "light" && scheme !== "dark") {
      scheme = prefersLight ? "light" : "dark";
    }

    if (!accentList.includes(accent)) {
      accent = "amber";
    }

    root.dataset.scheme = scheme;
    root.dataset.accent = accent;
    root.style.setProperty("color-scheme", scheme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", scheme === "light" ? "#faf5eb" : "#0a1117");
    }
  } catch (error) {
    // ignore theme bootstrap failures
  }
})();
