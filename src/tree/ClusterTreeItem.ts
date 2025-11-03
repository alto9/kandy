import * as vscode from 'vscode';
import { TreeItemType, TreeItemData, ClusterStatus } from './TreeItemTypes';

/**
 * Re-export types for convenience.
 */
export { ClusterStatus, TreeItemType };

/**
 * Custom tree item class that extends VS Code's TreeItem with additional metadata.
 * This wrapper allows us to attach custom data to tree items for navigation and display.
 */
export class ClusterTreeItem extends vscode.TreeItem {
    /**
     * The type of tree item (cluster, namespace, allNamespaces, or info).
     */
    public readonly type: TreeItemType;

    /**
     * Optional metadata associated with this tree item.
     * Contains cluster context information (context and cluster data).
     */
    public readonly resourceData?: TreeItemData;

    /**
     * Optional array of child items.
     * Used for hierarchical navigation in the tree view.
     */
    public children?: ClusterTreeItem[];

    /**
     * Connection status of the cluster.
     * Only relevant for cluster-type tree items.
     */
    public status?: ClusterStatus;

    /**
     * Whether this namespace is the active namespace in kubectl context.
     * Only relevant for namespace-type tree items.
     */
    public isActiveNamespace?: boolean;

    /**
     * Creates a new ClusterTreeItem.
     * 
     * @param label The display label for the tree item
     * @param type The type of tree item
     * @param collapsibleState Whether the item is collapsible and its initial state
     * @param resourceData Optional metadata associated with this item
     */
    constructor(
        label: string,
        type: TreeItemType,
        collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
        resourceData?: TreeItemData
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.resourceData = resourceData;
        
        // Set context value for use in when clauses (e.g., for context menus)
        this.contextValue = type;
    }
}

