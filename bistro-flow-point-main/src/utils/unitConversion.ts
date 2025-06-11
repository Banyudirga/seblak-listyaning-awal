// Define conversion factors for different measurement units
export type UnitConversionMap = {
  [key: string]: {
    [key: string]: number;
  };
};

// Conversion factors between units
// The key is the source unit, and the value is an object mapping target units to conversion factors
export const unitConversions: UnitConversionMap = {
  // Weight conversions
  'kg': {
    'g': 1000,
    'kg': 1,
  },
  'g': {
    'kg': 0.001,
    'g': 1,
  },
  // Volume conversions
  'l': {
    'ml': 1000,
    'l': 1,
  },
  'ml': {
    'l': 0.001,
    'ml': 1,
  },
  'liter': {
    'ml': 1000,
    'milliliter': 1000,
    'liter': 1,
    'l': 1,
  },
  'milliliter': {
    'liter': 0.001,
    'l': 0.001,
    'ml': 1,
    'milliliter': 1,
  },
  // Keep the same unit as is
  'buah': { 'buah': 1 },
  'butir': { 'butir': 1 },
  'lembar': { 'lembar': 1 },
  'botol': { 'botol': 1 },
  'pcs': { 'pcs': 1 },
};

// Normalize unit names for consistency
export const normalizeUnit = (unit: string): string => {
  const unitLower = unit.toLowerCase().trim();
  
  // Map common variations
  const unitMap: { [key: string]: string } = {
    'kilogram': 'kg',
    'gram': 'g',
    'liter': 'l',
    'litre': 'l',
    'milliliter': 'ml',
    'millilitre': 'ml',
    'pieces': 'pcs',
    'piece': 'pcs',
  };
  
  return unitMap[unitLower] || unitLower;
};

// Convert between different units
export const convertUnit = (
  value: number,
  fromUnit: string,
  toUnit: string
): number | null => {
  const normalizedFromUnit = normalizeUnit(fromUnit);
  const normalizedToUnit = normalizeUnit(toUnit);
  
  // If units are the same, no conversion needed
  if (normalizedFromUnit === normalizedToUnit) {
    return value;
  }
  
  // Check if conversion exists
  if (
    unitConversions[normalizedFromUnit] &&
    unitConversions[normalizedFromUnit][normalizedToUnit]
  ) {
    return value * unitConversions[normalizedFromUnit][normalizedToUnit];
  }
  
  // If no direct conversion found, log error and return null
  console.error(`No conversion found from ${normalizedFromUnit} to ${normalizedToUnit}`);
  return null;
};
