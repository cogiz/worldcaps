function launchPerfectGeographyVictory() {
    const successAudio = new Audio("../assets/region_success.mp3");
    successAudio.play();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        pointer-events: none; z-index: 9999; overflow: hidden;
    `;
    document.body.appendChild(wrapper);

    // 100-120 pieces for that "Perfect 52/52" feeling
    for (let i = 0; i < 110; i++) {
        const piece = document.createElement('div');
        
        // Color logic: Primarily Green (#00FF00), with Black (#000000) accents
        const rand = Math.random();
        let color = '#00FF00'; // Default Green
        if (rand > 0.8) color = '#000000';      // 20% Black accents
        else if (rand > 0.6) color = '#008800'; // 20% Dark Green for depth
        
        piece.style.cssText = `
            position: absolute; width: 9px; height: 9px;
            background: ${color}; bottom: -10px; left: 50%;
            opacity: 0; border-radius: 1px;
        `;

        // Physics: A wide fountain burst
        const xSpread = (Math.random() - 0.5) * 1100; 
        const yHeight = Math.random() * 15 + 85; // Fly up 85-100% of screen
        const duration = Math.random() * 0.8 + 2.2; 
        const delay = Math.random() * 0.4;

        piece.animate([
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${xSpread}px, -${yHeight}vh) rotate(${Math.random() * 500}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            delay: delay * 1000,
            easing: 'ease-out',
            fill: 'forwards'
        });

        wrapper.appendChild(piece);
    }

    setTimeout(() => wrapper.remove(), 5000);
}
