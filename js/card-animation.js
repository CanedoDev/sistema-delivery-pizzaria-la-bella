// Otimização de Performance: Animação fluida com IntersectionObserver nativo
// Sem stagger atrasando os cards e com aceleração de hardware (force3D: true)

let cardObserver = null;

function getCardObserver() {
    if (!cardObserver && typeof IntersectionObserver !== 'undefined') {
        cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                if (entry.isIntersecting) {
                    if (typeof gsap !== 'undefined') {
                        gsap.to(card, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.45,
                            ease: "power2.out",
                            force3D: true,
                            overwrite: "auto",
                            onComplete: () => {
                                card.style.willChange = 'auto';
                            }
                        });
                    } else {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }
                    // Desconecta o observer deste card após animar para zerar o consumo de CPU em scroll
                    cardObserver.unobserve(card);
                }
            });
        }, {
            rootMargin: "0px 0px 80px 0px",
            threshold: 0.05
        });
    }
    return cardObserver;
}

window.observeCard = function(card) {
    if (!card || card.closest('.models')) return;

    if (window.innerWidth <= 768) {
        card.style.opacity = '1';
        card.style.transform = 'none';
        return;
    }

    // Estado inicial suave e leve
    card.style.opacity = '0';
    card.style.transform = 'scale(0.85)';
    card.style.willChange = 'transform, opacity';

    const observer = getCardObserver();
    if (observer) {
        observer.observe(card);
    } else {
        card.style.opacity = '1';
        card.style.transform = 'none';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Cards da home: animam todos juntos sem stagger
    document.querySelectorAll('.cards-grid .card').forEach(card => {
        window.observeCard(card);
    });
});
