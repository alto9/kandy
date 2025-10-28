import * as vscode from 'vscode';
import { ClusterTreeItem } from './ClusterTreeItem';

/**
 * Tree data provider for displaying Kubernetes clusters in the VS Code sidebar.
 * Implements the TreeDataProvider interface to supply data to the tree view.
 * 
 * This provider manages the hierarchical display of:
 * - Clusters (top-level)
 * - Namespaces (under clusters)
 * - Resource types (under namespaces)
 * - Individual resources (under resource types)
 */
export class ClusterTreeProvider implements vscode.TreeDataProvider<ClusterTreeItem> {
    /**
     * Event emitter for tree data changes.
     * Fire this event to trigger a refresh of the tree view.
     */
    private _onDidChangeTreeData: vscode.EventEmitter<ClusterTreeItem | undefined | null | void> = 
        new vscode.EventEmitter<ClusterTreeItem | undefined | null | void>();

    /**
     * Event that VS Code listens to for tree data changes.
     * When this event fires, VS Code will call getChildren() to refresh the tree.
     */
    readonly onDidChangeTreeData: vscode.Event<ClusterTreeItem | undefined | null | void> = 
        this._onDidChangeTreeData.event;

    /**
     * Get the UI representation of a tree element.
     * This method is called by VS Code to render each tree item.
     * 
     * @param element The tree item to get the UI representation for
     * @returns The tree item (already a TreeItem, so we return as-is)
     */
    getTreeItem(element: ClusterTreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Get the children of a tree element.
     * This method is called by VS Code to populate the tree view.
     * 
     * @param element The parent element to get children for. If undefined, get root elements.
     * @returns A promise resolving to an array of child tree items
     */
    getChildren(element?: ClusterTreeItem): Thenable<ClusterTreeItem[]> {
        // If no element is provided, we're getting the root level items (clusters)
        if (!element) {
            // Return empty array for now - will be populated in story 12
            // This is where we'll eventually load and display clusters from kubeconfig
            return Promise.resolve([]);
        }

        // If element has children, return them
        if (element.children) {
            return Promise.resolve(element.children);
        }

        // No children for this element
        return Promise.resolve([]);
    }

    /**
     * Refresh the tree view.
     * Call this method to trigger a complete refresh of the tree view.
     * VS Code will call getChildren() again to rebuild the tree.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Refresh a specific tree item.
     * Call this method to refresh only a specific node and its children.
     * 
     * @param element The tree item to refresh, or undefined to refresh the entire tree
     */
    refreshItem(element?: ClusterTreeItem): void {
        this._onDidChangeTreeData.fire(element);
    }
}

