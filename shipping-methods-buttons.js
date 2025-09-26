/**
 * Custom Shipping Buttons JavaScript - Optimized
 *
 * @version 1.0.0
 */

(function($) {
    'use strict';

    /**
     * Custom Shipping Buttons Class - Optimized
     */
    class CustomShippingButtons {

        constructor() {
            // Cache DOM elements and selectors
            this.container = $('.custom-shipping-buttons');
            this.wrapper = $('#custom-shipping-buttons-wrapper');
            this.body = $(document.body);

            // State management
            this.selectedMethod = null;
            this.methods = [];
            this.isLoading = false;
            this.isDestroyed = false;

            // Cached selectors for performance
            this.shippingInputSelector = 'input[name="shipping_method[0]"]';
            this.shippingBtnSelector = '.shipping-btn';

            // Debounce timer
            this.debounceTimer = null;

            this.init();
        }

        /**
         * Initialize the shipping buttons functionality
         */
        init() {
            if (!this.container.length) {
                console.warn('Custom Shipping Buttons: Container not found');
                return;
            }

            this.bindEvents();
            this.initialRender();
        }

        /**
         * Bind event listeners with optimization
         */
        bindEvents() {
            // Use event delegation for better performance
            this.wrapper.on('keydown', this.shippingBtnSelector, (e) => {
                this.handleKeydown(e);
            });

            // Debounced checkout updates
            this.body.on('updated_checkout.shippingButtons init_checkout.shippingButtons', () => {
                this.debouncedCheckoutUpdate();
            });
        }

        /**
         * Debounced checkout update handler
         */
        debouncedCheckoutUpdate() {
            if (this.isDestroyed) return;

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.handleCheckoutUpdate();
            }, 100); // Reduced from 50ms for better performance
        }

        /**
         * Handle checkout updates with optimization
         */
        handleCheckoutUpdate() {
            if (this.isLoading || this.isDestroyed) return;

            this.setLoadingState(true);

            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                this.refreshShippingButtons();
                this.setLoadingState(false);
            });
        }

        /**
         * Set loading state with optimization
         * @param {boolean} loading - Whether to show loading state
         */
        setLoadingState(loading) {
            if (this.isDestroyed) return;

            this.isLoading = loading;

            // Batch DOM operations for better performance
            const operations = loading ? {
                addClass: 'loading',
                attr: { 'aria-busy': 'true' }
            } : {
                removeClass: 'loading',
                attr: { 'aria-busy': 'false' }
            };

            this.container
                .addClass(operations.addClass || '')
                .removeClass(operations.removeClass || '')
                .attr(operations.attr);
        }

        /**
         * Render shipping method buttons with optimization
         * @param {Array} methods - Array of shipping methods
         */
        renderShippingButtons(methods) {
            if (!Array.isArray(methods) || methods.length === 0 || this.isDestroyed) {
                this.container.empty();
                return;
            }

            // Clear container efficiently
            this.container[0].innerHTML = '';

            const currentMethod = this.getCurrentSelectedMethod();
            const fragment = document.createDocumentFragment();

            // Create buttons in batch for better performance
            methods.forEach((method, index) => {
                const button = this.createShippingButton(method, currentMethod, index);
                fragment.appendChild(button[0]);
            });

            this.container[0].appendChild(fragment);

            // Update ARIA attributes
            this.updateAriaAttributes();
        }

        /**
         * Create a shipping method button with optimization
         * @param {Object} method - Shipping method object
         * @param {string} currentMethod - Currently selected method ID
         * @param {number} index - Button index for keyboard navigation
         * @returns {jQuery} Button element
         */
        createShippingButton(method, currentMethod, index) {
            const isSelected = method.id === currentMethod;
            const buttonId = `shipping-btn-${method.id}`;

            // Create button element directly for better performance
            const button = $('<button>', {
                type: 'button',
                id: buttonId,
                class: `shipping-btn${isSelected ? ' selected' : ''}`,
                text: method.label,
                'data-shipping-id': method.id,
                'aria-pressed': isSelected,
                tabindex: isSelected ? 0 : -1,
                role: 'radio',
                'aria-checked': isSelected
            });

            // Optimized click handler using event delegation
            button.data('methodId', method.id);

            return button;
        }

        /**
         * Select a shipping method with optimization
         * @param {string} methodId - Shipping method ID to select
         */
        selectShippingMethod(methodId) {
            if (this.selectedMethod === methodId || this.isDestroyed) return;

            this.selectedMethod = methodId;

            // Cache the radio button selector for better performance
            const radioButton = $(`${this.shippingInputSelector}[value="${methodId}"]`);
            if (radioButton.length) {
                radioButton.prop('checked', true).trigger('change');
            }

            // Update button states efficiently
            this.updateButtonStates(methodId);

            // Trigger custom event
            this.body.trigger('shipping_method_selected', [methodId]);
        }

        /**
         * Update button visual states with optimization
         * @param {string} selectedId - Selected method ID
         */
        updateButtonStates(selectedId) {
            if (this.isDestroyed) return;

            // Use direct DOM manipulation for better performance
            const buttons = this.container[0].querySelectorAll(this.shippingBtnSelector);

            buttons.forEach(button => {
                const $btn = $(button);
                const isSelected = $btn.data('shipping-id') === selectedId;
                const methodId = $btn.data('methodId');

                // Batch attribute updates
                const attrs = {
                    'aria-pressed': isSelected,
                    'aria-checked': isSelected,
                    tabindex: isSelected ? 0 : -1
                };

                $btn.toggleClass('selected', isSelected);

                // Update attributes efficiently
                Object.keys(attrs).forEach(attr => {
                    $btn.attr(attr, attrs[attr]);
                });
            });
        }

        /**
         * Handle keyboard navigation with optimization
         * @param {Event} e - Keydown event
         */
        handleKeydown(e) {
            if (this.isDestroyed) return;

            const $currentBtn = $(e.target);
            const $buttons = this.container.find(this.shippingBtnSelector);
            const currentIndex = $buttons.index($currentBtn);

            let newIndex;

            switch (e.keyCode) {
                case 37: // Left arrow
                case 38: // Up arrow
                    e.preventDefault();
                    newIndex = currentIndex - 1;
                    break;
                case 39: // Right arrow
                case 40: // Down arrow
                    e.preventDefault();
                    newIndex = currentIndex + 1;
                    break;
                case 32: // Space
                case 13: // Enter
                    e.preventDefault();
                    this.selectShippingMethod($currentBtn.data('methodId'));
                    return;
                default:
                    return;
            }

            this.focusButton(newIndex, $buttons);
        }

        /**
         * Focus a button by index with optimization
         * @param {number} index - Button index
         * @param {jQuery} $buttons - Button collection
         */
        focusButton(index, $buttons) {
            const length = $buttons.length;
            if (length === 0) return;

            // Handle circular navigation
            if (index < 0) index = length - 1;
            if (index >= length) index = 0;

            $buttons.eq(index).focus();
        }

        /**
         * Get shipping methods from the DOM with optimization
         * @returns {Array} Array of shipping method objects
         */
        getShippingMethods() {
            if (this.isDestroyed) return [];

            const methods = [];
            const inputs = document.querySelectorAll(this.shippingInputSelector);

            // Use native DOM methods for better performance
            inputs.forEach(input => {
                const id = input.value;
                if (!id) return;

                const li = input.closest('li');
                if (!li) return;

                const label = li.querySelector('label');
                if (!label) return;

                let labelText = label.textContent.trim();
                // Clean up the label (remove extra whitespace)
                labelText = labelText.replace(/\s+/g, ' ');

                methods.push({
                    id: id,
                    label: labelText,
                    element: $(input)
                });
            });

            return methods;
        }

        /**
         * Refresh shipping buttons with error handling
         */
        refreshShippingButtons() {
            if (this.isDestroyed) return;

            try {
                const methods = this.getShippingMethods();
                this.methods = methods;
                this.renderShippingButtons(methods);
            } catch (error) {
                console.error('Custom Shipping Buttons: Error refreshing buttons', error);
                if (!this.isDestroyed) {
                    this.container.html('<p class="error">' + (window.shippingButtonsL10n?.error || 'Error loading shipping options') + '</p>');
                }
            }
        }

        /**
         * Get currently selected shipping method with optimization
         * @returns {string|null} Selected method ID
         */
        getCurrentSelectedMethod() {
            if (this.selectedMethod) {
                return this.selectedMethod;
            }

            // Use native DOM for better performance
            const checkedRadio = document.querySelector(`${this.shippingInputSelector}:checked`);
            return checkedRadio ? checkedRadio.value : null;
        }

        /**
         * Update ARIA attributes for accessibility
         */
        updateAriaAttributes() {
            if (this.isDestroyed) return;

            const selectedButton = this.container.find(`${this.shippingBtnSelector}.selected`)[0];
            const activeDescendant = selectedButton ? selectedButton.id : '';
            this.wrapper.attr('aria-activedescendant', activeDescendant);
        }

        /**
         * Initial render
         */
        initialRender() {
            this.refreshShippingButtons();

            // Set up click event delegation for better performance
            this.container.on('click', this.shippingBtnSelector, (e) => {
                e.preventDefault();
                const methodId = $(e.currentTarget).data('methodId');
                this.selectShippingMethod(methodId);
            });
        }

        /**
         * Destroy the instance with proper cleanup
         */
        destroy() {
            this.isDestroyed = true;

            // Clear timers
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = null;
            }

            // Remove event listeners
            this.container.off();
            this.wrapper.off();
            this.body.off('.shippingButtons');

            // Clear references
            this.container = null;
            this.wrapper = null;
            this.body = null;
            this.methods = [];
        }
    }

    // Initialize when document is ready with error handling
    $(document).ready(() => {
        try {
            if (typeof window.shippingButtonsInstance === 'undefined') {
                window.shippingButtonsInstance = new CustomShippingButtons();
            }
        } catch (error) {
            console.error('Custom Shipping Buttons: Initialization failed', error);
        }
    });

})(jQuery);
