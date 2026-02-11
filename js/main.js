document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.snap-section');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentIndex = 0;
    let isTransitioning = false;
    const transitionDuration = 800;

    // Initialize first section
    sections[0].classList.add('is-active');

    function goToSection(index) {
        if (index === currentIndex || isTransitioning) return;
        if (index < 0 || index >= sections.length) return;

        isTransitioning = true;

        // Remove states from current
        sections[currentIndex].classList.remove('is-active');
        sections[currentIndex].classList.add('is-prev');

        const prevIndex = currentIndex;
        currentIndex = index;

        // Reset and set active for target
        sections[currentIndex].classList.remove('is-prev');
        sections[currentIndex].classList.add('is-active');

        // Update Nav
        updateNav(sections[index].id);

        setTimeout(() => {
            sections[prevIndex].classList.remove('is-prev');
            isTransitioning = false;
        }, transitionDuration);
    }

    function updateNav(id) {
        navDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.dataset.section === id) {
                dot.classList.add('active');
            }
        });
    }

    // Scroll handling
    window.addEventListener('wheel', (e) => {
        if (isTransitioning) return;
        if (e.deltaY > 50) {
            goToSection(currentIndex + 1);
        } else if (e.deltaY < -50) {
            goToSection(currentIndex - 1);
        }
    }, { passive: true });

    // Touch handling for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', (e) => {
        if (isTransitioning) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToSection(currentIndex + 1);
            } else {
                goToSection(currentIndex - 1);
            }
        }
    });

    // Nav Dot Click
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSection(index);
        });
    });
});
