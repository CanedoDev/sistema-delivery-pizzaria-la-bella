document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("global-loader");
    if (!loader) return;

    if (typeof gsap === "undefined") {
        loader.classList.add("hidden");
        setTimeout(() => loader.remove(), 200);
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const circleDur = isMobile ? 0.42 : 0.55;
    const logoDur = isMobile ? 0.42 : 0.52;

    let dismissed = false;
    const dismissLoader = () => {
        if (dismissed) return;
        dismissed = true;
        clearTimeout(fallbackTimer);
        document.body.style.overflow = "";
        loader.classList.add("hidden");
        setTimeout(() => {
            try { loader.remove(); } catch(e) {}
        }, 150);
    };

    const tl = gsap.timeline({
        delay: 0.15,
        onComplete: dismissLoader
    });

    tl.to(".eat-circle", {
        strokeDashoffset: 158,
        duration: circleDur,
        ease: "power2.inOut"
    })
    .to(".pizza-svg", {
        opacity: 0,
        scale: 0.5,
        duration: 0.12
    }, "-=0.04")
    .to(".loader-logo", {
        scale: 1,
        opacity: 1,
        duration: logoDur,
        ease: "elastic.out(1, 0.7)"
    }, "-=0.04")
    .to({}, { duration: 0.18 })
    .to(loader, {
        yPercent: -100,
        duration: 0.48,
        ease: "power3.inOut"
    });

    const fallbackTimer = setTimeout(dismissLoader, 3000);
});
