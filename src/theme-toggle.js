const KEY = 'akadly_native_theme';
const root = document.documentElement;
const buttons = document.querySelectorAll('#themeToggle button');

function apply(mode) {
  if (mode === 'light' || mode === 'dark') {
    root.setAttribute('data-theme', mode);
  } else {
    root.removeAttribute('data-theme');
  }
  const effective = mode || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  buttons.forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-theme-mode') === effective);
  });
}

apply(localStorage.getItem(KEY));

buttons.forEach((b) => {
  b.addEventListener('click', () => {
    const mode = b.getAttribute('data-theme-mode');
    localStorage.setItem(KEY, mode);
    apply(mode);
  });
});
