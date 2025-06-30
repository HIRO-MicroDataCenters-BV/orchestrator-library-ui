import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValuePipe, NgFor, NgIf, DatePipe } from '@angular/common';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmInputDirective,
    TranslocoModule,
    KeyValuePipe,
    NgFor,
    NgIf,
    DatePipe,
  ],
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit {
  id: string | null = null;
  data = {};

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.data = history.state;
    console.log('State data:', this.data);
  }

  getValueType(value: unknown): string {
    if (typeof value === 'boolean') {
      return 'boolean';
    } else if (typeof value === 'number') {
      return 'number';
    } else if (this.isDate(value)) {
      return 'date';
    } else {
      return 'string';
    }
  }

  isDate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    // Test ISO date
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDateRegex.test(value)) {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }

    // Test other date formats
    if (value.includes('-') || value.includes('/')) {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date.getFullYear() > 1900;
    }

    return false;
  }
}
