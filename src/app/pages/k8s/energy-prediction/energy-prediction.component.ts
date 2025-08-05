import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject } from 'rxjs';
import { HlmCardImports } from '@spartan-ng/ui-card-helm';
import { HlmSidebarService } from '../../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';

interface EnergyDataPoint {
  timestamp: number;
  actual?: number;
  predicted?: number;
  nodeName: string;
}

interface NodeEnergyData {
  nodeName: string;
  historical: EnergyDataPoint[];
  predictions: EnergyDataPoint[];
}

@Component({
  selector: 'app-energy-prediction',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartComponent,
    ...HlmCardImports
  ],
  templateUrl: './energy-prediction.component.html',
  styleUrl: './energy-prediction.component.css'
})
export class EnergyPredictionComponent implements OnInit, OnDestroy {
  Highcharts: typeof Highcharts = Highcharts;
  
  overviewChartOptions: Highcharts.Options = {};
  detailedChartOptions: Highcharts.Options = {};
  comparisonChartOptions: Highcharts.Options = {};
  
  private destroy$ = new Subject<void>();
  private mockData: NodeEnergyData[] = [];

  constructor(public sidebarService: HlmSidebarService) {}

  ngOnInit(): void {
    this.generateMockData();
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateMockData(): void {
    const nodeNames = ['master-node-01', 'worker-node-01', 'worker-node-02', 'worker-node-03'];
    const now = new Date().getTime();
    const hoursBack = 24;
    const hoursForward = 24;

    this.mockData = nodeNames.map(nodeName => {
      const historical: EnergyDataPoint[] = [];
      const predictions: EnergyDataPoint[] = [];

      // Generate historical data (last 24 hours)
      for (let i = hoursBack; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000);
        const baseConsumption = nodeName.includes('master') ? 150 : 100;
        const variation = Math.sin((timestamp / (60 * 60 * 1000)) * Math.PI / 12) * 30;
        const randomFactor = (Math.random() - 0.5) * 20;
        
        historical.push({
          timestamp,
          actual: Math.max(0, baseConsumption + variation + randomFactor),
          nodeName
        });
      }

      // Generate prediction data (next 24 hours)
      for (let i = 1; i <= hoursForward; i++) {
        const timestamp = now + (i * 60 * 60 * 1000);
        const baseConsumption = nodeName.includes('master') ? 150 : 100;
        const variation = Math.sin((timestamp / (60 * 60 * 1000)) * Math.PI / 12) * 25;
        const trendFactor = Math.sin((i / hoursForward) * Math.PI) * 10;
        
        predictions.push({
          timestamp,
          predicted: Math.max(0, baseConsumption + variation + trendFactor),
          nodeName
        });
      }

      return { nodeName, historical, predictions };
    });
  }

  private initializeCharts(): void {
    this.setupOverviewChart();
    this.setupDetailedChart();
    this.setupComparisonChart();
  }

  private setupOverviewChart(): void {
    const now = new Date().getTime();
    
    // Aggregate data for overview
    const aggregatedHistorical: [number, number][] = [];
    const aggregatedPredicted: [number, number][] = [];

    // Group by timestamp and sum energy consumption
    const timestampMap = new Map<number, number>();
    const predictionMap = new Map<number, number>();

    this.mockData.forEach(nodeData => {
      nodeData.historical.forEach(point => {
        const existing = timestampMap.get(point.timestamp) || 0;
        timestampMap.set(point.timestamp, existing + (point.actual || 0));
      });

      nodeData.predictions.forEach(point => {
        const existing = predictionMap.get(point.timestamp) || 0;
        predictionMap.set(point.timestamp, existing + (point.predicted || 0));
      });
    });

    // Convert to arrays
    Array.from(timestampMap.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([timestamp, value]) => {
        aggregatedHistorical.push([timestamp, value]);
      });

    Array.from(predictionMap.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([timestamp, value]) => {
        aggregatedPredicted.push([timestamp, value]);
      });

    this.overviewChartOptions = {
      chart: {
        type: 'spline',
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
        plotLines: [{
          color: '#ff6b6b',
          dashStyle: 'ShortDash',
          value: now,
          width: 2,
          label: {
            text: 'Now',
            style: {
              color: '#ff6b6b'
            }
          }
        }]
      },
      yAxis: {
        title: {
          text: 'Energy Consumption (W)'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: 'W'
      },
      legend: {
        enabled: true
      },
      series: [
        {
          name: 'Historical Usage',
          type: 'spline',
          data: aggregatedHistorical,
          color: '#4ade80',
          lineWidth: 1,
          marker: {
            enabled: false
          }
        },
        {
          name: 'Predicted Usage',
          type: 'spline',
          data: aggregatedPredicted,
          color: '#fbbf24',
          dashStyle: 'ShortDot',
          lineWidth: 1,
          marker: {
            enabled: false
          }
        }
      ]
    };
  }


  private setupDetailedChart(): void {
    const series: Highcharts.SeriesOptionsType[] = [];
    const now = new Date().getTime();

    this.mockData.forEach((nodeData, index) => {
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
      const color = colors[index % colors.length];

      // Historical data series
      series.push({
        name: `${nodeData.nodeName} (Historical)`,
        type: 'spline',
        data: nodeData.historical.map(point => [point.timestamp, point.actual || 0]),
        color: color,
        lineWidth: 1,
        marker: {
          enabled: false
        }
      });

      // Prediction data series
      series.push({
        name: `${nodeData.nodeName} (Predicted)`,
        type: 'spline',
        data: nodeData.predictions.map(point => [point.timestamp, point.predicted || 0]),
        color: color,
        dashStyle: 'ShortDot',
        lineWidth: 1,
        marker: {
          enabled: false
        }
      });
    });

    this.detailedChartOptions = {
      chart: {
        type: 'spline',
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
        plotLines: [{
          color: '#ff6b6b',
          dashStyle: 'ShortDash',
          value: now,
          width: 2,
          label: {
            text: 'Current Time',
            style: {
              color: '#ff6b6b'
            }
          }
        }]
      },
      yAxis: {
        title: {
          text: 'Energy Consumption (W)'
        }
      },
      tooltip: {
        shared: false,
        valueSuffix: 'W'
      },
      legend: {
        enabled: true
      },
      series: series
    };
  }

  private setupComparisonChart(): void {
    const now = new Date().getTime();
    
    // Generate actual data (last 24 hours up to now)
    const actualData: [number, number][] = [];
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000);
      const baseConsumption = 400; // Total cluster consumption
      const dailyPattern = Math.sin((timestamp / (60 * 60 * 1000)) * Math.PI / 12) * 80;
      const randomFactor = (Math.random() - 0.5) * 40;
      const actualConsumption = baseConsumption + dailyPattern + randomFactor;
      
      actualData.push([timestamp, Math.max(0, actualConsumption)]);
    }

    // Generate previous forecast data (what was predicted for the last 24 hours)
    const previousForecastData: [number, number][] = [];
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000);
      const baseConsumption = 400;
      const dailyPattern = Math.sin((timestamp / (60 * 60 * 1000)) * Math.PI / 12) * 70;
      const predictionError = Math.sin((timestamp / (60 * 60 * 1000)) / 3) * 25; // Some prediction variance
      const randomError = (Math.random() - 0.5) * 30; // Prediction uncertainty
      const forecastConsumption = baseConsumption + dailyPattern + predictionError + randomError;
      
      previousForecastData.push([timestamp, Math.max(0, forecastConsumption)]);
    }

    // Generate future forecast data (next 24 hours from now)
    const futureForecastData: [number, number][] = [];
    for (let i = 1; i <= 24; i++) {
      const timestamp = now + (i * 60 * 60 * 1000);
      const baseConsumption = 400;
      const dailyPattern = Math.sin((timestamp / (60 * 60 * 1000)) * Math.PI / 12) * 70;
      const trendFactor = Math.sin((i / 24) * Math.PI) * 20; // Slight trend
      const forecastConsumption = baseConsumption + dailyPattern + trendFactor;
      
      futureForecastData.push([timestamp, Math.max(0, forecastConsumption)]);
    }

    this.comparisonChartOptions = {
      chart: {
        type: 'line',
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
        },
        plotLines: [{
          color: '#ff6b6b',
          dashStyle: 'ShortDash',
          value: now,
          width: 2,
          label: {
            text: 'Now',
            style: {
              color: '#ff6b6b'
            }
          }
        }]
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
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          lineWidth: 1,
          marker: {
            enabled: false
          }
        },
        line: {
          lineWidth: 2,
          marker: {
            enabled: false
          }
        }
      },
      series: [
        {
          name: 'Actual Energy Consumption',
          type: 'line',
          data: actualData,
          color: '#3b82f6',
          lineWidth: 2,
          marker: {
            enabled: false
          }
        },
        {
          name: 'Previous Forecast (Historical)',
          type: 'area',
          data: previousForecastData,
          color: '#f59e0b',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(245, 158, 11, 0.4)'],
              [1, 'rgba(245, 158, 11, 0.1)']
            ]
          },
          lineWidth: 1,
          marker: {
            enabled: false
          }
        },
        {
          name: 'Future Forecast',
          type: 'area',
          data: futureForecastData,
          color: '#f59e0b',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, 'rgba(245, 158, 11, 0.4)'],
              [1, 'rgba(245, 158, 11, 0.1)']
            ]
          },
          lineWidth: 1,
          marker: {
            enabled: false
          }
        }
      ]
    };
  }
}
