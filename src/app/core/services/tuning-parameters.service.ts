import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { TuningParameterCreate, TuningParameterResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class TuningParametersService {
  private readonly apiService = inject(ApiService);

  /**
   * Create new tuning parameters
   * @param data Tuning parameter data
   */
  create(data: TuningParameterCreate): Observable<TuningParameterResponse> {
    if (!this.validateTuningParameters(data)) {
      return throwError(() => new Error('Invalid tuning parameters'));
    }

    return this.apiService.createTuningParameters(data);
  }

  /**
   * Get tuning parameters with pagination and optional date filtering
   * @param options Query options
   */
  getAll(options?: {
    skip?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<TuningParameterResponse[]> {
    const skip = options?.skip || 0;
    const limit = options?.limit || 100;

    return this.apiService.getTuningParameters(
      skip,
      limit,
      options?.startDate,
      options?.endDate
    );
  }

  /**
   * Get latest tuning parameters
   * @param limit Number of latest records to fetch
   */
  getLatest(limit: number = 10): Observable<TuningParameterResponse[]> {
    if (limit <= 0) {
      return throwError(() => new Error('Limit must be greater than 0'));
    }

    return this.apiService.getLatestTuningParameters(limit);
  }

  /**
   * Get tuning parameters with pagination
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   */
  getPaginated(page: number = 1, pageSize: number = 20): Observable<TuningParameterResponse[]> {
    if (page < 1 || pageSize < 1) {
      return throwError(() => new Error('Page and pageSize must be greater than 0'));
    }

    const skip = (page - 1) * pageSize;
    return this.getAll({ skip, limit: pageSize });
  }

  /**
   * Get tuning parameters within date range
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @param limit Optional limit for results
   */
  getByDateRange(
    startDate: string,
    endDate: string,
    limit?: number
  ): Observable<TuningParameterResponse[]> {
    if (!startDate || !endDate) {
      return throwError(() => new Error('Start date and end date are required'));
    }

    if (new Date(startDate) > new Date(endDate)) {
      return throwError(() => new Error('Start date must be before end date'));
    }

    return this.getAll({
      startDate,
      endDate,
      limit: limit || 100
    });
  }

  /**
   * Get tuning parameters for today
   */
  getToday(): Observable<TuningParameterResponse[]> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    return this.getByDateRange(startDate, endDate);
  }

  /**
   * Get tuning parameters for last N days
   * @param days Number of days to look back
   */
  getLastDays(days: number): Observable<TuningParameterResponse[]> {
    if (days <= 0) {
      return throwError(() => new Error('Days must be greater than 0'));
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getByDateRange(startDate.toISOString(), endDate.toISOString());
  }

  /**
   * Validate tuning parameters before creation
   * @param data Tuning parameter data
   */
  private validateTuningParameters(data: TuningParameterCreate): boolean {
    if (!data) {
      return false;
    }

    // Check if all required fields are present
    const requiredFields: (keyof TuningParameterCreate)[] = [
      'output_1', 'output_2', 'output_3', 'alpha', 'beta', 'gamma'
    ];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate numeric values
    const numericFields: (keyof TuningParameterCreate)[] = [
      'output_1', 'output_2', 'output_3', 'alpha', 'beta', 'gamma'
    ];

    for (const field of numericFields) {
      if (typeof data[field] !== 'number' || isNaN(data[field])) {
        console.error(`Invalid numeric value for field: ${field}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Create tuning parameters with validation
   * @param outputs Output values
   * @param coefficients Alpha, beta, gamma coefficients
   */
  createWithValidation(
    outputs: { output1: number; output2: number; output3: number },
    coefficients: { alpha: number; beta: number; gamma: number }
  ): Observable<TuningParameterResponse> {
    const data: TuningParameterCreate = {
      output_1: outputs.output1,
      output_2: outputs.output2,
      output_3: outputs.output3,
      alpha: coefficients.alpha,
      beta: coefficients.beta,
      gamma: coefficients.gamma
    };

    return this.create(data);
  }

  /**
   * Get statistics for tuning parameters
   * @param parameters Array of tuning parameters
   */
  getStatistics(parameters: TuningParameterResponse[]): {
    count: number;
    averages: {
      output1: number;
      output2: number;
      output3: number;
      alpha: number;
      beta: number;
      gamma: number;
    };
    ranges: {
      output1: { min: number; max: number };
      output2: { min: number; max: number };
      output3: { min: number; max: number };
      alpha: { min: number; max: number };
      beta: { min: number; max: number };
      gamma: { min: number; max: number };
    };
  } {
    if (!parameters || parameters.length === 0) {
      return {
        count: 0,
        averages: {
          output1: 0, output2: 0, output3: 0,
          alpha: 0, beta: 0, gamma: 0
        },
        ranges: {
          output1: { min: 0, max: 0 },
          output2: { min: 0, max: 0 },
          output3: { min: 0, max: 0 },
          alpha: { min: 0, max: 0 },
          beta: { min: 0, max: 0 },
          gamma: { min: 0, max: 0 }
        }
      };
    }

    const count = parameters.length;

    // Calculate averages
    const sums = parameters.reduce((acc, param) => ({
      output1: acc.output1 + param.output_1,
      output2: acc.output2 + param.output_2,
      output3: acc.output3 + param.output_3,
      alpha: acc.alpha + param.alpha,
      beta: acc.beta + param.beta,
      gamma: acc.gamma + param.gamma
    }), {
      output1: 0, output2: 0, output3: 0,
      alpha: 0, beta: 0, gamma: 0
    });

    const averages = {
      output1: sums.output1 / count,
      output2: sums.output2 / count,
      output3: sums.output3 / count,
      alpha: sums.alpha / count,
      beta: sums.beta / count,
      gamma: sums.gamma / count
    };

    // Calculate ranges
    const ranges = {
      output1: {
        min: Math.min(...parameters.map(p => p.output_1)),
        max: Math.max(...parameters.map(p => p.output_1))
      },
      output2: {
        min: Math.min(...parameters.map(p => p.output_2)),
        max: Math.max(...parameters.map(p => p.output_2))
      },
      output3: {
        min: Math.min(...parameters.map(p => p.output_3)),
        max: Math.max(...parameters.map(p => p.output_3))
      },
      alpha: {
        min: Math.min(...parameters.map(p => p.alpha)),
        max: Math.max(...parameters.map(p => p.alpha))
      },
      beta: {
        min: Math.min(...parameters.map(p => p.beta)),
        max: Math.max(...parameters.map(p => p.beta))
      },
      gamma: {
        min: Math.min(...parameters.map(p => p.gamma)),
        max: Math.max(...parameters.map(p => p.gamma))
      }
    };

    return { count, averages, ranges };
  }
}
