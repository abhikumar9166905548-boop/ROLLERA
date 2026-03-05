window.onload = () => {
    const tl = gsap.timeline();

    // 1. Character enters from left
    tl.from("#walking-char", {
        x: -400,
        duration: 1.2,
        ease: "power2.out"
    })
    // 2. Small jump (dropping the bag)
    .to("#walking-char", {
        y: -20,
        duration: 0.2,
        yoyo: true,
        repeat: 1
    })
    // 3. Character disappears
    .to("#walking-char", {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        delay: 0.3
    })
    // 4. Glass Login Card pops up with bounce
    .to("#mainCard", {
        autoAlpha: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
    }, "-=0.2"); // starts slightly before character fully fades
};

// Baaki aapke functional functions (openAuthModal, etc.) yahan niche aayenge
function openAuthModal(type) {
    console.log("Opening " + type + " modal");
    // Modal logic here
}
