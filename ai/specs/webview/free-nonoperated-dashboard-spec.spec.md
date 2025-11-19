---
spec_id: free-nonoperated-dashboard-spec
feature_id: [free-dashboard]
diagram_id: [dashboard-architecture]
context_id: [kubernetes-cluster-management]
---

# Free Non-Operated Dashboard Specification

## Overview

The Free Non-Operated Dashboard displays basic cluster statistics derived directly from kubectl queries. This dashboard is shown when no kube9-operator is installed in the cluster (operator status: "basic"). It provides essential cluster insights without requiring any backend operator.

## Data Collection

### Kubectl Queries

The dashboard gathers data through direct kubectl commands:

#### Namespace Count

```typescript
async function getNamespaceCount(clusterContext: string): Promise<number> {
  const result = await execKubectl(
    `kubectl --context=${clusterContext} get namespaces --output=json`,
    { timeout: 5000 }
  );
  
  const namespaces = JSON.parse(result.stdout);
  return namespaces.items.length;
}
```

#### Workload Counts by Type

```typescript
interface WorkloadCounts {
  deployments: number;
  statefulsets: number;
  daemonsets: number;
  replicasets: number;
  jobs: number;
  cronjobs: number;
  pods: number;
}

async function getWorkloadCounts(clusterContext: string): Promise<WorkloadCounts> {
  const queries = [
    { key: 'deployments', resource: 'deployments.apps' },
    { key: 'statefulsets', resource: 'statefulsets.apps' },
    { key: 'daemonsets', resource: 'daemonsets.apps' },
    { key: 'replicasets', resource: 'replicasets.apps' },
    { key: 'jobs', resource: 'jobs.batch' },
    { key: 'cronjobs', resource: 'cronjobs.batch' },
    { key: 'pods', resource: 'pods' }
  ];
  
  const counts: Partial<WorkloadCounts> = {};
  
  await Promise.all(queries.map(async ({ key, resource }) => {
    try {
      const result = await execKubectl(
        `kubectl --context=${clusterContext} get ${resource} --all-namespaces --output=json`,
        { timeout: 5000 }
      );
      const data = JSON.parse(result.stdout);
      counts[key] = data.items.length;
    } catch (error) {
      counts[key] = 0; // Default to 0 on error
    }
  }));
  
  return counts as WorkloadCounts;
}
```

#### Node Information

```typescript
interface NodeInfo {
  totalNodes: number;
  readyNodes: number;
  cpuCapacity: string;
  memoryCapacity: string;
}

async function getNodeInfo(clusterContext: string): Promise<NodeInfo> {
  const result = await execKubectl(
    `kubectl --context=${clusterContext} get nodes --output=json`,
    { timeout: 5000 }
  );
  
  const nodes = JSON.parse(result.stdout);
  const totalNodes = nodes.items.length;
  
  const readyNodes = nodes.items.filter(node => {
    const readyCondition = node.status.conditions.find(c => c.type === 'Ready');
    return readyCondition?.status === 'True';
  }).length;
  
  // Aggregate CPU and memory capacity
  let totalCpu = 0;
  let totalMemory = 0;
  
  nodes.items.forEach(node => {
    totalCpu += parseCpuString(node.status.capacity.cpu);
    totalMemory += parseMemoryString(node.status.capacity.memory);
  });
  
  return {
    totalNodes,
    readyNodes,
    cpuCapacity: formatCpu(totalCpu),
    memoryCapacity: formatMemory(totalMemory)
  };
}
```

## Dashboard Data Structure

```typescript
interface FreeNonOperatedDashboardData {
  clusterName: string;
  namespaceCount: number;
  workloads: WorkloadCounts;
  nodes: NodeInfo;
  lastUpdated: Date;
}
```

## UI Components

### Dashboard Layout

```typescript
interface DashboardLayout {
  header: HeaderSection;
  statsCards: StatsCardSection[];
  charts: ChartSection[];
  footer: FooterSection;
}
```

### Stats Cards

Display key metrics in card format:

```typescript
interface StatsCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

const statsCards: StatsCard[] = [
  {
    title: 'Namespaces',
    value: data.namespaceCount,
    icon: 'symbol-namespace'
  },
  {
    title: 'Deployments',
    value: data.workloads.deployments,
    icon: 'vm-running'
  },
  {
    title: 'Pods',
    value: data.workloads.pods,
    icon: 'package'
  },
  {
    title: 'Nodes',
    value: `${data.nodes.readyNodes}/${data.nodes.totalNodes}`,
    icon: 'server'
  }
];
```

### Charts

#### Workload Distribution Chart

```typescript
interface WorkloadDistributionChart {
  type: 'pie' | 'doughnut';
  data: {
    labels: string[];
    values: number[];
  };
}

function buildWorkloadChart(workloads: WorkloadCounts): WorkloadDistributionChart {
  return {
    type: 'doughnut',
    data: {
      labels: [
        'Deployments',
        'StatefulSets',
        'DaemonSets',
        'Jobs',
        'CronJobs'
      ],
      values: [
        workloads.deployments,
        workloads.statefulsets,
        workloads.daemonsets,
        workloads.jobs,
        workloads.cronjobs
      ]
    }
  };
}
```

#### Node Health Chart

```typescript
interface NodeHealthChart {
  type: 'bar';
  data: {
    ready: number;
    notReady: number;
  };
}

function buildNodeHealthChart(nodes: NodeInfo): NodeHealthChart {
  return {
    type: 'bar',
    data: {
      ready: nodes.readyNodes,
      notReady: nodes.totalNodes - nodes.readyNodes
    }
  };
}
```

## HTML Template

```html
<div class="dashboard-header">
  <h1>Cluster Dashboard</h1>
  <div class="dashboard-subtitle">
    <span class="cluster-name">${clusterName}</span>
    <span class="last-updated">Last updated: ${formatTimestamp(lastUpdated)}</span>
  </div>
  <button class="refresh-button" onclick="refresh()">
    <span class="codicon codicon-refresh"></span> Refresh
  </button>
</div>

<div class="stats-cards-container">
  ${statsCards.map(card => `
    <div class="stats-card">
      <div class="card-icon">
        <span class="codicon codicon-${card.icon}"></span>
      </div>
      <div class="card-content">
        <div class="card-title">${card.title}</div>
        <div class="card-value">${card.value}</div>
      </div>
    </div>
  `).join('')}
</div>

<div class="charts-container">
  <div class="chart-wrapper">
    <h2>Workload Distribution</h2>
    <canvas id="workload-chart"></canvas>
  </div>
  
  <div class="chart-wrapper">
    <h2>Node Health</h2>
    <canvas id="node-health-chart"></canvas>
  </div>
</div>

<div class="workload-details">
  <h2>Workload Details</h2>
  <table class="workload-table">
    <tr>
      <td>Deployments</td>
      <td>${workloads.deployments}</td>
    </tr>
    <tr>
      <td>StatefulSets</td>
      <td>${workloads.statefulsets}</td>
    </tr>
    <tr>
      <td>DaemonSets</td>
      <td>${workloads.daemonsets}</td>
    </tr>
    <tr>
      <td>ReplicaSets</td>
      <td>${workloads.replicasets}</td>
    </tr>
    <tr>
      <td>Jobs</td>
      <td>${workloads.jobs}</td>
    </tr>
    <tr>
      <td>CronJobs</td>
      <td>${workloads.cronjobs}</td>
    </tr>
    <tr>
      <td>Pods</td>
      <td>${workloads.pods}</td>
    </tr>
  </table>
</div>
```

## Styling

### CSS Variables

```css
.dashboard-container {
  --card-spacing: 16px;
  --chart-height: 300px;
  --card-border-radius: 8px;
}

.stats-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--card-spacing);
  margin: 20px 0;
}

.stats-card {
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--card-border-radius);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-card:hover {
  background-color: var(--vscode-list-hoverBackground);
}

.card-icon {
  font-size: 32px;
  color: var(--vscode-charts-blue);
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--vscode-foreground);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--card-spacing);
  margin: 20px 0;
}

.chart-wrapper {
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border);
  border-radius: var(--card-border-radius);
  padding: 20px;
}

.chart-wrapper canvas {
  max-height: var(--chart-height);
}
```

## Chart Library Integration

### Chart.js Configuration

```typescript
function renderCharts(data: FreeNonOperatedDashboardData) {
  // Workload distribution chart
  new Chart(document.getElementById('workload-chart'), {
    type: 'doughnut',
    data: {
      labels: ['Deployments', 'StatefulSets', 'DaemonSets', 'Jobs', 'CronJobs'],
      datasets: [{
        data: [
          data.workloads.deployments,
          data.workloads.statefulsets,
          data.workloads.daemonsets,
          data.workloads.jobs,
          data.workloads.cronjobs
        ],
        backgroundColor: [
          'var(--vscode-charts-blue)',
          'var(--vscode-charts-green)',
          'var(--vscode-charts-yellow)',
          'var(--vscode-charts-orange)',
          'var(--vscode-charts-purple)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'var(--vscode-foreground)'
          }
        }
      }
    }
  });
  
  // Node health chart
  new Chart(document.getElementById('node-health-chart'), {
    type: 'bar',
    data: {
      labels: ['Ready', 'Not Ready'],
      datasets: [{
        data: [
          data.nodes.readyNodes,
          data.nodes.totalNodes - data.nodes.readyNodes
        ],
        backgroundColor: [
          'var(--vscode-charts-green)',
          'var(--vscode-charts-red)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'var(--vscode-foreground)'
          }
        },
        x: {
          ticks: {
            color: 'var(--vscode-foreground)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}
```

## Error Handling

### Query Failure Handling

```typescript
async function loadDashboardData(clusterContext: string): Promise<FreeNonOperatedDashboardData> {
  const errors: string[] = [];
  
  let namespaceCount = 0;
  let workloads: WorkloadCounts = {
    deployments: 0,
    statefulsets: 0,
    daemonsets: 0,
    replicasets: 0,
    jobs: 0,
    cronjobs: 0,
    pods: 0
  };
  let nodes: NodeInfo = {
    totalNodes: 0,
    readyNodes: 0,
    cpuCapacity: 'N/A',
    memoryCapacity: 'N/A'
  };
  
  try {
    namespaceCount = await getNamespaceCount(clusterContext);
  } catch (error) {
    errors.push('Failed to retrieve namespace count');
  }
  
  try {
    workloads = await getWorkloadCounts(clusterContext);
  } catch (error) {
    errors.push('Failed to retrieve workload counts');
  }
  
  try {
    nodes = await getNodeInfo(clusterContext);
  } catch (error) {
    errors.push('Failed to retrieve node information');
  }
  
  if (errors.length > 0) {
    vscode.window.showWarningMessage(
      `Dashboard loaded with errors: ${errors.join(', ')}`
    );
  }
  
  return {
    clusterName: getClusterName(clusterContext),
    namespaceCount,
    workloads,
    nodes,
    lastUpdated: new Date()
  };
}
```

## Performance Optimization

### Parallel Query Execution

All kubectl queries execute in parallel to minimize total load time:

```typescript
async function fetchAllData(clusterContext: string): Promise<FreeNonOperatedDashboardData> {
  const [namespaceCount, workloads, nodes] = await Promise.allSettled([
    getNamespaceCount(clusterContext),
    getWorkloadCounts(clusterContext),
    getNodeInfo(clusterContext)
  ]);
  
  return {
    clusterName: getClusterName(clusterContext),
    namespaceCount: namespaceCount.status === 'fulfilled' ? namespaceCount.value : 0,
    workloads: workloads.status === 'fulfilled' ? workloads.value : defaultWorkloadCounts,
    nodes: nodes.status === 'fulfilled' ? nodes.value : defaultNodeInfo,
    lastUpdated: new Date()
  };
}
```

### Query Timeout

All kubectl queries have a 5-second timeout to prevent dashboard freezing.

## Non-Goals

- Historical trend data (requires operator)
- Cost analysis (requires operator)
- Security recommendations (requires operator with API key)
- Custom metric collection (requires operator)
- Alert configuration (future feature)

