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



// Append this block to initialize charts (DOM-ready)
(function initAdminCharts() {
  function createLine(ctx, labels, data, xLabel, yLabel) {
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: yLabel, data, borderColor: '#4a7c2a', backgroundColor: 'rgba(74,124,42,0.12)', fill: true, tension: 0.25 }]},
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: xLabel } },
          y: { beginAtZero: true, title: { display: true, text: yLabel } }
        }
      }
    });
  }

  function createBar(ctx, labels, data, xLabel, yLabel) {
    const barColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4a7c2a';
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: yLabel, data, backgroundColor: barColor }]},
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: xLabel } },
          y: { beginAtZero: true, title: { display: true, text: yLabel } }
        }
      }
    });
  }

  function createDoughnut(ctx, labels, data) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: ['#4a7c2a','#2196F3','#FFC107','#dc3545'] }]},
      options: { responsive: true, plugins: { legend: { position: 'right' } } }
    });
  }

  function onReady(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    const dEl = document.getElementById('deliveriesChart');
    const uEl = document.getElementById('usersChart');
    const sEl = document.getElementById('statusChart');

    if (dEl) createLine(dEl.getContext('2d'),
      Array.from({length:14}, (_,i)=>`Day ${i+1}`),
      Array.from({length:14}, ()=>Math.floor(40 + Math.random()*120)),
      'Day', 'Deliveries');

    if (uEl) createBar(uEl.getContext('2d'),
      ['Week 1','Week 2','Week 3','Week 4'],
      [120,210,330,470],
      'Week', 'New Users');

    if (sEl) createDoughnut(sEl.getContext('2d'),
      ['Delivered','In Transit','Pending','Failed'],
      [420,54,24,6]);
  });
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
