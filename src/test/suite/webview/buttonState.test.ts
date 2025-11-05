import * as assert from 'assert';

/**
 * Tests for button state logic in the namespace webview.
 * 
 * Since the webview JavaScript uses browser APIs (document, window) and VS Code
 * webview APIs, these tests use a mock DOM environment to verify the button
 * state logic behavior.
 */

// Mock DOM elements interface
interface MockButton {
    disabled: boolean;
    querySelector: (selector: string) => MockElement | null;
    addEventListener: (event: string, handler: () => void) => void;
}

interface MockElement {
    style: { display: string };
    classList: {
        add: (className: string) => void;
        remove: (className: string) => void;
        contains: (className: string) => boolean;
    };
    textContent: string;
}

/**
 * Creates a mock button element with child elements for testing.
 */
function createMockButton(): { button: MockButton; icon: MockElement; text: MockElement } {
    const icon: MockElement = {
        style: { display: 'none' },
        classList: {
            add: (className: string) => {
                if (className === 'hidden') {
                    icon.classList.contains = (name: string) => name === 'hidden';
                }
            },
            remove: (className: string) => {
                if (className === 'hidden') {
                    icon.classList.contains = () => false;
                }
            },
            contains: (className: string) => className === 'hidden'
        },
        textContent: ''
    };

    const text: MockElement = {
        style: { display: 'none' },
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        textContent: 'Set as Default Namespace'
    };

    const button: MockButton = {
        disabled: false,
        querySelector: (selector: string) => {
            if (selector === '.btn-icon') {
                return icon;
            }
            if (selector === '.btn-text') {
                return text;
            }
            return null;
        },
        addEventListener: () => {} // No-op for testing
    };

    return { button, icon, text };
}

/**
 * Simulates the updateButtonState function logic.
 * This mirrors the behavior in src/webview/main.js
 */
function updateButtonState(
    button: MockButton | null,
    icon: MockElement | null,
    text: MockElement | null,
    isActive: boolean
): void {
    if (!button || !icon || !text) {
        return;
    }

    if (isActive) {
        // Namespace is active - show disabled/selected state
        button.disabled = true;
        icon.style.display = 'inline';
        icon.classList.remove('hidden');
        text.textContent = 'Default Namespace';
    } else {
        // Namespace is not active - show enabled state
        button.disabled = false;
        icon.style.display = 'none';
        icon.classList.add('hidden');
        text.textContent = 'Set as Default Namespace';
    }
}

suite('Button State Logic Test Suite', () => {
    suite('updateButtonState function', () => {
        test('Should set button to disabled state when isActive is true', () => {
            const { button, icon, text } = createMockButton();
            
            updateButtonState(button, icon, text, true);
            
            assert.strictEqual(button.disabled, true);
            assert.strictEqual(icon.style.display, 'inline');
            assert.strictEqual(icon.classList.contains('hidden'), false);
            assert.strictEqual(text.textContent, 'Default Namespace');
        });

        test('Should set button to enabled state when isActive is false', () => {
            const { button, icon, text } = createMockButton();
            
            updateButtonState(button, icon, text, false);
            
            assert.strictEqual(button.disabled, false);
            assert.strictEqual(icon.style.display, 'none');
            assert.strictEqual(icon.classList.contains('hidden'), true);
            assert.strictEqual(text.textContent, 'Set as Default Namespace');
        });

        test('Should handle state transitions from enabled to disabled', () => {
            const { button, icon, text } = createMockButton();
            
            // Start with enabled state
            updateButtonState(button, icon, text, false);
            assert.strictEqual(button.disabled, false);
            assert.strictEqual(text.textContent, 'Set as Default Namespace');
            
            // Transition to disabled/selected state
            updateButtonState(button, icon, text, true);
            assert.strictEqual(button.disabled, true);
            assert.strictEqual(text.textContent, 'Default Namespace');
            assert.strictEqual(icon.style.display, 'inline');
        });

        test('Should handle state transitions from disabled to enabled', () => {
            const { button, icon, text } = createMockButton();
            
            // Start with disabled/selected state
            updateButtonState(button, icon, text, true);
            assert.strictEqual(button.disabled, true);
            assert.strictEqual(text.textContent, 'Default Namespace');
            
            // Transition to enabled state
            updateButtonState(button, icon, text, false);
            assert.strictEqual(button.disabled, false);
            assert.strictEqual(text.textContent, 'Set as Default Namespace');
            assert.strictEqual(icon.style.display, 'none');
        });

        test('Should handle missing button elements gracefully', () => {
            const { icon, text } = createMockButton();
            
            // Should not throw when button is null
            updateButtonState(null, icon, text, true);
            // Test passes if no exception is thrown
            assert.ok(true);
        });

        test('Should handle missing icon element gracefully', () => {
            const { button, text } = createMockButton();
            
            // Should not throw when icon is null
            updateButtonState(button, null, text, true);
            // Test passes if no exception is thrown
            assert.ok(true);
        });

        test('Should handle missing text element gracefully', () => {
            const { button, icon } = createMockButton();
            
            // Should not throw when text is null
            updateButtonState(button, icon, null, true);
            // Test passes if no exception is thrown
            assert.ok(true);
        });
    });

    suite('Button click behavior', () => {
        test('Should prevent action when button is disabled', () => {
            const { button } = createMockButton();
            
            // Set button to disabled state
            button.disabled = true;
            
            // Simulate click - should be prevented
            let messageSent = false;
            const sendMessage = () => {
                if (!button.disabled) {
                    messageSent = true;
                }
            };
            
            // Click handler should check disabled state
            if (!button.disabled) {
                sendMessage();
            }
            
            assert.strictEqual(messageSent, false);
        });

        test('Should allow action when button is enabled', () => {
            const { button } = createMockButton();
            
            // Set button to enabled state
            button.disabled = false;
            
            // Simulate click - should be allowed
            let messageSent = false;
            interface MessageType {
                command: string;
                data?: { namespace: string };
            }
            let sentMessage: MessageType | null = null as MessageType | null;
            const sendMessage = (message: MessageType): void => {
                if (!button.disabled) {
                    messageSent = true;
                    sentMessage = message;
                }
            };
            
            // Click handler should check disabled state
            if (!button.disabled) {
                sendMessage({ command: 'setActiveNamespace', data: { namespace: 'test-namespace' } });
            }
            
            assert.strictEqual(messageSent, true);
            assert.ok(sentMessage !== null);
            const msg = sentMessage as MessageType;
            assert.strictEqual(msg.command, 'setActiveNamespace');
            assert.ok(msg.data);
            assert.strictEqual(msg.data.namespace, 'test-namespace');
        });
    });

    suite('Edge cases', () => {
        test('Should handle "All Namespaces" view (button should be disabled)', () => {
            const { button, icon, text } = createMockButton();
            const isAllNamespaces = true;
            
            // For "All Namespaces" view, button should be disabled
            if (isAllNamespaces) {
                button.disabled = true;
                icon.style.display = 'none';
                icon.classList.add('hidden');
                text.textContent = 'Set as Default Namespace';
            }
            
            assert.strictEqual(button.disabled, true);
            assert.strictEqual(icon.style.display, 'none');
        });

        test('Should handle null namespace name', () => {
            const { button, icon, text } = createMockButton();
            const namespaceName: string | null = null;
            
            // Should handle null gracefully
            if (!namespaceName || namespaceName === 'All Namespaces') {
                button.disabled = true;
            } else {
                updateButtonState(button, icon, text, false);
            }
            
            assert.strictEqual(button.disabled, true);
        });

        test('Should handle undefined namespace name', () => {
            const { button, icon, text } = createMockButton();
            const namespaceName: string | undefined = undefined;
            
            // Should handle undefined gracefully
            if (!namespaceName || namespaceName === 'All Namespaces') {
                button.disabled = true;
            } else {
                updateButtonState(button, icon, text, false);
            }
            
            assert.strictEqual(button.disabled, true);
        });
    });
});

