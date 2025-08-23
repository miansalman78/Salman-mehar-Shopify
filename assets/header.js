/**
 * Header JavaScript functionality
 * Handles mobile menu, search, and sticky header behavior
 */

class HeaderDrawer extends HTMLElement {
  constructor() {
    super();
    
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.header = document.querySelector('.header-wrapper');
    this.borderOffset = 0;
    this.borderOffset = parseInt(window.getComputedStyle(this.header).getPropertyValue('border-bottom-width'));
  }

  connectedCallback() {
    this.header = this.header || document.querySelector('.header-wrapper');
    this.borderOffset = this.borderOffset || this.header.offsetTop + this.header.offsetHeight;

    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('click', this.onBodyClick);
  }

  disconnectedCallback() {
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    document.removeEventListener('click', this.onBodyClick);
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    const summaryElement = openDetailsElement.querySelector('summary');
    openDetailsElement.removeAttribute('open');
    summaryElement.setAttribute('aria-expanded', false);
    summaryElement.focus();
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeOnClickOutside);
      });
    }

    if (detailsElement.hasAttribute('open')) {
      detailsElement.removeAttribute('open');
      summaryElement.setAttribute('aria-expanded', false);
      removeTrapFocus();
      closeAnimation(detailsElement);
    } else {
      detailsElement.setAttribute('open', true);
      summaryElement.setAttribute('aria-expanded', true);
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        addTrapFocus();
        if (!reducedMotion || reducedMotion.matches) {
          detailsElement.classList.add('menu-opened');
        }
      }, 100);
    }
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this && !target.closest('header-drawer') && !target.closest('menu-drawer')) {
      const disclosure = target.closest('details[open]');
      if (disclosure) {
        disclosure.removeAttribute('open');
        disclosure.querySelector('summary').setAttribute('aria-expanded', false);
      }
    }
  }
}

customElements.define('header-drawer', HeaderDrawer);

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button:not(.localization-selector)').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    const summaryElement = openDetailsElement.querySelector('summary');
    openDetailsElement.removeAttribute('open');
    summaryElement.setAttribute('aria-expanded', false);
    summaryElement.focus();
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeOnClickOutside);
      });
    }

    if (detailsElement.hasAttribute('open')) {
      detailsElement.removeAttribute('open');
      summaryElement.setAttribute('aria-expanded', false);
      removeTrapFocus();
      closeAnimation(detailsElement);
    } else {
      detailsElement.setAttribute('open', true);
      summaryElement.setAttribute('aria-expanded', true);
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        addTrapFocus();
        if (!reducedMotion || reducedMotion.matches) {
          detailsElement.classList.add('menu-opened');
        }
      }, 100);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
    document.removeEventListener('click', this.onBodyClickEvent);
    this.closeAnimation(this.mainDetailsToggle);

    if (elementToFocus) elementToFocus.focus();
  }

  closeSubmenu(detailsElement) {
    detailsElement.removeAttribute('open');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.classList.remove('menu-opening');
        detailsElement.classList.remove('menu-opened');
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderSearch extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('button[type="reset"]');

    if (this.input) {
      this.input.form.addEventListener('reset', this.onFormReset.bind(this));
      this.input.addEventListener(
        'input',
        debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );
    }
  }

  onChange() {
    const searchTerm = this.input.value.trim();

    if (!searchTerm.length) {
      this.close(true);
      return;
    }

    this.getSearchResults(searchTerm);
  }

  onFormReset() {
    super.close(true);
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();

    fetch(`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
        this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
          predictiveSearchInstance.innerHTML = resultsMarkup;
        });
        this.setAttribute('results', true);

        this.setLiveRegionResults();
        this.open();
      })
      .catch((error) => {
        this.close();
        throw error;
      });
  }

  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }

  open() {
    this.setAttribute('open', true);
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }

    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('loading');
    this.removeAttribute('open');
  }
}

customElements.define('header-search', HeaderSearch);

// Utility functions
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (elementToFocus.tagName === 'INPUT' &&
      ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
      elementToFocus.value) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

const trapFocusHandlers = {};

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function closeAnimation(detailsElement) {
  let animationStart;

  const handleAnimation = (time) => {
    if (animationStart === undefined) {
      animationStart = time;
    }

    const elapsedTime = time - animationStart;

    if (elapsedTime < 400) {
      window.requestAnimationFrame(handleAnimation);
    } else {
      detailsElement.classList.remove('menu-opening');
      detailsElement.classList.remove('menu-opened');
    }
  }

  window.requestAnimationFrame(handleAnimation);
}

// Initialize header functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('.header__menu-icon');
  const mobileMenu = document.querySelector('.header-drawer');
  const mobileMenuClose = document.querySelector('.header-drawer__close');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', function() {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});