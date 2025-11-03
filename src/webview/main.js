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

    // Get namespace selector elements
    const namespaceSelect = document.getElementById('namespace-select');
    const clearButton = document.getElementById('clear-namespace');

    /**
     * Update the clear button state based on current selection.
     * Button is disabled when no namespace is selected (All Namespaces).
     */
    function updateClearButtonState() {
        const currentValue = namespaceSelect.value;
        clearButton.disabled = !currentValue || currentValue === '';
    }

    /**
     * Populate the namespace dropdown with available namespaces.
     * 
     * @param {Array<{name: string}>} namespaces - Array of namespace objects
     * @param {string|null} currentNamespace - The currently active namespace
     */
    function populateNamespaces(namespaces, currentNamespace) {
        // Clear existing options except "All Namespaces"
        namespaceSelect.innerHTML = '<option value="">All Namespaces</option>';
        
        // Add namespace options
        if (namespaces && Array.isArray(namespaces)) {
            namespaces.forEach(ns => {
                const option = document.createElement('option');
                option.value = ns.name;
                option.textContent = ns.name;
                namespaceSelect.appendChild(option);
            });
        }

        // Set current selection
        if (currentNamespace) {
            namespaceSelect.value = currentNamespace;
        } else {
            namespaceSelect.value = '';
        }

        // Update clear button state
        updateClearButtonState();
    }

    /**
     * Set the current namespace selection in the dropdown.
     * 
     * @param {string|null} namespace - The namespace to select, or null for "All Namespaces"
     */
    function setCurrentNamespace(namespace) {
        if (namespace) {
            namespaceSelect.value = namespace;
        } else {
            namespaceSelect.value = '';
        }
        updateClearButtonState();
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

    // Handle namespace selection change
    namespaceSelect.addEventListener('change', () => {
        const selectedNamespace = namespaceSelect.value;
        
        if (selectedNamespace) {
            // Send setActiveNamespace message to extension
            vscode.postMessage({
                command: 'setActiveNamespace',
                data: {
                    namespace: selectedNamespace
                }
            });
        } else {
            // Selected "All Namespaces" - clear the namespace
            vscode.postMessage({
                command: 'clearActiveNamespace'
            });
        }
        
        updateClearButtonState();
    });

    // Handle clear button click
    clearButton.addEventListener('click', () => {
        if (!clearButton.disabled) {
            namespaceSelect.value = '';
            vscode.postMessage({
                command: 'clearActiveNamespace'
            });
            updateClearButtonState();
        }
    });

    // Handle incoming messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'namespaceData':
                // Populate dropdown with namespace list
                populateNamespaces(message.data.namespaces, message.data.currentNamespace);
                break;
            
            case 'namespaceContextChanged':
                // Update selection when context changes
                setCurrentNamespace(message.data.namespace);
                
                // Show notification if the change was external
                if (message.data.source === 'external') {
                    const namespaceName = message.data.namespace || 'All Namespaces';
                    console.log(`Namespace context changed externally to: ${namespaceName}`);
                }
                break;
        }
    });

    // Store functions in global scope for future use
    window.kandyNamespace = {
        refresh,
        openResource,
        populateNamespaces,
        setCurrentNamespace
    };

    // Initialize clear button state
    updateClearButtonState();
})();

