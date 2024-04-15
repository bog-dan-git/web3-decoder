if (window.browser && window.browser.devtools) {
  window.browser.devtools.panels.create(
    'Web3 Requests',
    'icon.png',
    'index.html',
  );
} else {
  window.chrome.devtools.panels.create(
    'Web3 Requests',
    'icon.png',
    'index.html',
    null,
  );
}
