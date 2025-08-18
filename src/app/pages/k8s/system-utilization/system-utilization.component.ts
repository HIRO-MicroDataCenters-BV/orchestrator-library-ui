import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil, forkJoin, interval } from 'rxjs';
import { MetricsApiService } from '../../../shared/services/metrics-api.service';
import { HlmSidebarService } from '../../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';

@Component({
  selector: 'app-system-utilization',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartComponent,
  ],
  templateUrl: './system-utilization.component.html',
  styleUrl: './system-utilization.component.css',
})
export class SystemUtilizationComponent implements OnInit, OnDestroy {
  cpuUtilizationChartOptions: Partial<Highcharts.Options> = {};
  memoryUtilizationChartOptions: Partial<Highcharts.Options> = {};
  energyWattsChartOptions: Partial<Highcharts.Options> = {};
  
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
  }

  private initializeCharts(): void {
    // Initialize CPU Utilization chart (Y-axis will be set dynamically)
    this.cpuUtilizationChartOptions = {
      chart: { 
        type: 'line', 
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
        line: {
          lineWidth: 2,
          marker: { enabled: false },
          states: { inactive: { opacity: 1 } }
        }
      },
      series: []
    };

    // Initialize Memory Utilization chart
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
        title: { text: 'Memory Usage (MB)' },
        min: 0 
      },
      tooltip: { 
        shared: true, 
        valueSuffix: ' MB',
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach((point) => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(0)} MB</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: { enabled: true },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 2,
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
          lineWidth: 2,
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

    forkJoin({
      cpuUtilization: this.metricsApiService.getCpuUtilizationChartData(1000),
      memoryUsage: this.metricsApiService.getMemoryUsageChartData(1000),
      energyWatts: this.metricsApiService.getEnergyWattsChartData(1000),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ cpuUtilization, memoryUsage, energyWatts }) => {
          console.log('✅ Received utilization data:', {
            cpuNodes: Object.keys(cpuUtilization).length,
            memoryNodes: Object.keys(memoryUsage).length,
            energyNodes: Object.keys(energyWatts).length,
          });

          if (Object.keys(cpuUtilization).length > 0) {
            this.setupCpuUtilizationChart(cpuUtilization);
          } else {
            this.loadMockCpuData();
          }

          if (Object.keys(memoryUsage).length > 0) {
            this.setupMemoryUtilizationChart(memoryUsage);
          } else {
            this.loadMockMemoryData();
          }

          if (Object.keys(energyWatts).length > 0) {
            this.setupEnergyWattsChart(energyWatts);
          } else {
            this.loadMockEnergyData();
          }

          this.updateSummaryData(cpuUtilization, memoryUsage, energyWatts);
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
        type: 'line',
        data: data[nodeName],
        color: color,
        lineWidth: 2,
        marker: { enabled: false },
      });
      colorIndex++;
    });

    // Update the CPU chart options with dynamic Y-axis
    this.cpuUtilizationChartOptions = {
      chart: { 
        type: 'line', 
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
        line: {
          lineWidth: 2,
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
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];
    let colorIndex = 0;

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
        lineWidth: 2,
        marker: { enabled: false },
      });
      colorIndex++;
    });

    this.memoryUtilizationChartOptions = {
      ...this.memoryUtilizationChartOptions,
      series: series,
    };

    console.log('✅ Memory Utilization chart updated');
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
      
      // Add 10% padding above and below for better visualization
      const padding = Math.max(range * 0.1, 5); // Minimum 5W padding
      
      yAxisMin = Math.max(0, Math.floor(dataMin - padding));
      yAxisMax = Math.ceil(dataMax + padding);
      
      console.log(`📊 Energy chart Y-axis range: ${yAxisMin}W to ${yAxisMax}W (data range: ${dataMin.toFixed(1)}W - ${dataMax.toFixed(1)}W)`);
    }

    Object.keys(data).forEach((nodeName) => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: nodeName,
        type: 'spline',
        data: data[nodeName],
        color: color,
        lineWidth: 2,
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
          lineWidth: 2,
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
      'master-node': this.generateMockTimeSeries(now, 60, 2000, 4000, 3000),
      'worker-node-1': this.generateMockTimeSeries(now, 60, 1500, 3500, 2500),
      'worker-node-2': this.generateMockTimeSeries(now, 60, 1200, 3200, 2200),
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

    // Collect all memory values
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
        ? Math.round(allMemoryValues.reduce((sum, val) => sum + val, 0) / allMemoryValues.length)
        : 0,
      peakMemoryUsage: allMemoryValues.length > 0 
        ? Math.round(Math.max(...allMemoryValues))
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
      averageMemoryUsage: 2567,
      peakMemoryUsage: 3850,
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
}