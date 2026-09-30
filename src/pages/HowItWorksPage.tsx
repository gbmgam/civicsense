import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Building2,
  DoorOpen,
  FileCheck2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { CivicFlowchart } from '../components/CivicFlowchart';

const FIVE_STEPS_DETAIL = [
  {
    num: '01',
    title: 'Select your service',
    subtitle: 'Tell CivicGuide what government service you need.',
    hoverHint: 'Tell us what you need.',
    detail:
      'Use everyday natural language such as "I need a DDO signature" or "Where do I apply for an income certificate?". Our deterministic matcher extracts your core intent and maps it to the right official service.',
    icon: Search,
  },
  {
    num: '02',
    title: 'Identify the department',
    subtitle: 'Find the department responsible for that service.',
    hoverHint: 'We identify who handles it.',
    detail:
      'Instead of guessing between Municipal, Revenue, Treasury, or Social Welfare authorities, CivicGuide shows the exact responsible department and its jurisdiction.',
    icon: Building2,
  },
  {
    num: '03',
    title: 'Find the exact office',
    subtitle: 'Get the building, floor, counter or desk information.',
    hoverHint: 'Find the exact office.',
    detail:
      'Large government complexes have dozens of rooms. We pinpoint the exact Building, Wing, Floor, Counter number, Desk code, and working hours.',
    icon: DoorOpen,
  },
  {
    num: '04',
    title: 'Check requirements',
    subtitle: 'Know which documents and steps are required.',
    hoverHint: 'Know what to bring.',
    detail:
      'Review an interactive document checklist and numbered procedure steps before leaving home so you are never turned away for a missing photocopy or form.',
    icon: FileCheck2,
  },
  {
    num: '05',
    title: 'Get directions',
    subtitle: 'Navigate directly to the required location.',
    hoverHint: 'Know where to go.',
    detail:
      'Inspect the office pin on an OpenStreetMap view, verify the street address and GPS coordinates, and launch one-click directions.',
    icon: Navigation,
  },
];

export const HowItWorksPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-5">
        <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
          How CivicGuide Works
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight max-w-3xl">
          From Knowing WHAT You Need to Knowing WHERE to Go
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Find the right service. Find the right office. Get there with
          confidence. CivicGuide bridges the gap between knowing the name of a
          certificate or signature and standing at the right counter with the
          right documents in hand.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/services?q=I%20need%20a%20DDO%20signature"
            className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs sm:text-sm font-semibold hover:bg-[#172E6E] inline-flex items-center gap-2"
          >
            <span>Try Demo Search: "I need a DDO signature"</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/services"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50"
          >
            Browse All Services
          </Link>
        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              The Everyday Citizen Problem
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Citizens usually know <strong>what</strong> government service they
            need — such as a DDO signature, an income certificate, or a property
            deed registration — but face four frustrating barriers:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="font-mono-tabular font-bold text-amber-700">01.</span>
              <span>Unclear which department handles that specific request.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono-tabular font-bold text-amber-700">02.</span>
              <span>
                Visiting the wrong building, floor, or window inside a large
                district complex.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono-tabular font-bold text-amber-700">03.</span>
              <span>
                Discovering only at the counter that a mandatory form or ID copy
                is missing.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono-tabular font-bold text-amber-700">04.</span>
              <span>
                Making repeat trips due to unclear office timings or unverified
                directions.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-[#0F172A] text-white rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h2 className="text-lg font-bold text-white">
              The CivicGuide Core Flow
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every page in CivicGuide reinforces a single deterministic chain of
            information so your first visit succeeds:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono-tabular text-xs sm:text-sm text-blue-300 font-semibold">
            SERVICE → DEPARTMENT → OFFICE → REQUIREMENTS → DIRECTIONS
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Pinpoints Building, Floor, Counter number, and exact Desk code.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Provides an interactive document checklist and numbered procedure.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Shows verified street address, coordinates, and resilient map
                directions.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Interactive Flowchart */}
      <section className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
            Interactive Architecture
          </p>
          <h2 className="text-2xl font-bold text-[#0F172A]">
            7-Stage Civic Journey Flowchart
          </h2>
        </div>

        <CivicFlowchart
          variant="horizontal"
          activeStepIndex={selectedStage}
          onSelectStep={(idx) => setSelectedStage(idx)}
        />
      </section>

      {/* Detailed 5 Steps Breakdown */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0F172A]">
          The 5 Steps in Detail
        </h2>
        <div className="space-y-4">
          {FIVE_STEPS_DETAIL.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 max-w-3xl">
                  <div className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-tabular font-bold text-[#1E3A8A]">
                        STEP {step.num}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-xs font-medium text-slate-500">
                        {step.hoverHint}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      {step.title} — {step.subtitle}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
                <Link
                  to="/services"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 transition-colors self-start md:self-center shrink-0 whitespace-nowrap"
                >
                  Try Step {step.num} →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-6 scroll-mt-24"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>About CivicGuide & Data Transparency</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Designed for Public Clarity, Accessibility, and Trust
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              CivicGuide is built around a simple civic promise: citizens should
              not have to understand internal government org charts just to get a
              routine signature, certificate, or license.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every record in the CivicGuide database tracks three explicit
              provenance fields — <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">dataSource</code>,{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">verified</code>, and{' '}
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">lastUpdated</code> — so
              citizens and administrators always know when office or counter
              details were last audited.
            </p>
          </div>

          <div className="lg:col-span-5 bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Important Demo Data Notice</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              All 5 departments, 10 offices, and 17 services pre-loaded in this
              application are labeled <strong>"Demo information"</strong> for
              presentation and evaluation purposes. None of the sample counter
              numbers or fees represent official statutory advice.
            </p>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Administrators can sign in to the Admin Portal to add, edit, or
              replace any department, office, or service with verified municipal
              data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
