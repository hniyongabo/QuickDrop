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
            console.log('Courier details saved! Please click "Create Account" to finalize.');
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
                if (!detailsComplete) {
                    console.error('Please complete the Courier Application Details pop-up first.');
                    if (courierModal) courierModal.style.display = 'block';
                    formIsValid = false;
                }
            }

            // Stop here if invalid
            if (!formIsValid) {
                return;
            }

            // Collect user info (support common input id/name variants)
            function getInputValue(idsOrSelectors) {
                for (const s of idsOrSelectors) {
                    const el = document.getElementById(s) || document.querySelector(`input[name="${s}"]`);
                    if (el && el.value) return el.value.trim();
                }
                return '';
            }
            const fullName = getInputValue(['fullName','fullname','name','firstName']);
            const emailVal = getInputValue(['email','signup-email','userEmail']);

            // Save user to localStorage (for admin listing). Minimal user model.
            try {
                const usersKey = 'quickdrop_users_v1';
                const raw = localStorage.getItem(usersKey);
                const users = raw ? JSON.parse(raw) : [];
                // Avoid duplicate emails: update if exists
                const existingIndex = users.findIndex(u => u.email && emailVal && u.email.toLowerCase() === emailVal.toLowerCase());
                const newUser = {
                    id: Date.now(),
                    name: fullName || emailVal || 'User',
                    email: emailVal || '',
                    role: isCourier ? 'courier' : 'customer',
                    createdAt: (new Date()).toISOString()
                };
                if (existingIndex >= 0) {
                    users[existingIndex] = Object.assign({}, users[existingIndex], newUser);
                } else {
                    users.push(newUser);
                }
                localStorage.setItem(usersKey, JSON.stringify(users));
            } catch (err) {
                console.error('Failed to save user to localStorage:', err);
            }

            // If valid, either submit normally or redirect as needed
            // Option A: actually submit the form to the server:
            // mainForm.submit();

            // Option B: redirect client-side (existing behaviour)
            if (isCourier) {
                // include name & email for welcome on courier dashboard
                const params = new URLSearchParams();
                if (fullName) params.set('name', fullName);
                if (emailVal) params.set('email', emailVal);
                params.set('role', 'courier');
                window.location.href = `CourierDashboard.html?${params.toString()}`;
            } else {
                // Redirect to Login page with email and role hint
                const params = new URLSearchParams();
                if (emailVal) params.set('email', emailVal);
                params.set('role', 'customer');
                window.location.href = `Login.html?${params.toString()}`;
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