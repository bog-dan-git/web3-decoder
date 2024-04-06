if (browser && browser.devtools) {
  browser.devtools.panels.create('Web3 Requests', 'icon.png', 'index.html');
} else {
  chrome.devtools.panels.create(
    'Web3 Requests',
    'icon.png',
    'index.html',
    null,
  );
}
