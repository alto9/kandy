/**
 * Workload Data Types
 * 
 * Type definitions for Kubernetes workload resources and their health status.
 * These types are used throughout the namespace workloads feature for type-safe
 * data handling between the extension backend and webview frontend.
 */

/**
 * The four supported Kubernetes workload types
 */
export type WorkloadType = 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'CronJob';

/**
 * Health status enumeration for workloads
 * - Healthy: All replicas ready and all health checks passing
 * - Degraded: Some replicas ready or some health checks failing
 * - Unhealthy: No replicas ready or all health checks failing
 * - Unknown: Unable to determine health status
 */
export type HealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';

/**
 * Health check statistics aggregated from all pods
 */
export interface HealthCheckStats {
    /** Number of successful health checks */
    passed: number;
    /** Number of failed health checks */
    failed: number;
    /** Number of health checks in unknown state */
    unknown: number;
}

/**
 * Summary of pod conditions aggregated by type and status
 */
export interface PodConditionSummary {
    /** Condition type (e.g., 'Ready', 'Initialized', 'ContainersReady') */
    type: string;
    /** Condition status */
    status: 'True' | 'False' | 'Unknown';
    /** Number of pods with this condition */
    count: number;
}

/**
 * Aggregated health information for all pods in a workload
 */
export interface PodHealthSummary {
    /** Total number of pods */
    totalPods: number;
    /** Number of ready pods */
    readyPods: number;
    /** Aggregated health check statistics */
    healthChecks: HealthCheckStats;
    /** Aggregated pod conditions */
    conditions: PodConditionSummary[];
}

/**
 * Complete health status information for a workload
 */
export interface WorkloadHealth {
    /** Overall health status */
    status: HealthStatus;
    /** Aggregated pod health information */
    podStatus: PodHealthSummary;
    /** Timestamp of last health check */
    lastChecked: Date;
}

/**
 * Represents a single workload entry in the workloads table
 */
export interface WorkloadEntry {
    /** Workload name */
    name: string;
    /** Namespace containing the workload */
    namespace: string;
    /** Health status and pod information */
    health: WorkloadHealth;
    /** Number of ready replicas */
    readyReplicas: number;
    /** Desired number of replicas */
    desiredReplicas: number;
    /** Label selector for finding associated pods */
    selector: string;
    /** ISO timestamp of workload creation */
    creationTimestamp: string;
}

/**
 * State for the pill selector component
 */
export interface PillSelectorState {
    /** Currently selected workload type */
    selectedType: WorkloadType;
    /** Available workload types to select from */
    availableTypes: WorkloadType[];
}

/**
 * Complete data structure for the workloads table
 */
export interface WorkloadsTableData {
    /** Array of workload entries */
    workloads: WorkloadEntry[];
    /** Timestamp of last data update */
    lastUpdated: Date;
    /** Namespace filter (null means "All Namespaces") */
    namespace: string | null;
    /** Currently selected workload type */
    workloadType: WorkloadType;
    /** Optional error message if data fetch failed */
    error?: string;
}

