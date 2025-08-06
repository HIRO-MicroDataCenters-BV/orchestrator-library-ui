export interface NodeMetric {
  timestamp: string;
  node_name: string;
  metric_source: string;
  cpu_core_watts: number;
  cpu_package_watts: number;
  memory_power_watts: number;
  platform_watts: number;
  cpu_utilization_percent: number;
  memory_utilization_percent: number;
  memory_usage_bytes: number;
}

export interface MetricsApiResponse {
  status: string;
  filters: {
    node_name: string | null;
    limit: number;
    hours: number | null;
  };
  metrics: NodeMetric[];
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  nodeName: string;
}