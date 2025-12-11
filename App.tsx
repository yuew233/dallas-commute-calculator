import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Train, 
  CalendarDays, 
  ExternalLink,
  Info,
  Calendar,
  Ticket,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

import { Inputs, ComparisonResult } from './types';
import { DEFAULT_INPUTS, MONTH_NAMES } from './constants';
import { calculateCosts } from './services/calculator';
import { InfoCard } from './components/InfoCard';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [activeTab, setActiveTab] = useState<'comparison' | 'hybrid'>('comparison');

  const results: ComparisonResult = useMemo(() => calculateCosts(inputs), [inputs]);

  const handleInputChange = (field: keyof Inputs, value: number | boolean) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const chartData = [
    {
      name: 'Driving',
      Fuel: results.drivingOnly.breakdown.fuel,
      Parking: results.drivingOnly.breakdown.parking,
      Tolls: results.drivingOnly.breakdown.tolls,
      Maintenance: results.drivingOnly.breakdown.maintenance,
      Pass: 0,
      Tickets: 0,
      TaxSavings: 0,
      Total: results.drivingOnly.totalCost
    },
    {
      name: 'Annual Pass',
      Fuel: 0,
      Parking: 0,
      Tolls: 0,
      Maintenance: 0,
      Pass: results.dartOnly.breakdown.passCost,
      Tickets: 0,
      TaxSavings: -results.dartOnly.breakdown.taxSavings, 
      Total: results.dartOnly.totalCost
    },
    {
      name: 'Prepaid Daily',
      Fuel: 0,
      Parking: 0,
      Tolls: 0,
      Maintenance: 0,
      Pass: 0,
      Tickets: results.prepaidDaily.breakdown.ticketCost,
      TaxSavings: -results.prepaidDaily.breakdown.taxSavings,
      Total: results.prepaidDaily.totalCost
    }
  ];

  const simpleChartData = chartData.map(item => ({
    name: item.name,
    "Fuel & Maint": Math.round(item.Fuel + item.Maintenance),
    "Parking & Tolls": Math.round(item.Parking + item.Tolls),
    "DART Cost (Net)": Math.round(item.Pass + item.Tickets + item.TaxSavings), 
  }));

  // Find cheapest option for comparison tab
  const costs = [
    { type: 'Driving', val: results.drivingOnly.totalCost },
    { type: 'Annual Pass', val: results.dartOnly.totalCost },
    { type: 'Prepaid Daily', val: results.prepaidDaily.totalCost }
  ];
  const cheapest = costs.reduce((prev, curr) => prev.val < curr.val ? prev : curr);
  const savings = results.drivingOnly.totalCost - cheapest.val;

  // Hybrid comparison logic
  const hybridIsPassCheaper = results.hybrid.totalCost < results.hybridPrepaid.totalCost;
  const hybridSavings = Math.abs(results.hybrid.totalCost - results.hybridPrepaid.totalCost);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-blue-600 h-32 overflow-hidden shadow-md">
         <div className="absolute inset-0 bg-black bg-opacity-10"></div>
         <div className="absolute -left-10 -bottom-10 text-white opacity-20 transform rotate-12">
            <Car size={160} />
         </div>
         <div className="absolute -right-6 top-2 text-white opacity-20 transform -rotate-12">
            <Train size={160} />
         </div>
         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">Commute Calculator</h1>
            <p className="text-blue-50 font-medium mt-1">Driving vs. DART Annual Pass vs. Prepaid</p>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Schedule Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-2 mb-4 text-slate-900">
                <CalendarDays size={20} className="text-blue-600" />
                <h2 className="font-semibold text-lg">Work Schedule</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Days in Office (per week)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="7" 
                    step="1"
                    value={inputs.daysInOffice}
                    onChange={(e) => handleInputChange('daysInOffice', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 day</span>
                    <span className="font-bold text-blue-600">{inputs.daysInOffice} days</span>
                    <span>7 days</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">PTO Days/Year</label>
                    <input 
                      type="number" 
                      value={inputs.ptoDays}
                      onChange={(e) => handleInputChange('ptoDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Holidays/Year</label>
                    <input 
                      type="number" 
                      value={inputs.holidays}
                      onChange={(e) => handleInputChange('holidays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1">Sick Days</label>
                    <input 
                      type="number" 
                      value={inputs.sickDays}
                      onChange={(e) => handleInputChange('sickDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Commutes ({results.periodLabel}): <span className="font-semibold text-slate-900">{results.actualCommuteDays} days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Driving Costs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-2 mb-4 text-slate-900">
                <Car size={20} className="text-emerald-600" />
                <h2 className="font-semibold text-lg">Driving Inputs</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Distance (One Way)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={inputs.oneWayDistance}
                      onChange={(e) => handleInputChange('oneWayDistance', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 pl-3 pr-12 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-sm text-slate-400">miles</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Gas Price ($/gal)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={inputs.gasPrice}
                      onChange={(e) => handleInputChange('gasPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">MPG</label>
                    <input 
                      type="number" 
                      value={inputs.mpg}
                      onChange={(e) => handleInputChange('mpg', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Parking ($/mo)</label>
                    <input 
                      type="number" 
                      value={inputs.monthlyParking}
                      onChange={(e) => handleInputChange('monthlyParking', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Tolls (Round Trip)</label>
                    <input 
                      type="number" 
                      value={inputs.tollsPerDay}
                      onChange={(e) => handleInputChange('tollsPerDay', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                 <div>
                    <label className="flex items-center space-x-1 block text-xs font-medium text-slate-500 mb-1">
                      <span>Maintenance ($/mile)</span>
                      <div className="group relative">
                        <Info size={12} className="text-slate-400 cursor-help"/>
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded w-48 text-center z-20">
                          Approx. $0.09/mile for tires, oil, and wear (AAA avg).
                        </div>
                      </div>
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={inputs.maintenancePerMile}
                      onChange={(e) => handleInputChange('maintenancePerMile', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
              </div>
            </div>

            {/* DART Costs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4 text-slate-900">
                <div className="flex items-center space-x-2">
                  <Train size={20} className="text-amber-500" />
                  <h2 className="font-semibold text-lg">Transit Options</h2>
                </div>
                <a href="https://attperks.benefithub.com/api/ResourceProxyV2/FileResource?resourceid=2TJOHCQQUW1ONZ0EU5VRLEHYUK1QDA41SNQYS1SMNOHW9KI" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  <span>View Rates</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="space-y-4">
                 <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-3">
                   <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center">
                     <Calendar size={12} className="mr-1" />
                     Purchase Start Month
                   </label>
                   <select 
                     value={inputs.startMonth}
                     onChange={(e) => handleInputChange('startMonth', parseInt(e.target.value))}
                     className="w-full px-2 py-1.5 border border-amber-200 rounded bg-white text-sm focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                   >
                     {MONTH_NAMES.map((month, index) => (
                       <option key={month} value={index + 1}>{month} ({12 - index} months)</option>
                     ))}
                   </select>
                   <p className="text-xs text-amber-700 mt-1">
                     Analysis period: {results.periodLabel}
                   </p>
                 </div>

                 {/* Annual Pass Input */}
                 <div className="p-3 border border-slate-100 rounded-lg">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Option 1: Annual Pass</label>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Full Year Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={inputs.annualPassPrice}
                        onChange={(e) => handleInputChange('annualPassPrice', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 pl-6 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                 </div>

                 {/* Prepaid Input */}
                 <div className="p-3 border border-slate-100 rounded-lg">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Option 2: Prepaid / Daily</label>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Daily Ticket Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={inputs.dailyTicketPrice}
                        onChange={(e) => handleInputChange('dailyTicketPrice', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 pl-6 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                 </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-700">Use Pre-tax Payroll?</label>
                  <input 
                    type="checkbox" 
                    checked={inputs.usePreTaxBenefit}
                    onChange={(e) => handleInputChange('usePreTaxBenefit', e.target.checked)}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                </div>

                {inputs.usePreTaxBenefit && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <label className="block text-xs font-medium text-green-800 mb-1">Marginal Tax Rate (%)</label>
                    <div className="flex items-center space-x-2">
                       <input 
                        type="number" 
                        value={inputs.taxRate}
                        onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-green-200 rounded text-sm focus:ring-1 focus:ring-green-500 outline-none"
                      />
                      <span className="text-xs text-green-700">Savings applied to both options.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard 
                title={`Driving`} 
                value={`$${results.drivingOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                subValue={`~$${(results.drivingOnly.totalCost / results.monthsRemaining).toFixed(0)} / mo`}
                icon={Car} 
                colorClass="bg-emerald-600" 
              />
              <InfoCard 
                title={`Annual Pass`} 
                value={`$${results.dartOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                subValue={`Net (After Tax)`}
                icon={Train} 
                colorClass="bg-amber-500"
                trend={results.dartOnly.totalCost < results.drivingOnly.totalCost ? "down" : "neutral"}
              />
               <InfoCard 
                title={`Prepaid Daily`} 
                value={`$${results.prepaidDaily.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                subValue={`$${inputs.dailyTicketPrice}/day Net`}
                icon={Ticket} 
                colorClass="bg-blue-500"
                trend={results.prepaidDaily.totalCost < results.drivingOnly.totalCost ? "down" : "neutral"}
              />
            </div>
            
             {/* Big Savings Result */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-slate-500">
                    Cheapest Option ({results.periodLabel})
                  </h3>
                  <p className="text-3xl font-bold mt-1 text-slate-900">
                    {cheapest.type}
                  </p>
                </div>
                <div className="text-center md:text-right">
                   {cheapest.type !== 'Driving' ? (
                     <>
                        <p className="text-sm text-slate-500">Total Savings vs Driving</p>
                        <p className="text-4xl font-extrabold text-emerald-600">
                          ${Math.abs(savings).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </p>
                     </>
                   ) : (
                     <p className="text-lg font-medium text-slate-400">Driving is the cheapest option</p>
                   )}
                </div>
             </div>

            {/* Main Viz Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="border-b border-slate-200 flex">
                  <button 
                    onClick={() => setActiveTab('comparison')}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'comparison' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Cost Comparison
                  </button>
                  <button 
                    onClick={() => setActiveTab('hybrid')}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'hybrid' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Hybrid Simulator
                  </button>
               </div>
               
               <div className="p-6">
                 {activeTab === 'comparison' ? (
                   <div className="h-[400px]">
                      <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center">Net Cost Composition ({results.periodLabel})</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={simpleChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                          />
                          <Legend wrapperStyle={{paddingTop: '20px'}} />
                          <Bar dataKey="Fuel & Maint" stackId="a" fill="#10b981" barSize={50} radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Parking & Tolls" stackId="a" fill="#059669" barSize={50} />
                          <Bar dataKey="DART Cost (Net)" stackId="a" fill="#3b82f6" barSize={50} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                 ) : (
                   <div>
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <h3 className="text-lg font-semibold text-slate-900">Hybrid Commute Simulator</h3>
                              <p className="text-sm text-slate-500">
                                Compare <strong>Buying a Pass</strong> vs <strong>Pay-As-You-Go</strong> for mixed schedules.
                              </p>
                           </div>
                           <div className={`px-4 py-2 rounded-lg border ${hybridIsPassCheaper ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                             <p className="text-xs font-bold uppercase tracking-wide mb-1">Recommendation</p>
                             <p className="font-bold flex items-center">
                               {hybridIsPassCheaper ? <Train size={16} className="mr-2"/> : <Ticket size={16} className="mr-2"/>}
                               {hybridIsPassCheaper ? 'Buy Annual Pass' : 'Pay As You Go'}
                             </p>
                             <p className="text-xs mt-1">Saves ${hybridSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                           </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                             Driving Days (out of {inputs.daysInOffice} office days)
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max={inputs.daysInOffice} 
                            step="1"
                            value={inputs.hybridDriveDays}
                            onChange={(e) => handleInputChange('hybridDriveDays', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-2"
                          />
                          <div className="flex justify-between text-sm">
                             <span className="font-semibold text-blue-600">{inputs.daysInOffice - inputs.hybridDriveDays} days DART</span>
                             <span className="font-semibold text-emerald-600">{inputs.hybridDriveDays} days Drive</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Card 1: Annual Pass Strategy */}
                         <div className={`p-5 rounded-xl border-2 transition-all ${hybridIsPassCheaper ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 shadow-sm' : 'border-slate-100 bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                               <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                  <Train size={24} />
                               </div>
                               <div className="text-right">
                                  <p className="text-xs font-bold text-slate-400 uppercase">Strategy A</p>
                                  <p className="font-bold text-slate-800">Annual Pass</p>
                               </div>
                            </div>
                            <div className="space-y-2 mb-4">
                               <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Fixed Pass Cost</span>
                                  <span className="font-medium text-slate-900">${(results.hybrid.breakdown.passCost - results.hybrid.breakdown.taxSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Driving ({inputs.hybridDriveDays} days)</span>
                                  <span className="font-medium text-slate-900">+ ${(results.hybrid.breakdown.fuel + results.hybrid.breakdown.parking + results.hybrid.breakdown.tolls + results.hybrid.breakdown.maintenance).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                               </div>
                            </div>
                            <div className="pt-3 border-t border-amber-200/50 flex justify-between items-end">
                               <span className="text-sm font-medium text-amber-800">Total Cost</span>
                               <span className="text-2xl font-bold text-slate-900">${results.hybrid.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            </div>
                         </div>

                         {/* Card 2: Prepaid Strategy */}
                         <div className={`p-5 rounded-xl border-2 transition-all ${!hybridIsPassCheaper ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 shadow-sm' : 'border-slate-100 bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                               <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                  <Ticket size={24} />
                               </div>
                               <div className="text-right">
                                  <p className="text-xs font-bold text-slate-400 uppercase">Strategy B</p>
                                  <p className="font-bold text-slate-800">Pay As You Go</p>
                               </div>
                            </div>
                            <div className="space-y-2 mb-4">
                               <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Tickets ({inputs.daysInOffice - inputs.hybridDriveDays} days/wk)</span>
                                  <span className="font-medium text-slate-900">${(results.hybridPrepaid.breakdown.ticketCost - results.hybridPrepaid.breakdown.taxSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Driving ({inputs.hybridDriveDays} days)</span>
                                  <span className="font-medium text-slate-900">+ ${(results.hybridPrepaid.breakdown.fuel + results.hybridPrepaid.breakdown.parking + results.hybridPrepaid.breakdown.tolls + results.hybridPrepaid.breakdown.maintenance).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                               </div>
                            </div>
                            <div className="pt-3 border-t border-blue-200/50 flex justify-between items-end">
                               <span className="text-sm font-medium text-blue-800">Total Cost</span>
                               <span className="text-2xl font-bold text-slate-900">${results.hybridPrepaid.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            </div>
                         </div>
                      </div>

                      <div className="mt-6 flex items-start space-x-3 text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200">
                         <Info className="flex-shrink-0 text-slate-400 mt-0.5" size={16} />
                         <p>
                           <strong>Note:</strong> Strategy A assumes you pay the full Annual Pass price regardless of how few days you use it. Strategy B assumes you only pay for tickets on the days you actually ride DART.
                         </p>
                      </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Detailed Breakdown ({results.periodLabel})</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                       <th className="px-6 py-3">Expense Category</th>
                       <th className="px-6 py-3">Driving</th>
                       <th className="px-6 py-3">Annual Pass</th>
                       <th className="px-6 py-3">Prepaid Daily</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">Fuel & Charging</td>
                       <td className="px-6 py-3">${results.drivingOnly.breakdown.fuel.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">-</td>
                     </tr>
                     <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">Parking & Tolls</td>
                       <td className="px-6 py-3">${(results.drivingOnly.breakdown.parking + results.drivingOnly.breakdown.tolls).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">-</td>
                     </tr>
                      <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">Maintenance</td>
                       <td className="px-6 py-3">${results.drivingOnly.breakdown.maintenance.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">-</td>
                     </tr>
                     <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">DART Fares (Pre-tax)</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">${results.dartOnly.breakdown.passCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">${results.prepaidDaily.breakdown.ticketCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                     <tr className="bg-emerald-50 text-emerald-700">
                       <td className="px-6 py-3 font-medium">Tax Savings</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">-${results.dartOnly.breakdown.taxSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-${results.prepaidDaily.breakdown.taxSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                     <tr className="bg-slate-50 font-bold text-slate-900">
                       <td className="px-6 py-4">Total Net Cost</td>
                       <td className="px-6 py-4">${results.drivingOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-4">${results.dartOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-4">${results.prepaidDaily.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;