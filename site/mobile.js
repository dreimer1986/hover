/* A touch screen alone does not turn a desktop/laptop into a mobile device. */
window.hoverMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (document.currentScript.hasAttribute('data-auto-start') && window.hoverMobile &&
    new URLSearchParams(location.search).get('view') !== 'archive' && !location.hash) {
  location.replace(new URL('play/modified/', location.href));
}
