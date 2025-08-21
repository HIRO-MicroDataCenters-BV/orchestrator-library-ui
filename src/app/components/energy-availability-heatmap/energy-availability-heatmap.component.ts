import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-energy-availability-heatmap',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  templateUrl: './energy-availability-heatmap.component.html',
  styleUrls: ['./energy-availability-heatmap.component.css']
})
export class EnergyAvailabilityHeatmapComponent implements OnInit, OnChanges {
  @Input() slots: any[] = [];
  chartOptions: Partial<Highcharts.Options> = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Dynamically import the heatmap module
        const heatmapModule = await import('highcharts/modules/heatmap');
        // Call the default export function with Highcharts
        if (heatmapModule.default && typeof heatmapModule.default === 'function') {
          (heatmapModule.default as any)(Highcharts);
        }
        this.buildChart();
      } catch (error) {
        console.error('Failed to load heatmap module:', error);
        // Build chart anyway, might work without heatmap
        this.buildChart();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slots'] && isPlatformBrowser(this.platformId)) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const timeSlots = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

    const dataMap = new Map<string, number>();

    (this.slots || []).forEach(slot => {
      const startDate = new Date(slot.slot_start_time);
      const dayOfWeek = startDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
      const startHour = startDate.getHours();
      const timeSlotIndex = Math.floor(startHour / 4);
      const key = `${adjustedDay}-${timeSlotIndex}`;
      dataMap.set(key, slot.available_watts || 0);
    });

    // Determine today's day index (Monday=0) and the current 4-hour time slot
    const now = new Date();
    const nowDay = now.getDay();
    const currentDayIndex = nowDay === 0 ? 6 : nowDay - 1;
    const currentSlotIndex = Math.floor(now.getHours() / 4);

    const heatmapData: any[] = [];
    for (let day = 0; day < 7; day++) {
      for (let timeSlot = 0; timeSlot < 6; timeSlot++) {
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


