document.addEventListener('DOMContentLoaded', () => {
    // Animated Profile with Math Functions
    const profileImg = document.getElementById('profile-img');
    const profileWrapper = document.getElementById('profile-wrapper');
    const floatingIconsContainer = document.getElementById('floating-icons');
    if (!profileImg || !profileWrapper) return;

    // Floating icons configuration - game-related icons that fly opposite to profile movement
    const icons = [
        { icon: 'fa-solid fa-gamepad', delay: 0 },
        { icon: 'fa-solid fa-ghost', delay: 1.5 },
        { icon: 'fa-solid fa-bug', delay: 3.0 },
        { icon: 'fa-solid fa-bolt', delay: 4.5 },
        { icon: 'fa-solid fa-dice', delay: 6.0 },
        { icon: 'fa-solid fa-rocket', delay: 7.5 }
    ];

    // Animation state - use a loop time for smooth, periodic motion
    const LOOP_DURATION = 3; // seconds for one full cycle
    let loopTime = 0;
    let lastTimestamp = 0;

    // Create floating icon elements
    const floatingIcons = [];
    icons.forEach((iconConfig, index) => {
        const iconEl = document.createElement('i');
        iconEl.className = `${iconConfig.icon} text-sky-400/40 text-lg absolute pointer-events-none`;
        floatingIconsContainer.appendChild(iconEl);
        floatingIcons.push({ el: iconEl, index: index, delay: iconConfig.delay });
    });

    // Animation function using sin/cos for profile bobbing
    function animate(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const dt = (timestamp - lastTimestamp) / 1000; // seconds
        lastTimestamp = timestamp;
        loopTime += dt;

        // Normalize to loop time - this creates smooth, repeating motion
        // The modulo creates a seamless loop from 0 to LOOP_DURATION
        const t = loopTime % LOOP_DURATION;
        // Normalize to 0..1 range for smoother control
        const normalized = t / LOOP_DURATION;
        // Convert to radians for sin/cos functions (full 2π cycle per loop)
        const angle = normalized * Math.PI * 2;

        // Profile bobbing with sin/cos - gentle, floating motion
        const bobX = Math.sin(angle) * 12;  // horizontal bob (gentler)
        const bobY = Math.cos(angle * 0.7) * 6;  // vertical bob with different frequency

        // Apply transformation to profile
        profileWrapper.style.transform = `translate(${bobX}px, ${bobY}px)`;

        // Floating icons move opposite to profile movement
        floatingIcons.forEach((icon, i) => {
            // Each icon has a different phase offset
            const phase = icon.delay * Math.PI / 4; // spread phases across circle
            // Use normalized time for consistent looping
            const iconAngle = normalized * Math.PI * 2 + phase;
            
            // Icons move opposite to profile - with varying speeds
            const speedVariation = 0.8 + (i % 3) * 0.2; // slight speed variation
            const effectiveAngle = iconAngle * speedVariation;

            // Horizontal position: opposite direction to profile
            const xOffset = -(Math.sin(effectiveAngle) * 25);
            const yOffset = Math.cos(effectiveAngle * 0.5) * 10;

            // Spread icons across the container
            const spread = 300;
            const baseX = (i / icons.length) * spread - spread / 2;
            const xPos = baseX + xOffset;
            const yPos = 55 + yOffset; // position icons below profile

            icon.el.style.transform = `translate(${xPos}px, ${yPos}px)`;

            // Opacity oscillation - icons fade in/out smoothly
            const opacity = 0.7 + Math.sin(angle + phase) * 0.3;
            icon.el.style.opacity = Math.max(0.5, Math.min(1.0, opacity));
        });

        // Request next frame
        requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);
});