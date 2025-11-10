// JS for responsiveness and interactivity

// Mobile Menu Toggle

(function() {
    const menuToggle = document.querySelector('.menuToggle');
    const mainNav = document.querySelector('.main-nav');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Landing page navbar toggle
    const menuToggleLanding = document.querySelector('.menu-toggle-landing');

    if (menuToggleLanding && navMenu) {
        menuToggleLanding.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
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

    function openModal(event) {
        if (event) event.preventDefault();
        if (deliveryModal) deliveryModal.classList.add('active');
    }

    function closeModal() {
        if (deliveryModal) deliveryModal.classList.remove('active');
    }

    if (openModalBtnDesktop) openModalBtnDesktop.addEventListener('click', openModal);
    if (openModalBtnMobile) openModalBtnMobile.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (deliveryModal) {
        deliveryModal.addEventListener('click', function(event) {
            if (event.target === deliveryModal) closeModal();
        });
    }

    // Form submission
    const parcelForm = document.getElementById('parcelForm');
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

// =====================
// Track Button Functionality
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const trackBtn = document.getElementById('trackBtn');
    const trackingNumber = document.getElementById('trackingNumber');
    const trackingResult = document.getElementById('trackingResult');
    const liveMapLink = document.getElementById('liveMapLink');

    if (trackBtn && trackingNumber && trackingResult) {
        trackBtn.addEventListener('click', function() {
            const orderNumber = trackingNumber.value.trim();
            if (orderNumber) {
                trackingResult.style.display = 'block';
                // TODO: Integrate live tracking API here
            } else {
                alert('Please enter an order number');
            }
        });

        trackingNumber.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') trackBtn.click();
        });
    }
});

// =====================
// Admin Dashboard Charts
// =====================
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof Chart !== 'undefined') {
            // Deliveries Chart
            const deliveriesCtx = document.getElementById('deliveriesChart');
            if (deliveriesCtx) {
                new Chart(deliveriesCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                            label: 'Total Deliveries',
                            data: [85, 92, 105, 118, 132, 145, 158, 172, 185, 198, 210, 247],
                            borderColor: '#4a7c2a',
                            backgroundColor: 'rgba(74, 124, 42, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }

            // Users Chart
            const usersCtx = document.getElementById('usersChart');
            if (usersCtx) {
                new Chart(usersCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                            label: 'Active Users',
                            data: [120, 145, 168, 192, 215, 238, 262, 285, 308, 332, 355, 856],
                            backgroundColor: '#4a7c2a',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }

            // Status Pie Chart
            const statusCtx = document.getElementById('statusChart');
            if (statusCtx) {
                new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Successful', 'In Transit', 'Pending', 'Failed'],
                        datasets: [{
                            data: [1189, 35, 12, 11],
                            backgroundColor: ['#4a7c2a', '#6c757d', '#fd7e14', '#dc3545']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }
        }

        // Driver availability check
        checkDriverAvailability();
        setInterval(checkDriverAvailability, 30000);
    });

    function checkDriverAvailability() {
        const availableDrivers = 0; // Simulated
        const alertDiv = document.getElementById('noDriverAlert');
        const normalDiv = document.getElementById('normalStatus');

        if (availableDrivers === 0) {
            if (alertDiv) alertDiv.style.display = 'block';
            if (normalDiv) normalDiv.style.display = 'none';
        } else {
            if (alertDiv) alertDiv.style.display = 'none';
            if (normalDiv) normalDiv.style.display = 'block';
        }
    }
})();

// =====================
// Simple Front-End View Switching
// =====================
const isLoggedIn = false; // Change manually or via server logic
const isAuthenticated = true; // Change this in real app

const basicStatus = document.getElementById('basicStatus');
const liveMapGate = document.getElementById('liveMapGate');
const loggedInDetails = document.getElementById('loggedInDetails');
const liveMapWrapper = document.getElementById('liveMapWrapper');
const loginSignupBtn = document.getElementById('loginSignupBtn');
const backToDashLink = document.getElementById('backToDashLink');
const profileMenu = document.getElementById('profileMenu');

if (isLoggedIn) {
    liveMapWrapper.style.display = 'block';
    loggedInDetails.style.display = 'block';
    basicStatus.style.display = 'none';
    liveMapGate.style.display = 'none';
    loginSignupBtn.style.display = 'none';
    backToDashLink.style.display = 'inline-block';
    profileMenu.style.display = 'block';
} else {
    liveMapWrapper.style.display = 'none';
    loggedInDetails.style.display = 'none';
    basicStatus.style.display = 'block';
    liveMapGate.style.display = 'block';
    loginSignupBtn.style.display = 'inline-block';
    backToDashLink.style.display = 'none';
    profileMenu.style.display = 'none';
}

// Authentication Redirect
if (!isAuthenticated) {
    const currentPath = encodeURIComponent(window.location.href);
    window.location.replace(`Login.html?redirect=${currentPath}`);
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
});

// On load, apply saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}
