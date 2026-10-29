import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Building2,
  FileSpreadsheet,
  Route,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import { residueService } from '../services/residueService';
import {
  ResidueType,
  SupplierType,
  ContaminationLevel,
  StorageCondition,
  UtilizationPathway,
} from '../types';

export const AddBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<'supplier' | 'material' | 'route' | 'review'>('supplier');

  // Section A: Supplier Details
  const [supplierName, setSupplierName] = useState('');
  const [supplierType, setSupplierType] = useState<SupplierType>('rice mill');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('Nizamabad');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 ');

  // Section B: Material Details
  const [residueType, setResidueType] = useState<ResidueType>('Rice husk');
  const [quantityTonnes, setQuantityTonnes] = useState<number>(35);
  const [moisturePercent, setMoisturePercent] = useState<string>('10.5');
  const [ashPercent, setAshPercent] = useState<string>('18.2');
  const [carbonContentPercent, setCarbonContentPercent] = useState<string>('38.0');
  const [contaminationStatus, setContaminationStatus] = useState<ContaminationLevel>('Low / Clean');
  const [availableDate, setAvailableDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('Covered dry warehouse');
  const [estimatedCollectionDistanceKm, setEstimatedCollectionDistanceKm] = useState<number>(140);
  const [notes, setNotes] = useState('');

  // Section C: Preferred Route
  const [preferredRoute, setPreferredRoute] = useState<UtilizationPathway>('Silica-rich ash recovery');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSupplier = () => {
    const errs: Record<string, string> = {};
    if (!supplierName.trim()) errs.supplierName = 'Supplier name is required';
    if (!location.trim()) errs.location = 'Specific facility/mandal location is required';
    if (!contactPerson.trim()) errs.contactPerson = 'Contact person name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateMaterial = () => {
    const errs: Record<string, string> = {};
    if (!quantityTonnes || quantityTonnes <= 0) errs.quantityTonnes = 'Quantity must be greater than 0';
    if (!availableDate) errs.availableDate = 'Availability date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromSupplier = () => {
    if (validateSupplier()) setCurrentSection('material');
  };

  const handleNextFromMaterial = () => {
    if (validateMaterial()) setCurrentSection('route');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const moistureVal = moisturePercent.trim() !== '' ? parseFloat(moisturePercent) : null;
    const ashVal = ashPercent.trim() !== '' ? parseFloat(ashPercent) : null;
    const carbonVal = carbonContentPercent.trim() !== '' ? parseFloat(carbonContentPercent) : null;

    residueService.createBatch({
      residueType,
      supplierName,
      supplierType,
      location,
      district,
      state: 'Telangana',
      quantityTonnes,
      moisturePercent: moistureVal,
      ashPercent: ashVal,
      carbonContentPercent: carbonVal,
      contaminationStatus,
      availableDate,
      storageCondition,
      estimatedCollectionDistanceKm,
      preferredRoute,
      status: 'Available',
      dataConfidence: moistureVal !== null && ashVal !== null ? 'High' : 'Provisional (Missing Labs)',
      notes: notes || 'Batch registered via intake portal.',
      contactPerson,
      contactPhone,
    });

    navigate('/inventory');
  };

  const isMoistureMissing = moisturePercent.trim() === '';
  const isAshMissing = ashPercent.trim() === '';
  const isCarbonMissing = carbonContentPercent.trim() === '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add Residue Batch</h1>
            <p className="text-xs text-slate-500">
              Characterize agricultural and agro-processing residues for explainable industrial valorization
            </p>
          </div>
        </div>

        {/* Multi-Section Progress Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setCurrentSection('supplier')}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
              currentSection === 'supplier'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] shrink-0">
              A
            </span>
            <span className="truncate">Supplier</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateSupplier()) setCurrentSection('material');
            }}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
              currentSection === 'material'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] shrink-0">
              B
            </span>
            <span className="truncate">Material & Labs</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateSupplier() && validateMaterial()) setCurrentSection('route');
            }}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
              currentSection === 'route'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] shrink-0">
              C
            </span>
            <span className="truncate">Route</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateSupplier() && validateMaterial()) setCurrentSection('review');
            }}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
              currentSection === 'review'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] shrink-0">
              D
            </span>
            <span className="truncate">Review</span>
          </button>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* SECTION A: SUPPLIER INFORMATION */}
        {currentSection === 'supplier' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                Section A: Supplier & Location Details
              </h2>
              <p className="text-xs text-slate-500">
                Identify the farm collective, mill, or aggregator listing this feedstock
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Supplier / Mill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sri Balaji Agro Rice Mill"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.supplierName ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
                {errors.supplierName && <p className="text-red-500 text-[11px] mt-1">{errors.supplierName}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Supplier Type</label>
                <select
                  value={supplierType}
                  onChange={(e) => setSupplierType(e.target.value as SupplierType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none bg-slate-50/50"
                >
                  <option value="rice mill">Rice Mill</option>
                  <option value="agro-processor">Agro-Processor</option>
                  <option value="aggregator">Aggregator / Producer Co-op</option>
                  <option value="farmer">Individual Farmer / Cluster</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  District (Telangana) <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none bg-slate-50/50"
                >
                  <option value="Nizamabad">Nizamabad</option>
                  <option value="Karimnagar">Karimnagar</option>
                  <option value="Warangal">Warangal</option>
                  <option value="Khammam">Khammam</option>
                  <option value="Nalgonda">Nalgonda</option>
                  <option value="Mahbubnagar">Mahbubnagar</option>
                  <option value="Sangareddy">Sangareddy</option>
                  <option value="Siddipet">Siddipet</option>
                  <option value="Kamareddy">Kamareddy</option>
                  <option value="Hyderabad">Hyderabad Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Specific Facility / Mandal Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bodhan Bypass Industrial Shed #4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.location ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
                {errors.location && <p className="text-red-500 text-[11px] mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Contact Person (Fictional Demo) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. K. Srinivas Rao"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                    errors.contactPerson ? 'border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
                {errors.contactPerson && <p className="text-red-500 text-[11px] mt-1">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleNextFromSupplier}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Continue to Material Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION B: MATERIAL INFORMATION */}
        {currentSection === 'material' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Section B: Material Characterization & Physical State
              </h2>
              <p className="text-xs text-slate-500">
                Specify batch volume and proximate laboratory assays. Missing values are flagged as "Not measured".
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Residue Type</label>
                <select
                  value={residueType}
                  onChange={(e) => setResidueType(e.target.value as ResidueType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none bg-slate-50/50"
                >
                  <option value="Rice husk">Rice husk</option>
                  <option value="Rice straw">Rice straw</option>
                  <option value="Coconut husk">Coconut husk</option>
                  <option value="Coconut shell">Coconut shell</option>
                  <option value="Groundnut shell">Groundnut shell</option>
                  <option value="Maize cob">Maize cob</option>
                  <option value="Sugarcane bagasse">Sugarcane bagasse</option>
                  <option value="Wheat straw">Wheat straw</option>
                  <option value="Coffee husk">Coffee husk</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quantity Available (Tonnes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={quantityTonnes}
                  onChange={(e) => setQuantityTonnes(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Equivalent to {(quantityTonnes * 1000).toLocaleString()} kg
                </span>
              </div>
            </div>

            {/* Laboratory Assays (Explicit Missing Values Supported) */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Proximate Laboratory Measurements
                </span>
                <span className="text-[10px] text-slate-500 italic">
                  Leave fields empty if no lab tests have been performed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 10.5"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                  />
                  {isMoistureMissing && (
                    <span className="text-[10px] text-amber-700 mt-0.5 block">
                      ⚠ Unmeasured: triggers provisional match warning
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ash Content (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.2"
                    value={ashPercent}
                    onChange={(e) => setAshPercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fixed Carbon (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 38.0"
                    value={carbonContentPercent}
                    onChange={(e) => setCarbonContentPercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contamination Status</label>
                <select
                  value={contaminationStatus}
                  onChange={(e) => setContaminationStatus(e.target.value as ContaminationLevel)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none bg-slate-50/50"
                >
                  <option value="Low / Clean">Low / Clean</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High / Contaminated">High / Contaminated</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Storage Condition</label>
                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value as StorageCondition)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none bg-slate-50/50"
                >
                  <option value="Covered dry warehouse">Covered dry warehouse</option>
                  <option value="Silo storage">Silo storage</option>
                  <option value="Tarpaulin covered">Tarpaulin covered</option>
                  <option value="Open field pile">Open field pile</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Available Date</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Estimated Collection Distance from Hyderabad Hub (km)
              </label>
              <input
                type="number"
                min="5"
                max="400"
                value={estimatedCollectionDistanceKm}
                onChange={(e) => setEstimatedCollectionDistanceKm(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentSection('supplier')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Supplier
              </button>
              <button
                type="button"
                onClick={handleNextFromMaterial}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Continue to Preferred Route
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION C: PREFERRED ROUTE */}
        {currentSection === 'route' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-emerald-700" />
                Section C: Preferred Utilization Pathway
              </h2>
              <p className="text-xs text-slate-500">
                Indicate the primary valorization trajectory requested by the supplier or aggregator
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                {
                  route: 'Silica-rich ash recovery' as UtilizationPathway,
                  title: 'Silica-Rich Ash Recovery',
                  type: 'Mineral Recovery (Non-Carbon)',
                  desc: 'Controlled incineration yielding amorphous biogenic silica for rubber, tire, and ceramics.',
                },
                {
                  route: 'Biochar production' as UtilizationPathway,
                  title: 'Biochar Production',
                  type: 'Carbon Sequestration',
                  desc: 'Slow pyrolysis creating alkaline soil amendments and long-term carbon lock-up.',
                },
                {
                  route: 'Activated carbon production' as UtilizationPathway,
                  title: 'Activated Carbon Production',
                  type: 'High-Value Carbonaceous Adsorbent',
                  desc: 'Steam activation yielding high-iodine microporous carbons for filtration and water treatment.',
                },
                {
                  route: 'Direct biomass energy / boiler fuel' as UtilizationPathway,
                  title: 'Direct Biomass Energy / Boiler Fuel',
                  type: 'Thermal Substitution',
                  desc: 'Combustion or pelletized co-firing in captive industrial boilers substituting coal.',
                },
                {
                  route: 'Coir fibre & composites' as UtilizationPathway,
                  title: 'Coir Fibre & Composites',
                  type: 'Bio-Fibre Engineering',
                  desc: 'Decorticated resilient fibres for geotextiles, erosion control, and automotive mats.',
                },
                {
                  route: 'Fibre-based paper & packaging' as UtilizationPathway,
                  title: 'Fibre-Based Paper & Packaging',
                  type: 'Cellulosic Material',
                  desc: 'De-pithed agro-fibre for corrugated kraft paperboard and molded tableware.',
                },
                {
                  route: 'Carbonaceous adsorbent production' as UtilizationPathway,
                  title: 'Carbonaceous Adsorbent Production',
                  type: 'Effluent Adsorbent',
                  desc: 'Engineered biosorbent for textile dye effluent and heavy metal removal.',
                },
              ].map((opt) => (
                <label
                  key={opt.route}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    preferredRoute === opt.route
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="preferredRoute"
                    value={opt.route}
                    checked={preferredRoute === opt.route}
                    onChange={() => setPreferredRoute(opt.route)}
                    className="mt-1 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{opt.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {opt.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                General Notes / Feedstock Description
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Parboiled paddy husk from automated milling. Concrete storage floor."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentSection('material')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Material
              </button>
              <button
                type="button"
                onClick={() => setCurrentSection('review')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Review Summary & Warnings
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION D: REVIEW & CONFIRM */}
        {currentSection === 'review' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Section D: Review Entered Data & Lab Verification Notice
              </h2>
              <p className="text-xs text-slate-500">
                Confirm batch properties before registering in the local simulated inventory
              </p>
            </div>

            {/* Warnings Alert if measurements missing */}
            {(isMoistureMissing || isAshMissing || isCarbonMissing) && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <span className="font-bold">Missing Laboratory Measurements Warning:</span>
                  <p>
                    {isMoistureMissing && '• Moisture percentage is unmeasured. '}
                    {isAshMissing && '• Ash content assay is unmeasured. '}
                    {isCarbonMissing && '• Fixed carbon assay is unmeasured. '}
                  </p>
                  <p className="text-[11px] text-amber-800">
                    This batch will be labelled as <strong>"Provisional (Missing Labs)"</strong>. In the Smart Matching Engine, provisional batches require manual verification before final haulage contracts.
                  </p>
                </div>
              </div>
            )}

            {/* Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Residue Type</span>
                  <p className="font-bold text-slate-900 text-sm">{residueType}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Quantity</span>
                  <p className="font-bold text-slate-900 text-sm">{quantityTonnes} Tonnes</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">District</span>
                  <p className="font-bold text-slate-900 text-sm">{district}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Route</span>
                  <p className="font-bold text-emerald-800 text-sm">{preferredRoute}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Moisture</span>
                  <p className="font-medium text-slate-800">{moisturePercent ? `${moisturePercent}%` : 'Not measured'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Ash Content</span>
                  <p className="font-medium text-slate-800">{ashPercent ? `${ashPercent}%` : 'Not measured'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Fixed Carbon</span>
                  <p className="font-medium text-slate-800">{carbonContentPercent ? `${carbonContentPercent}%` : 'Not measured'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                Supplier: <strong className="text-slate-800">{supplierName}</strong> ({supplierType}) • Location: {location} • Contact: {contactPerson} ({contactPhone})
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentSection('route')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Route Selection
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Create Batch
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
