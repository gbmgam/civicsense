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
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

export interface FlowStage {
  id: string;
  stepLabel: string;
  title: string;
  subtitle: string;
  hoverHint: string;
  verifiedLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CIVIC_FLOW_STAGES: FlowStage[] = [
  {
    id: 'citizen',
    stepLabel: '01',
    title: 'Citizen',
    subtitle: '"I need a service"',
    hoverHint: 'Start with your real-world civic need in plain words.',
    verifiedLabel: 'Citizen Need Stated',
    icon: User,
  },
  {
    id: 'service',
    stepLabel: '02',
    title: 'Service Search',
    subtitle: 'Identify exact service',
    hoverHint: 'Tell us what you need.',
    verifiedLabel: 'Service Identified ✓',
    icon: Search,
  },
  {
    id: 'department',
    stepLabel: '03',
    title: 'Department',
    subtitle: 'Responsible authority',
    hoverHint: 'We identify who handles it.',
    verifiedLabel: 'Department Identified ✓',
    icon: Building2,
  },
  {
    id: 'office',
    stepLabel: '04',
    title: 'Office',
    subtitle: 'Building, floor & counter',
    hoverHint: 'Find the exact office.',
    verifiedLabel: 'Office Identified ✓',
    icon: DoorOpen,
  },
  {
    id: 'requirements',
    stepLabel: '05',
    title: 'Requirements',
    subtitle: 'Checklist & procedure',
    hoverHint: 'Know what to bring.',
    verifiedLabel: 'Requirements Ready ✓',
    icon: FileCheck2,
  },
  {
    id: 'location',
    stepLabel: '06',
    title: 'Exact Location',
    subtitle: 'Verified address & pin',
    hoverHint: 'Pinpoint the exact civic building on the map.',
    verifiedLabel: 'Destination Found ✓',
    icon: MapPin,
  },
  {
    id: 'directions',
    stepLabel: '07',
    title: 'Directions',
    subtitle: 'Turn-by-turn route',
    hoverHint: 'Know where to go.',
    verifiedLabel: 'Route Ready ✓',
    icon: Navigation,
  },
];

interface CivicFlowchartProps {
  variant?: 'horizontal' | 'auth-vertical' | 'demo-interactive';
  isTyping?: boolean;
  activeStepIndex?: number;
  onSelectStep?: (index: number) => void;
  darkTheme?: boolean;
}

export const CivicFlowchart: React.FC<CivicFlowchartProps> = ({
  variant = 'horizontal',
  isTyping = false,
  activeStepIndex: controlledStepIndex,
  onSelectStep,
  darkTheme = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [internalStep, setInternalStep] = useState<number>(CIVIC_FLOW_STAGES.length);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeStep =
    typeof controlledStepIndex === 'number' ? controlledStepIndex : internalStep;

  useEffect(() => {
    if (prefersReducedMotion || typeof controlledStepIndex === 'number') {
      setInternalStep(CIVIC_FLOW_STAGES.length);
      return;
    }

    // Loop every ~10 seconds on auth or horizontal auto-flow; slow down if user is typing
    const intervalMs = isTyping ? 2600 : 1250;
    const timer = window.setInterval(() => {
      setInternalStep((prev) => {
        if (prev >= CIVIC_FLOW_STAGES.length + 1) {
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, controlledStepIndex, isTyping]);

  if (variant === 'auth-vertical') {
    return (
      <div className="space-y-4" aria-label="CivicGuide Journey Flowchart">
        <div className="space-y-2.5">
          {CIVIC_FLOW_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = prefersReducedMotion || activeStep >= idx;
            const isCurrent = !prefersReducedMotion && activeStep === idx;

            return (
              <div key={stage.id} className="relative">
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isCompleted ? 1 : 0.45,
                    scale: isCurrent && !isTyping ? 1.015 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                    isCurrent
                      ? 'bg-white/15 border-amber-400/80 text-white'
                      : isCompleted
                      ? 'bg-white/10 border-white/15 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        stage.id === 'location' && isCompleted
                          ? 'bg-amber-500 text-slate-950'
                          : isCompleted
                          ? 'bg-[#1D4ED8] text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-tabular text-blue-200">
                          {stage.stepLabel}
                        </span>
                        <p className="text-sm font-semibold truncate">{stage.title}</p>
                      </div>
                      <p className="text-xs text-blue-100/80 truncate">{stage.hoverHint}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isCompleted && (
                      <span className="text-xs font-medium text-emerald-300 flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="hidden sm:inline">{stage.verifiedLabel}</span>
                      </span>
                    )}
                  </div>
                </motion.div>

                {idx < CIVIC_FLOW_STAGES.length - 1 && (
                  <div className="flex justify-start pl-7 py-0.5" aria-hidden="true">
                    <div
                      className={`w-0.5 h-2.5 transition-colors ${
                        isCompleted ? 'bg-emerald-400/70' : 'bg-white/15'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final destination outcome card */}
        <motion.div
          initial={false}
          animate={{
            opacity: prefersReducedMotion || activeStep >= CIVIC_FLOW_STAGES.length - 1 ? 1 : 0.55,
            y:
              !prefersReducedMotion && activeStep >= CIVIC_FLOW_STAGES.length - 1
                ? 0
                : 4,
          }}
          transition={{ duration: 0.25 }}
          className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-white flex items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
              Destination Reached
            </p>
            <p className="text-base font-bold tracking-tight text-white">
              Right Service. Right Office. Right Place.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Horizontal / Grid Flowchart for Homepage & How-It-Works
  return (
    <div className="w-full space-y-6" aria-label="CivicGuide Core Service Flowchart">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 relative">
        {CIVIC_FLOW_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = prefersReducedMotion || activeStep >= idx;
          const isSelected = activeStep === idx;
          const isHovered = hoveredId === stage.id;

          return (
            <div key={stage.id} className="flex flex-col lg:flex-row items-stretch">
              <motion.button
                type="button"
                onClick={() => onSelectStep && onSelectStep(idx)}
                onMouseEnter={() => setHoveredId(stage.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(stage.id)}
                onBlur={() => setHoveredId(null)}
                initial={false}
                animate={{
                  opacity: isCompleted ? 1 : 0.65,
                  y: isHovered || isSelected ? -2 : 0,
                }}
                transition={{ duration: 0.18 }}
                className={`w-full text-left p-3.5 rounded-xl border transition-colors flex flex-col justify-between relative group ${
                  onSelectStep ? 'cursor-pointer' : 'cursor-default'
                } ${
                  darkTheme
                    ? isSelected
                      ? 'bg-blue-900/60 border-amber-400 text-white'
                      : 'bg-slate-900/90 border-slate-700 text-white hover:border-blue-400'
                    : isSelected
                    ? 'bg-blue-50/90 border-[#1E3A8A] text-[#0F172A] shadow-xs'
                    : 'bg-white border-slate-200/90 text-[#0F172A] hover:border-[#1E3A8A]/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        stage.id === 'location'
                          ? 'bg-amber-500 text-slate-950'
                          : isCompleted
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span
                      className={`text-xs font-mono-tabular font-semibold ${
                        darkTheme ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {stage.stepLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold leading-snug">{stage.title}</h4>
                    <p
                      className={`text-xs mt-0.5 leading-snug ${
                        darkTheme ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                {/* Hover / Focus Hint */}
                <div
                  className={`mt-3 pt-2 border-t text-[11px] leading-snug transition-opacity ${
                    darkTheme
                      ? 'border-slate-800 text-blue-200'
                      : 'border-slate-100 text-[#1E3A8A] font-medium'
                  }`}
                >
                  {stage.hoverHint}
                </div>
              </motion.button>

              {idx < CIVIC_FLOW_STAGES.length - 1 && (
                <div
                  className="flex items-center justify-center py-1 lg:py-0 lg:px-1 text-slate-400 shrink-0"
                  aria-hidden="true"
                >
                  <ArrowRight className="hidden lg:block w-4 h-4 text-[#1E3A8A]/60" />
                  <ArrowDown className="block lg:hidden w-4 h-4 text-[#1E3A8A]/60" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Banner: Right Service / Right Office / Right Place */}
      <div
        className={`rounded-xl px-5 py-3.5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          darkTheme
            ? 'bg-slate-900 border-slate-700 text-white'
            : 'bg-[#0F172A] border-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold tracking-tight">
            Right Service. Right Office. Right Place.
          </span>
        </div>
        <span className="text-xs text-slate-300">
          Hover or focus any stage above to inspect how CivicGuide connects your journey.
        </span>
      </div>
    </div>
  );
};
