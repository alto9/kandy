import * as vscode from 'vscode';
import { ClusterTreeItem } from '../ClusterTreeItem';
import { TreeItemData } from '../TreeItemTypes';

/**
 * Workloads category handler.
 * Provides the structure for workload subcategories (Deployments, StatefulSets, DaemonSets, CronJobs).
 * This category doesn't fetch data itself but returns subcategory tree items.
 */
export class WorkloadsCategory {
    /**
     * Retrieves the 4 workload subcategories for the Workloads category.
     * Returns subcategory tree items in the correct order.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Array of 4 workload subcategory tree items
     */
    public static getWorkloadSubcategories(resourceData: TreeItemData): ClusterTreeItem[] {
        return [
            this.createDeploymentsSubcategory(resourceData),
            this.createStatefulSetsSubcategory(resourceData),
            this.createDaemonSetsSubcategory(resourceData),
            this.createCronJobsSubcategory(resourceData)
        ];
    }

    /**
     * Creates the Deployments subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured Deployments subcategory tree item
     */
    private static createDeploymentsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'Deployments',
            'deployments',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('layers-active');
        item.tooltip = 'View all deployments across all namespaces';
        return item;
    }

    /**
     * Creates the StatefulSets subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured StatefulSets subcategory tree item
     */
    private static createStatefulSetsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'StatefulSets',
            'statefulsets',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('database');
        item.tooltip = 'View all statefulsets across all namespaces';
        return item;
    }

    /**
     * Creates the DaemonSets subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured DaemonSets subcategory tree item
     */
    private static createDaemonSetsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'DaemonSets',
            'daemonsets',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('sync');
        item.tooltip = 'View all daemonsets across all namespaces';
        return item;
    }

    /**
     * Creates the CronJobs subcategory tree item.
     * 
     * @param resourceData Cluster context and cluster information
     * @returns Configured CronJobs subcategory tree item
     */
    private static createCronJobsSubcategory(resourceData: TreeItemData): ClusterTreeItem {
        const item = new ClusterTreeItem(
            'CronJobs',
            'cronjobs',
            vscode.TreeItemCollapsibleState.Collapsed,
            resourceData
        );
        item.iconPath = new vscode.ThemeIcon('watch');
        item.tooltip = 'View all cronjobs across all namespaces';
        return item;
    }
}

