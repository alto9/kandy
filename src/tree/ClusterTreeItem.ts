import * as vscode from 'vscode';

/**
 * Types of tree items that can appear in the cluster tree view.
 */
export type TreeItemType = 'cluster' | 'namespace' | 'resourceType' | 'resource';

/**
 * Custom tree item class that extends VS Code's TreeItem with additional metadata.
 * This wrapper allows us to attach custom data to tree items for navigation and display.
 */
export class ClusterTreeItem extends vscode.TreeItem {
    /**
     * The type of tree item (cluster, namespace, resourceType, or resource).
     */
    public readonly type: TreeItemType;

    /**
     * Optional metadata associated with this tree item.
     * Can contain Kubernetes resource data, cluster information, etc.
     */
    public readonly resourceData?: any;

    /**
     * Optional array of child items.
     * Used for hierarchical navigation in the tree view.
     */
    public children?: ClusterTreeItem[];

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
        resourceData?: any
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.resourceData = resourceData;
        
        // Set context value for use in when clauses (e.g., for context menus)
        this.contextValue = type;
    }
}

