const story = document.querySelector('[data-story]');
const stage = story.querySelector('.story-visual');
const links = [...story.querySelectorAll('.story-nav a')];
const steps = [...story.querySelectorAll('.step')];
const media = matchMedia('(min-width: 920px) and (min-height: 660px) and (prefers-reduced-motion: no-preference)');
let frame = null;
let current = -1;

function syncScene() {
  frame = null;
  if (!media.matches) return;

  const readingLine = window.innerHeight * .51;
  let next = 0;
  steps.forEach((step, index) => {
    if (step.getBoundingClientRect().top <= readingLine) next = index;
  });
  if (current === next) return;
  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === next);
    stage.children[index].classList.toggle('is-active', index === next);
    if (index === next) links[index].setAttribute('aria-current', 'step');
    else links[index].removeAttribute('aria-current');
  });
  current = next;
}

function schedule() {
  if (!media.matches || frame !== null) return;
  frame = requestAnimationFrame(syncScene);
}

function updateLayout() {
  if (media.matches && !stage.children.length) {
    stage.replaceChildren(...steps.map(step => step.querySelector('[data-scene]').cloneNode(true)));
  }
  story.toggleAttribute('data-enhanced', media.matches);
  if (!media.matches) {
    links.forEach(link => link.removeAttribute('aria-current'));
    current = -1;
  }
  syncScene();
}

updateLayout();
media.addEventListener('change', updateLayout);
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);

const motionAllowed = matchMedia('(prefers-reduced-motion: no-preference)');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    if (motionAllowed.matches && (!media.matches || target.classList.contains('comparison'))) {
      target.animate(
        [{ opacity: .72, transform: 'translateY(20px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 550, easing: 'cubic-bezier(.22,.68,.24,1)' },
      );
    }
    revealObserver.unobserve(target);
  });
}, { threshold: .24 });

document.querySelectorAll('.step > [data-scene], .comparison').forEach((panel) => revealObserver.observe(panel));
