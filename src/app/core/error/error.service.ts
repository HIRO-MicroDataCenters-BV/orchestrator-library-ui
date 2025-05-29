import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";

export interface ErrorResponse {
  status: number;
  message: string;
  details?: any;
}

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<ErrorResponse | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private router: Router) {}

  handleError(error: any): void {
    const errorResponse: ErrorResponse = {
      status: error.status || 500,
      message: error.error?.message || "An unexpected error occurred",
      details: error.error?.details,
    };

    this.errorSubject.next(errorResponse);

    // Navigate to error page if status is not 401 (unauthorized)
    if (errorResponse.status !== 401) {
      this.router.navigate(["/error"], {
        queryParams: {
          status: errorResponse.status,
          message: errorResponse.message,
        },
      });
    }
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}
