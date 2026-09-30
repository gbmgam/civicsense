import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  User,
  Search,
  Building2,
  DoorOpen,
  FileCheck2,
  MapPin,
  Navigation,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

const HERO_STAGES = [
  {
    id: 'citizen',
    label: 'Citizen',
    detail: '"I need a DDO signature"',
    hint: 'Tell us what you need.',
    icon: User,
  },
  {
    id: 'search',
    label: 'Service Search',
    detail: 'DDO Signature & Bill Auth',
    hint: 'Tell us what you need.',
    icon: Search,
  },
  {
    id: 'department',
    label: 'Department',
    detail: 'Revenue & Treasury Dept',
    hint: 'We identify who handles it.',
    icon: Building2,
  },
  {
    id: 'office',
    label: 'Exact Office',
    detail: 'Block A · 2nd Fl · Counter 4 · Desk B-12',
    hint: 'Find the exact office.',
    icon: DoorOpen,
  },
  {
    id: 'requirements',
    label: 'Requirements',
    detail: 'Form TR-22 + ID + Sanction Memo',
    hint: 'Know what to bring.',
    icon: FileCheck2,
  },
  {
    id: 'location',
    label: 'Exact Location',
    detail: '14 Secretariat Marg, Civil Lines',
    hint: 'Verified building coordinates.',
    icon: MapPin,
  },
  {
    id: 'directions',
    label: 'Directions',
    detail: 'Direct Route Verified',
    hint: 'Know where to go.',
    icon: Navigation,
  },
];

export const HeroJourneyAnimation: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<number>(prefersReducedMotion ? 8 : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStep(8);
      return;
    }
    const timer = window.setInterval(() => {
      setStep((prev) => (prev >= 9 ? 0 : prev + 1));
    }, 1150);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const routeReached = prefersReducedMotion || step >= 7;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5"
      aria-label="Interactive visual showing how CivicGuide connects a citizen from service search to exact office directions"
    >
      {/* Top Bar of the Visual */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-xs font-semibold text-[#1E3A8A]">
            Live Civic Navigation Flow
          </span>
          <h3 className="text-sm font-bold text-[#0F172A]">
            From Knowing WHAT You Need to Knowing WHERE to Go
          </h3>
        </div>
        {!prefersReducedMotion && (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Replay journey sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Replay</span>
          </button>
        )}
      </div>

      {/* Progressive Stages Connected with Lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {HERO_STAGES.map((item, index) => {
          const Icon = item.icon;
          const active = prefersReducedMotion || step >= index;
          const isCurrent = !prefersReducedMotion && step === index;

          return (
            <motion.div
              key={item.id}
              initial={false}
              animate={{
                opacity: active ? 1 : 0.32,
                scale: isCurrent ? 1.015 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                index === HERO_STAGES.length - 1 ? 'sm:col-span-2' : ''
              } ${
                isCurrent
                  ? 'bg-blue-50/80 border-[#1E3A8A]'
                  : active
                  ? 'bg-slate-50/80 border-slate-200'
                  : 'bg-slate-50/30 border-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  item.id === 'location' && active
                    ? 'bg-amber-500 text-slate-950'
                    : active
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#0F172A] truncate">
                    {item.label}
                  </span>
                  {active && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="text-xs font-medium text-[#1E3A8A] truncate mt-0.5">
                  {item.detail}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{item.hint}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Vector Route Map Visualization */}
      <div className="rounded-xl bg-[#0F172A] text-white p-4 border border-slate-800 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">
            Route Preview: Citizen → Treasury Annex (Counter 4, Desk B-12)
          </span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              routeReached ? 'text-emerald-400' : 'text-amber-300'
            }`}
          >
            {routeReached ? 'Right Place Reached ✓' : 'Tracing Route...'}
          </span>
        </div>

        <div className="relative h-32 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 420 120"
            className="w-full h-full"
            role="img"
            aria-label="Map route illustration from Citizen start point to exact government office pin"
          >
            {/* Subtle civic street grid lines */}
            <g stroke="#1E293B" strokeWidth="1">
              <line x1="0" y1="30" x2="420" y2="30" />
              <line x1="0" y1="65" x2="420" y2="65" />
              <line x1="0" y1="95" x2="420" y2="95" />
              <line x1="70" y1="0" x2="70" y2="120" />
              <line x1="160" y1="0" x2="160" y2="120" />
              <line x1="260" y1="0" x2="260" y2="120" />
              <line x1="350" y1="0" x2="350" y2="120" />
            </g>

            {/* Background road track */}
            <path
              d="M 55 88 L 145 88 L 195 45 L 345 45"
              fill="none"
              stroke="#334155"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Animated active route line */}
            <motion.path
              d="M 55 88 L 145 88 L 195 45 L 345 45"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{
                opacity: routeReached ? 1 : 0.4,
                pathLength: routeReached ? 1 : 0.25,
              }}
              transition={{ duration: 0.6 }}
            />

            {/* Citizen Starting Point */}
            <g transform="translate(55, 88)">
              <circle r="9" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2" />
              <circle r="3.5" fill="#FFFFFF" />
              <text
                x="0"
                y="22"
                textAnchor="middle"
                fill="#CBD5E1"
                fontSize="10"
                fontWeight="600"
              >
                Citizen
              </text>
            </g>

            {/* Destination Office Building + Warm Amber Pin */}
            <g transform="translate(345, 45)">
              <rect
                x="-16"
                y="-8"
                width="32"
                height="24"
                rx="4"
                fill={routeReached ? '#065F46' : '#1E293B'}
                stroke={routeReached ? '#34D399' : '#64748B'}
                strokeWidth="1.5"
              />
              {/* Animated bouncing map pin (transform only) */}
              <motion.g
                initial={false}
                animate={{
                  y: routeReached && !prefersReducedMotion ? [0, -6, 0] : 0,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.45,
                  repeat: routeReached && !prefersReducedMotion ? 1 : 0,
                }}
              >
                <path
                  d="M 0 -6 C -7 -14 -11 -19 -11 -24 A 11 11 0 1 1 11 -24 C 11 -19 7 -14 0 -6 Z"
                  fill="#F59E0B"
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
                <circle cx="0" cy="-24" r="4" fill="#0F172A" />
              </motion.g>
              <text
                x="0"
                y="30"
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize="10"
                fontWeight="700"
              >
                Counter 4 · Desk B-12
              </text>
            </g>
          </svg>
        </div>

        {/* Final Tagline Banner */}
        <motion.div
          initial={false}
          animate={{
            opacity: routeReached ? 1 : 0.6,
          }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-between gap-2 pt-1"
        >
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
            Right Service. Right Office. Right Place.
          </span>
          <span className="text-xs text-emerald-300 font-medium">
            Zero wrong-office visits
          </span>
        </motion.div>
      </div>
    </div>
  );
};
