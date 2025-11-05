import * as assert from 'assert';
import { NamespaceContextChangedMessage } from '../../../types/webviewMessages';

/**
 * Tests for message handler logic in the namespace webview.
 * 
 * These tests verify that the namespaceContextChanged message handler
 * correctly processes the isActive flag and triggers appropriate UI updates.
 */


/**
 * Simulates the namespaceContextChanged message handler logic.
 * This mirrors the behavior in src/webview/main.js
 */
function handleNamespaceContextChanged(
    message: NamespaceContextChangedMessage,
    updateButtonStateFn: (isActive: boolean, namespaceName: string | null) => void,
    showNotificationFn: (message: string) => void
): void {
    // Validate message data exists
    if (!message.data) {
        console.warn('namespaceContextChanged message missing data property');
        return;
    }
    
    // Extract isActive flag - ensure it's a boolean
    // Default to false if missing, undefined, or not a boolean
    const isActive = typeof message.data.isActive === 'boolean' 
        ? message.data.isActive 
        : false;
    
    // Get namespace name (would be from title element in real code)
    const namespaceName = message.data.namespace || null;
    
    // Update button state based on isActive flag
    updateButtonStateFn(isActive, namespaceName);
    
    // Show notification if the change was external
    if (message.data.source === 'external') {
        let notificationMessage: string;
        if (message.data.namespace) {
            notificationMessage = `Namespace context changed externally to: ${message.data.namespace}`;
        } else {
            notificationMessage = 'Namespace context cleared externally';
        }
        showNotificationFn(notificationMessage);
    }
}

suite('Message Handlers Test Suite', () => {
    suite('namespaceContextChanged message handler', () => {
        test('Should extract isActive flag correctly when true', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: true
                }
            };
            
            let capturedIsActive: boolean | null = null;
            const updateButtonState = (isActive: boolean) => {
                capturedIsActive = isActive;
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.strictEqual(capturedIsActive, true);
        });

        test('Should extract isActive flag correctly when false', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: false
                }
            };
            
            let capturedIsActive: boolean | null = null;
            const updateButtonState = (isActive: boolean) => {
                capturedIsActive = isActive;
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.strictEqual(capturedIsActive, false);
        });

        test('Should call updateButtonState with correct isActive value', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: true
                }
            };
            
            interface CapturedParams {
                isActive: boolean;
                namespaceName: string | null;
            }
            let calledWith: CapturedParams | null = null as CapturedParams | null;
            const updateButtonState = (isActive: boolean, namespaceName: string | null): void => {
                calledWith = { isActive, namespaceName };
            };
            const showNotification = (): void => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.ok(calledWith !== null);
            const params = calledWith as CapturedParams;
            assert.strictEqual(params.isActive, true);
            assert.strictEqual(params.namespaceName, 'test-namespace');
        });

        test('Should show notification for external changes', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'external-namespace',
                    source: 'external',
                    isActive: true
                }
            };
            
            const updateButtonState = () => {};
            let notificationMessage: string | null = null;
            const showNotification = (msg: string) => {
                notificationMessage = msg;
            };
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.ok(notificationMessage !== null);
            assert.strictEqual(notificationMessage, 'Namespace context changed externally to: external-namespace');
        });

        test('Should show notification for external changes with null namespace', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: null,
                    source: 'external',
                    isActive: false
                }
            };
            
            const updateButtonState = () => {};
            let notificationMessage: string | null = null;
            const showNotification = (msg: string) => {
                notificationMessage = msg;
            };
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.ok(notificationMessage !== null);
            assert.strictEqual(notificationMessage, 'Namespace context cleared externally');
        });

        test('Should NOT show notification for extension-initiated changes', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: true
                }
            };
            
            const updateButtonState = () => {};
            let notificationShown = false;
            const showNotification = () => {
                notificationShown = true;
            };
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.strictEqual(notificationShown, false);
        });

        test('Should handle state transitions: enabled to disabled', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: true  // Transitioning to active/selected
                }
            };
            
            let buttonState: 'enabled' | 'disabled' | null = null;
            const updateButtonState = (isActive: boolean) => {
                buttonState = isActive ? 'disabled' : 'enabled';
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.strictEqual(buttonState, 'disabled');
        });

        test('Should handle state transitions: disabled to enabled', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: false  // Transitioning to inactive
                }
            };
            
            let buttonState: 'enabled' | 'disabled' | null = null;
            const updateButtonState = (isActive: boolean) => {
                buttonState = isActive ? 'disabled' : 'enabled';
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.strictEqual(buttonState, 'enabled');
        });

        test('Should handle missing message data gracefully', () => {
            // Test with invalid message structure (missing data)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message: any = {
                command: 'namespaceContextChanged',
                data: undefined
            };
            
            let updateButtonStateCalled = false;
            const updateButtonState = () => {
                updateButtonStateCalled = true;
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            // Should not call updateButtonState if data is missing
            assert.strictEqual(updateButtonStateCalled, false);
        });

        test('Should default isActive to false if not a boolean', () => {
            // Test with invalid isActive type (string instead of boolean)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message: any = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: 'test-namespace',
                    source: 'extension',
                    isActive: 'true'  // Not a boolean
                }
            };
            
            let capturedIsActive: boolean | null = null;
            const updateButtonState = (isActive: boolean) => {
                capturedIsActive = isActive;
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            // Should default to false when isActive is not a boolean
            assert.strictEqual(capturedIsActive, false);
        });

        test('Should handle null namespace correctly', () => {
            const message: NamespaceContextChangedMessage = {
                command: 'namespaceContextChanged',
                data: {
                    namespace: null,
                    source: 'extension',
                    isActive: false
                }
            };
            
            let capturedNamespace: string | null = null;
            const updateButtonState = (isActive: boolean, namespaceName: string | null) => {
                capturedNamespace = namespaceName;
            };
            const showNotification = () => {};
            
            handleNamespaceContextChanged(message, updateButtonState, showNotification);
            
            assert.strictEqual(capturedNamespace, null);
        });
    });
});

