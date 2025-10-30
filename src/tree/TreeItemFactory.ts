import * as vscode from 'vscode';
import { ClusterTreeItem } from './ClusterTreeItem';
import { TreeItemData } from './TreeItemTypes';

/**
 * Factory class for creating tree items with consistent configuration.
 * Provides methods to create category tree items with appropriate icons and settings.
 */
export class TreeItemFactory {
    /**
     * Creates the Nodes category tree item.
     * Displays all nodes in the cluster.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Nodes category tree item
     */
    static createNodesCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Nodes',
            'nodes',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('server');
        item.tooltip = 'View all nodes in the cluster';
        return item;
    }

    /**
     * Creates the Namespaces category tree item.
     * Displays all namespaces in the cluster.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Namespaces category tree item
     */
    static createNamespacesCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Namespaces',
            'namespaces',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('symbol-namespace');
        item.tooltip = 'View all namespaces in the cluster';
        return item;
    }

    /**
     * Creates the Workloads category tree item.
     * Displays workload subcategories (Deployments, StatefulSets, DaemonSets, CronJobs).
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Workloads category tree item
     */
    static createWorkloadsCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Workloads',
            'workloads',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('layers');
        item.tooltip = 'View workloads (Deployments, StatefulSets, DaemonSets, CronJobs)';
        return item;
    }

    /**
     * Creates the Storage category tree item.
     * Displays storage subcategories (Persistent Volumes, Persistent Volume Claims, Storage Classes).
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Storage category tree item
     */
    static createStorageCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Storage',
            'storage',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('database');
        item.tooltip = 'View storage resources (PVs, PVCs, Storage Classes)';
        return item;
    }

    /**
     * Creates the Helm category tree item.
     * Displays all Helm releases in the cluster.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Helm category tree item
     */
    static createHelmCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Helm',
            'helm',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('package');
        item.tooltip = 'View Helm releases';
        return item;
    }

    /**
     * Creates the Configuration category tree item.
     * Displays configuration subcategories (ConfigMaps, Secrets).
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Configuration category tree item
     */
    static createConfigurationCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Configuration',
            'configuration',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('settings-gear');
        item.tooltip = 'View configuration resources (ConfigMaps, Secrets)';
        return item;
    }

    /**
     * Creates the Custom Resources category tree item.
     * Displays all Custom Resource Definitions (CRDs) in the cluster.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Custom Resources category tree item
     */
    static createCustomResourcesCategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Custom Resources',
            'customResources',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('extensions');
        item.tooltip = 'View Custom Resource Definitions (CRDs)';
        return item;
    }
}

