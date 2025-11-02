import * as vscode from 'vscode';
import { ClusterTreeItem } from '../ClusterTreeItem';
import { TreeItemData } from '../TreeItemTypes';

/**
 * Storage category handler.
 * Provides the structure for storage subcategories (Persistent Volumes, Persistent Volume Claims, Storage Classes).
 * This category doesn't fetch data itself but returns subcategory tree items.
 */
export class StorageCategory {
    /**
     * Retrieves the 3 storage subcategories for the Storage category.
     * Returns subcategory tree items in the correct order.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Array of 3 storage subcategory tree items
     */
    public static getStorageSubcategories(resourceData: TreeItemData): ClusterTreeItem[] {
        return [
            this.createPersistentVolumesSubcategory(resourceData),
            this.createPersistentVolumeClaimsSubcategory(resourceData),
            this.createStorageClassesSubcategory(resourceData)
        ];
    }

    /**
     * Creates the Persistent Volumes subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Persistent Volumes subcategory tree item
     */
    private static createPersistentVolumesSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Persistent Volumes',
            'persistentVolumes',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('server-environment');
        item.tooltip = 'View all persistent volumes in the cluster';
        return item;
    }

    /**
     * Creates the Persistent Volume Claims subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Persistent Volume Claims subcategory tree item
     */
    private static createPersistentVolumeClaimsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Persistent Volume Claims',
            'persistentVolumeClaims',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('archive');
        item.tooltip = 'View all persistent volume claims across all namespaces';
        return item;
    }

    /**
     * Creates the Storage Classes subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Storage Classes subcategory tree item
     */
    private static createStorageClassesSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Storage Classes',
            'storageClasses',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('symbol-class');
        item.tooltip = 'View all storage classes in the cluster';
        return item;
    }
}

