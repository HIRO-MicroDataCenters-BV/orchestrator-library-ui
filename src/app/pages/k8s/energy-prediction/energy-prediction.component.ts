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
  templateUrl: './energy-prediction.component.html'
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
    
    // Generate comparison data (simulating past forecasts vs actual values)
    const comparisonData: { timestamp: number; actual: number; forecasted: number; }[] = [];
    
    // Create comparison data for the last 7 days
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = now - (dayOffset * 24 * 60 * 60 * 1000) + (hour * 60 * 60 * 1000);
        
        // Generate base consumption pattern
        const baseConsumption = 400; // Total cluster consumption
        const dailyPattern = Math.sin((hour / 24) * Math.PI * 2) * 80; // Daily variation
        const weeklyTrend = Math.sin((dayOffset / 7) * Math.PI) * 30; // Weekly trend
        
        // Actual consumption (with some randomness)
        const actualConsumption = baseConsumption + dailyPattern + weeklyTrend + (Math.random() - 0.5) * 40;
        
        // Forecasted consumption (with prediction error that varies over time)
        const predictionError = Math.sin((hour + dayOffset) / 5) * 25 + (Math.random() - 0.5) * 20;
        const forecastedConsumption = actualConsumption + predictionError;
        
        comparisonData.push({
          timestamp,
          actual: Math.max(0, actualConsumption),
          forecasted: Math.max(0, forecastedConsumption)
        });
      }
    }

    // Calculate accuracy metrics
    const accuracyData: [number, number][] = [];
    const errorData: [number, number][] = [];
    
    comparisonData.forEach(point => {
      const accuracy = Math.max(0, 100 - Math.abs(point.actual - point.forecasted) / point.actual * 100);
      const error = Math.abs(point.actual - point.forecasted);
      
      accuracyData.push([point.timestamp, accuracy]);
      errorData.push([point.timestamp, error]);
    });

    this.comparisonChartOptions = {
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
        title: {
          text: 'Time'
        }
      },
      yAxis: [{
        title: {
          text: 'Energy Consumption (W)',
          style: {
            color: '#666'
          }
        },
        labels: {
          style: {
            color: '#666'
          }
        }
      }, {
        title: {
          text: 'Forecast Accuracy (%)',
          style: {
            color: '#10b981'
          }
        },
        labels: {
          style: {
            color: '#10b981'
          }
        },
        opposite: true,
        min: 0,
        max: 100
      }],
      tooltip: {
        shared: true,
        formatter: function() {
          let tooltip = `<b>${new Date(this.x!).toLocaleString()}</b><br/>`;
          this.points!.forEach(point => {
            const suffix = point.series.name.includes('Accuracy') ? '%' : 'W';
            tooltip += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y?.toFixed(1)}${suffix}</b><br/>`;
          });
          return tooltip;
        }
      },
      legend: {
        enabled: true
      },
      series: [
        {
          name: 'Actual Consumption',
          type: 'spline',
          data: comparisonData.map(d => [d.timestamp, d.actual]),
          color: '#3b82f6',
          lineWidth: 1,
          marker: {
            enabled: false
          },
          yAxis: 0
        },
        {
          name: 'Forecasted Consumption',
          type: 'spline',
          data: comparisonData.map(d => [d.timestamp, d.forecasted]),
          color: '#f59e0b',
          dashStyle: 'ShortDot',
          lineWidth: 1,
          marker: {
            enabled: false
          },
          yAxis: 0
        },
        {
          name: 'Forecast Accuracy',
          type: 'spline',
          data: accuracyData,
          color: '#10b981',
          lineWidth: 1,
          marker: {
            enabled: false
          },
          yAxis: 1
        }
      ]
    };
  }
}
