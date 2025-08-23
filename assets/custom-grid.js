class CustomGrid {
  constructor() {
    this.popup = document.getElementById('productPopup');
    this.popupOverlay = this.popup?.querySelector('.custom-popup__overlay');
    this.popupClose = this.popup?.querySelector('.custom-popup__close');
    this.popupForm = this.popup?.querySelector('.custom-popup__form');
    this.currentProduct = null;
    this.currentVariant = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Bind popup triggers
    document.addEventListener('click', (e) => {
      if (e.target.closest('.custom-grid__popup-trigger')) {
        e.preventDefault();
        const trigger = e.target.closest('.custom-grid__popup-trigger');
        const productHandle = trigger.dataset.productHandle;
        this.openPopup(productHandle);
      }
    });

    // Bind popup close events
    if (this.popupOverlay) {
      this.popupOverlay.addEventListener('click', () => this.closePopup());
    }
    
    if (this.popupClose) {
      this.popupClose.addEventListener('click', () => this.closePopup());
    }

    // Bind escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.popup && this.popup.style.display !== 'none') {
        this.closePopup();
      }
    });

    // Bind form submission
    if (this.popupForm) {
      this.popupForm.addEventListener('submit', (e) => this.handleAddToCart(e));
    }

    // Bind variant selection
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('custom-popup__variant-input')) {
        this.handleVariantChange();
      }
    });
  }

  async openPopup(productHandle) {
    try {
      const product = await this.fetchProduct(productHandle);
      if (product) {
        this.currentProduct = product;
        this.renderPopup(product);
        this.showPopup();
      }
    } catch (error) {
      console.error('Error opening popup:', error);
    }
  }

  async fetchProduct(handle) {
    try {
      const response = await fetch(`/products/${handle}.js`);
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  renderPopup(product) {
    if (!this.popup) return;

    // Update image
    const image = this.popup.querySelector('.custom-popup__image');
    if (image && product.featured_image) {
      image.src = product.featured_image;
      image.alt = product.title;
    }

    // Update title
    const title = this.popup.querySelector('.custom-popup__title');
    if (title) {
      title.textContent = product.title;
    }

    // Update price
    const price = this.popup.querySelector('.custom-popup__price');
    if (price) {
      const formattedPrice = this.formatPrice(product.price_min);
      price.textContent = formattedPrice;
    }

    // Update description
    const description = this.popup.querySelector('.custom-popup__description');
    if (description) {
      description.innerHTML = product.description || '';
    }

    // Render variants
    this.renderVariants(product);

    // Set initial variant
    this.currentVariant = product.variants[0];
    this.updateVariantId();
  }

  renderVariants(product) {
    const variantsContainer = this.popup.querySelector('.custom-popup__variants');
    if (!variantsContainer) return;

    variantsContainer.innerHTML = '';

    if (product.variants.length <= 1) {
      return; // No variants to show
    }

    // Group variants by option names
    const optionGroups = {};
    product.options.forEach((option, index) => {
      optionGroups[option] = {
        name: option,
        values: [...new Set(product.variants.map(variant => variant.options[index]))]
      };
    });

    // Render each option group
    Object.values(optionGroups).forEach((group, groupIndex) => {
      const groupElement = document.createElement('div');
      groupElement.className = 'custom-popup__variant-group';

      const label = document.createElement('div');
      label.className = 'custom-popup__variant-label';
      label.textContent = group.name;
      groupElement.appendChild(label);

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-popup__variant-options';

      group.values.forEach((value, valueIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'custom-popup__variant-option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `option${groupIndex + 1}`;
        input.value = value;
        input.id = `option${groupIndex + 1}-${valueIndex}`;
        input.className = 'custom-popup__variant-input';
        input.checked = valueIndex === 0;

        const button = document.createElement('label');
        button.htmlFor = input.id;
        button.className = 'custom-popup__variant-button';
        button.textContent = value;

        optionElement.appendChild(input);
        optionElement.appendChild(button);
        optionsContainer.appendChild(optionElement);
      });

      groupElement.appendChild(optionsContainer);
      variantsContainer.appendChild(groupElement);
    });
  }

  handleVariantChange() {
    if (!this.currentProduct) return;

    const selectedOptions = [];
    const variantInputs = this.popup.querySelectorAll('.custom-popup__variant-input:checked');
    
    variantInputs.forEach(input => {
      selectedOptions.push(input.value);
    });

    // Find matching variant
    const matchingVariant = this.currentProduct.variants.find(variant => {
      return variant.options.every((option, index) => option === selectedOptions[index]);
    });

    if (matchingVariant) {
      this.currentVariant = matchingVariant;
      this.updateVariantId();
      this.updatePrice(matchingVariant.price);
      this.updateAvailability(matchingVariant.available);
    }
  }

  updateVariantId() {
    const variantIdInput = this.popup.querySelector('.custom-popup__variant-id');
    if (variantIdInput && this.currentVariant) {
      variantIdInput.value = this.currentVariant.id;
    }
  }

  updatePrice(price) {
    const priceElement = this.popup.querySelector('.custom-popup__price');
    if (priceElement) {
      priceElement.textContent = this.formatPrice(price);
    }
  }

  updateAvailability(available) {
    const addToCartButton = this.popup.querySelector('.custom-popup__add-to-cart');
    if (addToCartButton) {
      if (available) {
        addToCartButton.disabled = false;
        addToCartButton.querySelector('span').textContent = 'ADD TO CART';
      } else {
        addToCartButton.disabled = true;
        addToCartButton.querySelector('span').textContent = 'SOLD OUT';
      }
    }
  }

  async handleAddToCart(e) {
    e.preventDefault();
    
    if (!this.currentVariant) return;

    const formData = new FormData(this.popupForm);
    const addToCartButton = this.popup.querySelector('.custom-popup__add-to-cart');
    const spinner = addToCartButton.querySelector('.loading-overlay__spinner');
    const buttonText = addToCartButton.querySelector('span');

    // Show loading state
    addToCartButton.disabled = true;
    spinner.classList.remove('hidden');
    buttonText.style.opacity = '0';

    try {
      // Add main product to cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const result = await response.json();

      // Check if we need to add the "Soft Winter Jacket"
      await this.checkAndAddBonusProduct(formData);

      // Show success and close popup
      this.showSuccessMessage();
      this.closePopup();
      
      // Update cart count if exists
      this.updateCartCount();

    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showErrorMessage('Failed to add product to cart. Please try again.');
    } finally {
      // Reset button state
      addToCartButton.disabled = false;
      spinner.classList.add('hidden');
      buttonText.style.opacity = '1';
    }
  }

  async checkAndAddBonusProduct(formData) {
    if (!this.currentVariant) return;

    // Check if the selected variant has Black and Medium options
    const hasBlack = this.currentVariant.options.some(option => 
      option.toLowerCase().includes('black')
    );
    const hasMedium = this.currentVariant.options.some(option => 
      option.toLowerCase().includes('medium')
    );

    if (hasBlack && hasMedium) {
      try {
        // Fetch the "Soft Winter Jacket" product
        const bonusProduct = await this.fetchProduct('soft-winter-jacket');
        if (bonusProduct && bonusProduct.variants.length > 0) {
          const bonusFormData = new FormData();
          bonusFormData.append('id', bonusProduct.variants[0].id);
          bonusFormData.append('quantity', '1');

          await fetch('/cart/add.js', {
            method: 'POST',
            body: bonusFormData
          });

          console.log('Bonus product "Soft Winter Jacket" added to cart');
        }
      } catch (error) {
        console.error('Error adding bonus product:', error);
        // Don't throw error here as main product was added successfully
      }
    }
  }

  showPopup() {
    if (this.popup) {
      this.popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Focus management for accessibility
      const firstFocusable = this.popup.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }

  closePopup() {
    if (this.popup) {
      this.popup.style.display = 'none';
      document.body.style.overflow = '';
      this.currentProduct = null;
      this.currentVariant = null;
    }
  }

  showSuccessMessage() {
    // You can customize this to show a toast notification or other success indicator
    console.log('Product added to cart successfully!');
    
    // Simple alert for now - you can replace with a more elegant solution
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 10000;
      font-weight: 600;
    `;
    notification.textContent = 'Product added to cart!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      z-index: 10000;
      font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count in header if exists
      const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
      });
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CustomGrid();
  });
} else {
  new CustomGrid();
}