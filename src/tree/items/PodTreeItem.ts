import * as vscode from 'vscode';
import { ClusterTreeItem } from '../ClusterTreeItem';
import { TreeItemData } from '../TreeItemTypes';

/**
 * Pod status from Kubernetes API.
 */
export type PodStatus = 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown';

/**
 * Information about a Kubernetes pod.
 */
export interface PodInfo {
    /** Name of the pod */
    name: string;
    /** Namespace of the pod */
    namespace: string;
    /** Status of the pod */
    status: PodStatus;
    /** Optional parent resource name (deployment, statefulset, etc.) */
    parentResource?: string;
}

/**
 * Tree item class for Kubernetes pods.
 * Extends ClusterTreeItem with pod-specific functionality.
 */
export class PodTreeItem extends ClusterTreeItem {
    /** Pod information */
    public readonly podInfo: PodInfo;

    /**
     * Creates a new PodTreeItem.
     * 
     * @param podInfo Pod information
     * @param resourceData Cluster context and cluster information
     */
    constructor(podInfo: PodInfo, resourceData: TreeItemData) {
        // Pods are non-expandable items
        super(
            podInfo.name,
            'pod',
            vscode.TreeItemCollapsibleState.None,
            {
                ...resourceData,
                resourceName: podInfo.name,
                namespace: podInfo.namespace
            }
        );
        
        this.podInfo = podInfo;
        
        // Set description to show namespace
        this.description = podInfo.namespace;
        
        // Set icon based on pod status
        this.iconPath = this.getIconForStatus(podInfo.status);
        
        // Set tooltip with detailed information
        this.tooltip = `Pod: ${podInfo.name}\nNamespace: ${podInfo.namespace}\nStatus: ${podInfo.status}`;
        
        // No command - clicking a pod is a no-op at this stage (placeholder for future)
    }

    /**
     * Gets the appropriate icon for a pod status.
     * 
     * @param status The pod status
     * @returns ThemeIcon with appropriate icon and color
     */
    private getIconForStatus(status: PodStatus): vscode.ThemeIcon {
        switch (status) {
            case 'Running':
                return new vscode.ThemeIcon(
                    'circle-filled',
                    new vscode.ThemeColor('testing.iconPassed')
                );
            case 'Pending':
                return new vscode.ThemeIcon(
                    'clock',
                    new vscode.ThemeColor('editorWarning.foreground')
                );
            case 'Succeeded':
                return new vscode.ThemeIcon(
                    'check',
                    new vscode.ThemeColor('testing.iconPassed')
                );
            case 'Failed':
                return new vscode.ThemeIcon(
                    'error',
                    new vscode.ThemeColor('testing.iconFailed')
                );
            default: // Unknown
                return new vscode.ThemeIcon('question');
        }
    }

    /**
     * Factory method to create PodTreeItem from kubectl JSON response.
     * 
     * @param podData Raw pod data from kubectl get pods
     * @param resourceData Cluster context and cluster information
     * @param parentResource Optional parent resource name
     * @returns PodTreeItem instance
     */
    public static fromKubectlJson(
        podData: any,
        resourceData: TreeItemData,
        parentResource?: string
    ): PodTreeItem {
        const name = podData.metadata?.name || 'Unknown';
        const namespace = podData.metadata?.namespace || 'default';
        
        // Extract pod status from phase
        let status: PodStatus = 'Unknown';
        const phase = podData.status?.phase;
        
        if (phase === 'Running' || phase === 'Pending' || 
            phase === 'Succeeded' || phase === 'Failed') {
            status = phase as PodStatus;
        }
        
        const podInfo: PodInfo = {
            name,
            namespace,
            status,
            parentResource
        };
        
        return new PodTreeItem(podInfo, resourceData);
    }
}

