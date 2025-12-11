import { Inputs, ComparisonResult, CostBreakdown } from '../types';
import { WEEKS_PER_YEAR } from '../constants';

export const calculateCosts = (inputs: Inputs): ComparisonResult => {
  const {
    daysInOffice,
    oneWayDistance,
    ptoDays,
    holidays,
    sickDays,
    gasPrice,
    mpg,
    monthlyParking,
    tollsPerDay,
    maintenancePerMile,
    annualPassPrice,
    usePreTaxBenefit,
    taxRate,
    hybridDriveDays
  } = inputs;

  // 1. Calculate Total Commuting Days per Year
  // Total potential work days
  const totalWorkDaysAvailable = (WEEKS_PER_YEAR * 5) - holidays - ptoDays - sickDays;
  
  // Actual days traveling to office (adjusted for user's weekly schedule)
  // Ratio of days in office vs 5 day work week
  const attendanceRatio = daysInOffice / 5;
  const actualCommuteDays = Math.round(totalWorkDaysAvailable * attendanceRatio);

  // Helper to calculate Driving Cost for N days
  const calculateDrivingCost = (daysDriving: number, includeFixedParking: boolean): CostBreakdown => {
    const totalMiles = daysDriving * oneWayDistance * 2;
    const gallons = totalMiles / mpg;
    const fuelCost = gallons * gasPrice;
    const tollCost = daysDriving * tollsPerDay;
    const maintenanceCost = totalMiles * maintenancePerMile;
    
    // Parking: If you pay monthly, you pay it regardless of usage usually, unless specified otherwise.
    // For the sake of this calculator, we assume the $50/mo is a sunk cost if you plan to drive regularly.
    // However, if daysDriving is 0, we assume you cancel the spot.
    const parkingCost = includeFixedParking ? (monthlyParking * 12) : 0;

    return {
      totalCost: fuelCost + tollCost + maintenanceCost + parkingCost,
      breakdown: {
        fuel: fuelCost,
        parking: parkingCost,
        tolls: tollCost,
        maintenance: maintenanceCost,
        passCost: 0,
        taxSavings: 0
      },
      commuteDays: daysDriving
    };
  };

  // Helper to calculate DART Cost
  const calculateDartCost = (): CostBreakdown => {
    const taxSavings = usePreTaxBenefit ? (annualPassPrice * (taxRate / 100)) : 0;
    const netPassCost = annualPassPrice - taxSavings;

    return {
      totalCost: netPassCost,
      breakdown: {
        fuel: 0,
        parking: 0,
        tolls: 0,
        maintenance: 0,
        passCost: annualPassPrice,
        taxSavings: taxSavings
      },
      commuteDays: actualCommuteDays // In DART only mode, you ride every day you go to work
    };
  };

  // Scenario 1: Drive Every Day
  const drivingOnly = calculateDrivingCost(actualCommuteDays, true);

  // Scenario 2: DART Every Day
  const dartOnly = calculateDartCost();

  // Scenario 3: Hybrid
  // How many days driving vs DART annually?
  // hybridDriveDays is "Days driving per week".
  const hybridDriveRatio = hybridDriveDays / daysInOffice; // e.g. 2 days drive / 3 days office
  
  // Avoid NaN if daysInOffice is 0
  const safeHybridDriveRatio = daysInOffice > 0 ? hybridDriveRatio : 0;
  
  const annualHybridDriveDays = Math.round(actualCommuteDays * safeHybridDriveRatio);
  
  // Cost = Annual Pass (Fixed) + Driving Costs (Variable) + Parking (Fixed? Maybe)
  // Assumption: If you drive regular days (e.g. 2 days a week), you probably still pay the monthly parking.
  // Unless user sets Parking to 0.
  const hybridDrivingCosts = calculateDrivingCost(annualHybridDriveDays, monthlyParking > 0); 
  const hybridDartCosts = calculateDartCost();

  // In hybrid, you pay for the pass AND the variable driving costs
  const hybridTotal = hybridDrivingCosts.totalCost + hybridDartCosts.totalCost;

  const hybrid: CostBreakdown = {
    totalCost: hybridTotal,
    breakdown: {
      fuel: hybridDrivingCosts.breakdown.fuel,
      parking: hybridDrivingCosts.breakdown.parking,
      tolls: hybridDrivingCosts.breakdown.tolls,
      maintenance: hybridDrivingCosts.breakdown.maintenance,
      passCost: hybridDartCosts.breakdown.passCost,
      taxSavings: hybridDartCosts.breakdown.taxSavings
    },
    commuteDays: actualCommuteDays
  };

  return {
    drivingOnly,
    dartOnly,
    hybrid,
    actualCommuteDays
  };
};