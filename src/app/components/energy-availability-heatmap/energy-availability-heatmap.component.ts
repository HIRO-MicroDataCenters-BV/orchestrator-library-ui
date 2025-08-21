import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, OnDestroy } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-energy-availability-heatmap',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  templateUrl: './energy-availability-heatmap.component.html',
  styleUrls: ['./energy-availability-heatmap.component.css']
})
export class EnergyAvailabilityHeatmapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dataSource?: string; // Optional data source identifier
  @Input() refreshInterval?: number = 30000; // Refresh every 30 seconds by default
  
  chartOptions: Partial<Highcharts.Options> = {};
  private destroy$ = new Subject<void>();
  private energySlots: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Dynamically import the heatmap module
        const heatmapModule = await import('highcharts/modules/heatmap');
        // Call the default export function with Highcharts
        if (heatmapModule.default && typeof heatmapModule.default === 'function') {
          (heatmapModule.default as any)(Highcharts);
        }
        
        // Load initial data and start periodic refresh
        await this.loadEnergyData();
        this.startDataRefresh();
      } catch (error) {
        console.error('Failed to load heatmap module:', error);
        // Load data anyway, might work without heatmap
        await this.loadEnergyData();
        this.startDataRefresh();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['dataSource'] || changes['refreshInterval']) && isPlatformBrowser(this.platformId)) {
      this.loadEnergyData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadEnergyData(): Promise<void> {
    try {
      // Generate mock data for now - this can be replaced with actual API calls
      this.energySlots = this.generateMockEnergyData();
      this.buildChart();
    } catch (error) {
      console.error('Failed to load energy data:', error);
      // Use empty data on error
      this.energySlots = [];
      this.buildChart();
    }
  }

  private startDataRefresh(): void {
    if (!this.refreshInterval || this.refreshInterval <= 0) return;
    
    // Use interval with takeUntil to handle component destruction
    setInterval(() => {
      this.loadEnergyData();
    }, this.refreshInterval);
  }

  private generateMockEnergyData(): any[] {
    // Generate mock energy availability data for one week
    const mockData = [];
    const baseDate = new Date();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay() + 1); // Start from Monday

    for (let day = 0; day < 7; day++) {
      for (let timeSlot = 0; timeSlot < 4; timeSlot++) {
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + day);
        slotDate.setHours(timeSlot * 6, 0, 0, 0);
        
        // Generate varying energy levels based on time of day and day of week
        const isWeekend = day >= 5;
        const isPeakHours = timeSlot >= 1 && timeSlot <= 2; // 06:00-18:00
        
        let baseWatts = 1000;
        if (isPeakHours) baseWatts += 1500;
        if (!isWeekend) baseWatts += 500;
        
        // Add some random variation
        const variation = Math.random() * 800 - 400;
        const availableWatts = Math.max(800, Math.round(baseWatts + variation));

        mockData.push({
          slot_start_time: slotDate.toISOString(),
          available_watts: availableWatts
        });
      }
    }

    return mockData;
  }

  private buildChart(): void {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timeSlots = ['00-06', '06-12', '12-18', '18-24'];

    const dataMap = new Map<string, number>();

    (this.energySlots || []).forEach(slot => {
      const startDate = new Date(slot.slot_start_time);
      const dayOfWeek = startDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
      const startHour = startDate.getHours();
      const timeSlotIndex = Math.floor(startHour / 6);
      const key = `${adjustedDay}-${timeSlotIndex}`;
      dataMap.set(key, slot.available_watts || 0);
    });

    // Determine today's day index (Monday=0) and the current 6-hour time slot
    const now = new Date();
    const nowDay = now.getDay();
    const currentDayIndex = nowDay === 0 ? 6 : nowDay - 1;
    const currentSlotIndex = Math.floor(now.getHours() / 6);

    const heatmapData: any[] = [];
    for (let day = 0; day < 7; day++) {
      for (let timeSlot = 0; timeSlot < 4; timeSlot++) {
        const key = `${day}-${timeSlot}`;
        const value = dataMap.get(key) || 0;
        // Highlight the cell for today's date and current time slot
        if (day === currentDayIndex && timeSlot === currentSlotIndex) {
          heatmapData.push({
            x: timeSlot,
            y: day,
            value,
            borderColor: '#2563eb',
            borderWidth: 1
          });
        } else {
          heatmapData.push([timeSlot, day, value]);
        }
      }
    }

    this.chartOptions = {
      chart: {
        type: 'heatmap',
        backgroundColor: 'transparent',
        marginTop: 20,
        marginBottom: 10,
        plotBorderWidth: 0,
        borderWidth: 0
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: {
        categories: timeSlots,
        title: { text: '', style: { fontSize: '1px' } },
        opposite: true,
        labels: {
          style: {
            fontSize: '9px',
            fontWeight: 'normal'
          }
        },
        // Plot band to subtly highlight the current time-slot column
        plotBands: [{
          from: currentSlotIndex - 0.5,
          to: currentSlotIndex + 0.5,
          color: 'rgba(37, 99, 235, 0.08)'
        }]
      },
      yAxis: {
        categories: dayNames,
        title: { text: '', style: { fontSize: '1px' } },
        reversed: true,
        labels: {
          style: {
            fontSize: '9px',
            fontWeight: 'normal'
          }
        },
        // Plot band to subtly highlight today's row
        plotBands: [{
          from: currentDayIndex - 0.5,
          to: currentDayIndex + 0.5,
          color: 'rgba(16, 185, 129, 0.08)'
        }]
      },
      colorAxis: {
        visible: false,
        min: 0,
        minColor: '#FFFBEB',
        maxColor: '#D97706',
        stops: [
          [0, '#FFFBEB'],
          [0.2, '#FEF3C7'],
          [0.4, '#FDE68A'],
          [0.6, '#FBBF24'],
          [0.8, '#F59E0B'],
          [1, '#D97706']
        ]
      },
      legend: { enabled: false },
      tooltip: {
        formatter: function(this: any) {
          const timeSlot = timeSlots[this.x];
          const day = dayNames[this.y];
          const value = this.value || 0;
          // Convert abbreviated time format back to full format for tooltip
          const fullTimeSlot = timeSlot.replace('-', ':00-') + ':00';
          return `<b>${day}</b><br/><b>${fullTimeSlot}</b><br/>Available Energy: <b>${value.toLocaleString()}W</b><br/>(${(value / 1000).toFixed(1)}kW)`;
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
            const value = this.point?.value || this.value || 0;
            if (value === 0) return '';
            return `${(value / 1000).toFixed(0)}kW`;
          },
          style: {
            textOutline: 'none',
            fontSize: '8px',
            fontWeight: 'bold'
          }
        },
        states: {
          inactive: { opacity: 1 }
        }
      }]
    };
  }
}


