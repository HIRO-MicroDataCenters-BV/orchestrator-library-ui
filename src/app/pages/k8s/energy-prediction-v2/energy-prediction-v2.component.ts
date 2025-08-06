import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil } from 'rxjs';
import { EnergyDataService } from '../../../shared/services/energy-data.service';
import { HlmSidebarService } from '../../../../../libs/ui/ui-sidebar-helm/src/lib/hlm-sidebar.service';

@Component({
  selector: 'app-energy-prediction-v2',
  standalone: true,
  imports: [
    CommonModule,
    HighchartsChartComponent,
  ],
  templateUrl: './energy-prediction-v2.component.html',
  styleUrl: './energy-prediction-v2.component.css'
})
export class EnergyPredictionV2Component implements OnInit, OnDestroy {

  comparisonChartOptions: Partial<Highcharts.Options> = {};
  
  private destroy$ = new Subject<void>();

  constructor(
    private energyDataService: EnergyDataService,
    public sidebarService: HlmSidebarService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.setupComparisonChart();
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
    console.debug(actualData);
    console.debug(previousForecastData);
    console.debug(futureForecastData);
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
              color: '#ff6b6b',
              fontSize: '10px'
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
}
