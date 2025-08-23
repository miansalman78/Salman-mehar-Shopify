class Theme {
  constructor() {
    this.init();
  }

  init() {
    this.initializeAccessibility();
    this.initializeCartFunctionality();
    this.initializeFormValidation();
    this.initializeScrollBehavior();
  }

  initializeAccessibility() {
    // Skip to content functionality
    const skipLink = document.querySelector('.skip-to-content-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Trap focus in modals
    this.initializeFocusTrap();

    // Announce dynamic content changes to screen readers
    this.initializeAriaLive();
  }

  initializeFocusTrap() {
    const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');
    
    modals.forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.trapFocus(e, modal);
        }
      });
    });
  }

  trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }

  initializeAriaLive() {
    // Create aria-live region for announcements
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }
  }

  announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  initializeCartFunctionality() {
    // Update cart count on page load
    this.updateCartCount();

    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      this.updateCartCount();
    });
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        element.setAttribute('aria-label', `Cart with ${cart.item_count} items`);
      });
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });

      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
      });
    });
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    }

    // Email validation
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }

    // Phone validation
    if (type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number.';
      }
    }

    this.displayFieldError(field, isValid, errorMessage);
    return isValid;
  }

  displayFieldError(field, isValid, errorMessage) {
    const errorElement = field.parentNode.querySelector('.field-error');
    
    if (!isValid) {
      field.classList.add('field-error-input');
      field.setAttribute('aria-invalid', 'true');
      
      if (!errorElement) {
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = errorMessage;
        error.setAttribute('role', 'alert');
        field.parentNode.appendChild(error);
      } else {
        errorElement.textContent = errorMessage;
      }
    } else {
      field.classList.remove('field-error-input');
      field.setAttribute('aria-invalid', 'false');
      
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  initializeScrollBehavior() {
    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link && link.getAttribute('href') !== '#') {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });

    // Add scroll-based classes
    let ticking = false;
    
    const updateScrollClasses = () => {
      const scrollY = window.scrollY;
      const body = document.body;
      
      if (scrollY > 100) {
        body.classList.add('scrolled');
      } else {
        body.classList.remove('scrolled');
      }
      
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollClasses);
        ticking = true;
      }
    });
  }

  // Utility functions
  formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price / 100);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Media query helper
  matchMedia(query) {
    return window.matchMedia(query).matches;
  }

  // Local storage helpers
  setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }

  getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return null;
    }
  }

  // Cookie helpers
  setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Performance monitoring
  measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.theme = new Theme();
  });
} else {
  window.theme = new Theme();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Theme;
}