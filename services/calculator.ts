import { Inputs, ComparisonResult, CostBreakdown } from '../types';
import { WEEKS_PER_YEAR, MONTH_NAMES } from '../constants';

export const calculateCosts = (inputs: Inputs): ComparisonResult => {
  const {
    daysInOffice,
    oneWayDistance,
    startMonth,
    ptoDays,
    holidays,
    sickDays,
    gasPrice,
    mpg,
    monthlyParking,
    tollsPerDay,
    maintenancePerMile,
    annualPassPrice,
    dailyTicketPrice,
    usePreTaxBenefit,
    taxRate,
    hybridDriveDays
  } = inputs;

  // 0. Determine Time Period Scaling
  const monthsRemaining = 13 - startMonth;
  const periodRatio = monthsRemaining / 12;
  const periodLabel = `${MONTH_NAMES[startMonth - 1]} - Dec (${monthsRemaining} months)`;

  // 1. Calculate Total Commuting Days for the Period
  const totalAnnualWorkDays = (WEEKS_PER_YEAR * 5) - holidays - ptoDays - sickDays;
  const periodWorkDaysAvailable = totalAnnualWorkDays * periodRatio;
  
  const attendanceRatio = daysInOffice / 5;
  const actualCommuteDays = Math.round(periodWorkDaysAvailable * attendanceRatio);

  // Helper to calculate Driving Cost for N days
  const calculateDrivingCost = (daysDriving: number, includeFixedParking: boolean): CostBreakdown => {
    const totalMiles = daysDriving * oneWayDistance * 2;
    const gallons = totalMiles / mpg;
    const fuelCost = gallons * gasPrice;
    const tollCost = daysDriving * tollsPerDay;
    const maintenanceCost = totalMiles * maintenancePerMile;
    
    const parkingCost = includeFixedParking ? (monthlyParking * monthsRemaining) : 0;

    return {
      totalCost: fuelCost + tollCost + maintenanceCost + parkingCost,
      breakdown: {
        fuel: fuelCost,
        parking: parkingCost,
        tolls: tollCost,
        maintenance: maintenanceCost,
        passCost: 0,
        ticketCost: 0,
        taxSavings: 0
      },
      commuteDays: daysDriving
    };
  };

  // Helper to calculate Annual Pass Cost
  const calculateAnnualPassCost = (): CostBreakdown => {
    const proratedPassPrice = annualPassPrice * periodRatio;
    const taxSavings = usePreTaxBenefit ? (proratedPassPrice * (taxRate / 100)) : 0;
    const netPassCost = proratedPassPrice - taxSavings;

    return {
      totalCost: netPassCost,
      breakdown: {
        fuel: 0,
        parking: 0,
        tolls: 0,
        maintenance: 0,
        passCost: proratedPassPrice,
        ticketCost: 0,
        taxSavings: taxSavings
      },
      commuteDays: actualCommuteDays
    };
  };

  // Helper to calculate Prepaid Daily Ticket Cost
  const calculatePrepaidDailyCost = (daysRiding: number): CostBreakdown => {
    const totalTicketCost = daysRiding * dailyTicketPrice;
    // Assume prepaid load is also pre-tax
    const taxSavings = usePreTaxBenefit ? (totalTicketCost * (taxRate / 100)) : 0;
    const netCost = totalTicketCost - taxSavings;

    return {
      totalCost: netCost,
      breakdown: {
        fuel: 0,
        parking: 0,
        tolls: 0,
        maintenance: 0,
        passCost: 0,
        ticketCost: totalTicketCost,
        taxSavings: taxSavings
      },
      commuteDays: daysRiding
    };
  }

  // Scenario 1: Drive Every Day
  const drivingOnly = calculateDrivingCost(actualCommuteDays, true);

  // Scenario 2: DART Annual Pass
  const dartOnly = calculateAnnualPassCost();

  // Scenario 3: Prepaid Daily (Pay as you go)
  const prepaidDaily = calculatePrepaidDailyCost(actualCommuteDays);

  // Scenario 4: Hybrid Scenarios
  
  const hybridDriveRatio = hybridDriveDays / daysInOffice; 
  const safeHybridDriveRatio = daysInOffice > 0 ? hybridDriveRatio : 0;
  
  // Days driven in this period
  const periodHybridDriveDays = Math.round(actualCommuteDays * safeHybridDriveRatio);
  // Days taking DART in this period
  const periodHybridDartDays = actualCommuteDays - periodHybridDriveDays;
  
  // Common Driving Costs for both hybrid scenarios
  const hybridDrivingCosts = calculateDrivingCost(periodHybridDriveDays, monthlyParking > 0); 

  // Strategy A: Buy Annual Pass + Drive remaining days
  const hybridPassComponent = calculateAnnualPassCost(); // Assumes you bought the pass regardless of usage
  const hybridTotal = hybridDrivingCosts.totalCost + hybridPassComponent.totalCost;

  const hybrid: CostBreakdown = {
    totalCost: hybridTotal,
    breakdown: {
      fuel: hybridDrivingCosts.breakdown.fuel,
      parking: hybridDrivingCosts.breakdown.parking,
      tolls: hybridDrivingCosts.breakdown.tolls,
      maintenance: hybridDrivingCosts.breakdown.maintenance,
      passCost: hybridPassComponent.breakdown.passCost,
      ticketCost: 0,
      taxSavings: hybridPassComponent.breakdown.taxSavings
    },
    commuteDays: actualCommuteDays
  };

  // Strategy B: Prepaid Tickets + Drive remaining days
  const hybridPrepaidComponent = calculatePrepaidDailyCost(periodHybridDartDays);
  const hybridPrepaidTotal = hybridDrivingCosts.totalCost + hybridPrepaidComponent.totalCost;

  const hybridPrepaid: CostBreakdown = {
    totalCost: hybridPrepaidTotal,
    breakdown: {
      fuel: hybridDrivingCosts.breakdown.fuel,
      parking: hybridDrivingCosts.breakdown.parking,
      tolls: hybridDrivingCosts.breakdown.tolls,
      maintenance: hybridDrivingCosts.breakdown.maintenance,
      passCost: 0,
      ticketCost: hybridPrepaidComponent.breakdown.ticketCost,
      taxSavings: hybridPrepaidComponent.breakdown.taxSavings // Savings from prepaid
    },
    commuteDays: actualCommuteDays
  };

  return {
    drivingOnly,
    dartOnly,
    prepaidDaily,
    hybrid,
    hybridPrepaid,
    actualCommuteDays,
    periodLabel,
    monthsRemaining
  };
};