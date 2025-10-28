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
        const value = mockMemento.get<boolean>('kandy.welcomeScreen.dismissed');
        assert.strictEqual(value, true);
    });
});

