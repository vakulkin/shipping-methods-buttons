<?php

/**
 * Plugin Name: Custom Shipping Buttons
 * Description: Replaces WooCommerce shipping radio buttons with custom buttons below billing fields.
 * Version: 1.0.0
 * License: GPL2
 * Text Domain: shipping-methods-buttons
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Main plugin class for Custom Shipping Buttons
 *
 * @since 1.0.0
 */
class CustomShippingButtons {

    /**
     * Plugin version
     *
     * @var string
     */
    const VERSION = '1.0.0';

    /**
     * Plugin text domain
     *
     * @var string
     */
    const TEXT_DOMAIN = 'shipping-methods-buttons';

    /**
     * Constructor - Initialize the plugin
     *
     * @since 1.0.0
     */
    public function __construct() {
        add_action('plugins_loaded', [$this, 'load_textdomain']);
        $this->init_hooks();
    }

    /**
     * Load plugin textdomain for internationalization
     *
     * @since 1.0.0
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            self::TEXT_DOMAIN,
            false,
            dirname(plugin_basename(__FILE__)) . '/languages/'
        );
    }

    /**
     * Initialize WordPress hooks
     *
     * @since 1.0.0
     */
    private function init_hooks() {
        add_action('woocommerce_after_checkout_billing_form', [$this, 'add_shipping_buttons_container'], 5);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    /**
     * Add container for shipping buttons after billing fields
     *
     * @since 1.0.0
     */
    public function add_shipping_buttons_container() {
        if (!$this->is_woocommerce_active()) {
            return;
        }

        echo '<div id="custom-shipping-buttons-wrapper" class="custom-shipping-buttons-wrapper" role="radiogroup" aria-label="' . esc_attr__('Select Shipping Method', self::TEXT_DOMAIN) . '">
                <h3 class="custom-shipping-buttons-title">' . esc_html__('Метод доставки', self::TEXT_DOMAIN) . '</h3>
                <div class="custom-shipping-buttons" aria-live="polite"></div>
              </div>';
    }

    /**
     * Enqueue plugin assets (CSS and JS)
     *
     * @since 1.0.0
     */
    public function enqueue_assets() {
        if (!$this->is_checkout_page()) {
            return;
        }

        // Enqueue JavaScript
        wp_enqueue_script(
            'shipping-methods-buttons',
            plugin_dir_url(__FILE__) . 'shipping-methods-buttons.js',
            ['jquery'],
            self::VERSION,
            true
        );

        // Enqueue CSS
        wp_enqueue_style(
            'shipping-methods-buttons',
            plugin_dir_url(__FILE__) . 'shipping-methods-buttons.css',
            [],
            self::VERSION
        );

        // Localize script for translations
        wp_localize_script('shipping-methods-buttons', 'shippingButtonsL10n', [
            'selectShipping' => __('Select Shipping Method', self::TEXT_DOMAIN),
            'loading' => __('Loading shipping options...', self::TEXT_DOMAIN),
            'error' => __('Error loading shipping options', self::TEXT_DOMAIN),
        ]);
    }

    /**
     * Check if WooCommerce is active
     *
     * @since 1.0.0
     * @return bool True if WooCommerce is active
     */
    private function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }

    /**
     * Check if current page is checkout
     *
     * @since 1.0.0
     * @return bool True if on checkout page
     */
    private function is_checkout_page() {
        return function_exists('is_checkout') && is_checkout();
    }
}

// Initialize the plugin
new CustomShippingButtons();
