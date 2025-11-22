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

// --- 3. Modal Functionality (New Delivery Form) ---
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
            console.log('Booking request sent successfully.');
            
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

// --- 6. SignUp Modal Functionality (for couriers) ---
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
            console.log('Courier details saved! Please click "Create Account" to finalize.');
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
                    console.error('Please complete the Courier Application Details pop-up first.');
                    if (courierModal) courierModal.style.display = 'block'; 
                    formIsValid = false;
                }
            }

            // Prevent form submission if validation failed
            if (!formIsValid) {
                e.preventDefault(); 
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

// --- 8. Mobile Menu Toggle ---
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