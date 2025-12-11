import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  Train, 
  Calculator, 
  DollarSign, 
  Fuel, 
  ParkingCircle, 
  CalendarDays, 
  Settings2,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { Inputs, ComparisonResult } from './types';
import { DEFAULT_INPUTS } from './constants';
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
      name: 'Driving Only',
      Fuel: results.drivingOnly.breakdown.fuel,
      Parking: results.drivingOnly.breakdown.parking,
      Tolls: results.drivingOnly.breakdown.tolls,
      Maintenance: results.drivingOnly.breakdown.maintenance,
      Pass: 0,
      TaxSavings: 0,
      Total: results.drivingOnly.totalCost
    },
    {
      name: 'DART Annual Pass',
      Fuel: 0,
      Parking: 0,
      Tolls: 0,
      Maintenance: 0,
      Pass: results.dartOnly.breakdown.passCost,
      TaxSavings: -results.dartOnly.breakdown.taxSavings, // Negative for visualization or handle separately? Let's show Net.
      Total: results.dartOnly.totalCost
    },
    {
      name: 'Hybrid',
      Fuel: results.hybrid.breakdown.fuel,
      Parking: results.hybrid.breakdown.parking,
      Tolls: results.hybrid.breakdown.tolls,
      Maintenance: results.hybrid.breakdown.maintenance,
      Pass: results.hybrid.breakdown.passCost,
      TaxSavings: -results.hybrid.breakdown.taxSavings,
      Total: results.hybrid.totalCost
    }
  ];

  // For the breakdown chart, we want to show Costs as positive bars. 
  // We can visualize "Tax Savings" as a negative bar or just compare Net Costs.
  // Let's stick to positive cost components.
  const simpleChartData = chartData.map(item => ({
    name: item.name,
    "Fuel & Maint": Math.round(item.Fuel + item.Maintenance),
    "Parking & Tolls": Math.round(item.Parking + item.Tolls),
    "DART Pass (Net)": Math.round(item.Pass + item.TaxSavings), // Net cost
  }));

  const annualSavings = results.drivingOnly.totalCost - results.dartOnly.totalCost;
  const isDartCheaper = annualSavings > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Train size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Dallas Commute Calculator</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
             <a href="https://attperks.benefithub.com/api/ResourceProxyV2/FileResource?resourceid=2TJOHCQQUW1ONZ0EU5VRLEHYUK1QDA41SNQYS1SMNOHW9KI" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <span>View DART Rates</span>
                <ExternalLink size={14} />
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
                    Total Commutes: <span className="font-semibold text-slate-900">{results.actualCommuteDays} days/year</span>
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
              <div className="flex items-center space-x-2 mb-4 text-slate-900">
                <Train size={20} className="text-amber-500" />
                <h2 className="font-semibold text-lg">DART / Annual Pass</h2>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Annual Pass Cost</label>
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

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Use Pre-tax Payroll?</label>
                  <input 
                    type="checkbox" 
                    checked={inputs.usePreTaxBenefit}
                    onChange={(e) => handleInputChange('usePreTaxBenefit', e.target.checked)}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                </div>

                {inputs.usePreTaxBenefit && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <label className="block text-xs font-medium text-amber-800 mb-1">Marginal Tax Rate (%)</label>
                    <div className="flex items-center space-x-2">
                       <input 
                        type="number" 
                        value={inputs.taxRate}
                        onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                        className="w-20 px-2 py-1 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                      <span className="text-xs text-amber-700">Savings: <span className="font-bold">${results.dartOnly.breakdown.taxSavings.toFixed(0)}/yr</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                title="Driving Annual Cost" 
                value={`$${results.drivingOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                subValue={`$${(results.drivingOnly.totalCost / 12).toFixed(0)} / month`}
                icon={Car} 
                colorClass="bg-emerald-600" 
              />
              <InfoCard 
                title="DART Net Annual Cost" 
                value={`$${results.dartOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                subValue={inputs.usePreTaxBenefit ? `Includes $${results.dartOnly.breakdown.taxSavings.toFixed(0)} tax savings` : 'No pre-tax deduction'}
                icon={Train} 
                colorClass="bg-amber-500"
                trend="down"
              />
            </div>
            
             {/* Big Savings Result */}
             <div className={`rounded-xl shadow-sm border p-6 flex flex-col md:flex-row items-center justify-between ${isDartCheaper ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent' : 'bg-white border-slate-200'}`}>
                <div className="mb-4 md:mb-0">
                  <h3 className={`text-lg font-semibold ${isDartCheaper ? 'text-blue-100' : 'text-slate-500'}`}>
                    Annual Recommendation
                  </h3>
                  <p className={`text-3xl font-bold mt-1 ${isDartCheaper ? 'text-white' : 'text-slate-900'}`}>
                    {isDartCheaper ? 'Switch to DART' : 'Driving is Cheaper'}
                  </p>
                </div>
                <div className="text-center md:text-right">
                   <p className={`text-sm ${isDartCheaper ? 'text-blue-200' : 'text-slate-500'}`}>Potential Savings</p>
                   <p className={`text-4xl font-extrabold ${isDartCheaper ? 'text-white' : 'text-emerald-600'}`}>
                     ${Math.abs(annualSavings).toLocaleString(undefined, {maximumFractionDigits: 0})}
                     <span className={`text-lg font-normal ml-1 ${isDartCheaper ? 'text-blue-200' : 'text-slate-500'}`}>/ year</span>
                   </p>
                </div>
             </div>

            {/* Main Viz Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="border-b border-slate-200 flex">
                  <button 
                    onClick={() => setActiveTab('comparison')}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'comparison' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Cost Breakdown
                  </button>
                  <button 
                    onClick={() => setActiveTab('hybrid')}
                    className={`flex-1 py-4 text-sm font-medium text-center transition-colors border-b-2 ${activeTab === 'hybrid' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    Hybrid Scenario
                  </button>
               </div>
               
               <div className="p-6">
                 {activeTab === 'comparison' ? (
                   <div className="h-[400px]">
                      <h3 className="text-sm font-semibold text-slate-500 mb-4 text-center">Annual Cost Composition</h3>
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
                          <Bar dataKey="Fuel & Maint" stackId="a" fill="#10b981" barSize={60} radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Parking & Tolls" stackId="a" fill="#059669" barSize={60} />
                          <Bar dataKey="DART Pass (Net)" stackId="a" fill="#f59e0b" barSize={60} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                 ) : (
                   <div>
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Hybrid Commute Simulator</h3>
                        <p className="text-sm text-slate-500 mb-6">
                          What if you buy the Annual Pass but still drive occasionally (e.g., late nights, rain)?
                        </p>
                        
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
                             <span className="font-semibold text-amber-600">{inputs.daysInOffice - inputs.hybridDriveDays} days DART</span>
                             <span className="font-semibold text-emerald-600">{inputs.hybridDriveDays} days Drive</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                            <p className="text-xs text-emerald-700 uppercase tracking-wide font-bold mb-1">Driving Only</p>
                            <p className="text-2xl font-bold text-slate-900">${results.drivingOnly.totalCost.toLocaleString()}</p>
                         </div>
                         <div className="p-4 rounded-lg bg-purple-50 border border-purple-100 ring-2 ring-purple-200">
                            <p className="text-xs text-purple-700 uppercase tracking-wide font-bold mb-1">Hybrid Cost</p>
                            <p className="text-2xl font-bold text-slate-900">${results.hybrid.totalCost.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-1">Pass + Fuel/Parking for {inputs.hybridDriveDays * 52} days</p>
                         </div>
                         <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                            <p className="text-xs text-amber-700 uppercase tracking-wide font-bold mb-1">DART Only</p>
                            <p className="text-2xl font-bold text-slate-900">${results.dartOnly.totalCost.toLocaleString()}</p>
                         </div>
                      </div>
                      
                      <div className="mt-6 text-center text-sm text-slate-500">
                        {results.hybrid.totalCost < results.drivingOnly.totalCost ? (
                          <span className="text-emerald-600 font-medium">Hybrid approach saves ${Math.round(results.drivingOnly.totalCost - results.hybrid.totalCost).toLocaleString()} vs Driving daily.</span>
                        ) : (
                          <span className="text-rose-600 font-medium">Hybrid is more expensive than just driving if you drive {inputs.hybridDriveDays} days/week while holding a pass.</span>
                        )}
                      </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Detailed Breakdown</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                       <th className="px-6 py-3">Expense Category</th>
                       <th className="px-6 py-3">Driving Only</th>
                       <th className="px-6 py-3">DART Annual Pass</th>
                       <th className="px-6 py-3">Hybrid ({inputs.hybridDriveDays}d Drive)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">Fuel & Charging</td>
                       <td className="px-6 py-3">${results.drivingOnly.breakdown.fuel.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">${results.hybrid.breakdown.fuel.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                     <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">Parking & Tolls</td>
                       <td className="px-6 py-3">${(results.drivingOnly.breakdown.parking + results.drivingOnly.breakdown.tolls).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">${(results.hybrid.breakdown.parking + results.hybrid.breakdown.tolls).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                      <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">Maintenance (Tires/Oil)</td>
                       <td className="px-6 py-3">${results.drivingOnly.breakdown.maintenance.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">${results.hybrid.breakdown.maintenance.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                     <tr>
                       <td className="px-6 py-3 font-medium text-slate-700">DART Pass Base Cost</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">${results.dartOnly.breakdown.passCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">${results.dartOnly.breakdown.passCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                     <tr className="bg-emerald-50 text-emerald-700">
                       <td className="px-6 py-3 font-medium">Pre-tax Savings</td>
                       <td className="px-6 py-3">-</td>
                       <td className="px-6 py-3">-${results.dartOnly.breakdown.taxSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-3">-${results.dartOnly.breakdown.taxSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                     </tr>
                     <tr className="bg-slate-50 font-bold text-slate-900">
                       <td className="px-6 py-4">Total Annual Cost</td>
                       <td className="px-6 py-4">${results.drivingOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-4">${results.dartOnly.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                       <td className="px-6 py-4">${results.hybrid.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
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