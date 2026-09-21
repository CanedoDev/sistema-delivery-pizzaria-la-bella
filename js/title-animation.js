gsap.registerPlugin(ScrollTrigger, SplitText);

function animateTitle(title) {
    if (!title) return;

    if (title._split) {
        try { title._split.revert(); } catch(e) {}
    }

    const split = new SplitText(title, { 
        type: "words", 
        wordsClass: "split-word"
    });
    title._split = split;

    gsap.set(split.words, { opacity: 0, y: 24 });

    gsap.to(split.words, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        stagger: 0.04,
        force3D: true,
        overwrite: "auto",
        scrollTrigger: {
            trigger: title,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true
        }
    });
}

window.animateTitle = animateTitle;

function initAllTitles() {
    const titles = document.querySelectorAll(".section-title, .sobre-main-title, .clientes-title");
    titles.forEach(title => {
        animateTitle(title);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllTitles);
} else {
    initAllTitles();
}
