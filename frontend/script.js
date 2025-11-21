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
            alert('Courier details saved! Please click "Create Account" to finalize.');
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
                    alert('Please complete the Courier Application Details pop-up first.');
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

        // Store the access token
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));

        alert('Account created successfully!');

        // Redirect based on role
        if (result.user.role === 'customer') {
            window.location.href = 'CustomerDashboard.html';
        } else if (result.user.role === 'courier') {
            window.location.href = 'CourierDashboard.html';
        } else if (result.user.role === 'admin') {
            window.location.href = 'AdminDashboard.html';
        }
    } catch (error) {
        alert('Signup failed: ' + error.message);
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

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await apiCall('/login', 'POST', { email, password });

                // Store the access token and user data
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));

                alert('Login successful!');

                // Redirect based on role
                if (result.user.role === 'customer') {
                    window.location.href = 'CustomerDashboard.html';
                } else if (result.user.role === 'courier') {
                    window.location.href = 'CourierDashboard.html';
                } else if (result.user.role === 'admin') {
                    window.location.href = 'AdminDashboard.html';
                }
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
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

                const updateData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value
                };

                try {
                    const result = await apiCall('/profile', 'PUT', updateData, true);

                    // Update local storage
                    localStorage.setItem('user', JSON.stringify(result.user));

                    alert('Profile updated successfully!');
                } catch (error) {
                    alert('Profile update failed: ' + error.message);
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
                    alert('New passwords do not match!');
                    return;
                }

                try {
                    await apiCall('/change-password', 'POST', {
                        current_password: currentPassword,
                        new_password: newPassword
                    }, true);

                    alert('Password changed successfully!');
                    passwordForm.reset();
                } catch (error) {
                    alert('Password change failed: ' + error.message);
                }
            });
        }
    }
})();

async function loadUserProfile() {
    try {
        const result = await apiCall('/profile', 'GET', null, true);

        // Populate form fields
        document.getElementById('name').value = result.name || '';
        document.getElementById('email').value = result.email || '';
        document.getElementById('phone').value = result.phone || '';
        document.getElementById('address').value = result.address || '';

        // Update local storage
        localStorage.setItem('user', JSON.stringify(result));
    } catch (error) {
        console.error('Failed to load profile:', error);
        alert('Failed to load profile. Please login again.');
        window.location.href = 'Login.html';
    }
}

// =====================
// Auth Check
// =====================
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const protectedPages = ['CustomerDashboard.html', 'CourierDashboard.html', 'AdminDashboard.html', 'Profile.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !token) {
        alert('Please login to access this page');
        window.location.href = 'Login.html';
    }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);