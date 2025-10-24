/**
 * Café Bornträger - Gallery Modal
 * Handles image gallery lightbox functionality
 */

(function() {
    'use strict';

    // ===================================
    // Gallery Modal Elements
    // ===================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryModal = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const modalCounter = document.getElementById('modalCounter');

    let currentImageIndex = 0;
    const totalImages = galleryItems.length;

    // Array to store all image sources
    const imageSources = Array.from(galleryItems).map(item => {
        return item.querySelector('img').src;
    });

    // ===================================
    // Open Gallery Modal
    // ===================================
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            openGallery(index);
        });

        // Keyboard accessibility
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGallery(index);
            }
        });

        // Make gallery items keyboard accessible
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Bild ${index + 1} vergrößern`);
    });

    function openGallery(index) {
        currentImageIndex = index;
        updateModalImage();
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Focus trap for accessibility
        modalClose.focus();
    }

    // ===================================
    // Close Gallery Modal
    // ===================================
    function closeGallery() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeGallery);
    }

    // Close on background click
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeGallery();
        }
    });

    // ===================================
    // Navigate Gallery
    // ===================================
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % totalImages;
        updateModalImage();
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        updateModalImage();
    }

    if (modalNext) {
        modalNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
    }

    if (modalPrev) {
        modalPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevImage();
        });
    }

    // ===================================
    // Update Modal Image
    // ===================================
    function updateModalImage() {
        // Add loading state
        modalImage.style.opacity = '0';

        setTimeout(() => {
            modalImage.src = imageSources[currentImageIndex];
            modalImage.alt = `Café Bornträger - Bild ${currentImageIndex + 1}`;
            modalCounter.textContent = `${currentImageIndex + 1} / ${totalImages}`;

            // Fade in new image
            modalImage.style.opacity = '1';
        }, 150);
    }

    // ===================================
    // Keyboard Navigation
    // ===================================
    document.addEventListener('keydown', (e) => {
        if (!galleryModal.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeGallery();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
        }
    });

    // ===================================
    // Touch/Swipe Support for Mobile
    // ===================================
    let touchStartX = 0;
    let touchEndX = 0;

    galleryModal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryModal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - show next
                showNextImage();
            } else {
                // Swiped right - show previous
                showPrevImage();
            }
        }
    }

    // ===================================
    // Preload Adjacent Images
    // ===================================
    function preloadAdjacentImages() {
        const nextIndex = (currentImageIndex + 1) % totalImages;
        const prevIndex = (currentImageIndex - 1 + totalImages) % totalImages;

        // Preload next and previous images
        [nextIndex, prevIndex].forEach(index => {
            const img = new Image();
            img.src = imageSources[index];
        });
    }

    // Preload images when modal opens
    galleryModal.addEventListener('transitionend', (e) => {
        if (e.target === galleryModal && galleryModal.classList.contains('active')) {
            preloadAdjacentImages();
        }
    });

    // ===================================
    // Image Loading Animation
    // ===================================
    modalImage.addEventListener('load', () => {
        modalImage.style.transition = 'opacity 0.3s ease';
    });

    // ===================================
    // Prevent Modal Image Dragging
    // ===================================
    if (modalImage) {
        modalImage.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    // ===================================
    // Gallery Hover Effect Enhancement
    // ===================================
    galleryItems.forEach(item => {
        const img = item.querySelector('img');

        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.02)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });

    // ===================================
    // Accessibility Enhancements
    // ===================================

    // Add aria labels to navigation buttons
    if (modalPrev) {
        modalPrev.setAttribute('aria-label', 'Vorheriges Bild');
    }

    if (modalNext) {
        modalNext.setAttribute('aria-label', 'Nächstes Bild');
    }

    if (modalClose) {
        modalClose.setAttribute('aria-label', 'Galerie schließen');
    }

    // Announce image changes to screen readers
    function announceImageChange() {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Bild ${currentImageIndex + 1} von ${totalImages}`;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Add screen reader only class to CSS
    const srOnlyStyle = document.createElement('style');
    srOnlyStyle.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(srOnlyStyle);

    // ===================================
    // Performance Optimization
    // ===================================

    // Lazy load gallery images
    const galleryImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                galleryImageObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px'
    });

    galleryItems.forEach(item => {
        galleryImageObserver.observe(item);
    });

    console.log(`🖼️  Gallery initialized with ${totalImages} images`);

})();
