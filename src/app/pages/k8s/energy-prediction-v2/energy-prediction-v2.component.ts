import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import { EnergyAvailabilityHeatmapComponent } from '../../../components/energy-availability-heatmap/energy-availability-heatmap.component';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { EnergyDataService } from '../../../shared/services/energy-data.service';
import { MetricsApiService } from '../../../shared/services/metrics-api.service';
import { EnergyAvailabilityService } from '../../../shared/services/energy-availability.service';
import { HlmSidebarService } from '../../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';

@Component({
  selector: 'app-energy-prediction-v2',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartComponent,
    EnergyAvailabilityHeatmapComponent,
  ],
  templateUrl: './energy-prediction-v2.component.html',
  styleUrl: './energy-prediction-v2.component.css'
})
export class EnergyPredictionV2Component implements OnInit, OnDestroy {
  Highcharts: typeof Highcharts = Highcharts;

  comparisonChartOptions: Partial<Highcharts.Options> = {};
  cpuWattsChartOptions: Partial<Highcharts.Options> = {};
  cpuUtilizationChartOptions: Partial<Highcharts.Options> = {};
  memoryUsageChartOptions: Partial<Highcharts.Options> = {};
  // Deprecated/legacy charts (kept for compatibility)
  energyAvailabilityChartOptions: Partial<Highcharts.Options> = {};
  energyHeatmapChartOptions: Partial<Highcharts.Options> = {};
  nodeUtilizationHeatmapChartOptions: Partial<Highcharts.Options> = {};
  // Data used by the child heatmap component
  energyAvailabilitySlots: any[] = [];
  
  energyForecastSummary = {
    totalSlots: 0,
    totalCapacity: 0,
    averageConfidence: 0,
    providers: [] as string[],
    sourcesTypes: [] as string[]
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private energyDataService: EnergyDataService,
    private metricsApiService: MetricsApiService,
    private energyAvailabilityService: EnergyAvailabilityService,
    public sidebarService: HlmSidebarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('highcharts/modules/heatmap')
        .then((module) => {
          (module as any).default(Highcharts);
        })
        .catch((err) => {
          console.error('Failed to load Highcharts heatmap module:', err);
        })
        .finally(() => {
          this.loadData();
        });
    } else {
      // Skip on server; charts will initialize after hydration
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Load energy forecast chart (original functionality)
    this.setupComparisonChart();
    
    // Load energy availability data
    this.loadEnergyAvailabilityData();
    
    // Start with mock data for real metrics testing, then try real API
    console.log('Loading data - starting with mock data for testing');
    //this.loadMockDataForTesting();
    
    // Also try to load real data (this will override mock data if successful)
    this.loadRealMetricsData();
  }

  private loadRealMetricsData(): void {
    console.log('Starting to load metrics data...');
    
    forkJoin({
      cpuWatts: this.metricsApiService.getCpuWattsChartData(),
      cpuUtilization: this.metricsApiService.getCpuUtilizationChartData(),
      memoryUsage: this.metricsApiService.getMemoryUsageChartData()
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ cpuWatts, cpuUtilization, memoryUsage }) => {
        console.log('Received metrics data:', { cpuWatts, cpuUtilization, memoryUsage });
        
        if (Object.keys(cpuWatts).length > 0) {
          this.setupCpuWattsChart(cpuWatts);
          console.log('CPU Watts chart setup complete');
        } else {
          console.warn('No CPU watts data received');
        }
        
        if (Object.keys(cpuUtilization).length > 0) {
          this.setupCpuUtilizationChart(cpuUtilization);
          console.log('CPU Utilization chart setup complete');
        } else {
          console.warn('No CPU utilization data received');
        }
        
        if (Object.keys(memoryUsage).length > 0) {
          this.setupMemoryUsageChart(memoryUsage);
          console.log('Memory Usage chart setup complete');
        } else {
          console.warn('No memory usage data received');
        }
      },
      error: (error) => {
        console.error('Error loading metrics data:', error);
        console.log('Attempting to use mock data for testing...');
        this.loadMockDataForTesting();
      }
    });
  }

  private loadMockDataForTesting(): void {
    console.log('Loading mock data for testing...');
    const mockData: { [nodeName: string]: [number, number][] } = {
      'minikube': [
        [Date.now() - 300000, 150.5] as [number, number], // 5 min ago
        [Date.now() - 240000, 145.2] as [number, number], // 4 min ago
        [Date.now() - 180000, 148.9] as [number, number], // 3 min ago
        [Date.now() - 120000, 152.1] as [number, number], // 2 min ago
        [Date.now() - 60000, 149.8] as [number, number],  // 1 min ago
        [Date.now(), 151.2] as [number, number]           // now
      ]
    };

    this.setupCpuWattsChart(mockData);
    
    const mockCpuUtil: { [nodeName: string]: [number, number][] } = {
      'minikube': [
        [Date.now() - 300000, 65.2] as [number, number],
        [Date.now() - 240000, 70.1] as [number, number],
        [Date.now() - 180000, 68.5] as [number, number],
        [Date.now() - 120000, 72.8] as [number, number],
        [Date.now() - 60000, 69.3] as [number, number],
        [Date.now(), 71.5] as [number, number]
      ]
    };

    this.setupCpuUtilizationChart(mockCpuUtil);

    const mockMemory: { [nodeName: string]: [number, number][] } = {
      'minikube': [
        [Date.now() - 300000, 2400] as [number, number],
        [Date.now() - 240000, 2450] as [number, number],
        [Date.now() - 180000, 2380] as [number, number],
        [Date.now() - 120000, 2520] as [number, number],
        [Date.now() - 60000, 2480] as [number, number],
        [Date.now(), 2510] as [number, number]
      ]
    };

    this.setupMemoryUsageChart(mockMemory);
    console.log('Mock data setup complete');
  }

  private setupCpuWattsChart(data: { [nodeName: string]: [number, number][] }): void {
    console.log('Setting up CPU Watts chart with data:', data);
    const series: Highcharts.SeriesOptionsType[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    let colorIndex = 0;

    Object.keys(data).forEach(nodeName => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: `${nodeName} - CPU Watts`,
        type: 'area',
        data: data[nodeName],
        color: color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `${color}40`], // 25% opacity
            [1, `${color}10`]  // 6% opacity
          ]
        },
        lineWidth: 1,
        marker: {
          enabled: false
        }
      });
      colorIndex++;
    });

    this.cpuWattsChartOptions = {
      chart: {
        type: 'area',
        backgroundColor: 'transparent'
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        }
      },
      yAxis: {
        title: {
          text: 'CPU Watts'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: 'W'
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        line: {
          states: {
            inactive: {
              opacity: 1
            }
          }
        }
      },
      series: series
    };
    console.log('CPU Watts chart options set:', this.cpuWattsChartOptions);
  }

  private setupCpuUtilizationChart(data: { [nodeName: string]: [number, number][] }): void {
    console.log('Setting up CPU Utilization chart with data:', data);
    const series: Highcharts.SeriesOptionsType[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    let colorIndex = 0;

    Object.keys(data).forEach(nodeName => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: `${nodeName} - CPU Utilization`,
        type: 'area',
        data: data[nodeName],
        color: color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `${color}40`], // 25% opacity
            [1, `${color}10`]  // 6% opacity
          ]
        },
        lineWidth: 1,
        marker: {
          enabled: false
        }
      });
      colorIndex++;
    });

    this.cpuUtilizationChartOptions = {
      chart: {
        type: 'area',
        backgroundColor: 'transparent'
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        }
      },
      yAxis: {
        title: {
          text: 'CPU Utilization (%)'
        },
        max: 100
      },
      tooltip: {
        shared: true,
        valueSuffix: '%'
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        line: {
          states: {
            inactive: {
              opacity: 1
            }
          }
        }
      },
      series: series
    };
  }

  private setupMemoryUsageChart(data: { [nodeName: string]: [number, number][] }): void {
    console.log('Setting up Memory Usage chart with data:', data);
    const series: Highcharts.SeriesOptionsType[] = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    let colorIndex = 0;

    Object.keys(data).forEach(nodeName => {
      const color = colors[colorIndex % colors.length];
      series.push({
        name: `${nodeName} - Memory Usage`,
        type: 'area',
        data: data[nodeName],
        color: color,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `${color}40`], // 25% opacity
            [1, `${color}10`]  // 6% opacity
          ]
        },
        lineWidth: 1,
        marker: {
          enabled: false
        }
      });
      colorIndex++;
    });

    this.memoryUsageChartOptions = {
      chart: {
        type: 'area',
        backgroundColor: 'transparent'
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        }
      },
      yAxis: {
        title: {
          text: 'Memory Usage (MB)'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: ' MB'
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        line: {
          states: {
            inactive: {
              opacity: 1
            }
          }
        }
      },
      series: series
    };
  }

  private setupComparisonChart(): void {
    this.energyDataService.generateComparisonData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ actualData, previousForecastData, futureForecastData }) => {
        this.buildComparisonChart(actualData, previousForecastData, futureForecastData);
      });
  }

  private buildComparisonChart(
    actualData: [number, number][],
    previousForecastData: [number, number][],
    futureForecastData: [number, number][]
  ): void {
    const now = new Date().getTime();

    this.comparisonChartOptions = {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        panKey: 'shift',
        panning: {
          enabled: true,
          type: 'x'
        },
        zooming: {
          type: 'x'
        }
      },
      title: {
        text: undefined
      },
      subtitle: {
        text: 'Click and drag to zoom in. Hold shift key to pan.',
        style: {
          fontSize: '11px',
          color: '#666'
        }
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        },
        plotLines: [{
          color: '#ff6b6b',
          dashStyle: 'ShortDash',
          value: now,
          width: 0.3,
          label: {
            text: 'Now',
            style: {
              color: '#ff6b6b'
            }
          }
        }],
        events: {
          afterSetExtremes: function() {
            // Optional: Add custom behavior after zoom/pan
          }
        }
      },
      yAxis: {
        title: {
          text: 'Energy Consumption (W)'
        }
      },
      tooltip: {
        shared: true,
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach(point => {
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}W</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        enabled: true
      },
      navigation: {
        buttonOptions: {
          enabled: true
        }
      },
      rangeSelector: {
        enabled: false
      },
      scrollbar: {
        enabled: false
      },
      navigator: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 1,
          marker: {
            enabled: false
          },
          states: {
            inactive: {
              opacity: 1
            }
          }
        },
        line: {
          lineWidth: 2,
          marker: {
            enabled: false
          },
          states: {
            inactive: {
              opacity: 1
            }
          }
        }
      },
      series: [
        {
          name: 'Actual Energy Consumption',
          type: 'line',
          data: actualData,
          color: '#10b981',
          lineWidth: 1,
          marker: {
            enabled: false
          }
        },
        {
          name: 'Previous Forecast (Historical)',
          type: 'area',
          data: previousForecastData,
          color: 'rgba(59, 130, 246, 0.4)',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(59, 130, 246, 0.15)'],
              [1, 'rgba(59, 130, 246, 0.05)']
            ]
          },
          lineWidth: 0.5,
          marker: {
            enabled: false
          }
        },
        {
          name: 'Future Forecast',
          type: 'area',
          data: futureForecastData,
          color: 'rgba(59, 130, 246, 0.6)',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(59, 130, 246, 0.25)'],
              [1, 'rgba(59, 130, 246, 0.08)']
            ]
          },
          lineWidth: 0.5,
          marker: {
            enabled: false
          }
        }
      ]
    };
  }

  private updateEnergyForecastSummary(slots: any[]): void {
    const totalCapacity = slots.reduce((sum, slot) => sum + slot.available_watts, 0);
    const averageConfidence = slots.reduce((sum, slot) => sum + slot.confidence_percentage, 0) / slots.length;
    const uniqueProviders = [...new Set(slots.map(slot => slot.provider_name))];
    const uniqueSourceTypes = [...new Set(slots.map(slot => slot.energy_source_type))];
    
    this.energyForecastSummary = {
      totalSlots: slots.length,
      totalCapacity: totalCapacity,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
      providers: uniqueProviders,
      sourcesTypes: uniqueSourceTypes
    };
    
    console.log('Energy forecast summary updated:', this.energyForecastSummary);
  }

  private loadEnergyAvailabilityData(): void {
    console.log('Loading energy availability data...');
    
    this.energyAvailabilityService.getActiveEnergySlots(100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Energy availability data received:', response);
          
          if (response.status === 'success' && response.availability.length > 0) {
            this.updateEnergyForecastSummary(response.availability);
            this.energyAvailabilitySlots = response.availability;
          } else {
            console.warn('No energy availability data received');
          }
        },
        error: (error) => {
          console.error('Error loading energy availability data:', error);
        }
      });
  }

  // Deprecated: timeline chart removed
  private setupEnergyAvailabilityChart(slots: any[]): void {
    console.log('Setting up Energy Availability chart with slots:', slots);
    
    // Transform data for time series chart showing available watts over time
    const transformedData = this.energyAvailabilityService.transformAvailableEnergyData(slots);
    
    // Group by provider for different series
    const providerGroups = this.energyAvailabilityService.groupSlotsByProvider(slots);
    const colors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];
    
    const series: Highcharts.SeriesOptionsType[] = [];
    let colorIndex = 0;

    Object.keys(providerGroups).forEach(provider => {
      const providerSlots = providerGroups[provider];
      const color = colors[colorIndex % colors.length];
      
      // Create time range data for each slot (showing availability during the slot duration)
      const slotData: [number, number][] = [];
      
      providerSlots.forEach(slot => {
        const startTime = new Date(slot.slot_start_time).getTime();
        const endTime = new Date(slot.slot_end_time).getTime();
        
        // Add start point
        slotData.push([startTime, slot.available_watts]);
        // Add end point
        slotData.push([endTime, slot.available_watts]);
        // Add gap after slot (set to 0 to show no availability)
        if (slotData.length > 2) {
          slotData.push([endTime + 1000, 0]); // 1 second gap
        }
      });

      series.push({
        name: `${provider} - Available Energy`,
        type: 'line',
        data: slotData.sort((a, b) => a[0] - b[0]),
        color: color,
        lineWidth: 2,
        step: 'left', // Step chart to show slot duration
        marker: {
          enabled: false
        }
      });
      colorIndex++;
    });

    this.energyAvailabilityChartOptions = {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        zooming: {
          type: 'x'
        }
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Time'
        }
      },
      yAxis: {
        title: {
          text: 'Available Energy (W)'
        },
        min: 0
      },
      tooltip: {
        shared: true,
        formatter: function() {
          const date = new Date(this.x!);
          let tooltip = `<b>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</b><br/>`;
          
          this.points!.forEach(point => {
            if (point.y && point.y > 0) {
              tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toLocaleString()}W</b><br/>`;
            }
          });
          return tooltip;
        }
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        line: {
          states: {
            inactive: {
              opacity: 1
            }
          }
        }
      },
      series: series
    };
  }

  private setupEnergyProviderChart(_slots: any[]): void {}

  // Deprecated: inlined heatmap moved to standalone component
  private setupEnergyHeatmapChart(slots: any[]): void {
    console.log('Setting up Energy Heatmap chart with slots:', slots);
    
    // Group slots by day and time for heatmap
    const heatmapData: any[] = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['00:00-04:00', '04:00-08:00', '08:00-12:00', '12:00-16:00', '16:00-20:00', '20:00-24:00'];
    
    // Create a map to organize data
    const dataMap = new Map<string, number>();
    
    slots.forEach(slot => {
      const startDate = new Date(slot.slot_start_time);
      const endDate = new Date(slot.slot_end_time);
      
      // Get day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = startDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0
      
      // Get time slot index based on start hour
      const startHour = startDate.getHours();
      const timeSlotIndex = Math.floor(startHour / 4);
      
      const key = `${adjustedDay}-${timeSlotIndex}`;
      dataMap.set(key, slot.available_watts);
    });
    
    // Convert to heatmap format [x, y, value]
    for (let day = 0; day < 7; day++) {
      for (let timeSlot = 0; timeSlot < 6; timeSlot++) {
        const key = `${day}-${timeSlot}`;
        const value = dataMap.get(key) || 0;
        
        heatmapData.push([timeSlot, day, value]);
      }
    }
    
    this.energyHeatmapChartOptions = {
      chart: {
        type: 'heatmap',
        backgroundColor: 'transparent',
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1
      },
      title: {
        text: undefined
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: timeSlots,
        title: {
          text: 'Time Slots'
        },
        opposite: true
      },
      yAxis: {
        categories: dayNames,
        title: {
          text: 'Days of Week'
        },
        reversed: true
      },
      accessibility: {
        point: {
          descriptionFormatter: function(point: any) {
            return `${timeSlots[point.x]} on ${dayNames[point.y]}: ${point.value}W available energy`;
          }
        }
      },
      colorAxis: {
        min: 0,
        minColor: '#FFFBEB',
        maxColor: '#D97706',
        stops: [
          [0, '#FFFBEB'],   // amber-50
          [0.2, '#FEF3C7'], // amber-100
          [0.4, '#FDE68A'], // amber-200
          [0.6, '#FBBF24'], // amber-400
          [0.8, '#F59E0B'], // amber-500
          [1, '#D97706']    // amber-600
        ]
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
      },
      tooltip: {
        formatter: function(this: any) {
          const timeSlot = timeSlots[this.x];
          const day = dayNames[this.y];
          const value = this.value;
          
          return `<b>${day}</b><br/>
                  <b>${timeSlot}</b><br/>
                  Available Energy: <b>${value.toLocaleString()}W</b><br/>
                  (${(value / 1000).toFixed(1)}kW)`;
        }
      },
      series: [{
        name: 'Energy Availability',
        type: 'heatmap',
        data: heatmapData,
        dataLabels: {
          enabled: true,
          color: '#000000',
          formatter: function(this: any) {
            // For heatmap, the value is at this.point.value or this.value
            const value = this.point?.value || this.value || 0;
            if (value === 0) return '';
            return `${(value / 1000).toFixed(0)}kW`;
          },
          style: {
            textOutline: 'none',
            fontSize: '10px',
            fontWeight: 'bold'
          }
        }
      }]
    };
  }

  // Deprecated: alternate heatmap removed
  private setupNodeUtilizationHeatmapChart(slots: any[]): void {
    console.log('Setting up Node Utilization Heatmap (provider vs hour buckets) with slots:', slots);

    const providerGroups = this.energyAvailabilityService.groupSlotsByProvider(slots);
    const providerNames = Object.keys(providerGroups);
    const selectedProviders = providerNames.slice(0, 5);

    const hourBuckets = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

    const providerToSums: Record<string, number[]> = {};
    const providerToCounts: Record<string, number[]> = {};

    selectedProviders.forEach((provider) => {
      providerToSums[provider] = new Array(hourBuckets.length).fill(0);
      providerToCounts[provider] = new Array(hourBuckets.length).fill(0);
    });

    selectedProviders.forEach((provider) => {
      const pSlots = providerGroups[provider] || [];
      pSlots.forEach((slot: any) => {
        const startHour = new Date(slot.slot_start_time).getHours();
        const bucketHour = Math.floor(startHour / 2) * 2; // 0,2,4,...,22
        if (bucketHour === 0) {
          return; // skip 0 to match labels 2..22
        }
        const bucketIndex = hourBuckets.indexOf(bucketHour);
        if (bucketIndex >= 0) {
          providerToSums[provider][bucketIndex] += slot.available_watts || 0;
          providerToCounts[provider][bucketIndex] += 1;
        }
      });
    });

    const data: [number, number, number][] = [];
    selectedProviders.forEach((provider, yIndex) => {
      hourBuckets.forEach((h, xIndex) => {
        const count = providerToCounts[provider][xIndex];
        const sum = providerToSums[provider][xIndex];
        const value = count > 0 ? Math.round(sum / count) : 0;
        data.push([xIndex, yIndex, value]);
      });
    });

    this.nodeUtilizationHeatmapChartOptions = {
      chart: {
        type: 'heatmap',
        backgroundColor: 'transparent',
        marginTop: 20,
        marginBottom: 40
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: {
        categories: hourBuckets.map((h) => h.toString()),
        title: { text: undefined }
      },
      yAxis: {
        categories: selectedProviders,
        title: { text: undefined },
        reversed: false
      },
      legend: { enabled: false },
      colorAxis: {
        min: 0,
        minColor: '#FEF3C7',
        maxColor: '#F59E0B'
      },
      tooltip: {
        formatter: function(this: any) {
          const provider = this.series.yAxis.categories[this.point.y];
          const hourLabel = this.series.xAxis.categories[this.point.x];
          const value = this.point.value || 0;
          return `<b>${provider}</b><br/>Hour: <b>${hourLabel}:00</b><br/>Available: <b>${value.toLocaleString()}W</b>`;
        }
      },
      plotOptions: {
        series: {
          borderWidth: 2,
          borderColor: '#FFFFFF',
          dataLabels: { enabled: false }
        }
      },
      series: [{
        name: 'Availability',
        type: 'heatmap',
        data
      }]
    };
  }
}
