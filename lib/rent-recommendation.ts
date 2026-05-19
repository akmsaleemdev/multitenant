import type { RentRecommendation } from './types';

interface RentInputs {
  base_rent_aed: number;
  unit_count: number;
  location: string | null;
  occupied_units: number;
}

/**
 * Explainable heuristic stub — NOT production ML.
 * Adjusts base rent by occupancy and marina proximity.
 */
export function recommendRent(inputs: RentInputs): RentRecommendation {
  const { base_rent_aed, unit_count, location, occupied_units } = inputs;
  const occupancyRate = unit_count > 0 ? occupied_units / unit_count : 0;

  let multiplier = 1;
  const reasons: string[] = [];

  if (occupancyRate >= 0.85) {
    multiplier += 0.05;
    reasons.push('high occupancy (≥85%)');
  } else if (occupancyRate < 0.5) {
    multiplier -= 0.03;
    reasons.push('low occupancy (<50%)');
  }

  const loc = (location ?? '').toLowerCase();
  if (loc.includes('marina')) {
    multiplier += 0.04;
    reasons.push('marina proximity premium');
  }
  if (loc.includes('creek')) {
    multiplier += 0.02;
    reasons.push('creek harbour demand');
  }

  const recommended = Math.round(base_rent_aed * multiplier);
  const pctChange = Math.round((multiplier - 1) * 100);
  const direction =
    pctChange === 0 ? 'unchanged' : pctChange > 0 ? `Increased ${pctChange}%` : `Decreased ${Math.abs(pctChange)}%`;

  const explanation =
    reasons.length > 0
      ? `${direction} due to ${reasons.join(' and ')}.`
      : 'No adjustment — baseline rent retained.';

  return {
    recommended_rent_aed: recommended,
    explanation,
    inputs: {
      base_rent_aed,
      unit_count,
      location,
      occupancy_rate: Math.round(occupancyRate * 100) / 100,
    },
  };
}
