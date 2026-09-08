let cardsQueue = [];
let animTimer = null;

let cardObserver = null;
if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    cardObserver = new IntersectionObserver((entries, obs) => {
        const visibleCards = [];
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleCards.push(entry.target);
                obs.unobserve(entry.target);
            }
        });
        if (visibleCards.length && typeof gsap !== 'undefined') {
            gsap.to(visibleCards, {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.42,
                stagger: 0.025,
                ease: "power2.out",
                overwrite: "auto",
                clearProps: "willChange"
            });
        }
    }, {
        rootMargin: '160px 0px 80px 0px',
        threshold: 0.01
    });
}

function processCardsQueue() {
    if (!cardsQueue.length) return;

    const cardsToAnimate = cardsQueue.filter(card => card && !card.closest('.models') && !card.dataset.stActive);
    cardsQueue = [];

    if (!cardsToAnimate.length) return;

    cardsToAnimate.forEach(c => {
        c.dataset.stActive = "true";
    });

    if (cardObserver && typeof gsap !== 'undefined') {
        gsap.set(cardsToAnimate, { y: 18, scale: 0.96, opacity: 0 });
        cardsToAnimate.forEach(c => cardObserver.observe(c));
    } else if (typeof gsap !== 'undefined') {
        gsap.set(cardsToAnimate, { y: 0, scale: 1, opacity: 1 });
    }
}

window.observeCard = function(card) {
    if (!card || card.closest('.models')) return;
    cardsQueue.push(card);
    if (animTimer) clearTimeout(animTimer);
    animTimer = setTimeout(processCardsQueue, 30);
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cards-grid .card').forEach(card => {
        window.observeCard(card);
    });
});
