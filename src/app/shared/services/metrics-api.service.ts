import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MetricsApiResponse, NodeMetric, ChartDataPoint } from '../interfaces/metrics-api.interface';

@Injectable({
  providedIn: 'root'
})
export class MetricsApiService {
  private readonly baseUrl = 'http://0.0.0.0:8086/api/metrics/nodes/';

  constructor(private http: HttpClient) { }

  /**
   * Fetch metrics from the API
   * @param limit - Number of metrics to fetch (default: 100)
   * @param nodeName - Optional node name filter
   * @param hours - Optional hours filter
   * @returns Observable<MetricsApiResponse>
   */
  getMetrics(limit = 10000, nodeName?: string, hours?: number): Observable<MetricsApiResponse> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (nodeName) {
      params = params.set('node_name', nodeName);
    }
    
    if (hours) {
      params = params.set('hours', hours.toString());
    }

    return this.http.get<MetricsApiResponse>(this.baseUrl, { params });
  }

  /**
   * Transform metrics data for CPU watts chart
   * @param metrics - Array of NodeMetric
   * @returns Array of chart data points
   */
  transformCpuWattsData(metrics: NodeMetric[]): ChartDataPoint[] {
    return metrics.map(metric => ({
      timestamp: new Date(metric.timestamp).getTime(),
      value: metric.cpu_core_watts,
      nodeName: metric.node_name
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Transform metrics data for CPU utilization chart
   * @param metrics - Array of NodeMetric
   * @returns Array of chart data points
   */
  transformCpuUtilizationData(metrics: NodeMetric[]): ChartDataPoint[] {
    return metrics.map(metric => ({
      timestamp: new Date(metric.timestamp).getTime(),
      value: metric.cpu_utilization_percent,
      nodeName: metric.node_name
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Transform metrics data for memory usage chart (convert bytes to MB)
   * @param metrics - Array of NodeMetric
   * @returns Array of chart data points
   */
  transformMemoryUsageData(metrics: NodeMetric[]): ChartDataPoint[] {
    return metrics.map(metric => ({
      timestamp: new Date(metric.timestamp).getTime(),
      value: metric.memory_usage_bytes / (1024 * 1024), // Convert to MB
      nodeName: metric.node_name
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get CPU watts data formatted for charts
   * @param limit - Number of records to fetch
   * @returns Observable with chart-formatted data
   */
  getCpuWattsChartData(limit = 100): Observable<{ [nodeName: string]: [number, number][] }> {
    return this.getMetrics(limit).pipe(
      map(response => {
        const chartData = this.transformCpuWattsData(response.metrics);
        return this.groupDataByNode(chartData);
      })
    );
  }

  /**
   * Get CPU utilization data formatted for charts
   * @param limit - Number of records to fetch
   * @returns Observable with chart-formatted data
   */
  getCpuUtilizationChartData(limit = 100): Observable<{ [nodeName: string]: [number, number][] }> {
    return this.getMetrics(limit).pipe(
      map(response => {
        const chartData = this.transformCpuUtilizationData(response.metrics);
        return this.groupDataByNode(chartData);
      })
    );
  }

  /**
   * Get memory usage data formatted for charts
   * @param limit - Number of records to fetch
   * @returns Observable with chart-formatted data
   */
  getMemoryUsageChartData(limit = 100): Observable<{ [nodeName: string]: [number, number][] }> {
    return this.getMetrics(limit).pipe(
      map(response => {
        const chartData = this.transformMemoryUsageData(response.metrics);
        return this.groupDataByNode(chartData);
      })
    );
  }

  /**
   * Group chart data points by node name
   * @param data - Array of ChartDataPoint
   * @returns Object with node names as keys and chart data arrays as values
   */
  private groupDataByNode(data: ChartDataPoint[]): { [nodeName: string]: [number, number][] } {
    const grouped: { [nodeName: string]: [number, number][] } = {};
    
    data.forEach(point => {
      if (!grouped[point.nodeName]) {
        grouped[point.nodeName] = [];
      }
      grouped[point.nodeName].push([point.timestamp, point.value]);
    });

    return grouped;
  }
}
