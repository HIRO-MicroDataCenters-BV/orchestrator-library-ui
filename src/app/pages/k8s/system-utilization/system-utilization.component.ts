import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil, interval } from 'rxjs';
import { MetricsApiService } from '../../../shared/services/metrics-api.service';
import { HlmSidebarService } from '../../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';
import { EnergyAvailabilityHeatmapComponent } from '../../../components/energy-availability-heatmap/energy-availability-heatmap.component';

@Component({
  selector: 'app-system-utilization',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartComponent,
    EnergyAvailabilityHeatmapComponent,
  ],
  templateUrl: './system-utilization.component.html',
  styleUrl: './system-utilization.component.css',
})
export class SystemUtilizationComponent implements OnInit, OnDestroy {
  cpuUtilizationChartOptions: Partial<Highcharts.Options> = {};
  memoryUtilizationChartOptions: Partial<Highcharts.Options> = {};
  energyWattsChartOptions: Partial<Highcharts.Options> = {};
  
  // Make Math available in template
  Math = Math;
  
  // Energy availability heatmap data
  energyAvailabilitySlots: any[] = [];
  
  // Alert rotation data
  allAlerts = [
    {
      type: 'critical',
      title: 'Energy Shortfall Critical',
      message: 'Expected demand 320W > Available 280W - 1 min ago',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-600'
    },
    {
      type: 'critical',
      title: 'High CPU Usage',
      message: 'worker-node-2 - 2 min ago',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-600'
    },
    {
      type: 'warning',
      title: 'Energy Budget Warning',
      message: '90% of daily energy allowance used - 8 min ago',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-400',
      titleColor: 'text-orange-800',
      messageColor: 'text-orange-600'
    },
    {
      type: 'warning',
      title: 'Memory Warning',
      message: 'master-node-1 - 15 min ago',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-600'
    },
    {
      type: 'info',
      title: 'Energy Peak Prediction',
      message: 'High demand expected at 2:00 PM - 18 min ago',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-400',
      titleColor: 'text-purple-800',
      messageColor: 'text-purple-600'
    }
  ];
  
  visibleAlerts: any[] = [];
  currentAlertIndex = 0;
  alertRotationInterval: any;
  
  // Summary data
  utilizationSummary = {
    averageCpuUsage: 0,
    peakCpuUsage: 0,
    averageMemoryUsage: 0,
    peakMemoryUsage: 0,
    averageEnergyUsage: 0,
    peakEnergyUsage: 0,
    totalNodes: 0,
    lastUpdated: new Date(),
  };

  private destroy$ = new Subject<void>();
  private refreshInterval$ = interval(30000); // Refresh every 30 seconds

  constructor(
    private metricsApiService: MetricsApiService,
    public sidebarService: HlmSidebarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('🚀 SystemUtilizationComponent initialized');
    
    if (isPlatformBrowser(this.platformId)) {
      console.log('📊 Platform is browser, loading data...');
      this.initializeCharts();
      this.loadUtilizationData();
      this.loadMockEnergyAvailabilityData();
      this.startAlertRotation();
      
      // Set up auto-refresh
      this.refreshInterval$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('🔄 Auto-refreshing utilization data...');
          this.loadUtilizationData();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.alertRotationInterval) {
      clearInterval(this.alertRotationInterval);
    }
  }

  private initializeCharts(): void {
    // Initialize CPU Utilization chart (Y-axis will be set dynamically)
    this.cpuUtilizationChartOptions = {
      chart: { 
        type: 'area', 
        backgroundColor: 'transparent',
        height: 300 
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { 
        type: 'datetime', 
        title: { text: 'Time' } 
      },
      yAxis: { 
        title: { text: 'CPU Utilization (%)' },
        startOnTick: false,
        endOnTick: false
      },
      tooltip: { 
        shared: true, 
        valueSuffix: '%',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}%</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 1,
          marker: { enabled: false },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: []
    };

    // Initialize Memory Utilization chart (Y-axis will be set dynamically)
    this.memoryUtilizationChartOptions = {
      chart: { 
        type: 'area', 
        backgroundColor: 'transparent',
        height: 300 
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { 
        type: 'datetime', 
        title: { text: 'Time' } 
      },
      yAxis: { 
        title: { text: 'Memory Utilization (%)' },
        startOnTick: false,
        endOnTick: false
      },
      tooltip: { 
        shared: true, 
        valueSuffix: '%',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}%</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 1,
          marker: { enabled: false },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: []
    };

    // Initialize Energy Watts chart (Y-axis will be set dynamically)
    this.energyWattsChartOptions = {
      chart: { 
        type: 'spline', 
        backgroundColor: 'transparent',
        height: 300 
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { 
        type: 'datetime', 
        title: { text: 'Time' } 
      },
      yAxis: { 
        title: { text: 'Energy Usage (W)' },
        startOnTick: false,
        endOnTick: false
      },
      tooltip: { 
        shared: true, 
        valueSuffix: 'W',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}W</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        spline: {
          lineWidth: 1,
          marker: { 
            enabled: false
          },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: []
    };

    console.log('📊 Charts initialized');
  }

  private loadUtilizationData(): void {
    console.log('📡 Loading utilization data from API...');

    // Single API call to get all metrics data
    this.metricsApiService.getMetrics(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Received metrics response:', {
            totalMetrics: response.metrics.length,
            status: response.status
          });

          if (response.metrics.length > 0) {
            // Transform data for each chart type from the single response
            const cpuUtilizationData = this.metricsApiService.groupDataByNode(
              this.metricsApiService.transformCpuUtilizationData(response.metrics)
            );
            
            const memoryUtilizationData = this.metricsApiService.groupDataByNode(
              this.metricsApiService.transformMemoryUtilizationData(response.metrics)
            );
            
            const energyWattsData = this.metricsApiService.groupDataByNode(
              this.metricsApiService.transformEnergyWattsData(response.metrics)
            );

            console.log('📊 Transformed chart data:', {
              cpuNodes: Object.keys(cpuUtilizationData).length,
              memoryNodes: Object.keys(memoryUtilizationData).length,
              energyNodes: Object.keys(energyWattsData).length,
            });

            // Setup charts with transformed data
            this.setupCpuUtilizationChart(cpuUtilizationData);
            this.setupMemoryUtilizationChart(memoryUtilizationData);
            this.setupEnergyWattsChart(energyWattsData);
            this.updateSummaryData(cpuUtilizationData, memoryUtilizationData, energyWattsData);
          } else {
            console.warn('⚠️ No metrics data received, loading mock data...');
            this.loadMockCpuData();
            this.loadMockMemoryData();
            this.loadMockEnergyData();
            this.updateSummaryWithMockData();
          }
        },
        error: (error) => {
          console.error('❌ Error loading utilization data:', error);
          console.log('🔄 Loading mock data...');
          this.loadMockCpuData();
          this.loadMockMemoryData();
          this.loadMockEnergyData();
          this.updateSummaryWithMockData();
        },
      });
  }

  private setupCpuUtilizationChart(data: { [nodeName: string]: [number, number][] }): void {
    console.log('📊 Setting up CPU Utilization chart');
    
    const series: Highcharts.SeriesOptionsType[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];
    let colorIndex = 0;

    // Calculate min and max values from all data points
    let allValues: number[] = [];
    Object.values(data).forEach(nodeData => {
      nodeData.forEach(([_, value]) => allValues.push(value));
    });

    let yAxisMin = 0;
    let yAxisMax = 100; // CPU utilization cap at 100%

    if (allValues.length > 0) {
      const dataMin = Math.min(...allValues);
      const dataMax = Math.max(...allValues);
      const range = dataMax - dataMin;
      
      // Add 5% padding above and below for better visualization
      const padding = Math.max(range * 0.05, 2); // Minimum 2% padding
      
      yAxisMin = Math.max(0, Math.floor(dataMin - padding));
      yAxisMax = Math.min(100, Math.ceil(dataMax + padding));
      
      console.log(`📊 CPU chart Y-axis range: ${yAxisMin}% to ${yAxisMax}% (data range: ${dataMin.toFixed(1)}% - ${dataMax.toFixed(1)}%)`);
    }

    Object.keys(data).forEach((nodeName) => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: nodeName,
        type: 'area',
        data: data[nodeName],
        color: color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `${color}40`],
            [1, `${color}10`],
          ],
        } as Highcharts.GradientColorObject,
        lineWidth: 1,
        marker: { enabled: false },
      });
      colorIndex++;
    });

    // Update the CPU chart options with dynamic Y-axis
    this.cpuUtilizationChartOptions = {
      chart: { 
        type: 'area', 
        backgroundColor: 'transparent',
        height: 300 
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { 
        type: 'datetime', 
        title: { text: 'Time' } 
      },
      yAxis: { 
        title: { text: 'CPU Utilization (%)' },
        min: yAxisMin,
        max: yAxisMax,
        startOnTick: false,
        endOnTick: false
      },
      tooltip: { 
        shared: true, 
        valueSuffix: '%',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}%</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 1,
          marker: { enabled: false },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: series
    };

    console.log('✅ CPU Utilization chart updated with dynamic Y-axis');
  }

  private setupMemoryUtilizationChart(data: { [nodeName: string]: [number, number][] }): void {
    console.log('📊 Setting up Memory Utilization chart');
    
    const series: Highcharts.SeriesOptionsType[] = [];
    const colors = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#f97316'];
    let colorIndex = 0;

    // Calculate min and max values from all data points
    let allValues: number[] = [];
    Object.values(data).forEach(nodeData => {
      nodeData.forEach(([_, value]) => allValues.push(value));
    });

    let yAxisMin = 0;
    let yAxisMax = 100; // Memory utilization cap at 100%

    if (allValues.length > 0) {
      const dataMin = Math.min(...allValues);
      const dataMax = Math.max(...allValues);
      const range = dataMax - dataMin;
      
      // Use minimal padding like energy chart for better normalization
      const padding = Math.max(range * 0.02, 1); // Only 2% padding, minimum 1%
      
      yAxisMin = Math.max(0, dataMin - padding);
      yAxisMax = Math.min(100, dataMax + padding);
      
      console.log(`📊 Memory chart Y-axis range: ${yAxisMin.toFixed(1)}% to ${yAxisMax.toFixed(1)}% (data range: ${dataMin.toFixed(1)}% - ${dataMax.toFixed(1)}%)`);
    }

    Object.keys(data).forEach((nodeName) => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: nodeName,
        type: 'area',
        data: data[nodeName],
        color: color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `${color}40`],
            [1, `${color}10`],
          ],
        } as Highcharts.GradientColorObject,
        lineWidth: 1,
        marker: { enabled: false },
      });
      colorIndex++;
    });

    // Update the memory chart options with dynamic Y-axis
    this.memoryUtilizationChartOptions = {
      chart: { 
        type: 'area', 
        backgroundColor: 'transparent',
        height: 300 
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { 
        type: 'datetime', 
        title: { text: 'Time' } 
      },
      yAxis: { 
        title: { text: 'Memory Utilization (%)' },
        min: yAxisMin,
        max: yAxisMax,
        startOnTick: false,
        endOnTick: false
      },
      tooltip: { 
        shared: true, 
        valueSuffix: '%',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}%</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 1,
          marker: { enabled: false },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: series
    };

    console.log('✅ Memory Utilization chart updated with dynamic Y-axis');
  }

  private setupEnergyWattsChart(data: { [nodeName: string]: [number, number][] }): void {
    console.log('📊 Setting up Energy Watts chart');
    
    const series: Highcharts.SeriesOptionsType[] = [];
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'];
    let colorIndex = 0;

    // Calculate min and max values from all data points
    let allValues: number[] = [];
    Object.values(data).forEach(nodeData => {
      nodeData.forEach(([_, value]) => allValues.push(value));
    });

    let yAxisMin = 0;
    let yAxisMax = undefined;

    if (allValues.length > 0) {
      const dataMin = Math.min(...allValues);
      const dataMax = Math.max(...allValues);
      const range = dataMax - dataMin;
      
      // Use minimal padding for energy chart to show curve better
      const padding = Math.max(range * 0.02, 1); // Only 2% padding, minimum 1W
      
      yAxisMin = Math.max(0, dataMin - padding);
      yAxisMax = dataMax + padding;
      
      console.log(`📊 Energy chart Y-axis range: ${yAxisMin.toFixed(1)}W to ${yAxisMax.toFixed(1)}W (data range: ${dataMin.toFixed(1)}W - ${dataMax.toFixed(1)}W)`);
    }

    Object.keys(data).forEach((nodeName) => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: nodeName,
        type: 'spline',
        data: data[nodeName],
        color: color,
        lineWidth: 1,
        marker: { 
          enabled: false
        },
      });
      colorIndex++;
    });

    // Update the energy chart options with dynamic Y-axis
    this.energyWattsChartOptions = {
      chart: { 
        type: 'spline', 
        backgroundColor: 'transparent',
        height: 300 
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { 
        type: 'datetime', 
        title: { text: 'Time' } 
      },
      yAxis: { 
        title: { text: 'Energy Usage (W)' },
        min: yAxisMin,
        max: yAxisMax,
        startOnTick: false,
        endOnTick: false
      },
      tooltip: { 
        shared: true, 
        valueSuffix: 'W',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}W</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        spline: {
          lineWidth: 1,
          marker: { 
            enabled: false
          },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: series
    };

    console.log('✅ Energy Watts chart updated with dynamic Y-axis');
  }

  private loadMockCpuData(): void {
    const now = Date.now();
    const mockCpuData: { [nodeName: string]: [number, number][] } = {
      'master-node': this.generateMockTimeSeries(now, 60, 25, 85, 60),
      'worker-node-1': this.generateMockTimeSeries(now, 60, 20, 75, 45),
      'worker-node-2': this.generateMockTimeSeries(now, 60, 15, 80, 50),
    };
    this.setupCpuUtilizationChart(mockCpuData);
  }

  private loadMockMemoryData(): void {
    const now = Date.now();
    const mockMemoryData: { [nodeName: string]: [number, number][] } = {
      'master-node': this.generateMockTimeSeries(now, 60, 35, 85, 65),
      'worker-node-1': this.generateMockTimeSeries(now, 60, 25, 75, 55),
      'worker-node-2': this.generateMockTimeSeries(now, 60, 20, 70, 45),
    };
    this.setupMemoryUtilizationChart(mockMemoryData);
  }

  private loadMockEnergyData(): void {
    const now = Date.now();
    const mockEnergyData: { [nodeName: string]: [number, number][] } = {
      'master-node': this.generateMockTimeSeries(now, 60, 240, 280, 265),
      'worker-node-1': this.generateMockTimeSeries(now, 60, 210, 250, 235),
      'worker-node-2': this.generateMockTimeSeries(now, 60, 190, 230, 215),
    };
    this.setupEnergyWattsChart(mockEnergyData);
  }

  private generateMockTimeSeries(
    endTime: number,
    points: number,
    min: number,
    max: number,
    base: number
  ): [number, number][] {
    const series: [number, number][] = [];
    const interval = 60000; // 1 minute intervals

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = endTime - (i * interval);
      const variation = Math.sin((timestamp / interval) * 0.1) * 20;
      const randomness = (Math.random() - 0.5) * 10;
      const value = Math.max(min, Math.min(max, base + variation + randomness));
      series.push([timestamp, Math.round(value * 100) / 100]);
    }

    return series;
  }

  private updateSummaryData(
    cpuData: { [nodeName: string]: [number, number][] },
    memoryData: { [nodeName: string]: [number, number][] },
    energyData: { [nodeName: string]: [number, number][] }
  ): void {
    const allCpuValues: number[] = [];
    const allMemoryValues: number[] = [];
    const allEnergyValues: number[] = [];

    // Collect all CPU values
    Object.values(cpuData).forEach(nodeData => {
      nodeData.forEach(([_, value]) => allCpuValues.push(value));
    });

    // Collect all memory values (now percentages)
    Object.values(memoryData).forEach(nodeData => {
      nodeData.forEach(([_, value]) => allMemoryValues.push(value));
    });

    // Collect all energy values
    Object.values(energyData).forEach(nodeData => {
      nodeData.forEach(([_, value]) => allEnergyValues.push(value));
    });

    this.utilizationSummary = {
      averageCpuUsage: allCpuValues.length > 0 
        ? Math.round((allCpuValues.reduce((sum, val) => sum + val, 0) / allCpuValues.length) * 10) / 10
        : 0,
      peakCpuUsage: allCpuValues.length > 0 
        ? Math.round(Math.max(...allCpuValues) * 10) / 10
        : 0,
      averageMemoryUsage: allMemoryValues.length > 0 
        ? Math.round((allMemoryValues.reduce((sum, val) => sum + val, 0) / allMemoryValues.length) * 10) / 10
        : 0,
      peakMemoryUsage: allMemoryValues.length > 0 
        ? Math.round(Math.max(...allMemoryValues) * 10) / 10
        : 0,
      averageEnergyUsage: allEnergyValues.length > 0 
        ? Math.round((allEnergyValues.reduce((sum, val) => sum + val, 0) / allEnergyValues.length) * 10) / 10
        : 0,
      peakEnergyUsage: allEnergyValues.length > 0 
        ? Math.round(Math.max(...allEnergyValues) * 10) / 10
        : 0,
      totalNodes: Math.max(Object.keys(cpuData).length, Object.keys(memoryData).length, Object.keys(energyData).length),
      lastUpdated: new Date(),
    };

    console.log('📊 Summary updated:', this.utilizationSummary);
  }

  private updateSummaryWithMockData(): void {
    this.utilizationSummary = {
      averageCpuUsage: 58.5,
      peakCpuUsage: 85.2,
      averageMemoryUsage: 55.7,
      peakMemoryUsage: 82.3,
      averageEnergyUsage: 238.3,
      peakEnergyUsage: 276.5,
      totalNodes: 3,
      lastUpdated: new Date(),
    };
  }

  refreshData(): void {
    console.log('🔄 Manual refresh triggered');
    this.loadUtilizationData();
  }

  private loadMockEnergyAvailabilityData(): void {
    // Generate mock energy availability data for the heatmap
    this.energyAvailabilitySlots = [
      // Monday
      { slot_start_time: '2024-01-01T00:00:00Z', available_watts: 1200 },
      { slot_start_time: '2024-01-01T04:00:00Z', available_watts: 1400 },
      { slot_start_time: '2024-01-01T08:00:00Z', available_watts: 2800 },
      { slot_start_time: '2024-01-01T12:00:00Z', available_watts: 3200 },
      { slot_start_time: '2024-01-01T16:00:00Z', available_watts: 2600 },
      { slot_start_time: '2024-01-01T20:00:00Z', available_watts: 1800 },
      
      // Tuesday
      { slot_start_time: '2024-01-02T00:00:00Z', available_watts: 1100 },
      { slot_start_time: '2024-01-02T04:00:00Z', available_watts: 1300 },
      { slot_start_time: '2024-01-02T08:00:00Z', available_watts: 2900 },
      { slot_start_time: '2024-01-02T12:00:00Z', available_watts: 3400 },
      { slot_start_time: '2024-01-02T16:00:00Z', available_watts: 2700 },
      { slot_start_time: '2024-01-02T20:00:00Z', available_watts: 1900 },
      
      // Wednesday
      { slot_start_time: '2024-01-03T00:00:00Z', available_watts: 1000 },
      { slot_start_time: '2024-01-03T04:00:00Z', available_watts: 1200 },
      { slot_start_time: '2024-01-03T08:00:00Z', available_watts: 3100 },
      { slot_start_time: '2024-01-03T12:00:00Z', available_watts: 3600 },
      { slot_start_time: '2024-01-03T16:00:00Z', available_watts: 2900 },
      { slot_start_time: '2024-01-03T20:00:00Z', available_watts: 2000 },
      
      // Thursday
      { slot_start_time: '2024-01-04T00:00:00Z', available_watts: 1300 },
      { slot_start_time: '2024-01-04T04:00:00Z', available_watts: 1500 },
      { slot_start_time: '2024-01-04T08:00:00Z', available_watts: 2700 },
      { slot_start_time: '2024-01-04T12:00:00Z', available_watts: 3000 },
      { slot_start_time: '2024-01-04T16:00:00Z', available_watts: 2400 },
      { slot_start_time: '2024-01-04T20:00:00Z', available_watts: 1700 },
      
      // Friday
      { slot_start_time: '2024-01-05T00:00:00Z', available_watts: 1400 },
      { slot_start_time: '2024-01-05T04:00:00Z', available_watts: 1600 },
      { slot_start_time: '2024-01-05T08:00:00Z', available_watts: 2500 },
      { slot_start_time: '2024-01-05T12:00:00Z', available_watts: 2800 },
      { slot_start_time: '2024-01-05T16:00:00Z', available_watts: 2200 },
      { slot_start_time: '2024-01-05T20:00:00Z', available_watts: 1600 },
      
      // Saturday
      { slot_start_time: '2024-01-06T00:00:00Z', available_watts: 800 },
      { slot_start_time: '2024-01-06T04:00:00Z', available_watts: 1000 },
      { slot_start_time: '2024-01-06T08:00:00Z', available_watts: 1800 },
      { slot_start_time: '2024-01-06T12:00:00Z', available_watts: 2200 },
      { slot_start_time: '2024-01-06T16:00:00Z', available_watts: 2000 },
      { slot_start_time: '2024-01-06T20:00:00Z', available_watts: 1400 },
      
      // Sunday
      { slot_start_time: '2024-01-07T00:00:00Z', available_watts: 900 },
      { slot_start_time: '2024-01-07T04:00:00Z', available_watts: 1100 },
      { slot_start_time: '2024-01-07T08:00:00Z', available_watts: 1900 },
      { slot_start_time: '2024-01-07T12:00:00Z', available_watts: 2400 },
      { slot_start_time: '2024-01-07T16:00:00Z', available_watts: 2100 },
      { slot_start_time: '2024-01-07T20:00:00Z', available_watts: 1500 },
    ];
    
    console.log('🔥 Mock energy availability data loaded:', this.energyAvailabilitySlots.length, 'slots');
  }

  private startAlertRotation(): void {
    // Initialize with first 2 alerts
    this.updateVisibleAlerts();
    
    // Rotate alerts every 10 seconds (slow rotation)
    this.alertRotationInterval = setInterval(() => {
      this.rotateAlerts();
    }, 10000);
  }

  private updateVisibleAlerts(): void {
    // Show 2 alerts starting from currentAlertIndex
    this.visibleAlerts = [];
    for (let i = 0; i < 2; i++) {
      const index = (this.currentAlertIndex + i) % this.allAlerts.length;
      this.visibleAlerts.push(this.allAlerts[index]);
    }
  }

  private rotateAlerts(): void {
    // Move to next set of alerts
    this.currentAlertIndex = (this.currentAlertIndex + 2) % this.allAlerts.length;
    this.updateVisibleAlerts();
  }

  goToAlertGroup(groupIndex: number): void {
    // Stop automatic rotation temporarily
    if (this.alertRotationInterval) {
      clearInterval(this.alertRotationInterval);
    }
    
    // Set the alert index based on group
    this.currentAlertIndex = groupIndex * 2;
    this.updateVisibleAlerts();
    
    // Restart automatic rotation after 8 seconds
    setTimeout(() => {
      this.startAlertRotation();
    }, 8000);
  }
}
