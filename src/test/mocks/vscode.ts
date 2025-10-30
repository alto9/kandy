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

export enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
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

/**
 * Mock ThemeColor class for colored icons
 */
export class ThemeColor {
    constructor(public readonly id: string) {}
}

/**
 * Mock ThemeIcon class for tree item icons
 */
export class ThemeIcon {
    constructor(
        public readonly id: string,
        public readonly color?: ThemeColor
    ) {}
}

/**
 * Mock Command interface for tree item actions
 */
export interface Command {
    title: string;
    command: string;
    tooltip?: string;
    arguments?: unknown[];
}

/**
 * Mock TreeItem class for tree view items
 */
export class TreeItem {
    label?: string;
    id?: string;
    iconPath?: ThemeIcon | Uri | { light: Uri; dark: Uri };
    description?: string;
    tooltip?: string;
    command?: Command;
    contextValue?: string;
    collapsibleState?: TreeItemCollapsibleState;

    constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
        this.label = label;
        this.collapsibleState = collapsibleState;
    }
}

/**
 * Event type
 */
export type Event<T> = (listener: (e: T) => unknown, thisArgs?: unknown, disposables?: { dispose(): unknown }[]) => { dispose(): unknown };

/**
 * Mock EventEmitter class for tree data changes
 */
export class EventEmitter<T> {
    private listeners: Array<(e: T) => void> = [];

    get event(): Event<T> {
        return (listener: (e: T) => void) => {
            this.listeners.push(listener);
            return {
                dispose: () => {
                    const index = this.listeners.indexOf(listener);
                    if (index > -1) {
                        this.listeners.splice(index, 1);
                    }
                }
            };
        };
    }

    fire(data: T): void {
        this.listeners.forEach(listener => listener(data));
    }

    dispose(): void {
        this.listeners = [];
    }
}

/**
 * Mock TreeDataProvider interface
 */
export interface TreeDataProvider<T> {
    onDidChangeTreeData?: Event<T | undefined | null | void>;
    getTreeItem(element: T): TreeItem | Thenable<TreeItem>;
    getChildren(element?: T): T[] | Thenable<T[]>;
    getParent?(element: T): T | undefined | Thenable<T | undefined>;
}

/**
 * Mock window API
 */
const errorMessages: string[] = [];
const warningMessages: string[] = [];
const infoMessages: string[] = [];

export const window = {
    showErrorMessage: (message: string, ...items: string[]) => {
        errorMessages.push(message);
        return Promise.resolve(items[0]);
    },
    showWarningMessage: (message: string, ...items: string[]) => {
        warningMessages.push(message);
        return Promise.resolve(items[0]);
    },
    showInformationMessage: (message: string, ...items: string[]) => {
        infoMessages.push(message);
        return Promise.resolve(items[0]);
    },
    _getErrorMessages: () => [...errorMessages],
    _getWarningMessages: () => [...warningMessages],
    _getInfoMessages: () => [...infoMessages],
    _clearMessages: () => {
        errorMessages.length = 0;
        warningMessages.length = 0;
        infoMessages.length = 0;
    }
};

/**
 * Mock WorkspaceConfiguration
 */
class WorkspaceConfiguration {
    private config: { [key: string]: unknown } = {};

    get<T>(section: string): T | undefined;
    get<T>(section: string, defaultValue: T): T;
    get<T>(section: string, defaultValue?: T): T | undefined {
        const value = this.config[section];
        return value !== undefined ? (value as T) : defaultValue;
    }

    has(section: string): boolean {
        return this.config[section] !== undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inspect<T>(_section: string): { key: string; defaultValue?: T; globalValue?: T; workspaceValue?: T; workspaceFolderValue?: T } | undefined {
        return undefined;
    }

    update(section: string, value: unknown): Thenable<void> {
        this.config[section] = value;
        return Promise.resolve();
    }

    _setConfig(section: string, value: unknown): void {
        this.config[section] = value;
    }

    _clearConfig(): void {
        this.config = {};
    }
}

const mockConfiguration = new WorkspaceConfiguration();

/**
 * Mock workspace API
 */
export const workspace = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getConfiguration: (_section?: string) => {
        return mockConfiguration;
    },
    _getConfiguration: () => mockConfiguration
};

