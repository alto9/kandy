/**
 * Connection status of a Kubernetes cluster.
 */
export enum ClusterStatus {
    /**
     * Cluster API is reachable and responding.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Connected = 'connected',
    
    /**
     * Cluster API is unreachable or not responding.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Disconnected = 'disconnected',
    
    /**
     * Connection status has not been checked yet.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Unknown = 'unknown'
}

