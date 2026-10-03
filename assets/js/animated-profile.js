document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-img');
    const profileWrapper = document.getElementById('profile-wrapper');
    const backLayer = document.getElementById('profile-icons-back');
    const frontLayer = document.getElementById('profile-icons-front');

    if (!profileImg || !profileWrapper || !backLayer || !frontLayer) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const iconClasses = [
        'fa-solid fa-gamepad',
        'fa-solid fa-ghost',
        'fa-solid fa-bug',
        'fa-solid fa-bolt',
        'fa-solid fa-dice',
        'fa-solid fa-rocket',
        'fa-solid fa-dragon',
        'fa-solid fa-wand-magic-sparkles'
    ];
    const poolSize = 24;
    const laneCount = 4;
    const objectsPerLane = poolSize / laneCount;
    const maxIconSize = 34;
    const edgeFade = 72;
    const spawnGap = 48;
    const bobAmplitude = 8;

    function randomBaseY(size, height) {
        const minY = Math.min(height / 2, size / 2 + bobAmplitude);
        const maxY = Math.max(minY, height - size / 2 - bobAmplitude);
        return minY + Math.random() * (maxY - minY);
    }

    // Stagger each lane like offset rows so the screen stays populated.
    // These DOM nodes are created once and reused for every pass.
    const iconPool = Array.from({ length: poolSize }, (_, index) => {
        const lane = Math.floor(index / objectsPerLane);
        const slot = index % objectsPerLane;
        const inFront = (lane + slot) % 2 === 0;
        const size = inFront ? 26 + Math.random() * 8 : 19 + Math.random() * 6;
        const element = document.createElement('i');

        element.className = iconClasses[index % iconClasses.length];
        element.setAttribute('aria-hidden', 'true');
        Object.assign(element.style, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${size}px`,
            height: `${size}px`,
            color: 'rgb(56, 189, 248)',
            fontSize: `${size * 0.82}px`,
            lineHeight: '1',
            pointerEvents: 'none',
            willChange: 'transform, opacity'
        });
        (inFront ? frontLayer : backLayer).appendChild(element);

        return {
            element,
            lane,
            slot,
            inFront,
            x: 0,
            speed: 0,
            size,
            phase: index * 0.73,
            baseY: 0,
            baseOpacity: inFront ? 0.88 : 0.28
        };
    });

    let width = 0;
    let padding = 0;
    let trackLength = 0;
    let lastTimestamp;
    let elapsed = 0;
    let animationFrame = null;
    let pageVisible = !document.hidden;
    let inViewport = typeof IntersectionObserver === 'undefined';

    function stopAnimation() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        lastTimestamp = undefined;
    }

    function syncAnimation() {
        if (pageVisible && inViewport) {
            if (animationFrame === null) animationFrame = requestAnimationFrame(animate);
        } else {
            stopAnimation();
        }
    }

    function updateLayout(initial = false) {
        const nextWidth = backLayer.clientWidth;
        const nextPadding = spawnGap * objectsPerLane / 2 + maxIconSize / 2;
        const nextTrackLength = nextWidth + nextPadding * 2;
        const layerHeight = backLayer.clientHeight;
        const minSpeed = Math.max(110, nextWidth / 10);
        const maxSpeed = Math.max(minSpeed + 40, nextWidth / 6);

        if (initial || trackLength === 0) {
            iconPool.forEach(icon => {
                const stagger = icon.lane % 2 === 0 ? 0 : 0.5;
                const fraction = ((icon.slot + 0.5 + stagger) / objectsPerLane) % 1;
                icon.x = -nextPadding + fraction * nextTrackLength;
            });
        } else {
            iconPool.forEach(icon => {
                const position = (((icon.x + padding) % trackLength) + trackLength) % trackLength;
                icon.x = -nextPadding + (position / trackLength) * nextTrackLength;
            });
        }

        width = nextWidth;
        padding = nextPadding;
        trackLength = nextTrackLength;
        iconPool.forEach(icon => {
            // Give every icon an independent speed and vertical position. Keep
            // both stable during resize; only choose new values on first setup.
            if (initial || icon.speed === 0) {
                icon.speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
            }
            icon.baseY = randomBaseY(icon.size, layerHeight);
        });
    }

    updateLayout(true);
    window.addEventListener('resize', () => updateLayout());
    document.addEventListener('visibilitychange', () => {
        pageVisible = !document.hidden;
        syncAnimation();
    });

    if ('IntersectionObserver' in window) {
        inViewport = false;
        const observer = new IntersectionObserver(entries => {
            inViewport = entries.some(entry => entry.isIntersecting);
            syncAnimation();
        });
        observer.observe(backLayer.parentElement || backLayer);
    }

    function animate(timestamp) {
        animationFrame = null;
        if (!pageVisible || !inViewport) return;
        if (lastTimestamp === undefined) lastTimestamp = timestamp;
        const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
        lastTimestamp = timestamp;
        elapsed += delta;

        const profileAngle = elapsed * 0.7;
        profileWrapper.style.transform = `translate(${Math.sin(profileAngle) * 8}px, ${Math.cos(profileAngle * 0.7) * 4}px)`;

        iconPool.forEach(icon => {
            icon.x -= icon.speed * delta;
            while (icon.x < -padding) {
                icon.x += trackLength;
                icon.baseY = randomBaseY(icon.size, backLayer.clientHeight);
                icon.speed = Math.max(110, width / 10) + Math.random() * (Math.max(150, width / 6) - Math.max(110, width / 10));
            }

            const fadeIn = Math.max(0, Math.min(1, (icon.x + icon.size / 2) / edgeFade));
            const fadeOut = Math.max(0, Math.min(1, (width + icon.size / 2 - icon.x) / edgeFade));
            const opacity = icon.baseOpacity * Math.min(fadeIn, fadeOut);
            const y = icon.baseY + Math.sin(elapsed * 1.1 + icon.phase) * bobAmplitude;

            icon.element.style.transform = `translate3d(${icon.x - icon.size / 2}px, ${y - icon.size / 2}px, 0)`;
            icon.element.style.opacity = `${opacity}`;
        });

        syncAnimation();
    }

    syncAnimation();
});
