import { describe, it, expect } from 'vitest';
import { recommendRent } from '@/lib/rent-recommendation';

describe('Rent recommendation heuristic', () => {
  it('increases rent for high occupancy and marina location', () => {
    const result = recommendRent({
      base_rent_aed: 10000,
      unit_count: 100,
      occupied_units: 90,
      location: 'Dubai Marina',
    });

    expect(result.recommended_rent_aed).toBeGreaterThan(10000);
    expect(result.explanation).toMatch(/marina|occupancy/i);
  });

  it('decreases rent for low occupancy', () => {
    const result = recommendRent({
      base_rent_aed: 10000,
      unit_count: 100,
      occupied_units: 30,
      location: 'Remote Area',
    });

    expect(result.recommended_rent_aed).toBeLessThan(10000);
  });
});
