/**
 * ============================================================================
 * TEJAS LADIES TYLOR — Master Application Script
 * ============================================================================
 * Handles UI interactions, Dark/Light mode theme toggle, Navigation states,
 * Scroll reveal animations, Counters, Testimonial Carousel, Gallery Lightbox,
 * Modals, and Toast alerts.
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. THEME MANAGEMENT (Light / Dark Mode with localStorage Persistence)
     -------------------------------------------------------------------------- */
  const THEME_STORAGE_KEY = 'tlt_theme_preference';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(activeTheme);

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeToggleIcons(theme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info');
  }

  function updateThemeToggleIcons(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      if (theme === 'dark') {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Switch to light mode"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        btn.setAttribute('title', 'Switch to Light Mode');
      } else {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Switch to dark mode"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        btn.setAttribute('title', 'Switch to Dark Mode');
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. DYNAMIC NAVBAR AUTH STATE (Login/Register <-> My Account/Logout)
     -------------------------------------------------------------------------- */
  function updateNavAuthState() {
    const authContainers = document.querySelectorAll('.auth-group, .mobile-auth-group');
    const isLoggedIn = window.TLT_AUTH && window.TLT_AUTH.isLoggedIn();
    const currentUser = isLoggedIn ? window.TLT_AUTH.getCurrentUser() : null;

    authContainers.forEach(container => {
      if (isLoggedIn && currentUser) {
        const firstName = (currentUser.fullName || 'User').split(' ')[0];
        container.innerHTML = `
          <a href="profile.html" class="btn btn-outline btn-sm nav-account-btn" title="View My Account">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>My Account</span>
          </a>
          <button type="button" class="btn btn-sm btn-logout" id="logoutBtn" style="color:var(--text-muted);font-size:0.8rem;padding:0.4rem 0.8rem;">
            Logout
          </button>
        `;
      } else {
        container.innerHTML = `
          <a href="login.html" class="btn btn-outline btn-sm">Login</a>
          <a href="register.html" class="btn btn-primary btn-sm">Register</a>
        `;
      }
    });

    // Attach logout event listeners
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out from TEJAS LADIES TYLOR?')) {
          if (window.TLT_AUTH) {
            window.TLT_AUTH.logoutUser();
            showToast('You have been logged out.', 'info');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 600);
          }
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. STICKY NAVBAR, SCROLL PROGRESS & ACTIVE LINK OBSERVER
     -------------------------------------------------------------------------- */
  function initScrollBehaviors() {
    const navbar = document.querySelector('.navbar');
    const progressBar = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Sticky Navbar styling
      if (navbar) {
        if (scrollPos > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Scroll progress bar
      if (progressBar && docHeight > 0) {
        const progress = (scrollPos / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
      }

      // Back to Top button
      if (backToTopBtn) {
        if (scrollPos > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }
    }, { passive: true });

    // Back to Top click
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Highlight current active nav link based on section in view
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length > 0 && navLinks.length > 0) {
      window.addEventListener('scroll', () => {
        let currentSection = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 120;
          const sectionHeight = section.offsetHeight;
          if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
          }
        });
      }, { passive: true });
    }
  }

  /* --------------------------------------------------------------------------
     4. MOBILE HAMBURGER MENU & SLIDE-OUT DRAWER
     -------------------------------------------------------------------------- */
  function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburgerBtn || !mobileDrawer) return;

    function openMenu() {
      hamburgerBtn.classList.add('active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      mobileDrawer.classList.add('open');
      if (mobileBackdrop) mobileBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      mobileDrawer.classList.remove('open');
      if (mobileBackdrop) mobileBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) closeMenu();
      else openMenu();
    });

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMenu);
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* --------------------------------------------------------------------------
     5. SCROLL REVEAL & STATS COUNTER ANIMATIONS
     -------------------------------------------------------------------------- */
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Slight staggered entry
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 40);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Animate stats counter numbers when visible
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      statNumbers.forEach(stat => statsObserver.observe(stat));
    }
  }

  function animateNumber(el) {
    const targetText = el.getAttribute('data-target') || el.textContent;
    const hasPlus = targetText.includes('+');
    const hasPercent = targetText.includes('%');
    const numericValue = parseInt(targetText.replace(/\D/g, ''), 10);

    if (isNaN(numericValue)) return;

    let start = 0;
    const duration = 1800;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = numericValue / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        start = numericValue;
        clearInterval(timer);
      }
      el.textContent = Math.floor(start) + (hasPlus ? '+' : '') + (hasPercent ? '%' : '');
    }, stepTime);
  }

  /* --------------------------------------------------------------------------
     6. TESTIMONIALS SLIDER / CAROUSEL
     -------------------------------------------------------------------------- */
  function initTestimonialSlider() {
    const track = document.querySelector('.reviews-track');
    const slides = document.querySelectorAll('.review-card');
    const prevBtn = document.getElementById('prevReviewBtn');
    const nextBtn = document.getElementById('nextReviewBtn');
    const dotsContainer = document.querySelector('.slider-dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;

    // Build dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(idx);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateSlider() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      updateSlider();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
      });
    }

    function startAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    // Pause on hover
    const container = document.querySelector('.reviews-slider-container');
    if (container) {
      container.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
      container.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
  }

  /* --------------------------------------------------------------------------
     7. GALLERY LIGHTBOX & CATEGORY FILTERING
     -------------------------------------------------------------------------- */
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!modal || galleryItems.length === 0) return;

    let activeItems = Array.from(galleryItems);
    let activeIndex = 0;

    function openLightbox(index) {
      activeIndex = index;
      const item = activeItems[activeIndex];
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-item-title') ? item.querySelector('.gallery-item-title').textContent : '';
      const tag = item.querySelector('.gallery-item-tag') ? item.querySelector('.gallery-item-tag').textContent : '';

      lightboxImg.src = img.getAttribute('data-large') || img.src;
      lightboxImg.alt = img.alt || 'Bespoke tailoring piece';
      if (lightboxCaption) {
        lightboxCaption.textContent = tag ? `${tag} — ${title}` : title;
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (lightboxImg) lightboxImg.src = '';
    }

    function nextImage() {
      activeIndex = (activeIndex + 1) % activeItems.length;
      openLightbox(activeIndex);
    }

    function prevImage() {
      activeIndex = (activeIndex - 1 + activeItems.length) % activeItems.length;
      openLightbox(activeIndex);
    }

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const idx = activeItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);

    // Click outside image to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });

    // Category Filter buttons
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');
        activeItems = [];

        galleryItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            item.style.display = 'block';
            activeItems.push(item);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. SERVICE "LEARN MORE" POPUP MODAL
     -------------------------------------------------------------------------- */
  const SERVICE_DETAILS = {
    'ethnic': {
      title: 'Ethnic & Traditional Wear',
      badge: 'Signature Craft',
      description: 'Handcrafted traditional garments tailored with immaculate finishing and custom silhouetting for cultural celebrations, family functions, and festivals.',
      features: [
        'Custom Salwar Suits, Patiala Suits & Anarkalis',
        'Bridal & Designer Lehengas with customized can-can layers',
        'Comfort-fit Kurtis and Palazzos with precision chest darts',
        'Fabric suggestions, border attachments, and handcrafted latkans'
      ],
      turnaround: 'Standard: 5–7 days | Urgent: 48 hours',
      bookingService: 'Ethnic & Traditional Wear'
    },
    'blouses': {
      title: 'Designer Blouses',
      badge: 'Most Requested',
      description: 'The crown jewel of TEJAS LADIES TYLOR. We engineer blouse cuts that embrace your posture without shoulder slippage, underarm pinch, or back gaping.',
      features: [
        'Princess Cut, Katori Cut, Four-Tuck & Padded Blouses',
        'Intricate Backs: Deep U, Keyhole, Sheer Mesh, Halter & Tie-up Dori',
        'Boat Neck, Sweetheart, Square & High-collar Couture Necks',
        'Aari, Zari, Maggam work and delicate bead embroidery'
      ],
      turnaround: 'Standard: 3–5 days | Bridal: 7–10 days',
      bookingService: 'Designer Blouses'
    },
    'western': {
      title: 'Western & Fusion Wear',
      badge: 'Modern Chic',
      description: 'Tailored western silhouettes that match global runway trends, made to fit your individual body contours with ease and confidence.',
      features: [
        'Bespoke Formal Trousers, Cigarette Pants & Culottes',
        'Cocktail Gowns, A-line Dresses & Summer Sundresses',
        'Indo-Western Crop Tops, Cape Jackets & Dhoti Skirts',
        'Structured Jumpsuits with custom torso measurements'
      ],
      turnaround: 'Standard: 5–7 days',
      bookingService: 'Western & Fusion Wear'
    },
    'alterations': {
      title: 'Alterations & Restyling',
      badge: 'Wardrobe Refresh',
      description: 'Give your beloved outfits a second life. Our master tailors perform surgical adjustments to revive, downsize, or modernize any piece.',
      features: [
        'Precision Resizing, Shoulder Slimming & Hem Adjustments',
        'Old Saree to Anarkali, Lehenga, or Kurti Restyling',
        'Zipper Replacements, Hook Reinforcements & Cup Insertions',
        'Darning, Patchwork, and Fabric Reinforcement'
      ],
      turnaround: 'Express: 24–48 hours',
      bookingService: 'Alterations & Restyling'
    },
    'bridal': {
      title: 'Festive & Bridal Wear',
      badge: 'Couture Experience',
      description: 'Your wedding journey deserves perfection. We deliver personalized bridal trousseau styling, embroidery coordination, and multiple trial fittings.',
      features: [
        'Complete Bridal Trousseau packages',
        'Handcrafted Zardozi, Kundan & Resham Threadwork',
        'Custom Bridal Blouse & Dupatta Embellishments',
        'Pre-wedding Fitting Trials & Final Steaming'
      ],
      turnaround: 'Custom timeline based on wedding schedule',
      bookingService: 'Festive & Bridal Wear'
    },
    'consultation': {
      title: 'Design Consultation & Styling',
      badge: 'Expert Guidance',
      description: 'Not sure which neckline flatters your neckline or which sleeve cut works with your fabric? Sit with our master stylists for personalized advice.',
      features: [
        'Body-type and posture-flattering styling advice',
        'Fabric selection, draping, and fall analysis',
        'Neckline, sleeve length, and border pairing recommendations',
        'Comprehensive 1-on-1 measurement session'
      ],
      turnaround: 'Same day consultation (30–45 mins)',
      bookingService: 'Design Consultation'
    }
  };

  function initServiceModal() {
    const modal = document.getElementById('serviceDetailsModal');
    const closeBtn = document.getElementById('serviceModalClose');
    const learnMoreBtns = document.querySelectorAll('.service-learn-more-btn');

    if (!modal || learnMoreBtns.length === 0) return;

    const titleEl = document.getElementById('serviceModalTitle');
    const badgeEl = document.getElementById('serviceModalBadge');
    const descEl = document.getElementById('serviceModalDesc');
    const featuresList = document.getElementById('serviceModalFeatures');
    const turnaroundEl = document.getElementById('serviceModalTurnaround');
    const bookBtn = document.getElementById('serviceModalBookBtn');

    learnMoreBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceKey = btn.getAttribute('data-service');
        const data = SERVICE_DETAILS[serviceKey];
        if (!data) return;

        titleEl.textContent = data.title;
        badgeEl.textContent = data.badge;
        descEl.textContent = data.description;
        turnaroundEl.textContent = data.turnaround;

        featuresList.innerHTML = '';
        data.features.forEach(f => {
          const li = document.createElement('li');
          li.className = 'service-spec-item';
          li.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>${f}</span>`;
          featuresList.appendChild(li);
        });

        bookBtn.href = `booking.html?service=${encodeURIComponent(data.bookingService)}`;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     9. QUICK CONTACT FORM HANDLING (Instant Local Feedback)
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const contactForm = document.getElementById('quickContactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const message = document.getElementById('contactMsg').value.trim();

      if (!name || !phone) {
        showToast('Please provide your name and contact phone number.', 'error');
        return;
      }

      showToast(`Thank you, ${name}! Your inquiry has been received. Our boutique will call you shortly.`, 'success');
      contactForm.reset();
    });
  }

  /* --------------------------------------------------------------------------
     10. GLOBAL TOAST NOTIFICATION SYSTEM
     -------------------------------------------------------------------------- */
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-remove after 4.2 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4200);
  }

  // Expose showToast globally
  window.showToast = showToast;

  /* --------------------------------------------------------------------------
     INITIALIZE ON DOM CONTENT LOADED
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateNavAuthState();
    initScrollBehaviors();
    initMobileMenu();
    initScrollReveals();
    initTestimonialSlider();
    initGalleryLightbox();
    initServiceModal();
    initContactForm();
  });

})();
