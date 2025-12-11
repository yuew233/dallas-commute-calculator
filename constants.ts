import { Inputs } from './types';

export const DEFAULT_INPUTS: Inputs = {
  daysInOffice: 5,
  oneWayDistance: 20,
  
  ptoDays: 15,
  holidays: 10,
  sickDays: 5,

  gasPrice: 3.10, // Average Dallas price placeholder
  mpg: 25,
  monthlyParking: 50,
  tollsPerDay: 0,
  maintenancePerMile: 0.09, // AAA average roughly 9-10 cents for maintenance/tires
  
  annualPassPrice: 960, // Approximate corporate rate, user can edit
  usePreTaxBenefit: true,
  taxRate: 25, // Conservative estimate for combined Fed/State/FICA effectiveness

  hybridDriveDays: 0, // Default to full DART in hybrid view initially
};

export const WEEKS_PER_YEAR = 52;
export const WORK_DAYS_PER_WEEK = 5;