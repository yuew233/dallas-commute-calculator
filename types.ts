export interface Inputs {
  // Commute Basics
  daysInOffice: number; // Days per week
  oneWayDistance: number; // Miles
  startMonth: number; // 1-12, Month of purchase/start
  
  // Time Off (Annual)
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
  annualPassPrice: number; // $ per FULL year (Reference Rate)
  dailyTicketPrice: number; // $ per day (e.g. 6)
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
    passCost: number; // Used for Annual Pass
    ticketCost: number; // Used for Daily Tickets
    taxSavings: number;
  };
  commuteDays: number;
}

export interface ComparisonResult {
  drivingOnly: CostBreakdown;
  dartOnly: CostBreakdown;
  prepaidDaily: CostBreakdown;
  hybrid: CostBreakdown;        // Strategy A: Annual Pass + Driving
  hybridPrepaid: CostBreakdown; // Strategy B: Prepaid Tickets + Driving
  actualCommuteDays: number;
  periodLabel: string;
  monthsRemaining: number;
}