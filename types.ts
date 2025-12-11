export interface Inputs {
  // Commute Basics
  daysInOffice: number; // Days per week
  oneWayDistance: number; // Miles
  
  // Time Off
  ptoDays: number;
  holidays: number;
  sickDays: number;

  // Driving Costs
  gasPrice: number; // $ per gallon
  mpg: number; // Miles per gallon
  monthlyParking: number; // $ per month
  tollsPerDay: number; // $ per round trip
  maintenancePerMile: number; // $ per mile (tires, oil, wear)
  
  // DART Costs
  annualPassPrice: number; // $ per year
  usePreTaxBenefit: boolean;
  taxRate: number; // Percentage (marginal tax rate for savings)

  // Hybrid Model
  hybridDriveDays: number; // Of the office days, how many are driving?
}

export interface CostBreakdown {
  totalCost: number;
  breakdown: {
    fuel: number;
    parking: number;
    tolls: number;
    maintenance: number;
    passCost: number;
    taxSavings: number;
  };
  commuteDays: number;
}

export interface ComparisonResult {
  drivingOnly: CostBreakdown;
  dartOnly: CostBreakdown;
  hybrid: CostBreakdown;
  actualCommuteDays: number;
}