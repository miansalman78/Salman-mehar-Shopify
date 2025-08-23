/**
 * Footer JavaScript functionality
 * Handles newsletter form, localization, and social interactions
 */

class NewsletterForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.input = this.querySelector('input[type="email"]');
    this.button = this.querySelector('button[type="submit"]');
    this.messageContainer = this.querySelector('.newsletter-form__message');
    
    if (this.form) {
      this.form.addEventListener('submit', this.onSubmit.bind(this));
    }
    
    if (this.input) {
      this.input.addEventListener('input', this.onInput.bind(this));
      this.input.addEventListener('focus', this.onFocus.bind(this));
      this.input.addEventListener('blur', this.onBlur.bind(this));
    }
  }

  onSubmit(event) {
    event.preventDefault();
    
    const email = this.input.value.trim();
    
    if (!this.isValidEmail(email)) {
      this.showError('Please enter a valid email address.');
      return;
    }

    this.showLoading();
    
    // Submit the form data
    const formData = new FormData(this.form);
    
    fetch(this.form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok');
    })
    .then(data => {
      this.showSuccess('Thank you for subscribing!');
      this.input.value = '';
    })
    .catch(error => {
      console.error('Error:', error);
      this.showError('Something went wrong. Please try again.');
    })
    .finally(() => {
      this.hideLoading();
    });
  }

  onInput() {
    this.clearMessages();
    this.updateButtonState();
  }

  onFocus() {
    this.input.parentElement.classList.add('field--focused');
  }

  onBlur() {
    if (!this.input.value.trim()) {
      this.input.parentElement.classList.remove('field--focused');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  updateButtonState() {
    const email = this.input.value.trim();
    if (this.button) {
      this.button.disabled = !email || !this.isValidEmail(email);
    }
  }

  showLoading() {
    if (this.button) {
      this.button.disabled = true;
      this.button.classList.add('loading');
      this.button.innerHTML = '<span class="loading-spinner"></span>';
    }
  }

  hideLoading() {
    if (this.button) {
      this.button.disabled = false;
      this.button.classList.remove('loading');
      this.button.innerHTML = '<svg viewBox="0 0 14 10" fill="none" aria-hidden="true" focusable="false" class="icon icon-arrow" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="m8.537.808 4.297 4.297a.75.75 0 0 1 0 1.06L8.537 10.46a.75.75 0 1 1-1.06-1.061L9.94 7.75H1a.75.75 0 0 1 0-1.5h8.94L7.477 3.87a.75.75 0 1 1 1.06-1.061Z" fill="currentColor"></path></svg>';
    }
  }

  showSuccess(message) {
    this.clearMessages();
    const successElement = document.createElement('div');
    successElement.className = 'newsletter-form__message newsletter-form__message--success';
    successElement.innerHTML = `
      <svg viewBox="0 0 13 13" class="icon icon-success" aria-hidden="true" focusable="false">
        <path d="m4.946 7.28 3.75 3.75c.138.138.362.138.5 0l.354-.353a.353.353 0 0 0 0-.5L5.1 5.727a.353.353 0 0 0-.5 0l-.354.353a.353.353 0 0 0 0 .5Z" fill="currentColor"/>
        <path d="M11.28 4.72 5.727 10.28a.353.353 0 0 1-.5 0L1.72 6.78a.353.353 0 0 1 0-.5l.353-.354a.353.353 0 0 1 .5 0L5.477 8.83l4.75-4.75a.353.353 0 0 1 .5 0l.353.354a.353.353 0 0 1 0 .5Z" fill="currentColor"/>
      </svg>
      ${message}
    `;
    
    if (this.messageContainer) {
      this.messageContainer.replaceWith(successElement);
    } else {
      this.form.appendChild(successElement);
    }
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      successElement.remove();
    }, 5000);
  }

  showError(message) {
    this.clearMessages();
    const errorElement = document.createElement('div');
    errorElement.className = 'newsletter-form__message newsletter-form__message--error';
    errorElement.innerHTML = `
      <svg aria-hidden="true" focusable="false" class="icon icon-error" viewBox="0 0 13 13">
        <circle cx="6.5" cy="6.50049" r="5.5" stroke="currentColor" stroke-width="2"/>
        <circle cx="6.5" cy="6.5" r=".5" fill="currentColor" stroke="currentColor"/>
        <path d="m6.5 3.5 0 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      ${message}
    `;
    
    if (this.messageContainer) {
      this.messageContainer.replaceWith(errorElement);
    } else {
      this.form.appendChild(errorElement);
    }
  }

  clearMessages() {
    const messages = this.querySelectorAll('.newsletter-form__message');
    messages.forEach(message => message.remove());
  }
}

customElements.define('newsletter-form', NewsletterForm);

class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      input: this.querySelector('input[name="language_code"], input[name="country_code"]'),
      button: this.querySelector('button'),
      panel: this.querySelector('.disclosure__list-wrapper')
    };
    this.elements.button.addEventListener('click', this.openSelector.bind(this));
    this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
    this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

    this.querySelectorAll('a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
  }

  hidePanel() {
    this.elements.button.setAttribute('aria-expanded', 'false');
    this.elements.panel.setAttribute('hidden', true);
  }

  onContainerKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    this.hidePanel();
    this.elements.button.focus();
  }

  onItemClick(event) {
    event.preventDefault();
    const form = this.querySelector('form');
    this.elements.input.value = event.currentTarget.dataset.value;

    if (form) form.submit();
  }

  openSelector() {
    this.elements.button.focus();
    this.elements.panel.toggleAttribute('hidden');
    this.elements.button.setAttribute(
      'aria-expanded',
      (this.elements.button.getAttribute('aria-expanded') === 'false').toString()
    );
  }

  closeSelector(event) {
    const shouldClose = event.relatedTarget && event.relatedTarget.nodeName === 'BUTTON';
    if (event.relatedTarget === null || shouldClose) {
      this.hidePanel();
    }
  }
}

customElements.define('localization-form', LocalizationForm);

// Social media link tracking
class SocialLinks {
  constructor() {
    this.init();
  }

  init() {
    const socialLinks = document.querySelectorAll('.footer__list-social a');
    
    socialLinks.forEach(link => {
      link.addEventListener('click', this.trackSocialClick.bind(this));
    });
  }

  trackSocialClick(event) {
    const link = event.currentTarget;
    const platform = this.getSocialPlatform(link.href);
    
    // Add analytics tracking here if needed
    console.log(`Social link clicked: ${platform}`);
    
    // Add visual feedback
    link.style.transform = 'scale(0.95)';
    setTimeout(() => {
      link.style.transform = '';
    }, 150);
  }

  getSocialPlatform(url) {
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('youtube.com')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('pinterest.com')) return 'Pinterest';
    if (url.includes('snapchat.com')) return 'Snapchat';
    if (url.includes('tumblr.com')) return 'Tumblr';
    if (url.includes('vimeo.com')) return 'Vimeo';
    return 'Unknown';
  }
}

// Footer animations and interactions
class FooterAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
  }

  setupScrollAnimations() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          footer.classList.add('footer--visible');
          this.animateFooterBlocks();
        }
      });
    }, {
      threshold: 0.1
    });

    observer.observe(footer);
  }

  animateFooterBlocks() {
    const blocks = document.querySelectorAll('.footer-block');
    
    blocks.forEach((block, index) => {
      setTimeout(() => {
        block.style.opacity = '1';
        block.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  setupHoverEffects() {
    // Add hover effects to footer links
    const footerLinks = document.querySelectorAll('.footer a');
    
    footerLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.transition = 'color 0.3s ease';
      });
    });
  }
}

// Initialize footer functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize social links tracking
  new SocialLinks();
  
  // Initialize footer animations
  new FooterAnimations();
  
  // Newsletter form enhancement
  const newsletterForms = document.querySelectorAll('.footer__newsletter');
  newsletterForms.forEach(form => {
    if (!form.querySelector('newsletter-form')) {
      const newsletterForm = document.createElement('newsletter-form');
      form.appendChild(newsletterForm);
    }
  });
  
  // Add loading styles for newsletter form
  const style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .newsletter-form__message--error {
      color: #d72c0d;
    }
    
    .newsletter-form__message--success {
      color: #2e7d32;
    }
    
    .footer-block {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .footer--visible .footer-block {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
  
  // Handle policy links accessibility
  const policyLinks = document.querySelectorAll('.footer__policy a');
  policyLinks.forEach(link => {
    link.addEventListener('focus', function() {
      this.style.outline = '2px solid rgba(var(--color-foreground), 0.5)';
      this.style.outlineOffset = '2px';
    });
    
    link.addEventListener('blur', function() {
      this.style.outline = '';
      this.style.outlineOffset = '';
    });
  });
  
  // Smooth scroll for anchor links in footer
  const anchorLinks = document.querySelectorAll('.footer a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});