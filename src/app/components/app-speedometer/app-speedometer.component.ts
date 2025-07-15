import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-speedometer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-speedometer.component.html',
  styleUrls: ['./app-speedometer.component.scss'],
})
export class AppSpeedometerComponent implements OnChanges {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() unit = '%';
  @Input() label = '';
  @Input() size = 200;
  @Input() strokeWidth = 12;
  @Input() backgroundColor = '#e5e7eb';
  @Input() lowColor = '#10b981'; // green
  @Input() mediumColor = '#f59e0b'; // yellow
  @Input() highColor = '#ef4444'; // red
  @Input() lowThreshold = 50;
  @Input() highThreshold = 75;
  @Input() showLabels = false;
  @Input() animate = true;

  centerX = 0;
  centerY = 0;
  outerRadius = 0;
  displayValue = 0;

  startAngle = -Math.PI;
  endAngle = 0;

  ngOnChanges(): void {
    this.calculateDimensions();
    this.updateDisplayValue();
  }

  private calculateDimensions(): void {
    this.centerX = this.size / 2;
    this.centerY = this.size / 2;
    this.outerRadius = (this.size - this.strokeWidth) / 2;
  }

  private updateDisplayValue(): void {
    if (this.animate) {
      const startValue = this.displayValue;
      const endValue = Math.max(this.min, Math.min(this.max, this.value));
      const duration = 500;
      const steps = 30;
      const stepValue = (endValue - startValue) / steps;
      const stepTime = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          this.displayValue = endValue;
          clearInterval(timer);
        } else {
          this.displayValue = Math.round(startValue + stepValue * currentStep);
        }
      }, stepTime);
    } else {
      this.displayValue = Math.max(this.min, Math.min(this.max, this.value));
    }
  }

  getValueColor(): string {
    const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;

    if (percentage <= this.lowThreshold) {
      return this.lowColor;
    } else if (percentage <= this.highThreshold) {
      return this.mediumColor;
    } else {
      return this.highColor;
    }
  }

  getProgressAngle(): number {
    const percentage = (this.displayValue - this.min) / (this.max - this.min);
    return this.startAngle + percentage * Math.PI;
  }

  getArcPath(
    startAngle: number,
    endAngle: number,
    outerRadius: number
  ): string {
    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    const x1 = this.centerX + outerRadius * Math.cos(startAngle);
    const y1 = this.centerY + outerRadius * Math.sin(startAngle);
    const x2 = this.centerX + outerRadius * Math.cos(endAngle);
    const y2 = this.centerY + outerRadius * Math.sin(endAngle);

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  }
}
