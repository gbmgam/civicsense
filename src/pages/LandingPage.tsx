import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Building2,
  DoorOpen,
  FileCheck2,
  MapPin,
  Navigation,
  CheckCircle2,
  Compass,
  Info,
} from 'lucide-react';
import { HeroJourneyAnimation } from '../components/HeroJourneyAnimation';
import { CivicFlowchart } from '../components/CivicFlowchart';
import { dataService } from '../services/dataService';
import { ServiceCard } from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

const QUICK_SEARCH_TERMS = [
  'DDO signature',
  'Income certificate',
  'Birth certificate',
  'Pension application',
  'Trade license',
  'Property document',
];

const HOW_IT_WORKS_CARDS = [
  {
    number: '01',
    title: 'Select your service',
    description: 'Tell CivicGuide what government service you need.',
    hint: 'Tell us what you need.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Identify the department',
    description: 'Find the department responsible for that service.',
    hint: 'We identify who handles it.',
    icon: Building2,
  },
  {
    number: '03',
    title: 'Find the exact office',
    description: 'Get the building, floor, counter or desk information.',
    hint: 'Find the exact office.',
    icon: DoorOpen,
  },
  {
    number: '04',
    title: 'Check requirements',
    description: 'Know which documents and steps are required.',
    hint: 'Know what to bring.',
    icon: FileCheck2,
  },
  {
    number: '05',
    title: 'Get directions',
    description: 'Navigate directly to the required location.',
    hint: 'Know where to go.',
    icon: Navigation,
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [selectedDemoServiceId, setSelectedDemoServiceId] =
    useState<string>('srv-ddo-signature');

  const allEnriched = dataService.getAllEnrichedServices();
  const featuredServices = allEnriched.slice(0, 6);
  const demoService =
    allEnriched.find((s) => s.service.id === selectedDemoServiceId) ||
    allEnriched[0];

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    if (!user) return new Set();
    return new Set(dataService.getSavedServices(user.id).map((s) => s.serviceId));
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/services?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/services');
    }
  };

  const handleQuickTermClick = (term: string) => {
    navigate(`/services?q=${encodeURIComponent(term)}`);
  };

  const handleToggleSave = (serviceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const nowSaved = dataService.toggleSaveService(user.id, serviceId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
  };

  const demoStepsData = [
    {
      stepNumber: '01',
      label: 'Enter Service',
      title: 'Citizen Enters Natural Language Query',
      summary: `Query entered: "I need a ${demoService?.service.name.toLowerCase()}"`,
      detail:
        'Citizens do not need to know technical bureaucratic codes. Plain everyday requests are matched immediately.',
    },
    {
      stepNumber: '02',
      label: 'Service Identified',
      title: demoService?.service.name || 'Service Identified',
      summary: demoService?.service.description || '',
      detail: `Category: ${demoService?.service.category} · Fee: ${demoService?.service.fee} · Turnaround: ${demoService?.service.processingTime}`,
    },
    {
      stepNumber: '03',
      label: 'Department',
      title: demoService?.department?.name || 'Department Identified',
      summary: demoService?.department?.description || '',
      detail: `Department Code: ${demoService?.department?.code} · Verified Authority`,
    },
    {
      stepNumber: '04',
      label: 'Exact Office',
      title: demoService?.office?.name || 'Office Identified',
      summary: `${demoService?.office?.building} · ${demoService?.office?.floor}`,
      detail: `Report directly to ${demoService?.office?.counter} at ${demoService?.office?.desk}. Hours: ${demoService?.office?.openingTime} – ${demoService?.office?.closingTime}.`,
    },
    {
      stepNumber: '05',
      label: 'Requirements',
      title: `${demoService?.requirements.length || 0} Required Documents & ${
        demoService?.steps.length || 0
      } Procedure Steps`,
      summary:
        demoService?.requirements.map((r) => r.name).join(' • ') ||
        'Checklist verified',
      detail:
        'Carry these exact documents before leaving home to eliminate repeat visits.',
    },
    {
      stepNumber: '06',
      label: 'Exact Location',
      title: demoService?.office?.building || 'Building Location',
      summary: demoService?.office?.address || '',
      detail:
        demoService?.office?.lat && demoService?.office?.lng
          ? `GPS Coordinates: ${demoService.office.lat.toFixed(4)}° N, ${demoService.office.lng.toFixed(4)}° E`
          : 'Street address verified.',
    },
    {
      stepNumber: '07',
      label: 'Directions',
      title: 'Direct Route & Counter Arrival',
      summary: 'Turn-by-turn navigation straight to the building entrance and counter.',
      detail:
        'Open directly in OpenStreetMap or Google Maps and walk straight to the right desk on your first visit.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border-b border-slate-200 pt-10 pb-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Search Box & Quick Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-[#1E3A8A] tracking-tight">
                  From knowing WHAT you need to knowing WHERE to go.
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0F172A] tracking-tight leading-[1.15]">
                  Find the Right Government Service. Find the Right Office.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed pt-1">
                  Search for a government service and get the department, office,
                  requirements and directions you need.
                </p>
              </div>

              {/* Large Civic Search Box */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl border-2 border-slate-300 focus-within:border-[#1E3A8A] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
                role="search"
                aria-label="Search government services"
              >
                <div className="flex items-center gap-3 flex-1 px-3 py-2">
                  <Search
                    className="w-5 h-5 text-[#1E3A8A] shrink-0"
                    aria-hidden="true"
                  />
                  <label htmlFor="hero-service-search" className="sr-only">
                    Search for a government service
                  </label>
                  <input
                    id="hero-service-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. DDO signature, income certificate, birth certificate..."
                    className="w-full text-sm sm:text-base text-[#0F172A] placeholder:text-slate-400 bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <span>Find Service</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              {/* "Try searching for:" interactive filter buttons */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-500 block">
                  Try searching for:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_SEARCH_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleQuickTermClick(term)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-blue-50/50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tagline & Demo Notice */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-200/80">
                <span className="font-semibold text-slate-700">
                  Find the right service. Find the right office. Get there with confidence.
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <Info className="w-3.5 h-3.5 text-[#1E3A8A]" aria-hidden="true" />
                  Demo information dataset
                </span>
              </div>
            </div>

            {/* Right Column: Hero Journey Animation */}
            <div className="lg:col-span-5">
              <HeroJourneyAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 5 Large Cards Joined by a Flow Line */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
            The CivicGuide Method
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            How It Works — Five Clear Steps to the Right Counter
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every search follows a structured five-stage verification path so you
            never visit the wrong building or stand in the wrong queue.
          </p>
        </div>

        {/* 5 Large Cards Joined by a Horizontal Flow Line on Desktop */}
        <div className="relative">
          {/* Connecting line on large screens */}
          <div
            className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-slate-200 -z-10"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {HOW_IT_WORKS_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.number}
                  className="bg-white rounded-xl border border-slate-200 hover:border-[#1E3A8A] transition-colors p-5 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-xs">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-mono-tabular font-bold text-slate-400 group-hover:text-[#1E3A8A] transition-colors">
                        {card.number}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-[#0F172A]">
                        {card.number}. {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs font-medium text-[#1E3A8A]">
                    {card.hint}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REUSABLE FLOWCHART COMPONENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
              End-to-End Architecture
            </p>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Complete Service-to-Location Flowchart
            </h2>
          </div>
          <Link
            to="/how-it-works"
            className="text-xs font-semibold text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore detailed walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CivicFlowchart
          variant="horizontal"
          activeStepIndex={demoStep}
          onSelectStep={(idx) => setDemoStep(idx)}
        />
      </section>

      {/* DEMO JOURNEY SECTION (Interactive 7-Step Presentation Walkthrough) */}
      <section
        id="demo-journey"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-[#0F172A] text-white rounded-2xl border border-slate-800 p-6 sm:p-8 lg:p-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Interactive Presentation Walkthrough (7-Step Demo Journey)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                See How a Citizen Resolves a Real Visit in 7 Steps
              </h2>
              <p className="text-sm text-slate-300">
                Select a sample government service below and step through each
                stage from initial query to exact counter arrival.
              </p>
            </div>

            {/* Service Switcher for Presentation */}
            <div className="space-y-1.5 shrink-0">
              <label
                htmlFor="demo-service-select"
                className="text-xs font-medium text-slate-400 block"
              >
                 Inspect Sample Service:
              </label>
              <select
                id="demo-service-select"
                value={selectedDemoServiceId}
                onChange={(e) => {
                  setSelectedDemoServiceId(e.target.value);
                  setDemoStep(0);
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 focus:outline-2 focus:outline-amber-400"
              >
                <option value="srv-ddo-signature">
                  DDO Signature & Bill Authorization
                </option>
                <option value="srv-income-certificate">
                  Income Certificate Issuance
                </option>
                <option value="srv-birth-certificate">
                  Birth Certificate Issuance & Correction
                </option>
                <option value="srv-pension-application">
                  Pension Application & PPO Sanction
                </option>
                <option value="srv-property-document">
                  Property Document & Sale Deed Registration
                </option>
              </select>
            </div>
          </div>

          {/* 7-Step Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {demoStepsData.map((item, idx) => {
              const isSelected = demoStep === idx;
              const isPassed = demoStep > idx;
              return (
                <button
                  key={item.stepNumber}
                  type="button"
                  onClick={() => setDemoStep(idx)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1D4ED8] border-blue-400 text-white'
                      : isPassed
                      ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono-tabular">
                    <span>Step {item.stepNumber}</span>
                    {isPassed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold leading-snug block">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Detail Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs text-blue-300 font-mono-tabular">
                <span>STAGE {demoStepsData[demoStep].stepNumber} OF 07</span>
                <span aria-hidden="true">·</span>
                <span>{demoStepsData[demoStep].label}</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {demoStepsData[demoStep].title}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {demoStepsData[demoStep].summary}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {demoStepsData[demoStep].detail}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDemoStep((prev) => (prev > 0 ? prev - 1 : 6))}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold border border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  onClick={() => setDemoStep((prev) => (prev < 6 ? prev + 1 : 0))}
                  className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  {demoStep < 6 ? 'Next Step →' : 'Restart Tour'}
                </button>
              </div>
              {demoService && (
                <Link
                  to={`/services/${demoService.service.id}`}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#1D4ED8] text-white hover:bg-blue-600 text-center flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Service Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CIVIC SERVICES DIRECTORY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
              Popular Citizen Requests
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Frequently Searched Government Services
            </h2>
          </div>
          <Link
            to="/services"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
          >
            <span>Browse All {allEnriched.length} Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredServices.map((item) => (
            <ServiceCard
              key={item.service.id}
              item={item}
              isSaved={savedIds.has(item.service.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
