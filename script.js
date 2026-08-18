const copyButton = document.querySelector('#copy-ip');
const feedback = document.querySelector('#copy-feedback');
const ip = document.querySelector('#server-ip').textContent;

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(ip);
    feedback.textContent = 'Address copied — see you there.';
    copyButton.firstChild.textContent = 'Copied ';
  } catch {
    feedback.textContent = `Copy this address: ${ip}`;
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((element) => observer.observe(element));

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', open);
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', () => header.classList.remove('menu-open')));
