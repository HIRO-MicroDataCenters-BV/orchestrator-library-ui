import {
  Component,
  Input,
  OnChanges,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  @Input() lowColor = '#22c55e'; // brighter green
  @Input() mediumColor = '#eab308'; // more saturated yellow
  @Input() highColor = '#dc2626'; // deeper red
  @Input() lowThreshold = 30;
  @Input() highThreshold = 60;
  @Input() showLabels = false;
  @Input() animate = true;

  centerX = 0;
  centerY = 0;
  outerRadius = 0;
  displayValue = 0;
  currentColor = '#10b981';
  circumference = 0;
  strokeDashoffset = 0;

  startAngle = -Math.PI;
  endAngle = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // Disable animation for SSR
    if (!isPlatformBrowser(this.platformId)) {
      this.animate = false;
    }
  }

  ngOnChanges(): void {
    this.calculateDimensions();
    this.updateDisplayValue();
  }

  private calculateDimensions(): void {
    this.centerX = this.size / 2;
    this.centerY = this.size / 2;
    this.outerRadius = (this.size - this.strokeWidth) / 2;
    // Calculate circumference for half circle
    this.circumference = Math.PI * this.outerRadius;
    // Initialize with full offset (empty state)
    if (this.strokeDashoffset === 0) {
      this.strokeDashoffset = this.circumference;
    }
  }

  private updateDisplayValue(): void {
    const targetValue = Math.max(this.min, Math.min(this.max, this.value));

    if (
      this.animate &&
      isPlatformBrowser(this.platformId) &&
      typeof requestAnimationFrame !== 'undefined' &&
      typeof performance !== 'undefined'
    ) {
      const startValue = this.displayValue;
      const duration = 800;
      const startTime = performance.now();

      // Initialize starting values - start from empty if this is the first animation
      const startOffset =
        this.displayValue === 0 ? this.circumference : this.strokeDashoffset;
      const targetPercentage = (targetValue - this.min) / (this.max - this.min);
      const targetOffset =
        this.circumference - targetPercentage * this.circumference;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easing function for smooth animation
        const easeProgress = this.easeInOutCubic(progress);

        // Animate display value
        this.displayValue = Math.round(
          startValue + (targetValue - startValue) * easeProgress
        );

        // Animate stroke offset
        this.strokeDashoffset =
          startOffset + (targetOffset - startOffset) * easeProgress;

        // Update color
        this.currentColor = this.getValueColorForValue(this.displayValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final values are exact
          this.displayValue = targetValue;
          this.strokeDashoffset = targetOffset;
          this.currentColor = this.getValueColorForValue(targetValue);
        }
      };

      try {
        requestAnimationFrame(animate);
      } catch {
        // Fallback if requestAnimationFrame fails
        this.displayValue = targetValue;
        this.currentColor = this.getValueColorForValue(targetValue);
        this.updateStrokeDashoffset(targetValue);
      }
    } else {
      // No animation or SSR environment - set values directly
      this.displayValue = targetValue;
      this.currentColor = this.getValueColorForValue(targetValue);
      this.updateStrokeDashoffset(targetValue);
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private updateStrokeDashoffset(value: number): void {
    const percentage = (value - this.min) / (this.max - this.min);
    this.strokeDashoffset =
      this.circumference - percentage * this.circumference;
  }

  getValueColor(): string {
    return this.currentColor;
  }

  getValueColorForValue(value: number): string {
    const percentage = ((value - this.min) / (this.max - this.min)) * 100;

    if (percentage <= this.lowThreshold) {
      return this.lowColor;
    } else if (percentage <= this.highThreshold) {
      // More aggressive transition to yellow - make it more noticeable
      const ratio =
        (percentage - this.lowThreshold) /
        (this.highThreshold - this.lowThreshold);
      // Use exponential curve for faster transition to warning color
      const exponentialRatio = Math.pow(ratio, 0.7);
      return this.interpolateColor(
        this.lowColor,
        this.mediumColor,
        exponentialRatio
      );
    } else {
      // Very aggressive transition to red for high load
      const ratio = Math.min(
        1,
        (percentage - this.highThreshold) / (100 - this.highThreshold)
      );
      // Use power curve for more immediate red transition
      const exponentialRatio = Math.pow(ratio, 0.5);
      return this.interpolateColor(
        this.mediumColor,
        this.highColor,
        exponentialRatio
      );
    }
  }

  private interpolateColor(
    color1: string,
    color2: string,
    ratio: number
  ): string {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  getProgressAngle(): number {
    const percentage = (this.displayValue - this.min) / (this.max - this.min);
    return this.startAngle + percentage * Math.PI;
  }

  getStrokeDasharray(): string {
    return `${this.circumference} ${this.circumference}`;
  }

  getStrokeDashoffset(): number {
    return this.strokeDashoffset;
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
