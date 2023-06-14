if (readCookie('cookie-notice-dismissed') == 'true') {
  const analytics = `{% include analytics.html %}`;
  document.querySelector("body").insertAdjacentHTML("beforeend", analytics);
  
} else {
  document.getElementById('cookie-notice').style.display = 'block';
}