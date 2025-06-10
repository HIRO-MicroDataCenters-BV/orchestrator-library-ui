import { Component, OnInit } from '@angular/core';
import { AppTableComponent } from '../../../components/app-table/app-table.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-clusters',
  standalone: true,
  imports: [AppTableComponent, TranslocoModule],
  templateUrl: './clusters.component.html'
})
export class ClustersComponent implements OnInit {
  clusters = [];
  
  ngOnInit() {
  }
}