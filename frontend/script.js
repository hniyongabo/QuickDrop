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
        deliveryMarker.addListener('click', () => deliveryInfo.open(map, deliveryMarker));
        
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