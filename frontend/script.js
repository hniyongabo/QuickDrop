//  this is a js file for responsiveness and interactivity
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

            Toast.success('Booking request sent!');
            closeModal();
        });
    }
})();

// Reveal animations for hero, track, and feature cards on scroll
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Added #heroContent to the list of elements to observe for its animation
        const elementsToAnimate = document.querySelectorAll('.fade-in-up, .feature-card.image-feature, .step, #heroContent');
        if (!elementsToAnimate || elementsToAnimate.length === 0) return;

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    // For .fade-in-up, .step, and #heroContent (Hero text) trigger at 20% visibility
                    if (entry.target.classList.contains('fade-in-up') || entry.target.classList.contains('step') || entry.target.id === 'heroContent') {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in-view');
                            observer.unobserve(entry.target);
                        }
                    }
                    // For .feature-card.image-feature, trigger at full visibility (100%)
                    else if (entry.target.classList.contains('feature-card') && entry.isIntersecting && entry.intersectionRatio >= 1) {
                        const text = entry.target.querySelector('.feature-text');
                        if (text) text.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: [0.2, 1.0], rootMargin: '0px' });

            elementsToAnimate.forEach(el => obs.observe(el));
        } else {
            // Fallback: immediately show all
            elementsToAnimate.forEach(el => {
                el.classList.add('in-view');
                const text = el.querySelector('.feature-text');
                if (text) text.classList.add('in-view');
            });
        }
    });
})();

// =====================
// SignUp Modal Functionality
// =====================
(function() {
    const roleCourier = document.getElementById('role-courier');
    const courierModal = document.getElementById('courierModal');
    const closeModal = document.querySelector('.close-btn');
    const courierDetailsForm = document.getElementById('courier-details-form');
    const mainForm = document.getElementById('main-signup-form');
    
    // Elements for Password Matching validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordMatchError = document.getElementById('password-match-error');

    // Modal Logic
    if (roleCourier) {
        roleCourier.addEventListener('change', function() {
            if (this.checked && courierModal) {
                courierModal.style.display = 'block';
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (courierModal) courierModal.style.display = 'none';
        });
    }

    if (courierModal) {
        window.addEventListener('click', function(event) {
            if (event.target === courierModal) {
                courierModal.style.display = 'none';
            }
        });
    }

    if (courierDetailsForm) {
        courierDetailsForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            document.getElementById('hidden-vehicle-model').value = document.getElementById('vehicle-model').value;
            document.getElementById('hidden-license-plate').value = document.getElementById('license-plate').value;
            document.getElementById('hidden-driver-license-num').value = document.getElementById('driver-license-num').value;
            document.getElementById('hidden-id-card-num').value = document.getElementById('id-card-num').value;
            document.getElementById('hidden-experience').value = document.getElementById('delivery-experience').value;
            document.getElementById('hidden-motivation').value = document.getElementById('motivation').value;
            Toast.success('Courier details saved! Please click "Create Account" to finalize.');
            if (courierModal) courierModal.style.display = 'none';
            if (mainForm) mainForm.setAttribute('data-courier-details-complete', 'true');
        });
    }

    // Main Form Submission and Validation
    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            let formIsValid = true;
            
            // Check Password Match
            if (passwordInput && confirmPasswordInput && passwordMatchError) {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    passwordMatchError.textContent = 'Passwords do not match.';
                    formIsValid = false;
                } else {
                    passwordMatchError.textContent = '';
                }
            }

            // Check Courier Details completion
            if (roleCourier) {
                const isCourier = roleCourier.checked;
                const detailsComplete = mainForm.getAttribute('data-courier-details-complete') === 'true';

                if (isCourier && !detailsComplete) {
                    Toast.warning('Please complete the Courier Application Details pop-up first.');
                    if (courierModal) courierModal.style.display = 'block'; 
                    formIsValid = false;
                }
            }

            // Prevent form submission if validation failed
            if (!formIsValid) {
                e.preventDefault();
                return;
            }

            // If valid, prevent default and handle API submission
            e.preventDefault();
            handleSignup();
        });
    }
})();

// =====================
// Toast Notification System
// =====================
const Toast = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    },

    show(message, type = 'success', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const colors = {
            success: { bg: '#10b981', border: '#059669' },
            error: { bg: '#ef4444', border: '#dc2626' },
            warning: { bg: '#f59e0b', border: '#d97706' },
            info: { bg: '#3b82f6', border: '#2563eb' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        toast.innerHTML = `
            <span style="font-size: 20px; flex-shrink: 0;">${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                padding: 0;
                margin-left: 8px;
            ">×</button>
        `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, duration);

        return toast;
    },

    success(message, duration) { return this.show(message, 'success', duration); },
    error(message, duration) { return this.show(message, 'error', duration); },
    warning(message, duration) { return this.show(message, 'warning', duration); },
    info(message, duration) { return this.show(message, 'info', duration); }
};

// =====================
// API Integration
// =====================
const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, includeAuth = false) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (includeAuth) {
        const token = localStorage.getItem('access_token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'An error occurred');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// =====================
// Signup Handler
// =====================
async function handleSignup() {
    const mainForm = document.getElementById('main-signup-form');
    if (!mainForm) return;

    const submitBtn = document.getElementById('signup-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Show loader and disable button
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';

    const formData = new FormData(mainForm);
    const role = formData.get('role');

    const signupData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        password: formData.get('password'),
        role: role
    };

    // Add courier-specific fields if role is courier
    if (role === 'courier') {
        signupData.vehicle_model = formData.get('vehicle_model');
        signupData.license_plate = formData.get('license_plate');
        signupData.driver_license_num = formData.get('driver_license_num');
        signupData.id_card_num = formData.get('id_card_num');
        signupData.experience = parseInt(formData.get('experience')) || 0;
        signupData.motivation = formData.get('motivation');
    }

    try {
        const result = await apiCall('/signup', 'POST', signupData);

        // Hide loader and re-enable button
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';

        // Store the access token
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));

        Toast.success('Account created successfully! Redirecting...');

        // Wait a moment before redirecting to show the success message
        setTimeout(() => {
            // Redirect based on role
            if (result.user.role === 'customer') {
                window.location.href = 'CustomerDashboard.html';
            } else if (result.user.role === 'courier') {
                window.location.href = 'CourierDashboard.html';
            } else if (result.user.role === 'admin') {
                window.location.href = 'AdminDashboard.html';
            }
        }, 1000);
    } catch (error) {
        // Hide loader and re-enable button on error
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';

        Toast.error('Signup failed: ' + error.message);
    }
}

// =====================
// Login Handler
// =====================
(function() {
    const loginForm = document.querySelector('form[action="#"]');
    const isLoginPage = document.title.includes('Sign In');

    if (loginForm && isLoginPage) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('login-submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            // Show loader
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await apiCall('/login', 'POST', { email, password });

                // Store the access token and user data
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));

                Toast.success('Login successful! Redirecting...');

                // Small delay to show success message
                setTimeout(() => {
                    // Redirect based on role
                    if (result.user.role === 'customer') {
                        window.location.href = 'CustomerDashboard.html';
                    } else if (result.user.role === 'courier') {
                        window.location.href = 'CourierDashboard.html';
                    } else if (result.user.role === 'admin') {
                        window.location.href = 'AdminDashboard.html';
                    }
                }, 1000);
            } catch (error) {
                // Hide loader on error
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';

                Toast.error('Login failed: ' + error.message);
            }
        });

    }

})(); 

// --- Track Button Functionality ---
(function() {
    const trackBtn = document.getElementById('trackBtn');
    const trackingResult = document.getElementById('trackingResult');
    const trackingNumber = document.getElementById('trackingNumber');
    const lastUpdateEl = document.getElementById('lastUpdate');

    if (trackBtn && trackingResult && trackingNumber) {
        trackBtn.addEventListener('click', function() {
            // simple UX: if empty, shake input (light feedback) else show result
            if (!trackingNumber.value || trackingNumber.value.trim().length < 2) {
                trackingNumber.focus();
                trackingNumber.style.transition = 'transform .12s ease';
                trackingNumber.style.transform = 'translateX(-6px)';
                setTimeout(()=> trackingNumber.style.transform = 'translateX(6px)', 120);
                setTimeout(()=> trackingNumber.style.transform = '', 240);
                return;
            }

            // simulate update timestamp
            if(lastUpdateEl) {
                const now = new Date();
                lastUpdateEl.textContent = now.toLocaleString();
            }
            trackingResult.classList.add('active');
            
            // scroll into view lightly on small screens
            trackingResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
})(); // <--- This closes the Track Button Logic properly


// =====================
// Mobile Menu Toggle (CLEAN & SEPARATED)
// =====================
(function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-menu li a');

    if (hamburger && navMenu) {
        // Toggle Menu on Click
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
})();

// =====================
// Profile Page Handler
// =====================
(function() {
    const isProfilePage = document.title.includes('My Profile');

    if (isProfilePage) {
        // Load user profile on page load
        loadUserProfile();

        // Handle profile update form
        const profileForm = document.querySelector('.settings-card form');
        if (profileForm && !profileForm.querySelector('#current-password')) {
            profileForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const submitBtn = document.getElementById('profile-update-btn');
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoader = submitBtn.querySelector('.btn-loader');

                // Show loader
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                btnLoader.style.display = 'inline-flex';

                const updateData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value
                };

                try {
                    const result = await apiCall('/profile', 'PUT', updateData, true);

                    // Hide loader
                    submitBtn.disabled = false;
                    btnText.style.display = 'inline';
                    btnLoader.style.display = 'none';

                    // Update local storage with the complete user object
                    localStorage.setItem('user', JSON.stringify(result.user));

                    Toast.success('Profile updated successfully!');

                    // Reload profile to show updated data
                    await loadUserProfile();
                } catch (error) {
                    // Hide loader on error
                    submitBtn.disabled = false;
                    btnText.style.display = 'inline';
                    btnLoader.style.display = 'none';

                    Toast.error('Profile update failed: ' + error.message);
                }
            });
        }

        // Handle password change form
        const passwordForm = document.querySelectorAll('.settings-card form')[1];
        if (passwordForm) {
            passwordForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                if (newPassword !== confirmPassword) {
                    Toast.warning('New passwords do not match!');
                    return;
                }

                try {
                    await apiCall('/change-password', 'POST', {
                        current_password: currentPassword,
                        new_password: newPassword
                    }, true);

                    Toast.success('Password changed successfully!');
                    passwordForm.reset();
                } catch (error) {
                    Toast.error('Password change failed: ' + error.message);
                }
            });
        }
    }
})();

async function loadUserProfile() {
    try {
        const result = await apiCall('/profile', 'GET', null, true);

        // Populate form fields if they exist
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const addressField = document.getElementById('address');

        if (nameField) nameField.value = result.name || '';
        if (emailField) emailField.value = result.email || '';
        if (phoneField) phoneField.value = result.phone || '';
        if (addressField) addressField.value = result.address || '';

        // Update local storage with fresh data
        localStorage.setItem('user', JSON.stringify(result));
    } catch (error) {
        console.error('Failed to load profile:', error);
        Toast.error('Failed to load profile. Please login again.');
        window.location.href = 'Login.html';
    }
}

// =====================
// Auth Check & Auto-Redirect
// =====================
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const protectedPages = ['CustomerDashboard.html', 'CourierDashboard.html', 'AdminDashboard.html', 'Profile.html'];
    const publicPages = ['landingpage.html', 'Login.html', 'SignUp.html'];
    const currentPage = window.location.pathname.split('/').pop();

    // Redirect to dashboard if user is already logged in and on a public page
    if (token && user.role && publicPages.includes(currentPage)) {
        if (user.role === 'customer') {
            window.location.href = 'CustomerDashboard.html';
        } else if (user.role === 'courier') {
            window.location.href = 'CourierDashboard.html';
        } else if (user.role === 'admin') {
            window.location.href = 'AdminDashboard.html';
        }
        return;
    }

    // Redirect to login if trying to access protected page without token
    if (protectedPages.includes(currentPage) && !token) {
        Toast.warning('Please login to access this page');
        window.location.href = 'Login.html';
    }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// =====================
// Logout Handler
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const signOutLinks = document.querySelectorAll('a[href*="login.html"], a[href*="Login.html"]');

    signOutLinks.forEach(link => {
        const linkText = link.textContent.toLowerCase();
        if (linkText.includes('sign out') || linkText.includes('logout') || linkText.includes('log out')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                // Clear authentication data
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');

                Toast.success('Logged out successfully');

                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 500);
            });
        }
    });
});

// =====================
// Customer Dashboard Integration
// =====================
(function() {
    const isCustomerDashboard = document.title.includes('My Dashboard');
    if (!isCustomerDashboard) return;

    const courierSelect = document.getElementById('courier');
    const deliveriesGrid = document.querySelector('.deliveries-grid');
    const pastDeliveriesContainer = document.querySelector('.past-deliveries .list-container');
    const pickupInput = document.getElementById('pickup');
    const pickupMapDiv = document.getElementById('pickupMap');
    const parcelForm = document.getElementById('parcelForm');
    const welcomeHeader = document.querySelector('.dashboard-header h1');

    // Load user name - use first name only
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (welcomeHeader) {
        // Check both user.name and user.profile.name for backward compatibility
        const fullName = user.name || (user.profile && user.profile.name) || '';
        if (fullName) {
            const firstName = fullName.trim().split(' ')[0];
            welcomeHeader.textContent = `Welcome, ${firstName}!`;
        }
    }

    // Populate sender name from user (use same user variable from above)
    const senderNameInput = document.getElementById('senderName');
    if (senderNameInput) {
        const fullName = user.name || (user.profile && user.profile.name) || '';
        if (fullName) {
            senderNameInput.value = fullName;
        }
    }

    // Load online couriers
    async function loadOnlineCouriers() {
        if (!courierSelect) return;
        try {
            const result = await apiCall('/couriers/online', 'GET', null, true);
            courierSelect.innerHTML = '<option value="">Select available courier (optional)</option>';

            result.couriers.forEach(courier => {
                const option = document.createElement('option');
                option.value = courier.id;
                option.textContent = `${courier.name} - Online (Rating: ${courier.rating || 'N/A'})`;
                option.dataset.courier = JSON.stringify(courier);
                courierSelect.appendChild(option);
            });

            if (result.couriers.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No couriers available - order will be posted for couriers";
                courierSelect.appendChild(option);
            }
        } catch (error) {
            console.error('Failed to load couriers:', error);
        }
    }

    // Show courier profile modal
    function showCourierProfile(courier) {
        const existingModal = document.getElementById('courierProfileModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'courierProfileModal';
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Courier Profile</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div style="padding: 1rem;">
                    <p><strong>Name:</strong> ${courier.name}</p>
                    <p><strong>Phone:</strong> ${courier.phone}</p>
                    <p><strong>Vehicle:</strong> ${courier.vehicle_model}</p>
                    <p><strong>Rating:</strong> ${courier.rating || 'N/A'} ⭐</p>
                    <p><strong>Total Deliveries:</strong> ${courier.total_deliveries}</p>
                    <p><strong>Experience:</strong> ${courier.experience} years</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Add view profile button next to courier select
    if (courierSelect) {
        const viewProfileBtn = document.createElement('button');
        viewProfileBtn.type = 'button';
        viewProfileBtn.textContent = 'View Profile';
        viewProfileBtn.className = 'btn btn-secondary';
        viewProfileBtn.style.marginTop = '0.5rem';
        viewProfileBtn.addEventListener('click', () => {
            const selected = courierSelect.options[courierSelect.selectedIndex];
            if (selected && selected.dataset.courier) {
                showCourierProfile(JSON.parse(selected.dataset.courier));
            } else {
                Toast.info('Please select a courier first');
            }
        });
        courierSelect.parentNode.appendChild(viewProfileBtn);
    }

    // Update pickup map when location is entered
    if (pickupInput && pickupMapDiv) {
        pickupInput.addEventListener('change', function() {
            const location = this.value;
            if (location) {
                const encodedLocation = encodeURIComponent(location + ', Kigali, Rwanda');
                pickupMapDiv.innerHTML = `
                    <iframe
                        src="https://maps.google.com/maps?q=${encodedLocation}&output=embed"
                        width="100%"
                        height="200"
                        style="border:0;"
                        allowfullscreen=""
                        loading="lazy">
                    </iframe>
                `;
            }
        });
    }

    // Load customer orders
    async function loadCustomerOrders() {
        try {
            const result = await apiCall('/orders', 'GET', null, true);

            // Separate active and past orders
            const activeOrders = result.orders.filter(o =>
                !['delivered', 'completed', 'cancelled', 'failed'].includes(o.status)
            );
            const pastOrders = result.orders.filter(o =>
                ['delivered', 'completed', 'cancelled', 'failed'].includes(o.status)
            );

            // Render active orders
            if (deliveriesGrid) {
                if (activeOrders.length === 0) {
                    deliveriesGrid.innerHTML = `
                        <div class="empty-state">
                            <svg class="empty-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 8H4C2.89543 8 2 8.89543 2 10V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V10C22 8.89543 21.1046 8 20 8Z" stroke="#4a7c2a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="#4a7c2a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h3>No Active Deliveries</h3>
                            <p>You don't have any active deliveries at the moment. Start by creating a new delivery!</p>
                            <button class="btn btn-primary" onclick="document.getElementById('openModalBtnDesktop').click()">Create New Delivery</button>
                        </div>
                    `;
                } else {
                    deliveriesGrid.innerHTML = activeOrders.map(order => `
                        <a href="TrackOrder.html?order=${order.order_number}" class="order-card" data-order-id="${order.id}">
                            <h4>Order #${order.order_number}</h4>
                            <p class="status">${formatStatus(order.status)}</p>
                            <p class="eta">${order.courier ? `Courier: ${order.courier?.name || 'Assigned'}` : 'Waiting for courier'}</p>
                        </a>
                    `).join('');
                }
            }

            // Render past orders
            if (pastDeliveriesContainer) {
                if (pastOrders.length === 0) {
                    pastDeliveriesContainer.innerHTML = `
                        <div class="empty-state-compact">
                            <svg class="empty-icon-small" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12L15 15" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="12" r="9" stroke="#6c757d" stroke-width="2"/>
                            </svg>
                            <p>No past deliveries yet. Your completed deliveries will appear here.</p>
                        </div>
                    `;
                } else {
                    pastDeliveriesContainer.innerHTML = pastOrders.map(order => `
                        <a href="#" class="past-order-item">
                            <div class="past-order-info">
                                <p class="item-name">Order #${order.order_number}</p>
                                <p class="item-date">${new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span class="past-order-price">${order.delivery_fee} RWF</span>
                        </a>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    }

    function formatStatus(status) {
        const statusMap = {
            'pending': 'Waiting for courier',
            'courier_assigned': 'Courier assigned',
            'en_route_to_pickup': 'En route to pickup',
            'picked_up': 'Package picked up',
            'in_transit': 'In transit',
            'delivered': 'Delivered',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'failed': 'Failed'
        };
        return statusMap[status] || status;
    }

    // Handle order form submission
    if (parcelForm) {
        parcelForm.removeEventListener('submit', parcelForm._submitHandler);
        parcelForm._submitHandler = async function(e) {
            e.preventDefault();

            const formData = new FormData(parcelForm);
            const weight = parseFloat(formData.get('weight')) || 1;
            const deliveryFee = Math.round(weight * 2000 + 1000); // Base 1000 + 2000/kg

            const orderData = {
                pickup_address: formData.get('pickup'),
                pickup_contact_name: formData.get('senderName'),
                pickup_contact_phone: formData.get('senderPhone'),
                delivery_address: formData.get('delivery'),
                delivery_contact_name: formData.get('receiverName'),
                delivery_contact_phone: formData.get('receiverPhone'),
                parcel_type: formData.get('parcelType'),
                parcel_description: formData.get('otherDetails') || '',
                parcel_weight: weight,
                delivery_fee: deliveryFee
            };

            // If courier selected, assign directly
            const courierId = formData.get('courier');
            if (courierId) {
                orderData.courier_id = parseInt(courierId);
            }

            try {
                const result = await apiCall('/orders', 'POST', orderData, true);
                Toast.success('Order created successfully! Order #' + result.order.order_number);
                document.getElementById('deliveryModal').classList.remove('active');
                parcelForm.reset();
                loadCustomerOrders();
            } catch (error) {
                Toast.error('Failed to create order: ' + error.message);
            }
        };
        parcelForm.addEventListener('submit', parcelForm._submitHandler);
    }

    // Initialize
    loadOnlineCouriers();
    loadCustomerOrders();

    // Poll for order updates every 30 seconds
    setInterval(loadCustomerOrders, 30000);
})();

// =====================
// Courier Dashboard Integration
// =====================
(function() {
    const isCourierDashboard = document.title.includes('My Tasks');
    if (!isCourierDashboard) return;

    const currentTaskCard = document.querySelector('.current-task-card');
    const currentTaskSection = document.querySelector('.current-task');
    const upcomingTasksContainer = document.querySelector('.upcoming-tasks .list-container');

    // Load courier's assigned orders and pending orders
    async function loadCourierTasks() {
        try {
            // Load assigned orders (current tasks)
            const assignedResult = await apiCall('/orders', 'GET', null, true);
            const currentTasks = assignedResult.orders.filter(o =>
                ['courier_assigned', 'en_route_to_pickup', 'picked_up', 'in_transit'].includes(o.status)
            );

            // Load pending orders available to accept
            const pendingResult = await apiCall('/orders/pending', 'GET', null, true);

            // Render current task
            if (currentTaskSection) {
                if (currentTasks.length > 0) {
                    const task = currentTasks[0];
                    currentTaskSection.innerHTML = `
                        <h2>Current Task</h2>
                        <div class="current-task-card">
                            <div class="task-address pickup">
                                <p>PICK UP FROM</p>
                                <h3>${task.pickup_address}</h3>
                                <p>${task.pickup_contact_name} - ${task.pickup_contact_phone}</p>
                            </div>
                            <div class="task-address dropoff">
                                <p>DELIVER TO</p>
                                <h3>${task.delivery_address}</h3>
                                <p>${task.delivery_contact_name} - ${task.delivery_contact_phone}</p>
                            </div>
                            <div class="task-actions">
                                <a href="CourierLiveTask.html?order=${task.order_number}" class="btn btn-primary">Navigate</a>
                                <button class="btn btn-secondary" onclick="updateOrderStatus(${task.id}, '${getNextStatus(task.status)}')">${getNextAction(task.status)}</button>
                            </div>
                        </div>
                    `;
                } else {
                    currentTaskSection.innerHTML = `
                        <h2>Current Task</h2>
                        <p class="no-orders">No current task. Check pending orders below.</p>
                    `;
                }
            }

            // Render pending orders for acceptance
            if (upcomingTasksContainer) {
                const html = pendingResult.orders.length > 0
                    ? pendingResult.orders.map(order => `
                        <div class="task-list-item">
                            <div class="task-list-info">
                                <p class="locations">${order.pickup_address} ➔ ${order.delivery_address}</p>
                                <p class="id">Order: #${order.order_number} | ${order.parcel_type} | ${order.parcel_weight}kg</p>
                                <p class="fee">Fee: ${order.delivery_fee} RWF</p>
                            </div>
                            <button class="btn btn-primary" onclick="acceptOrder(${order.id})">Accept</button>
                        </div>
                    `).join('')
                    : '<p class="no-orders">No pending orders available</p>';

                upcomingTasksContainer.innerHTML = html;
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    }

    function getNextStatus(currentStatus) {
        const flow = {
            'courier_assigned': 'en_route_to_pickup',
            'en_route_to_pickup': 'picked_up',
            'picked_up': 'in_transit',
            'in_transit': 'delivered'
        };
        return flow[currentStatus] || currentStatus;
    }

    function getNextAction(currentStatus) {
        const actions = {
            'courier_assigned': 'Start Pickup',
            'en_route_to_pickup': 'Confirm Pickup',
            'picked_up': 'Start Delivery',
            'in_transit': 'Confirm Delivery'
        };
        return actions[currentStatus] || 'Update Status';
    }

    // Global functions for button clicks
    window.acceptOrder = async function(orderId) {
        try {
            await apiCall(`/orders/${orderId}/accept`, 'POST', {}, true);
            Toast.success('Order accepted!');
            loadCourierTasks();
        } catch (error) {
            Toast.error('Failed to accept order: ' + error.message);
        }
    };

    window.updateOrderStatus = async function(orderId, newStatus) {
        try {
            await apiCall(`/orders/${orderId}/status`, 'PUT', { status: newStatus }, true);
            Toast.success('Status updated!');
            loadCourierTasks();
        } catch (error) {
            Toast.error('Failed to update status: ' + error.message);
        }
    };

    // Initialize
    loadCourierTasks();

    // Poll for updates every 15 seconds
    setInterval(loadCourierTasks, 15000);
})();