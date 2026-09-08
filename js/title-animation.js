gsap.registerPlugin(ScrollTrigger, SplitText);

function animateTitle(title) {
    if (!title) return;

    if (title._split) {
        try { title._split.revert(); } catch(e) {}
    }

    const rect = title.getBoundingClientRect();
    const isAlreadyVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    const split = new SplitText(title, { 
        type: "words,chars", 
        wordsClass: "split-word",
        charsClass: "split-char" 
    });
    title._split = split;

    if (isAlreadyVisible) {
        gsap.from(split.chars, {
            opacity: 0,
            y: 20,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.018,
            overwrite: "auto"
        });
    } else {
        gsap.set(split.chars, { opacity: 0, y: 24 });
        gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            duration: 0.48,
            ease: "power2.out",
            stagger: 0.02,
            overwrite: "auto",
            scrollTrigger: {
                trigger: title,
                start: "top 90%",
                toggleActions: "play none none none",
                once: true,
                fastScrollEnd: true
            }
        });
    }
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
