import { HealthStatus, PodHealthSummary } from '../types/workloadData';

/**
 * Calculates the overall health status of a workload based on replica counts and pod health data.
 * 
 * This function implements the health calculation algorithm specified in the namespace-workloads-table spec.
 * It evaluates workload health by examining both replica readiness (desired vs ready counts) and 
 * pod-level health check results (passed, failed, and unknown health checks).
 * 
 * @param readyReplicas - Number of replicas that are currently ready
 * @param desiredReplicas - Total number of replicas desired for this workload
 * @param podSummary - Aggregated health information from all pods in the workload
 * @returns HealthStatus - One of: 'Healthy', 'Degraded', 'Unhealthy', or 'Unknown'
 * 
 * @example
 * // All replicas ready, no failed health checks → Healthy
 * calculateHealthStatus(3, 3, { healthChecks: { passed: 10, failed: 0, unknown: 0 }, ... })
 * // Returns: 'Healthy'
 * 
 * @example
 * // Some replicas ready → Degraded
 * calculateHealthStatus(2, 3, { healthChecks: { passed: 8, failed: 2, unknown: 0 }, ... })
 * // Returns: 'Degraded'
 * 
 * @example
 * // No replicas ready → Unhealthy
 * calculateHealthStatus(0, 3, { healthChecks: { passed: 0, failed: 10, unknown: 0 }, ... })
 * // Returns: 'Unhealthy'
 * 
 * @example
 * // Scaled to zero → Unknown
 * calculateHealthStatus(0, 0, { healthChecks: { passed: 0, failed: 0, unknown: 0 }, ... })
 * // Returns: 'Unknown'
 */
export function calculateHealthStatus(
    readyReplicas: number,
    desiredReplicas: number,
    podSummary: PodHealthSummary
): HealthStatus {
    // Case 1: Healthy
    // All replicas are ready AND no health checks have failed AND the workload is not scaled to zero
    // This represents the ideal state where everything is functioning as expected
    if (readyReplicas === desiredReplicas && 
        podSummary.healthChecks.failed === 0 && 
        desiredReplicas > 0) {
        return 'Healthy';
    }
    
    // Case 2: Unhealthy
    // Either no replicas are ready OR all health checks are failing (with at least one failed check)
    // This represents a critical state where the workload is not functioning properly
    if (readyReplicas === 0 || 
        (podSummary.healthChecks.passed === 0 && podSummary.healthChecks.failed > 0)) {
        return 'Unhealthy';
    }
    
    // Case 3: Degraded
    // Either some (but not all) replicas are ready OR some health checks are failing while others pass
    // This represents a partially functional state that needs attention
    if ((readyReplicas < desiredReplicas && readyReplicas > 0) ||
        (podSummary.healthChecks.failed > 0 && podSummary.healthChecks.passed > 0)) {
        return 'Degraded';
    }
    
    // Case 4: Unknown (Only Unknown Health Checks)
    // Only unknown health checks exist with no passed or failed checks
    // This happens when health check data is unavailable or inconclusive
    if (podSummary.healthChecks.unknown > 0 && 
        podSummary.healthChecks.passed === 0 && 
        podSummary.healthChecks.failed === 0) {
        return 'Unknown';
    }
    
    // Case 5: Unknown (Scaled to Zero)
    // Workload has been scaled down to zero replicas
    // Cannot determine health when no instances are running
    if (desiredReplicas === 0) {
        return 'Unknown';
    }
    
    // Fallback: Unknown
    // For any edge cases not covered by the above conditions
    return 'Unknown';
}

