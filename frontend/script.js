//  this is a js file for responsiveness and interactivity
// Mobile menu toggle functionality


(function() {
    // Select the landing page button and menu using their IDs
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    // Check if both elements were found
    if (menuToggle && navMenu) {
        // Add the click event listener
        menuToggle.addEventListener('click', () => {
            // Toggle the .active class on the menu itself
            navMenu.classList.toggle('active');
        });
    }

    // --- Keep the rest of your JS code below ---

})();
// Profile Dropdown Toggle
(function() {
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', function(event) {
            event.preventDefault();
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!profileToggle.contains(event.target) && !profileDropdown.contains(event.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }
})();


// Tab Switching
(function() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length > 0 && tabContents.length > 0) {
        tabLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                const tabId = link.getAttribute('data-tab');

                // Remove active class from all tabs
                tabLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');

                // Show/hide tab content
                tabContents.forEach(function(content) {
                    content.classList.toggle('active', content.id === 'tab-' + tabId);
                });
            });
        });
    }
})();

// =====================
// Modal Functionality
// =====================
(function() {
    const openModalBtnDesktop = document.getElementById('openModalBtnDesktop');
    const openModalBtnMobile = document.getElementById('openModalBtnMobile');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const deliveryModal = document.getElementById('deliveryModal');
    const parcelForm = document.getElementById('parcelForm'); // Moved up for scope

    // Elements for 'Other' details functionality (NEW)
    const parcelTypeSelect = document.getElementById('parcelType');
    const otherDetailsGroup = document.getElementById('otherDetailsGroup');
    const otherDetailsTextarea = document.getElementById('otherDetails');


    function openModal(event) {
        if (event) {
            event.preventDefault();
        }
        if (deliveryModal) {
            deliveryModal.classList.add('active');
        }
    }

    function closeModal() {
        if (deliveryModal) deliveryModal.classList.remove('active');
    }
    
    // --- NEW: Toggle Visibility of 'Other Details' ---
    function toggleOtherDetails() {
        if (!parcelTypeSelect || !otherDetailsGroup || !otherDetailsTextarea) return;

        if (parcelTypeSelect.value === 'other') {
            otherDetailsGroup.style.display = 'block';
            otherDetailsTextarea.setAttribute('required', 'required');
        } else {
            otherDetailsGroup.style.display = 'none';
            otherDetailsTextarea.removeAttribute('required');
            // Optional: Clear the value when hidden to ensure clean data submission
            otherDetailsTextarea.value = ''; 
        }
    }

    // Attach listener for 'Parcel Type' change (NEW)
    if (parcelTypeSelect) {
        parcelTypeSelect.addEventListener('change', toggleOtherDetails);
    }
    
    // Run on content load to set initial state (e.g., if page cached) (NEW)
    document.addEventListener('DOMContentLoaded', toggleOtherDetails); 
    // --------------------------------------------------


    if (openModalBtnDesktop) openModalBtnDesktop.addEventListener('click', openModal);
    if (openModalBtnMobile) openModalBtnMobile.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (deliveryModal) {
        deliveryModal.addEventListener('click', function(event) {
            if (event.target === deliveryModal) closeModal();
        });
    }

    // Form submission handler
    
    if (parcelForm) {
        parcelForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(parcelForm);
            console.log('Form Submitted!');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            alert('Booking request sent!');
            closeModal();
        });
    }
})();

// Reveal first feature card text when it scrolls into view
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const card = document.querySelector('.feature-card.first-feature');
        if (!card) return;
        const text = card.querySelector('.feature-text');
        if (!text) return;

        if ('IntersectionObserver' in window) {
            // ONLY trigger when the entire card is visible
            const obs = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    // require full visibility (threshold: 1.0)
                    if (entry.isIntersecting && entry.intersectionRatio >= 1) {
                        text.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 1.0, rootMargin: '0px' });

            obs.observe(card);
        } else {
            // Fallback: immediately show if IntersectionObserver not supported
            text.classList.add('in-view');
        }
    });
})();

// Reveal image-feature cards when they are fully in view
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const cards = document.querySelectorAll('.feature-card.image-feature');
        if (!cards || cards.length === 0) return;

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 1) {
                        const text = entry.target.querySelector('.feature-text');
                        if (text) text.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 1.0, rootMargin: '0px' });

            cards.forEach(card => obs.observe(card));
        } else {
            // Fallback: reveal all immediately
            cards.forEach(card => {
                const text = card.querySelector('.feature-text');
                if (text) text.classList.add('in-view');
            });
        }
    });
})();