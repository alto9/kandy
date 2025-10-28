/**
 * Mock implementation of VS Code API for unit testing
 * This allows tests to run without the VS Code extension host
 */

export class Uri {
    static file(path: string): Uri {
        return new Uri(path);
    }

    constructor(public readonly path: string) {}
}

/* eslint-disable @typescript-eslint/naming-convention */
export enum ExtensionMode {
    Production = 1,
    Development = 2,
    Test = 3
}
/* eslint-enable @typescript-eslint/naming-convention */

export interface Memento {
    keys(): readonly string[];
    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    update(key: string, value: unknown): Thenable<void>;
}

export interface SecretStorage {
    get(key: string): Thenable<string | undefined>;
    store(key: string, value: string): Thenable<void>;
    delete(key: string): Thenable<void>;
    keys(): Thenable<string[]>;
    onDidChange: unknown;
}

export interface ExtensionContext {
    subscriptions: { dispose(): unknown }[];
    workspaceState: Memento;
    globalState: Memento & { setKeysForSync(keys: readonly string[]): void };
    secrets: SecretStorage;
    extensionUri: Uri;
    extensionPath: string;
    environmentVariableCollection: unknown;
    asAbsolutePath(relativePath: string): string;
    storageUri: Uri | undefined;
    storagePath: string | undefined;
    globalStorageUri: Uri;
    globalStoragePath: string;
    logUri: Uri;
    logPath: string;
    extensionMode: ExtensionMode;
    extension: unknown;
    languageModelAccessInformation: unknown;
}

