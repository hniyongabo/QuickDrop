// this is a js file for responsiveness and interactivity

// --- 1. Profile Dropdown Toggle ---
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


// --- 2. Tab Switching ---
(function() {
    // Note: The customer dashboard HTML does not currently contain .tab-link or .tab-content elements, 
    // but the logic is preserved here for future use.
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length > 0 && tabContents.length > 0) {
        tabLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                const tabId = link.getAttribute('data-tab');

                // Remove active class from all tabs
                tabLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');

                // on small screens keep tab button visible
                const activeBtn = document.querySelector('.tab-link.active');
                if (activeBtn && window.innerWidth < 800) activeBtn.scrollIntoView({ inline: 'center', behavior: 'smooth' });
            
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
    const parcelForm = document.getElementById('parcelForm'); 

    // Elements for 'Other' details functionality
    const parcelTypeSelect = document.getElementById('parcelType');
    const otherDetailsGroup = document.getElementById('otherDetailsGroup');
    const otherDetailsTextarea = document.getElementById('otherDetails');


    function openModal(event) {
        if (event) {
            event.preventDefault();
        }
        if (deliveryModal) {
            // Show modal
            deliveryModal.style.display = 'flex';
            deliveryModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        }
    }

    function closeModal() {
        if (deliveryModal) {
            deliveryModal.style.display = 'none';
            deliveryModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Toggle Visibility of 'Other Details'
    function toggleOtherDetails() {
        if (!parcelTypeSelect || !otherDetailsGroup || !otherDetailsTextarea) return;

        if (parcelTypeSelect.value === 'other') {
            otherDetailsGroup.style.display = 'block';
            otherDetailsTextarea.setAttribute('required', 'required');
        } else {
            otherDetailsGroup.style.display = 'none';
            otherDetailsTextarea.removeAttribute('required');
            // Clear the value when hidden to ensure clean data submission
            otherDetailsTextarea.value = ''; 
        }
    }

    // Attach listeners
    if (parcelTypeSelect) {
        parcelTypeSelect.addEventListener('change', toggleOtherDetails);
    }
    
    document.addEventListener('DOMContentLoaded', toggleOtherDetails); 

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
            
            console.log('--- New Delivery Request Submitted ---');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            Toast.success('Booking request sent!');
            closeModal();
        });
    }
})();

// --- 4. Google Places Autocomplete Logic (UPDATED) ---
/**
 * Initializes Google Maps Places Autocomplete for the Pickup and Dropoff fields.
 * Uses a retry mechanism to ensure the 'google.maps.places' object is loaded from the API script.
 * Includes maximum retry limit to prevent infinite loops.
 */
(function() {
    let retryCount = 0;
    const MAX_RETRIES = 20; // Maximum 10 seconds (20 * 500ms)
    
    function initAutocomplete() {
        // Check if the Google Maps API (and Places library) is loaded
        if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.places === 'undefined') {
            retryCount++;
            
            // Stop retrying after maximum attempts
            if (retryCount >= MAX_RETRIES) {
                console.error('Google Maps API failed to load after ' + (MAX_RETRIES * 500) + 'ms. Please check your API key and network connection.');
                return;
            }
            
            // Retry in 500ms until the script is fully loaded by the browser
            setTimeout(initAutocomplete, 500); 
            return;
        }

        const pickupInput = document.getElementById('pickup');
        const deliveryInput = document.getElementById('delivery');
        
        // If inputs don't exist, this page doesn't need autocomplete
        if (!pickupInput && !deliveryInput) {
            return;
        }
        
        const autocompleteOptions = {
            types: ['geocode'], 
            // Recommend using the local country code, e.g., 'rw' for Rwanda
            componentRestrictions: { country: 'rw' } 
        };

        if (pickupInput) {
            try {
                // Initializes Autocomplete on the Pickup Address field (#pickup)
                const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, autocompleteOptions);
                
                // Listener for when a place is selected
                pickupAutocomplete.addListener('place_changed', () => {
                    const place = pickupAutocomplete.getPlace();
                    
                    if (place.geometry) {
                        console.log('Pickup Place Selected:', place.geometry.location.lat(), place.geometry.location.lng());
                    } else {
                        console.log('Pickup Place Selected but no geometry found.');
                    }
                });
            } catch (error) {
                console.error('Error initializing pickup autocomplete:', error);
            }
        }

        if (deliveryInput) {
            try {
                // Initializes Autocomplete on the Dropoff Address field (#delivery)
                const deliveryAutocomplete = new google.maps.places.Autocomplete(deliveryInput, autocompleteOptions);
                
                // Listener for when a place is selected
                deliveryAutocomplete.addListener('place_changed', () => {
                    const place = deliveryAutocomplete.getPlace();
                    if (place.geometry) {
                        console.log('Dropoff Place Selected:', place.geometry.location.lat(), place.geometry.location.lng());
                    } else {
                        console.log('Dropoff Place Selected but no geometry found.');
                    }
                });
            } catch (error) {
                console.error('Error initializing delivery autocomplete:', error);
            }
        }

        console.log("Google Places Autocomplete initialized successfully.");
    }

    // Initialize Autocomplete once the DOM is loaded
    document.addEventListener('DOMContentLoaded', initAutocomplete);
})();


// --- 5. Reveal animations for hero, track, and feature cards on scroll ---
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
    // Note: These elements are likely on a separate signup/landing page, but the logic is preserved.
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
            // Save details to hidden inputs
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
            e.preventDefault(); // always prevent and decide after validation
            let formIsValid = true;

            // Determine role early
            const isCourier = roleCourier ? roleCourier.checked : false;

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
            if (isCourier) {
                const detailsComplete = mainForm.getAttribute('data-courier-details-complete') === 'true';

                if (isCourier && !detailsComplete) {
                    Toast.warning('Please complete the Courier Application Details pop-up first.');
                    if (courierModal) courierModal.style.display = 'block'; 
                    formIsValid = false;
                }
            }

            // Stop here if invalid
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

// --- 7. Track Button Functionality ---
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
})();

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

    // Populate sender name, phone, and delivery address from user
    const senderNameInput = document.getElementById('senderName');
    const senderPhoneInput = document.getElementById('senderPhone');
    const deliveryAddressInput = document.getElementById('delivery');

    if (senderNameInput) {
        const fullName = user.name || (user.profile && user.profile.name) || '';
        if (fullName) {
            senderNameInput.value = fullName;
        }
    }

    if (senderPhoneInput) {
        const phone = user.phone || (user.profile && user.profile.phone) || '';
        if (phone) {
            senderPhoneInput.value = phone;
        }
    }

    if (deliveryAddressInput) {
        const address = user.address || (user.profile && user.profile.address) || '';
        if (address) {
            deliveryAddressInput.value = address;
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
                        <a href="TrackOrder.html?order=${order.order_number}" class="order-card" data-order-id="${order.id}" style="position: relative;">
                            ${order.blocker_title ? `
                                <div style="background-color: #ffc107; color: #000; padding: 0.5rem; margin: -1rem -1rem 0.5rem -1rem; border-radius: 8px 8px 0 0; font-weight: bold;">
                                    ⚠️ Issue: ${order.blocker_title}
                                </div>
                            ` : ''}
                            <h4>Order #${order.order_number}</h4>
                            <p class="status">${formatStatus(order.status)}</p>
                            <p class="eta">${order.courier ? `Courier: ${order.courier?.name || 'Assigned'}` : 'Waiting for courier'}</p>
                            ${order.blocker_notes ? `<p style="color: #d32f2f; font-size: 0.9rem; margin-top: 0.5rem;">${order.blocker_notes}</p>` : ''}
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

            // Show error state
            if (deliveriesGrid) {
                deliveriesGrid.innerHTML = `
                    <div class="empty-state">
                        <p style="color: #dc2626;">Failed to load orders. Please refresh the page.</p>
                    </div>
                `;
            }
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

            const submitBtn = document.getElementById('booking-submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            // Show loader
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

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

                // Hide loader
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';

                Toast.success('Order created successfully! Order #' + result.order.order_number);
                document.getElementById('deliveryModal').classList.remove('active');
                parcelForm.reset();

                // Reload orders to show the new one
                loadCustomerOrders();
            } catch (error) {
                // Hide loader on error
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';

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
                                <button id="statusBtn-${task.id}" class="btn btn-secondary" onclick="updateOrderStatus(${task.id}, '${getNextStatus(task.status)}')">
                                    <span class="btn-text">${getNextAction(task.status)}</span>
                                    <span class="btn-loader" style="display: none;">
                                        <svg class="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.4" stroke-dashoffset="10"></circle>
                                        </svg>
                                        Updating...
                                    </span>
                                </button>
                                <button class="btn btn-warning" onclick="openBlockerModal(${task.id}, '${task.order_number}')" style="background-color: #ffc107; color: #000;">Report Issue</button>
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
                            <button id="acceptBtn-${order.id}" class="btn btn-primary" onclick="acceptOrder(${order.id})">
                                <span class="btn-text">Accept</span>
                                <span class="btn-loader" style="display: none;">
                                    <svg class="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.4" stroke-dashoffset="10"></circle>
                                    </svg>
                                    Accepting...
                                </span>
                            </button>
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
        const btn = document.getElementById(`acceptBtn-${orderId}`);
        if (!btn) return;

        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        // Show loader
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        try {
            await apiCall(`/orders/${orderId}/accept`, 'POST', {}, true);
            Toast.success('Order accepted!');
            loadCourierTasks();
        } catch (error) {
            // Hide loader on error
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            Toast.error('Failed to accept order: ' + error.message);
        }
    };

    window.updateOrderStatus = async function(orderId, newStatus) {
        const btn = document.getElementById(`statusBtn-${orderId}`);
        if (!btn) return;

        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');

        // Show loader
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        try {
            await apiCall(`/orders/${orderId}/status`, 'PUT', { status: newStatus }, true);
            Toast.success('Status updated!');
            loadCourierTasks();
        } catch (error) {
            // Hide loader on error
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            Toast.error('Failed to update status: ' + error.message);
        }
    };

    // Blocker reporting functionality
    window.openBlockerModal = function(orderId, orderNumber) {
        const existingModal = document.getElementById('blockerModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'blockerModal';
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Report Issue - Order #${orderNumber}</h2>
                    <button class="modal-close" onclick="document.getElementById('blockerModal').remove()">×</button>
                </div>
                <form id="blockerForm" class="modal-form" style="padding: 1rem;">
                    <div class="form-group">
                        <label for="blockerTitle">Issue Title</label>
                        <input type="text" id="blockerTitle" placeholder="e.g., Customer not available" required>
                    </div>
                    <div class="form-group">
                        <label for="blockerNotes">Notes</label>
                        <textarea id="blockerNotes" rows="4" placeholder="Describe the issue..." required></textarea>
                    </div>
                    <button type="submit" id="blockerSubmitBtn" class="btn btn-primary">
                        <span class="btn-text">Submit Report</span>
                        <span class="btn-loader" style="display: none;">
                            <svg class="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.4" stroke-dashoffset="10"></circle>
                            </svg>
                            Submitting...
                        </span>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.getElementById('blockerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const blockerTitle = document.getElementById('blockerTitle').value;
            const blockerNotes = document.getElementById('blockerNotes').value;

            const submitBtn = document.getElementById('blockerSubmitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            // Show loader
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';

            try {
                await apiCall(`/orders/${orderId}/blocker`, 'POST', {
                    blocker_title: blockerTitle,
                    blocker_notes: blockerNotes
                }, true);
                Toast.success('Issue reported successfully');
                modal.remove();
                loadCourierTasks();
            } catch (error) {
                // Hide loader on error
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
                Toast.error('Failed to report issue: ' + error.message);
            }
        });
    };

    // Initialize
    loadCourierTasks();

    // Poll for updates every 15 seconds
    setInterval(loadCourierTasks, 15000);
})();

// =====================
// Track Order Page Integration
// =====================
(function() {
    const isTrackOrderPage = document.title.includes('Track Order');
    if (!isTrackOrderPage) return;

    // Get order number from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');

    if (!orderNumber) {
        Toast.error('No order number provided');
        setTimeout(() => window.location.href = 'CustomerDashboard.html', 2000);
        return;
    }

    // Helper function to format status
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

    // Helper function to format time
    function formatTime(dateString) {
        if (!dateString) return 'Pending';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Load and display order tracking data
    async function loadOrderTracking() {
        try {
            const order = await apiCall(`/orders/track/${orderNumber}`, 'GET', null, false);

            // Update page title and header
            const pageHeader = document.querySelector('.page-header h1');
            if (pageHeader) {
                pageHeader.textContent = `Track Your Order (#${order.order_number})`;
            }

            // Update status sidebar
            const statusSidebar = document.querySelector('.status-sidebar');
            if (statusSidebar) {
                const currentStatus = formatStatus(order.status);

                // Build timeline based on order status
                const timeline = [];

                // Order Placed
                timeline.push({
                    label: 'Order Placed',
                    time: formatTime(order.created_at),
                    completed: true
                });

                // Courier Assigned
                if (['courier_assigned', 'en_route_to_pickup', 'picked_up', 'in_transit', 'delivered', 'completed'].includes(order.status)) {
                    timeline.push({
                        label: 'Courier Assigned',
                        time: formatTime(order.updated_at),
                        completed: true
                    });
                } else {
                    timeline.push({
                        label: 'Courier Assigned',
                        time: 'Pending',
                        completed: false
                    });
                }

                // At Pickup Location
                if (['picked_up', 'in_transit', 'delivered', 'completed'].includes(order.status)) {
                    timeline.push({
                        label: 'At Pickup Location',
                        time: formatTime(order.actual_pickup_time),
                        completed: true
                    });
                } else {
                    timeline.push({
                        label: 'At Pickup Location',
                        time: 'Pending',
                        completed: false
                    });
                }

                // Delivered
                if (['delivered', 'completed'].includes(order.status)) {
                    timeline.push({
                        label: 'Delivered',
                        time: formatTime(order.actual_delivery_time),
                        completed: true
                    });
                } else {
                    timeline.push({
                        label: 'Delivered',
                        time: 'Pending',
                        completed: false
                    });
                }

                statusSidebar.innerHTML = `
                    <h2>Status: ${currentStatus}</h2>
                    <p class="eta">${order.courier ? `Courier: ${order.courier.name}` : 'Waiting for courier assignment'}</p>

                    ${order.courier ? `
                        <div class="info-group">
                            <h3>Courier</h3>
                            <p>${order.courier.name}</p>
                            <p>${order.courier.phone || ''}</p>
                        </div>
                    ` : ''}

                    <div class="info-group">
                        <h3>From (Pickup)</h3>
                        <p>${order.pickup_address}</p>
                        ${order.pickup_contact_name ? `<p>${order.pickup_contact_name} - ${order.pickup_contact_phone}</p>` : ''}
                    </div>

                    <div class="info-group">
                        <h3>To (Delivery)</h3>
                        <p>${order.delivery_address}</p>
                        ${order.delivery_contact_name ? `<p>${order.delivery_contact_name} - ${order.delivery_contact_phone}</p>` : ''}
                    </div>

                    <div class="info-group">
                        <h3>Delivery Timeline</h3>
                        <ul class="status-timeline">
                            ${timeline.map(step => `
                                <li class="status-step ${step.completed ? 'completed' : ''}">
                                    <p>${step.label}</p>
                                    <span>${step.time}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Failed to load order tracking:', error);
            Toast.error('Failed to load order details');
            setTimeout(() => window.location.href = 'CustomerDashboard.html', 2000);
        }
    }

    // Initialize
    loadOrderTracking();

    // Poll for updates every 10 seconds
    setInterval(loadOrderTracking, 10000);
})();
// --- 9. Google Maps Real-Time Tracking ---
/**
 * Initializes Google Maps for real-time tracking on tracking pages.
 * Handles TrackOrder.html, CourierLiveTask.html, and AdminDashboard.html
 */
(function() {
    let retryCount = 0;
    const MAX_RETRIES = 20; // Maximum 10 seconds (20 * 500ms)
    
    // Default center for Kigali, Rwanda
    const DEFAULT_CENTER = { lat: -1.9441, lng: 30.0619 };
    
    // Sample coordinates for tracking (in production, these would come from your backend)
    const TRACKING_DATA = {
        // TrackOrder.html data
        tracking: {
            pickup: { lat: -1.9500, lng: 30.0589, address: 'MTN Centre (KG 9 Ave, Nyarugenge)' },
            delivery: { lat: -1.9441, lng: 30.0619, address: 'Ange K. (Gisozi Sector, Gasabo)' },
            courier: { lat: -1.9480, lng: 30.0600 }, // Starting position (will be updated)
            courierName: 'Didier M.'
        },
        // CourierLiveTask.html data
        courierLive: {
            pickup: { lat: -1.9500, lng: 30.0589, address: 'Wardiere Store (123 Main St)' },
            delivery: { lat: -1.9441, lng: 30.0619, address: 'Gisozi Sector' },
            courier: { lat: -1.9490, lng: 30.0595 }, // Starting position
            courierName: 'Current Courier'
        },
        // AdminDashboard.html - overview map
        admin: {
            center: DEFAULT_CENTER,
            zoom: 12
        }
    };
    
    // Store map instances and tracking intervals
    const mapInstances = {
        trackingMap: null,
        courierLiveMap: null,
        adminMap: null
    };
    
    const trackingIntervals = {
        tracking: null,
        courierLive: null
    };
    
    function initTrackingMaps() {
        // Check if the Google Maps API is loaded
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            retryCount++;
            
            if (retryCount >= MAX_RETRIES) {
                console.error('Google Maps API failed to load after ' + (MAX_RETRIES * 500) + 'ms. Please check your API key and network connection.');
                return;
            }
            
            setTimeout(initTrackingMaps, 500);
            return;
        }
        
        // Initialize TrackOrder.html map
        const trackingMapEl = document.getElementById('trackingMap');
        if (trackingMapEl) {
            initOrderTrackingMap(trackingMapEl);
        }
        
        // Initialize CourierLiveTask.html map
        const courierLiveMapEl = document.getElementById('courierLiveMap');
        if (courierLiveMapEl) {
            initCourierLiveMap(courierLiveMapEl);
        }
        
        // Initialize AdminDashboard.html map
        const adminMapEl = document.getElementById('adminMap');
        if (adminMapEl) {
            initAdminMap(adminMapEl);
        }
    }
    
    /**
     * Initialize map for TrackOrder.html - Customer tracking view
     */
    function initOrderTrackingMap(mapElement) {
        const data = TRACKING_DATA.tracking;
        
        // Create map centered between pickup and delivery
        const center = {
            lat: (data.pickup.lat + data.delivery.lat) / 2,
            lng: (data.pickup.lng + data.delivery.lng) / 2
        };
        
        const map = new google.maps.Map(mapElement, {
            zoom: 13,
            center: center,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        });
        
        mapInstances.trackingMap = map;
        
        // Create markers
        const pickupMarker = new google.maps.Marker({
            position: data.pickup,
            map: map,
            title: 'Pickup Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4CAF50',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            label: {
                text: 'P',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        });
        
        const deliveryMarker = new google.maps.Marker({
            position: data.delivery,
            map: map,
            title: 'Delivery Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#FF5722',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            },
            label: {
                text: 'D',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        });
        
        // Courier marker (will move in real-time)
        const courierMarker = new google.maps.Marker({
            position: data.courier,
            map: map,
            title: `Courier: ${data.courierName}`,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                rotation: 45,
                fillColor: '#2196F3',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            }
        });
        
        // Draw route between pickup and delivery
        const routePath = new google.maps.Polyline({
            path: [data.pickup, data.delivery],
            geodesic: true,
            strokeColor: '#2196F3',
            strokeOpacity: 0.5,
            strokeWeight: 3
        });
        routePath.setMap(map);
        
        // Info windows
        const pickupInfo = new google.maps.InfoWindow({
            content: `<div><strong>Pickup Location</strong><br>${data.pickup.address}</div>`
        });
        const deliveryInfo = new google.maps.InfoWindow({
            content: `<div><strong>Delivery Location</strong><br>${data.delivery.address}</div>`
        });
        const courierInfo = new google.maps.InfoWindow({
            content: `<div><strong>Courier: ${data.courierName}</strong><br>En route to pickup</div>`
        });
        
        pickupMarker.addListener('click', () => pickupInfo.open(map, pickupMarker));
        deliveryMarker.addListener('click', () => deliveryInfo.open(map, deliveryMarker));
        courierMarker.addListener('click', () => courierInfo.open(map, courierMarker));
        
        // Simulate real-time courier movement
        simulateCourierMovement(courierMarker, data.pickup, data.delivery, 'tracking');
        
        // Fit bounds to show all markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(data.pickup);
        bounds.extend(data.delivery);
        bounds.extend(data.courier);
        map.fitBounds(bounds);
    }
    
    /**
     * Initialize map for CourierLiveTask.html - Courier navigation view
     */
    function initCourierLiveMap(mapElement) {
        const data = TRACKING_DATA.courierLive;
        
        const center = {
            lat: (data.pickup.lat + data.delivery.lat) / 2,
            lng: (data.pickup.lng + data.delivery.lng) / 2
        };
        
        const map = new google.maps.Map(mapElement, {
            zoom: 14,
            center: center,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });
        
        mapInstances.courierLiveMap = map;
        
        // Pickup marker
        const pickupMarker = new google.maps.Marker({
            position: data.pickup,
            map: map,
            title: 'Pickup Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4CAF50',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
            },
            label: {
                text: 'PICKUP',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 'bold'
            }
        });
        
        // Delivery marker
        const deliveryMarker = new google.maps.Marker({
            position: data.delivery,
            map: map,
            title: 'Delivery Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF5722',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
            },
            label: {
                text: 'DELIVERY',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 'bold'
            }
        });
        
        // Current position marker (blue dot)
        const currentPosMarker = new google.maps.Marker({
            position: data.courier,
            map: map,
            title: 'Your Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#2196F3',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
            }
        });
        
        // Draw route
        const routePath = new google.maps.Polyline({
            path: [data.courier, data.pickup, data.delivery],
            geodesic: true,
            strokeColor: '#2196F3',
            strokeOpacity: 0.7,
            strokeWeight: 4
        });
        routePath.setMap(map);
        
        // Info windows
        const pickupInfo = new google.maps.InfoWindow({
            content: `<div><strong>Pickup: ${data.pickup.address}</strong></div>`
        });
        const deliveryInfo = new google.maps.InfoWindow({
            content: `<div><strong>Delivery: ${data.delivery.address}</strong></div>`
        });
        
        pickupMarker.addListener('click', () => pickupInfo.open(map, pickupMarker));
        deliveryMarker.addEventListener('click', () => deliveryInfo.open(map, deliveryMarker));
        
        // Simulate movement towards pickup
        simulateCourierMovement(currentPosMarker, data.pickup, data.delivery, 'courierLive');
        
        // Fit bounds
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(data.pickup);
        bounds.extend(data.delivery);
        bounds.extend(data.courier);
        map.fitBounds(bounds);
    }
    
    /**
     * Initialize map for AdminDashboard.html - Overview map
     */
    function initAdminMap(mapElement) {
        const data = TRACKING_DATA.admin;
        
        const map = new google.maps.Map(mapElement, {
            zoom: data.zoom,
            center: data.center,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        });
        
        mapInstances.adminMap = map;
        
        // Add sample markers for active deliveries (in production, these would come from backend)
        const activeDeliveries = [
            { lat: -1.9500, lng: 30.0589, title: 'Order #1021' },
            { lat: -1.9441, lng: 30.0619, title: 'Order #1020' }
        ];
        
        activeDeliveries.forEach((delivery, index) => {
            new google.maps.Marker({
                position: delivery,
                map: map,
                title: delivery.title,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: index === 0 ? '#4CAF50' : '#FFC107',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                }
            });
        });
    }
    
    /**
     * Simulate courier movement from current position to pickup, then to delivery
     */
    function simulateCourierMovement(marker, pickup, delivery, mapType) {
        let currentPos = { ...TRACKING_DATA[mapType === 'tracking' ? 'tracking' : 'courierLive'].courier };
        let target = pickup;
        let phase = 'toPickup'; // 'toPickup' or 'toDelivery'
        let step = 0;
        const totalSteps = 100;
        
        function move() {
            if (step >= totalSteps) {
                if (phase === 'toPickup') {
                    // Reached pickup, now go to delivery
                    phase = 'toDelivery';
                    target = delivery;
                    step = 0;
                    currentPos = { ...pickup };
                } else {
                    // Reached delivery, stop or restart
                    return;
                }
            }
            
            // Calculate next position (linear interpolation)
            const latDiff = target.lat - currentPos.lat;
            const lngDiff = target.lng - currentPos.lng;
            
            currentPos.lat += latDiff / (totalSteps - step);
            currentPos.lng += lngDiff / (totalSteps - step);
            
            // Calculate bearing for arrow rotation
            const bearing = Math.atan2(lngDiff, latDiff) * 180 / Math.PI;
            
            marker.setPosition(currentPos);
            marker.setIcon({
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                rotation: bearing,
                fillColor: '#2196F3',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
            });
            
            step++;
        }
        
        // Update position every 2 seconds (simulate real-time tracking)
        const interval = setInterval(move, 2000);
        trackingIntervals[mapType] = interval;
        
        // Initial movement
        move();
    }
    
    // Initialize maps when DOM is ready
    document.addEventListener('DOMContentLoaded', initTrackingMaps);
    
    // Cleanup intervals when page unloads
    window.addEventListener('beforeunload', () => {
        Object.values(trackingIntervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
    });
})();

// Prefill Login form email if present in query string and handle login submit redirect
(function() {
    // Prefill Login form email if present in query string and handle login submit redirect
    document.addEventListener('DOMContentLoaded', function() {
        try {
            const params = new URLSearchParams(window.location.search);
            const emailParam = params.get('email');
            const roleParam = params.get('role'); // optional role hint

            // only run on the login page
            const path = window.location.pathname.split('/').pop() || '';
            if (!path.toLowerCase().includes('login')) return;

            // find email & password inputs (support several id conventions)
            const emailInput = document.querySelector('input[type="email"]#email') || document.getElementById('email') || document.querySelector('input[type="email"]');
            const pwdInput = document.querySelector('input[type="password"]#password') || document.getElementById('password') || document.querySelector('input[type="password"]');

            if (emailParam && emailInput) {
                emailInput.value = decodeURIComponent(emailParam);
                if (pwdInput) pwdInput.focus();
            }

            // locate the login form (try common ids, otherwise first form)
            const loginForm = document.getElementById('loginForm') || document.getElementById('login-form') || document.querySelector('form');

            if (!loginForm) return;

            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const email = emailInput ? emailInput.value.trim() : '';
                const password = pwdInput ? pwdInput.value : '';

                // basic client-side validation
                if (!email || !password) {
                    if (!email) emailInput && emailInput.focus();
                    else pwdInput && pwdInput.focus();
                    alert('Please enter both email and password.');
                    return;
                }

                // lookup user in localStorage (client-side demo auth)
                let userName = '';
                try {
                    const usersKey = 'quickdrop_users_v1';
                    const raw = localStorage.getItem(usersKey);
                    const users = raw ? JSON.parse(raw) : [];
                    const found = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                    if (found) userName = found.name || '';
                } catch (err) {
                    console.error('Error reading users from storage:', err);
                }

                // NOTE: Replace with real server-side auth. This is a client-side fallback.
                const isCourier = (roleParam === 'courier') || /courier/i.test(email);

                const params = new URLSearchParams();
                if (userName) params.set('name', userName);
                params.set('email', email);
                params.set('role', isCourier ? 'courier' : 'customer');

                if (isCourier) {
                    window.location.href = `CourierDashboard.html?${params.toString()}`;
                } else {
                    window.location.href = `CustomerDashboard.html?${params.toString()}`;
                }
            });
        } catch (err) {
            console.error('Login prefill/submit handler error:', err);
        }
    });
})();

// Admin Dashboard Enhancements (Client-side only)
(function() {
    function getUsers() {
        try {
            const raw = localStorage.getItem('quickdrop_users_v1');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    // Lookup user name by email from localStorage
    function getUserNameFromEmail(email) {
        if (!email) return '';
        try {
            const users = getUsers();
            const found = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
            return found ? (found.name || '') : '';
        } catch (e) {
            return '';
        }
    }

    function renderAdminUsers() {
        // Only render if an explicit admin container exists in your HTML.
        // Do NOT create a fallback element (user requested no extra bottom content).
        const container = document.getElementById('adminUserList') || document.getElementById('adminUsersContainer');
        if (!container) return; // do nothing if admin list area not present

        const users = getUsers();
        container.innerHTML = ''; // clear existing content
        const heading = document.createElement('h3');
        heading.textContent = 'Registered Users (Client-side)';
        heading.style.marginBottom = '8px';
        container.appendChild(heading);

        if (users.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No registered users (client-side).';
            container.appendChild(p);
            return;
        }

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '0.95rem';

        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Name</th><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Email</th><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Role</th><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Joined</th></tr>';
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td style="padding:6px;border-bottom:1px solid #f2f2f2">${u.name || ''}</td>
                            <td style="padding:6px;border-bottom:1px solid #f2f2f2">${u.email || ''}</td>
                            <td style="padding:6px;border-bottom:1px solid #f2f2f2">${u.role || ''}</td>
                            <td style="padding:6px;border-bottom:1px solid #f2f2f2">${u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</td>`;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    }

    function showWelcomeFromQuery() {
        const params = new URLSearchParams(window.location.search);
        let name = params.get('name') || '';
        const emailParam = params.get('email') || '';
        const roleParam = params.get('role') || '';

        // If no name supplied, try to resolve from stored users using email
        if (!name && emailParam) {
            name = getUserNameFromEmail(emailParam);
        }

        // Final fallback: show role-specific generic label (Customer / Courier)
        if (!name) {
            if (roleParam.toLowerCase() === 'courier') name = 'Courier';
            else if (roleParam.toLowerCase() === 'customer') name = 'Customer';
            else name = ''; // don't show any welcome if nothing meaningful
        }

        if (!name) return; // nothing to show

        // Prefer an explicit welcome slot if present
        const welcomeSlot = document.getElementById('welcomeName') || document.querySelector('.welcome-message') || document.getElementById('dashboardGreeting');
        if (welcomeSlot) {
            welcomeSlot.textContent = `Welcome, ${name}`;
            return;
        }

        // Otherwise prepend a small unobtrusive welcome before first H1 (retain original H1 text)
        const h1 = document.querySelector('h1');
        if (h1) {
            // Create a small element to avoid overwriting the H1 text (non-destructive)
            const smallWelcome = document.createElement('div');
            smallWelcome.textContent = `Welcome, ${name}`;
            smallWelcome.style.fontSize = '1.05rem';
            smallWelcome.style.fontWeight = '600';
            smallWelcome.style.marginBottom = '8px';
            // insert before the H1 without changing H1 content
            h1.parentNode.insertBefore(smallWelcome, h1);
            return;
        }

        // If no H1, insert at top of main container if present
        const firstContainer = document.querySelector('.container') || document.body;
        const top = document.createElement('div');
        top.textContent = `Welcome, ${name}`;
        top.setAttribute('aria-live','polite');
        top.style.fontSize = '1.05rem';
        top.style.fontWeight = '600';
        top.style.padding = '6px 0';
        firstContainer.insertBefore(top, firstContainer.firstChild);
    }

    // Ensure meta viewport exists to improve responsiveness without changing styles
    (function ensureViewport() {
        if (!document.querySelector('meta[name="viewport"]')) {
            const m = document.createElement('meta');
            m.name = 'viewport';
            m.content = 'width=device-width, initial-scale=1';
            document.head.appendChild(m);
        }
    })();

    document.addEventListener('DOMContentLoaded', function() {
        // Show welcome on dashboards
        const path = (window.location.pathname.split('/').pop() || '').toLowerCase();
        if (path.includes('courierdashboard') || path.includes('customerdashboard') || path.includes('customer')) {
            showWelcomeFromQuery();
        }

        // On Admin page render users only if admin UI provides a container
        if (path.includes('admindashboard') || path.includes('admin')) {
            renderAdminUsers();
        }
    });
})();

// Safe Chart.js initializer for admin canvases
(function() {
    // Safe Chart.js initializer for admin canvases
    document.addEventListener('DOMContentLoaded', function() {
        const canvases = document.querySelectorAll('canvas.admin-chart, canvas[data-chart]');
        if (!canvases || canvases.length === 0) return;

        function initCanvas(canvas) {
            if (canvas._chartInitialized) return;
            if (typeof Chart === 'undefined') return false;
            try {
                const ctx = canvas.getContext('2d');
                let config = null;
                const raw = canvas.getAttribute('data-chart');
                if (raw) {
                    try { config = JSON.parse(raw); } catch (e) { console.warn('Invalid JSON in data-chart:', e); }
                }
                if (!config) {
                    // non-intrusive fallback sample (won't change layout/design)
                    config = {
                        type: 'bar',
                        data: {
                            labels: ['Jan','Feb','Mar','Apr','May'],
                            datasets: [{ label: 'Activity', data: [12,19,8,15,10], backgroundColor: 'rgba(74,124,42,0.85)' }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    };
                }
                // create chart instance and mark as initialized
                canvas._chartInstance = new Chart(ctx, config);
                canvas._chartInitialized = true;
                return true;
            } catch (err) {
                console.error('Chart init error:', err);
                return false;
            }
        }

        // Wait for Chart.js to load (max retries)
        let tries = 25;
        (function waitForChart() {
            if (typeof Chart !== 'undefined') {
                canvases.forEach(initCanvas);
            } else if (tries-- > 0) {
                setTimeout(waitForChart, 200);
            } else {
                console.warn('Chart.js not found; admin charts not initialized.');
            }
        })();
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    // Confirm Pickup button behaviour
    const confirmBtn = document.getElementById('confirmPickupBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // mark button as confirmed
            confirmBtn.classList.add('disabled');
            confirmBtn.setAttribute('aria-disabled', 'true');
            confirmBtn.textContent = 'Picked up';

            // Update current-task card status if present
            const currentCard = document.querySelector('.current-task-card');
            if (currentCard) {
                // try to find a visible status element or create one
                let s = currentCard.querySelector('.task-list-status') || currentCard.querySelector('.task-status');
                if (!s) {
                    s = document.createElement('span');
                    s.className = 'task-status';
                    s.style.marginTop = '8px';
                    currentCard.appendChild(s);
                }
                s.textContent = 'Picked up';
            }

            // Update matching upcoming task status by searching for order id text
            const orderId = confirmBtn.dataset.orderId;
            if (orderId) {
                document.querySelectorAll('.task-list-item').forEach(item => {
                    const idEl = item.querySelector('.id');
                    if (idEl && idEl.textContent.includes(`#${orderId}`)) {
                        const statusEl = item.querySelector('.task-list-status');
                        if (statusEl) statusEl.textContent = 'In Transit';
                    }
                });
            }
        });
    }

    // Admin charts diagnostic: warn if canvases exist but Chart.js is not loaded
    const adminCanvases = document.querySelectorAll('canvas.admin-chart, canvas[data-chart]');
    if (adminCanvases.length > 0 && typeof Chart === 'undefined') {
        console.warn('Chart.js not found on this page. Add <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> to AdminDashboard.html (before script.js) so charts initialize.');
    }
});

    /*quick-test: initialize any canvas.analytics-chart using Chart.js (temporary) */
    (function(){
      if (typeof Chart === 'undefined') return console.error('Chart.js not found on this page.');
      const canvases = document.querySelectorAll('canvas.analytics-chart');
      if (!canvases.length) return console.warn('No canvases found with .analytics-chart selector.');
      canvases.forEach((c, i) => {
        try {
          const ctx = c.getContext('2d');
          // small responsive fallback config
          new Chart(ctx, {
            type: i === 1 ? 'line' : (i === 2 ? 'doughnut' : 'bar'),
            data: {
              labels: ['Mon','Tue','Wed','Thu','Fri'],
              datasets: [{ label: 'Sample', data: [12,19,8,15,10], backgroundColor: ['#4a7c2a'], borderColor:'#4a7c2a', tension:0.3 }]
            },
            options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:i===2}} }
          });
          console.log('Chart initialized on', c.id || c);
        } catch (e) {
          console.error('Chart init failed for', c, e);
        }
      });
    })();
