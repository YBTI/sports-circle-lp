document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.snap-section');
    const navDots = document.querySelectorAll('.nav-dot');
    const hamburger = document.getElementById('hamburger');
    const sideNav = document.getElementById('side-nav');
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

        // Reset scroll position of content boxes when switching
        const contentBox = sections[currentIndex].querySelector('.content-box');
        if (contentBox) {
            contentBox.scrollTop = 0;
        }

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
            if (hamburger && hamburger.classList.contains('is-active')) {
                hamburger.classList.remove('is-active');
                sideNav.classList.remove('is-open');
            }
        });
    });

    // Hamburger Menu Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            sideNav.classList.toggle('is-open');
        });
    }

    // Dynamic Note Article Fetching
    async function fetchNoteArticles() {
        const reportGrid = document.getElementById('report-grid');
        if (!reportGrid) return;

        const rssUrl = 'https://note.com/camellia_soccer/rss';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                const items = data.items.slice(0, 3);
                reportGrid.innerHTML = ''; // Clear loading state

                items.forEach(item => {
                    const card = document.createElement('a');
                    card.href = item.link;
                    card.target = '_blank';
                    card.className = 'report-card';

                    // Extract image from description or use placeholder
                    let thumbUrl = '';
                    const imgMatch = item.description.match(/<img[^>]+src="([^">?]+)/);
                    if (imgMatch) {
                        thumbUrl = imgMatch[1];
                    } else if (item.enclosure && item.enclosure.link) {
                        thumbUrl = item.enclosure.link;
                    } else if (item.thumbnail) {
                        thumbUrl = item.thumbnail;
                    }

                    const pubDate = new Date(item.pubDate);
                    const formattedDate = `${pubDate.getFullYear()}.${(pubDate.getMonth() + 1).toString().padStart(2, '0')}.${pubDate.getDate().toString().padStart(2, '0')}`;

                    card.innerHTML = `
                        <div class="report-thumb" style="background-image: url('${thumbUrl}')"></div>
                        <div class="report-info">
                            <span class="date">${formattedDate}</span>
                            <h3>${item.title}</h3>
                        </div>
                    `;
                    reportGrid.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error fetching Note articles:', error);
            reportGrid.innerHTML = '<p>記事の読み込みに失敗しました。</p>';
        }
    }

    fetchNoteArticles();
});
