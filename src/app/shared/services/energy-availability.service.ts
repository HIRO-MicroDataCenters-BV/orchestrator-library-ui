import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnergyAvailabilityResponse {
  status: string;
  filters: {
    provider_name: string | null;
    location: string | null;
    energy_source_type: string | null;
    hours_ahead: number | null;
    is_active: boolean;
    limit: number;
  };
  availability: EnergyAvailabilitySlot[];
}

export interface EnergyAvailabilitySlot {
  id: number;
  provider_name: string;
  location: string;
  energy_source_type: string;
  slot_start_time: string;
  slot_end_time: string;
  available_watts: number;
  guaranteed_minimum_watts: number;
  potential_maximum_watts: number;
  confidence_percentage: number;
  weather_dependency: boolean;
  forecast_date: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnergyAvailabilityService {
  private readonly baseUrl = 'http://0.0.0.0:8086/api/metrics/energy-availability/';

  constructor(private http: HttpClient) { }

  /**
   * Fetch energy availability data from the API
   * @param limit - Number of records to fetch (default: 100)
   * @param isActive - Filter by active status (default: true)
   * @param providerName - Optional provider name filter
   * @param location - Optional location filter
   * @param energySourceType - Optional energy source type filter
   * @param hoursAhead - Optional hours ahead filter
   * @returns Observable<EnergyAvailabilityResponse>
   */
  getEnergyAvailability(
    limit = 100, 
    isActive = true, 
    providerName?: string,
    location?: string,
    energySourceType?: string,
    hoursAhead?: number
  ): Observable<EnergyAvailabilityResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('is_active', isActive.toString());
    
    if (providerName) {
      params = params.set('provider_name', providerName);
    }
    
    if (location) {
      params = params.set('location', location);
    }
    
    if (energySourceType) {
      params = params.set('energy_source_type', energySourceType);
    }
    
    if (hoursAhead !== undefined) {
      params = params.set('hours_ahead', hoursAhead.toString());
    }

    return this.http.get<EnergyAvailabilityResponse>(this.baseUrl, { params });
  }

  /**
   * Get energy availability for a specific provider
   * @param providerName - Provider name to filter by
   * @param limit - Number of records to fetch
   * @returns Observable<EnergyAvailabilityResponse>
   */
  getProviderEnergyAvailability(providerName: string, limit = 100): Observable<EnergyAvailabilityResponse> {
    return this.getEnergyAvailability(limit, true, providerName);
  }

  /**
   * Get energy availability by energy source type
   * @param energySourceType - Energy source type (e.g., 'Solar', 'Wind')
   * @param limit - Number of records to fetch
   * @returns Observable<EnergyAvailabilityResponse>
   */
  getEnergyBySourceType(energySourceType: string, limit = 100): Observable<EnergyAvailabilityResponse> {
    return this.getEnergyAvailability(limit, true, undefined, undefined, energySourceType);
  }

  /**
   * Get all active energy availability slots
   * @param limit - Number of records to fetch
   * @returns Observable<EnergyAvailabilityResponse>
   */
  getActiveEnergySlots(limit = 100): Observable<EnergyAvailabilityResponse> {
    return this.getEnergyAvailability(limit, true);
  }

  /**
   * Transform energy slots for time series chart display
   * @param slots - Array of EnergyAvailabilitySlot
   * @returns Array of chart data points
   */
  transformSlotsForChart(slots: EnergyAvailabilitySlot[]): Array<{
    startTime: number;
    endTime: number;
    availableWatts: number;
    guaranteedWatts: number;
    maxWatts: number;
    confidence: number;
    provider: string;
    sourceType: string;
  }> {
    return slots.map(slot => ({
      startTime: new Date(slot.slot_start_time).getTime(),
      endTime: new Date(slot.slot_end_time).getTime(),
      availableWatts: slot.available_watts,
      guaranteedWatts: slot.guaranteed_minimum_watts,
      maxWatts: slot.potential_maximum_watts,
      confidence: slot.confidence_percentage,
      provider: slot.provider_name,
      sourceType: slot.energy_source_type
    })).sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Get available energy data for chart display
   * @param slots - Array of EnergyAvailabilitySlot
   * @returns Array of chart data points with time and available watts
   */
  transformAvailableEnergyData(slots: EnergyAvailabilitySlot[]): Array<{
    timestamp: number;
    value: number;
    provider: string;
  }> {
    return slots.map(slot => ({
      timestamp: new Date(slot.slot_start_time).getTime(),
      value: slot.available_watts,
      provider: slot.provider_name
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get confidence percentage data for chart display
   * @param slots - Array of EnergyAvailabilitySlot
   * @returns Array of chart data points with confidence percentages
   */
  transformConfidenceData(slots: EnergyAvailabilitySlot[]): Array<{
    timestamp: number;
    confidence: number;
    provider: string;
    sourceType: string;
  }> {
    return slots.map(slot => ({
      timestamp: new Date(slot.slot_start_time).getTime(),
      confidence: slot.confidence_percentage,
      provider: slot.provider_name,
      sourceType: slot.energy_source_type
    })).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Group energy slots by provider
   * @param slots - Array of EnergyAvailabilitySlot
   * @returns Object with providers as keys and their slots as values
   */
  groupSlotsByProvider(slots: EnergyAvailabilitySlot[]): { [provider: string]: EnergyAvailabilitySlot[] } {
    return slots.reduce((groups, slot) => {
      const provider = slot.provider_name;
      if (!groups[provider]) {
        groups[provider] = [];
      }
      groups[provider].push(slot);
      return groups;
    }, {} as { [provider: string]: EnergyAvailabilitySlot[] });
  }

  /**
   * Group energy slots by energy source type
   * @param slots - Array of EnergyAvailabilitySlot
   * @returns Object with energy source types as keys and their slots as values
   */
  groupSlotsBySourceType(slots: EnergyAvailabilitySlot[]): { [sourceType: string]: EnergyAvailabilitySlot[] } {
    return slots.reduce((groups, slot) => {
      const sourceType = slot.energy_source_type;
      if (!groups[sourceType]) {
        groups[sourceType] = [];
      }
      groups[sourceType].push(slot);
      return groups;
    }, {} as { [sourceType: string]: EnergyAvailabilitySlot[] });
  }
}