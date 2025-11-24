/**
 * Ferremas Frontend - JavaScript Utilities
 * =================================================================
 * Common JavaScript functions and utilities for the frontend
 */

// Namespace for Ferremas utilities
const Ferremas = {
    // Configuration
    config: {
        baseUrl: window.location.origin,
        apiTimeout: 10000,
        csrf: document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
    },

    // Utility functions
    utils: {
        /**
         * Format currency amount
         */
        formatCurrency: function(amount, currency = 'CLP') {
            if (currency === 'CLP') {
                return `$${Number(amount).toLocaleString('es-CL')}`;
            }
            return `${currency} ${Number(amount).toFixed(2)}`;
        },

        /**
         * Format RUT with dots and hyphen
         */
        formatRut: function(rut) {
            if (!rut) return '';
            
            const cleanRut = rut.replace(/[^0-9Kk]/g, '').toUpperCase();
            if (cleanRut.length < 2) return rut;
            
            const body = cleanRut.slice(0, -1);
            const dv = cleanRut.slice(-1);
            
            const formattedBody = body.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            return `${formattedBody}-${dv}`;
        },

        /**
         * Validate RUT
         */
        validateRut: function(rut) {
            if (!rut) return false;
            
            const cleanRut = rut.replace(/[^0-9Kk]/g, '').toUpperCase();
            if (cleanRut.length < 2) return false;
            
            const body = cleanRut.slice(0, -1);
            const dv = cleanRut.slice(-1);
            
            let sum = 0;
            let multiplier = 2;
            
            for (let i = body.length - 1; i >= 0; i--) {
                sum += parseInt(body[i]) * multiplier;
                multiplier = multiplier === 7 ? 2 : multiplier + 1;
            }
            
            const remainder = sum % 11;
            const calculatedDv = remainder < 2 ? remainder.toString() : 
                               remainder === 2 ? '0' : 'K';
            
            return dv === calculatedDv;
        },

        /**
         * Debounce function
         */
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(this, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(this, args);
            };
        },

        /**
         * Throttle function
         */
        throttle: function(func, limit) {
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
        },

        /**
         * Get cookie value
         */
        getCookie: function(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        },

        /**
         * Show loading state
         */
        showLoading: function(element) {
            if (element) {
                element.classList.add('loading');
                element.disabled = true;
            }
        },

        /**
         * Hide loading state
         */
        hideLoading: function(element) {
            if (element) {
                element.classList.remove('loading');
                element.disabled = false;
            }
        },

        /**
         * Scroll to element
         */
        scrollTo: function(element, offset = 0) {
            if (element) {
                const elementPosition = element.offsetTop - offset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            }
        },

        /**
         * Copy text to clipboard
         */
        copyToClipboard: function(text) {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                return new Promise((resolve, reject) => {
                    document.execCommand('copy') ? resolve() : reject();
                    textArea.remove();
                });
            }
        }
    },

    // UI utilities
    ui: {
        /**
         * Show alert message
         */
        showAlert: function(message, type = 'info', duration = 5000) {
            const alertContainer = document.getElementById('alert-container') || 
                                 this.createAlertContainer();
            
            const alertElement = document.createElement('div');
            alertElement.className = `alert alert-${type} fade-in`;
            alertElement.innerHTML = `
                <span>${message}</span>
                <button type="button" class="btn-close" onclick="this.parentElement.remove()">
                    &times;
                </button>
            `;
            
            alertContainer.appendChild(alertElement);
            
            if (duration > 0) {
                setTimeout(() => {
                    alertElement.remove();
                }, duration);
            }
        },

        /**
         * Create alert container if it doesn't exist
         */
        createAlertContainer: function() {
            const container = document.createElement('div');
            container.id = 'alert-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1050;
                max-width: 400px;
            `;
            document.body.appendChild(container);
            return container;
        },

        /**
         * Show modal
         */
        showModal: function(title, content, actions = []) {
            const modal = document.getElementById('dynamic-modal') || this.createModal();
            const modalTitle = modal.querySelector('.modal-title');
            const modalBody = modal.querySelector('.modal-body');
            const modalFooter = modal.querySelector('.modal-footer');
            
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            
            modalFooter.innerHTML = '';
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `btn btn-${action.type || 'secondary'}`;
                button.textContent = action.text;
                button.onclick = action.handler;
                modalFooter.appendChild(button);
            });
            
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
        },

        /**
         * Hide modal
         */
        hideModal: function() {
            const modal = document.getElementById('dynamic-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        },

        /**
         * Create modal if it doesn't exist
         */
        createModal: function() {
            const modal = document.createElement('div');
            modal.id = 'dynamic-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" onclick="Ferremas.ui.hideModal()">
                                &times;
                            </button>
                        </div>
                        <div class="modal-body"></div>
                        <div class="modal-footer"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            return modal;
        },

        /**
         * Confirm dialog
         */
        confirm: function(message, onConfirm, onCancel) {
            this.showModal('Confirmación', message, [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    handler: () => {
                        this.hideModal();
                        if (onCancel) onCancel();
                    }
                },
                {
                    text: 'Confirmar',
                    type: 'primary',
                    handler: () => {
                        this.hideModal();
                        if (onConfirm) onConfirm();
                    }
                }
            ]);
        }
    },

    // Form utilities
    forms: {
        /**
         * Serialize form data
         */
        serialize: function(form) {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            return data;
        },

        /**
         * Validate form
         */
        validate: function(form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
                
                // Special validations
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        input.classList.add('is-invalid');
                        isValid = false;
                    }
                }
                
                if (input.dataset.rut && input.value) {
                    if (!Ferremas.utils.validateRut(input.value)) {
                        input.classList.add('is-invalid');
                        isValid = false;
                    }
                }
            });
            
            return isValid;
        },

        /**
         * Clear form validation
         */
        clearValidation: function(form) {
            const inputs = form.querySelectorAll('.is-invalid, .is-valid');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
        }
    },

    // API utilities
    api: {
        /**
         * Make API request
         */
        request: async function(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Ferremas.config.csrf,
                },
                timeout: Ferremas.config.apiTimeout
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            
            try {
                const response = await fetch(url, finalOptions);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
                
                return data;
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        },

        /**
         * GET request
         */
        get: function(url, params = {}) {
            const urlParams = new URLSearchParams(params);
            const fullUrl = `${url}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
            return this.request(fullUrl);
        },

        /**
         * POST request
         */
        post: function(url, data = {}) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        /**
         * PUT request
         */
        put: function(url, data = {}) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        /**
         * DELETE request
         */
        delete: function(url) {
            return this.request(url, {
                method: 'DELETE'
            });
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Auto-format RUT inputs
    const rutInputs = document.querySelectorAll('input[data-rut]');
    rutInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = Ferremas.utils.formatRut(this.value);
        });
    });
    
    // Auto-submit search forms with debounce
    const searchInputs = document.querySelectorAll('input[data-auto-search]');
    searchInputs.forEach(input => {
        const debouncedSubmit = Ferremas.utils.debounce(function() {
            input.form.submit();
        }, 500);
        
        input.addEventListener('input', debouncedSubmit);
    });
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                Ferremas.utils.scrollTo(target, 80);
            }
        });
    });
    
    // Auto-hide alerts
    const alerts = document.querySelectorAll('.alert:not([data-permanent])');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
    
    // Form validation on submit
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!Ferremas.forms.validate(this)) {
                e.preventDefault();
                Ferremas.ui.showAlert('Por favor, corrija los errores en el formulario.', 'danger');
            }
        });
    });
});

// Export for use in other scripts
window.Ferremas = Ferremas;