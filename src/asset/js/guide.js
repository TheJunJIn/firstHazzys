import 'prismjs';
const { $ } = window;
function safeHTML(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/@/g, '&#64;');
}

const markup = document.querySelectorAll('.language-markup');
markup.forEach((html) => {
  html.innerHTML = safeHTML($.trim(html.innerHTML));
});