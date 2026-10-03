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

    previousButton.addEventListener('click', () => scrollByPage(-1));
    nextButton.addEventListener('click', () => scrollByPage(1));
    scroller.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    updateButtons();
});
