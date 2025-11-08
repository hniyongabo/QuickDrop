//  this is a js file for responsiveness and interactivity
// Mobile menu toggle functionality
(function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
})();

// Profile dropdown toggle
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

// Tab switching (for dashboards with tabs)
(function() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length > 0 && tabContents.length > 0) {
        tabLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                const tabId = link.getAttribute('data-tab');

                // Remove active class from all tabs
                tabLinks.forEach(function(item) {
                    item.classList.remove('active');
                });
                link.classList.add('active');

                // Show/hide tab content
                tabContents.forEach(function(content) {
                    if (content.id === 'tab-' + tabId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }
})();

// Modal functionality (for delivery creation modal)
(function() {
    const openModalBtnDesktop = document.getElementById('openModalBtnDesktop');
    const openModalBtnMobile = document.getElementById('openModalBtnMobile');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const deliveryModal = document.getElementById('deliveryModal');

    function openModal(event) {
        if (event) {
            event.preventDefault();
        }
        if (deliveryModal) {
            deliveryModal.classList.add('active');
        }
    }

    function closeModal() {
        if (deliveryModal) {
            deliveryModal.classList.remove('active');
        }
    }

    if (openModalBtnDesktop) {
        openModalBtnDesktop.addEventListener('click', openModal);
    }

    if (openModalBtnMobile) {
        openModalBtnMobile.addEventListener('click', openModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (deliveryModal) {
        // Close modal when clicking overlay
        deliveryModal.addEventListener('click', function(event) {
            if (event.target === deliveryModal) {
                closeModal();
            }
        });
    }

    // Form submission handler
    const parcelForm = document.getElementById('parcelForm');
    if (parcelForm) {
        parcelForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(parcelForm);
            console.log('Form Submitted!');
            for (let [key, value] of formData.entries()) {
                console.log(key, ':', value);
            }
            
            // TODO: Send request to backend
            alert('Booking request sent!');
            closeModal();
        });
    }
})();
