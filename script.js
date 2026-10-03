// Local portfolio interactions. Content and case studies live in index.html.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduceMotion.matches;
const motionButton = document.querySelector('.motion-control');
function updateMotion() {
  document.body.classList.toggle('motion-paused', paused);
  motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
  motionButton.setAttribute('aria-pressed', String(paused));
}
updateMotion();
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
reduceMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });
const collage = document.querySelector('.collage');
collage.addEventListener('pointermove', event => {
  if (paused || reduceMotion.matches || event.pointerType !== 'mouse') return;
  const r = collage.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - .5;
  const y = (event.clientY - r.top) / r.height - .5;
  collage.querySelectorAll('[data-depth]').forEach(el => {
    el.style.setProperty('--mx', `${x * Number(el.dataset.depth)}px`);
    el.style.setProperty('--my', `${y * Number(el.dataset.depth)}px`);
  });
});
collage.addEventListener('pointerleave', () => {
  collage.querySelectorAll('[data-depth]').forEach(el => {
    el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px');
  });
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.body.classList.add('enhanced');
}
let scheduled = false;
function updateProgress() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('.progress').style.width = `${range > 0 ? window.scrollY / range * 100 : 0}%`;
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
let lastTrigger;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  lastTrigger = button;
  const dialog = document.getElementById(button.dataset.project);
  dialog.showModal(); dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    lastTrigger?.focus({ preventScroll: true });
  });
});
// Scale the original 1280px Canva composition as one unit.
const canvasStage = document.querySelector('.canva-stage');
if (canvasStage) {
  const resizeStage = () => canvasStage.style.setProperty('--stage-scale', String(collage.clientWidth / 1280));
  resizeStage();
  new ResizeObserver(resizeStage).observe(collage);
}
// Stop local media when its project closes.
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => dialog.querySelectorAll('video').forEach(video => video.pause()));
});
const contactSection = document.getElementById('contact');
const contactCanvas = document.querySelector('.contact-canvas');
if (contactCanvas) {
  const fitContact = () => contactCanvas.style.setProperty('--contact-scale', String(contactSection.clientWidth / 1280));
  fitContact();
  new ResizeObserver(fitContact).observe(contactSection);
}

// Tap a software icon to reveal its name; tap again to dismiss.
document.querySelectorAll('.software-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const selected = icon.getAttribute('aria-pressed') !== 'true';
    document.querySelectorAll('.software-icon').forEach(other => other.setAttribute('aria-pressed', 'false'));
    icon.setAttribute('aria-pressed', String(selected));
  });
});
