import { Component } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmCardDirective } from '@spartan-ng/ui-card-helm';
import { HlmTableDirective } from '@spartan-ng/ui-table-helm';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div hlmCard class="p-6">
          <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Last Login</span>
              <span>2 hours ago</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Books Checked Out</span>
              <span>3</span>
            </div>
          </div>
        </div>

        <div hlmCard class="p-6">
          <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
          <div class="space-y-4">
            <button hlmBtn variant="default" class="w-full">
              Browse Books
            </button>
            <button hlmBtn variant="outline" class="w-full">
              View History
            </button>
          </div>
        </div>

        <div hlmCard class="p-6">
          <h2 class="text-xl font-semibold mb-4">Due Soon</h2>
          <table hlmTable class="w-full">
            <thead>
              <tr>
                <th>Book</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The Great Gatsby</td>
                <td>Tomorrow</td>
              </tr>
              <tr>
                <td>1984</td>
                <td>In 3 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [HlmButtonDirective, HlmCardDirective, HlmTableDirective],
})
export class DashboardComponent {}
