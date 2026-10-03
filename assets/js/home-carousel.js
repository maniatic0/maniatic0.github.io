document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('featured-links');
    const previousButton = document.getElementById('featured-links-prev');
    const nextButton = document.getElementById('featured-links-next');

    if (!scroller || !previousButton || !nextButton) return;

    function updateButtons() {
        previousButton.disabled = scroller.scrollLeft <= 1;
        nextButton.disabled = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;
    }

    function scrollByPage(direction) {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior });
    }

    // Native overflow scrolling supports touch and trackpads, but not dragging
    // with a mouse. Add that interaction without interfering with link clicks.
    let pointerId = null;
    let startX = 0;
    let startScrollLeft = 0;
    let isDragging = false;
    let suppressClick = false;
    const dragThreshold = 5;

    scroller.style.cursor = 'grab';
    scroller.addEventListener('dragstart', (event) => event.preventDefault());

    scroller.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;

        suppressClick = false;
        pointerId = event.pointerId;
        startX = event.clientX;
        startScrollLeft = scroller.scrollLeft;
        isDragging = false;
    });

    scroller.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;

        const deltaX = event.clientX - startX;
        if (!isDragging && Math.abs(deltaX) < dragThreshold) return;

        if (!isDragging) {
            isDragging = true;
            scroller.setPointerCapture(pointerId);
            scroller.style.cursor = 'grabbing';
            scroller.style.userSelect = 'none';
        }

        event.preventDefault();
        scroller.scrollLeft = startScrollLeft - deltaX;
    });

    function endDrag(event) {
        if (event.pointerId !== pointerId) return;

        if (isDragging) {
            suppressClick = true;
            scroller.style.cursor = 'grab';
            scroller.style.removeProperty('user-select');
        }

        pointerId = null;
        isDragging = false;
        updateButtons();
    }

    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('click', (event) => {
        if (!suppressClick) return;

        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
    }, true);

    previousButton.addEventListener('click', () => scrollByPage(-1));
    nextButton.addEventListener('click', () => scrollByPage(1));
    scroller.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    updateButtons();
});
