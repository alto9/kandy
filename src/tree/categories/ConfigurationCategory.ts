import * as vscode from 'vscode';
import { ClusterTreeItem } from '../ClusterTreeItem';
import { TreeItemData } from '../TreeItemTypes';

/**
 * Configuration category handler.
 * Provides the structure for configuration subcategories (ConfigMaps, Secrets).
 * This category doesn't fetch data itself but returns subcategory tree items.
 */
export class ConfigurationCategory {
    /**
     * Retrieves the 2 configuration subcategories for the Configuration category.
     * Returns subcategory tree items in the correct order.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Array of 2 configuration subcategory tree items
     */
    public static getConfigurationSubcategories(resourceData: TreeItemData): ClusterTreeItem[] {
        return [
            this.createConfigMapsSubcategory(resourceData),
            this.createSecretsSubcategory(resourceData)
        ];
    }

    /**
     * Creates the ConfigMaps subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured ConfigMaps subcategory tree item
     */
    private static createConfigMapsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'ConfigMaps',
            'configmaps',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('symbol-property');
        item.tooltip = 'View all configmaps across all namespaces';
        return item;
    }

    /**
     * Creates the Secrets subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Secrets subcategory tree item
     */
    private static createSecretsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Secrets',
            'secrets',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('key');
        item.tooltip = 'View all secrets across all namespaces';
        return item;
    }
}

