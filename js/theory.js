import AccordionController from './controller/AccordionController.js';

document.addEventListener('DOMContentLoaded', () => {
  new AccordionController();

  // Открыть раздел по хэшу URL (например, theory.html#threshold)
  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.querySelector(`[data-anchor="${id}"]`);
    if (target) {
      target.classList.add('open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});
