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

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Partial<Highcharts.Options> = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('highcharts/modules/heatmap')
        .then((m) => (m as any).default(Highcharts))
        .then(() => this.buildChart())
        .catch((err) => console.error('Failed to load Highcharts heatmap module:', err));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slots'] && isPlatformBrowser(this.platformId)) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['00:00-04:00', '04:00-08:00', '08:00-12:00', '12:00-16:00', '16:00-20:00', '20:00-24:00'];

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
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: {
        categories: timeSlots,
        title: { text: 'Time Slots' },
        opposite: true,
        // Plot band to subtly highlight the current time-slot column
        plotBands: [{
          from: currentSlotIndex - 0.5,
          to: currentSlotIndex + 0.5,
          color: 'rgba(37, 99, 235, 0.08)'
        }]
      },
      yAxis: {
        categories: dayNames,
        title: { text: 'Days of Week' },
        reversed: true,
        // Plot band to subtly highlight today's row
        plotBands: [{
          from: currentDayIndex - 0.5,
          to: currentDayIndex + 0.5,
          color: 'rgba(16, 185, 129, 0.08)'
        }]
      },
      colorAxis: {
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
          const value = this.value || 0;
          return `<b>${day}</b><br/><b>${timeSlot}</b><br/>Available Energy: <b>${value.toLocaleString()}W</b><br/>(${(value / 1000).toFixed(1)}kW)`;
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
            fontSize: '10px',
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


