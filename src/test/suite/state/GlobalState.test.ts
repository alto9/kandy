import * as assert from 'assert';
import * as vscode from '../../mocks/vscode';
import { GlobalState } from '../../../state/GlobalState';

suite('GlobalState Test Suite', () => {
    let mockContext: vscode.ExtensionContext;
    let mockMemento: vscode.Memento;

    setup(() => {
        // Reset the singleton before each test
        GlobalState.reset();

        // Create a mock memento (globalState)
        const storage = new Map<string, unknown>();
        mockMemento = {
            keys: () => Array.from(storage.keys()),
            get: <T>(key: string, defaultValue?: T): T => {
                return storage.has(key) ? (storage.get(key) as T) : (defaultValue as T);
            },
            update: async (key: string, value: unknown): Promise<void> => {
                storage.set(key, value);
            }
        } as vscode.Memento;

        // Create a mock extension context with setKeysForSync
        const globalStateWithSync = Object.assign(mockMemento, {
            setKeysForSync: (): void => {
                // No-op for testing
            }
        });

        mockContext = {
            globalState: globalStateWithSync,
            subscriptions: [],
            extensionPath: '',
            extensionUri: vscode.Uri.file(''),
            environmentVariableCollection: {},
            storagePath: undefined,
            globalStoragePath: '',
            logPath: '',
            extensionMode: vscode.ExtensionMode.Test,
            storageUri: undefined,
            globalStorageUri: vscode.Uri.file(''),
            logUri: vscode.Uri.file(''),
            workspaceState: {} as vscode.Memento,
            secrets: {
                get: async () => undefined,
                store: async () => {},
                delete: async () => {},
                keys: async () => [],
                onDidChange: {}
            } as vscode.SecretStorage,
            extension: {},
            languageModelAccessInformation: {},
            asAbsolutePath: (relativePath: string) => relativePath
        };
    });

    teardown(() => {
        // Clean up after each test
        GlobalState.reset();
    });

    test('Should initialize successfully', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const instance = GlobalState.getInstance();
        assert.ok(instance);
    });

    test('Should throw error if initialized twice', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        assert.throws(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            () => GlobalState.initialize(mockContext as any),
            /already been initialized/
        );
    });

    test('Should throw error if getInstance called before initialize', () => {
        assert.throws(
            () => GlobalState.getInstance(),
            /has not been initialized/
        );
    });

    test('getWelcomeScreenDismissed should return false by default', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        const dismissed = state.getWelcomeScreenDismissed();
        assert.strictEqual(dismissed, false);
    });

    test('setWelcomeScreenDismissed should persist value', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        await state.setWelcomeScreenDismissed(true);
        const dismissed = state.getWelcomeScreenDismissed();
        
        assert.strictEqual(dismissed, true);
    });

    test('Should persist value across multiple get/set operations', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        // Initially false
        assert.strictEqual(state.getWelcomeScreenDismissed(), false);
        
        // Set to true
        await state.setWelcomeScreenDismissed(true);
        assert.strictEqual(state.getWelcomeScreenDismissed(), true);
        
        // Set back to false
        await state.setWelcomeScreenDismissed(false);
        assert.strictEqual(state.getWelcomeScreenDismissed(), false);
        
        // Set to true again
        await state.setWelcomeScreenDismissed(true);
        assert.strictEqual(state.getWelcomeScreenDismissed(), true);
    });

    test('Should use correct storage key', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        await state.setWelcomeScreenDismissed(true);
        
        // Verify the value is stored with the correct key
        const value = mockMemento.get<boolean>('kube9.welcomeScreen.dismissed');
        assert.strictEqual(value, true);
    });

    // Dismiss Logic Scenarios

    test('Dismiss with checkbox checked - should persist dismissal', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        // Simulate user dismissing with checkbox checked
        const doNotShowAgain = true;
        await state.setWelcomeScreenDismissed(doNotShowAgain);
        
        // Verify dismissal is persisted
        assert.strictEqual(
            state.getWelcomeScreenDismissed(),
            true,
            'Welcome screen should be permanently dismissed'
        );
        
        // Simulate extension restart - create new GlobalState instance
        GlobalState.reset();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const newState = GlobalState.getInstance();
        
        // Verify dismissal persists across restart
        assert.strictEqual(
            newState.getWelcomeScreenDismissed(),
            true,
            'Welcome screen dismissal should persist across restarts'
        );
    });

    test('Dismiss with checkbox unchecked - should not persist dismissal', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        // Simulate user dismissing WITHOUT checkbox checked
        const doNotShowAgain = false;
        await state.setWelcomeScreenDismissed(doNotShowAgain);
        
        // Verify dismissal is NOT persisted
        assert.strictEqual(
            state.getWelcomeScreenDismissed(),
            false,
            'Welcome screen should not be permanently dismissed'
        );
        
        // Simulate extension restart
        GlobalState.reset();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const newState = GlobalState.getInstance();
        
        // Verify welcome screen will show again
        assert.strictEqual(
            newState.getWelcomeScreenDismissed(),
            false,
            'Welcome screen should appear again on next activation'
        );
    });

    test('Welcome screen reappears after temporary dismissal', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        // Initial state - not dismissed
        assert.strictEqual(state.getWelcomeScreenDismissed(), false);
        
        // User closes without checking box (temporary dismiss)
        await state.setWelcomeScreenDismissed(false);
        
        // Verify still not dismissed
        assert.strictEqual(state.getWelcomeScreenDismissed(), false);
        
        // Simulate another activation - welcome should show again
        GlobalState.reset();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const newState = GlobalState.getInstance();
        
        assert.strictEqual(
            newState.getWelcomeScreenDismissed(),
            false,
            'Welcome screen should reappear after temporary dismissal'
        );
    });

    test('Permanent dismissal prevents welcome screen on future activations', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GlobalState.initialize(mockContext as any);
        const state = GlobalState.getInstance();
        
        // User permanently dismisses
        await state.setWelcomeScreenDismissed(true);
        
        // Simulate multiple restarts
        for (let i = 0; i < 3; i++) {
            GlobalState.reset();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            GlobalState.initialize(mockContext as any);
            const newState = GlobalState.getInstance();
            
            assert.strictEqual(
                newState.getWelcomeScreenDismissed(),
                true,
                `Welcome screen should remain dismissed after restart ${i + 1}`
            );
        }
    });
});

