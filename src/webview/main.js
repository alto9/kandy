/**
 * Main JavaScript for namespace webview panel.
 * Handles user interactions, message passing with extension, and UI state management.
 */

(function() {
    'use strict';

    // Update UI based on whether this is "All Namespaces" view
    const isAllNamespaces = window.initialIsAllNamespaces || false;
    
    if (isAllNamespaces) {
        const icon = document.getElementById('namespace-icon');
        const badge = document.getElementById('scope-badge');
        
        if (icon) {
            icon.classList.add('all-namespaces');
        }
        
        if (badge) {
            badge.textContent = 'CLUSTER-WIDE';
        }
    }

    // Set up message passing for communication with extension
    const vscode = acquireVsCodeApi();

    // Get button elements
    const setDefaultNamespaceButton = document.getElementById('set-default-namespace');
    const btnIcon = setDefaultNamespaceButton?.querySelector('.btn-icon');
    const btnText = setDefaultNamespaceButton?.querySelector('.btn-text');
    const namespaceTitle = document.querySelector('h1.namespace-title');

    /**
     * Update the button state based on whether the namespace is active.
     * 
     * @param {boolean} isActive - Whether this namespace is the active/default namespace
     * @param {string} namespaceName - The namespace name (for validation/logging)
     */
    function updateButtonState(isActive, namespaceName) {
        if (!setDefaultNamespaceButton || !btnIcon || !btnText) {
            console.warn('Button elements not found, cannot update state');
            return;
        }

        if (isActive) {
            // Namespace is active - show disabled/selected state
            setDefaultNamespaceButton.disabled = true;
            btnIcon.style.display = 'inline';
            btnIcon.classList.remove('hidden');
            btnText.textContent = 'Default Namespace';
        } else {
            // Namespace is not active - show enabled state
            setDefaultNamespaceButton.disabled = false;
            btnIcon.style.display = 'none';
            btnIcon.classList.add('hidden');
            btnText.textContent = 'Set as Default Namespace';
        }
    }

    /**
     * Send a refresh request to the extension.
     */
    function refresh() {
        vscode.postMessage({
            command: 'refresh'
        });
    }

    /**
     * Send a request to open a specific resource.
     * 
     * @param {string} resourceType - The type of resource (e.g., 'pod', 'deployment')
     * @param {string} resourceName - The name of the resource
     */
    function openResource(resourceType, resourceName) {
        vscode.postMessage({
            command: 'openResource',
            data: {
                type: resourceType,
                name: resourceName
            }
        });
    }

    // Notification management
    let notificationTimeout = null;
    const notificationElement = document.getElementById('context-notification');
    const notificationMessageElement = document.getElementById('notification-message');
    const notificationCloseButton = document.getElementById('notification-close');

    /**
     * Show a notification banner with a message.
     * The notification will auto-dismiss after 5 seconds.
     * 
     * @param {string} message - The message to display in the notification
     */
    function showNotification(message) {
        // Clear any existing timeout to prevent premature dismissal
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }

        // Set the message text
        notificationMessageElement.textContent = message;

        // Remove hide class if present and add show class
        notificationElement.classList.remove('hide');
        notificationElement.classList.add('show');

        // Set timeout to auto-dismiss after 5 seconds
        notificationTimeout = setTimeout(() => {
            hideNotification();
        }, 5000);
    }

    /**
     * Hide the notification banner.
     * Adds fade-out animation before fully hiding.
     */
    function hideNotification() {
        // Clear any pending timeout
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }

        // Add hide class to trigger fade-out
        notificationElement.classList.add('hide');

        // After transition completes, remove show class
        setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.classList.remove('hide');
        }, 300); // Match the CSS transition duration
    }

    // Handle notification close button click
    notificationCloseButton.addEventListener('click', () => {
        hideNotification();
    });

    // Handle button click for setting default namespace
    if (setDefaultNamespaceButton) {
        setDefaultNamespaceButton.addEventListener('click', () => {
            // Prevent action if button is disabled
            if (setDefaultNamespaceButton.disabled) {
                return;
            }

            // Read namespace name from the title element
            const namespaceName = namespaceTitle?.textContent?.trim();
            
            // For "All Namespaces" view, don't allow setting as default
            if (isAllNamespaces || !namespaceName || namespaceName === 'All Namespaces') {
                return;
            }

            // Send setActiveNamespace message to extension
            vscode.postMessage({
                command: 'setActiveNamespace',
                data: {
                    namespace: namespaceName
                }
            });
        });
    }

    // Handle incoming messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'namespaceData':
                // Namespace data is no longer needed for dropdown, but we keep the handler
                // in case it's used for other purposes
                break;
            
            case 'namespaceContextChanged':
                // Validate message data exists
                if (!message.data) {
                    console.warn('namespaceContextChanged message missing data property');
                    break;
                }
                
                // Extract isActive flag - ensure it's a boolean
                // Default to false if missing, undefined, or not a boolean
                const isActive = typeof message.data.isActive === 'boolean' 
                    ? message.data.isActive 
                    : false;
                
                // Get namespace name from title element for validation/logging
                const namespaceName = namespaceTitle?.textContent?.trim();
                
                // Update button state based on isActive flag
                // This handles transitions: enabled ↔ disabled/selected
                updateButtonState(isActive, namespaceName);
                
                // Show notification if the change was external
                if (message.data.source === 'external') {
                    let notificationMessage;
                    if (message.data.namespace) {
                        // Format matches story requirement: "Namespace context changed externally to: <namespace>"
                        notificationMessage = `Namespace context changed externally to: ${message.data.namespace}`;
                    } else {
                        notificationMessage = 'Namespace context cleared externally';
                    }
                    showNotification(notificationMessage);
                }
                // Note: Handler intentionally does not trigger resource refreshes
                // to avoid unnecessary reloads when namespace context changes
                break;
        }
    });

    // Store functions in global scope for future use
    window.kandyNamespace = {
        refresh,
        openResource,
        updateButtonState
    };

    // Initialize button state on load
    // For "All Namespaces" view, disable the button
    // For regular namespace view, start with disabled state (will be updated when first message arrives)
    if (isAllNamespaces) {
        // Disable button for "All Namespaces" view
        if (setDefaultNamespaceButton) {
            setDefaultNamespaceButton.disabled = true;
            if (btnIcon) {
                btnIcon.style.display = 'none';
                btnIcon.classList.add('hidden');
            }
            if (btnText) {
                btnText.textContent = 'Set as Default Namespace';
            }
        }
    } else {
        // Initialize with inactive state (will be updated by first namespaceContextChanged message)
        const initialNamespaceName = namespaceTitle?.textContent?.trim();
        if (initialNamespaceName) {
            updateButtonState(false, initialNamespaceName);
        }
    }
})();
