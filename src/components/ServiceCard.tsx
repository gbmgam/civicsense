import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DoorOpen,
  MapPin,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
} from 'lucide-react';
import { EnrichedService } from '../types/civic';

interface ServiceCardProps {
  item: EnrichedService;
  matchReasons?: string[];
  isSaved?: boolean;
  onToggleSave?: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  matchReasons,
  isSaved = false,
  onToggleSave,
}) => {
  const { service, department, office, requirements } = item;

  return (
    <article className="bg-white rounded-xl border border-slate-200 hover:border-[#1E3A8A]/60 transition-colors p-5 sm:p-6 flex flex-col justify-between gap-5">
      <div className="space-y-3.5">
        {/* Clean unboxed metadata header */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="font-semibold text-[#1E3A8A]">{service.category}</span>
            <span aria-hidden="true">·</span>
            <span>Demo information</span>
            {matchReasons && matchReasons.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">
                  {matchReasons[0]}
                </span>
              </>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(service.id)}
              aria-label={
                isSaved
                  ? `Remove ${service.name} from saved services`
                  : `Save ${service.name}`
              }
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isSaved
                  ? 'bg-blue-50 border-blue-200 text-[#1E3A8A]'
                  : 'border-slate-200 text-slate-500 hover:text-[#0F172A] hover:bg-slate-50'
              }`}
              title={isSaved ? 'Saved in your account' : 'Save service for quick access'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Bookmark className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Service Name & Description */}
        <div>
          <h3 className="text-lg font-bold text-[#0F172A] leading-snug">
            <Link
              to={`/services/${service.id}`}
              className="hover:text-[#1E3A8A] transition-colors focus-visible:outline-2 focus-visible:outline-[#1E3A8A] rounded-xs"
            >
              {service.name}
            </Link>
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Structured Civic Trail: Department -> Office -> Exact Location */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Building2
              className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="text-slate-500 block">Responsible Department</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {department?.name || 'Department Not Assigned'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <DoorOpen
              className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="text-slate-500 block">Exact Office & Counter</span>
              <span className="font-semibold text-slate-900 block mt-0.5">
                {office
                  ? `${office.name} · ${office.floor}`
                  : 'Office Not Assigned'}
              </span>
              {office && (
                <span className="text-[#1E3A8A] font-mono-tabular font-medium block mt-0.5">
                  {office.counter} · {office.desk}
                </span>
              )}
            </div>
          </div>

          {office && (
            <div className="sm:col-span-2 flex items-start gap-2.5 pt-1">
              <MapPin
                className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <span className="text-slate-600">
                  <strong className="text-slate-800">{office.building}</strong> —{' '}
                  {office.address}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Bar: Requirements Count, Timings, and View Service CTA */}
      <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono-tabular">
          <span>{requirements.length} required docs</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            {office ? `${office.openingTime}–${office.closingTime}` : service.processingTime}
          </span>
          <span aria-hidden="true">·</span>
          <span>{service.fee}</span>
        </div>

        <Link
          to={`/services/${service.id}`}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#172E6E] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
        >
          <span>View Service</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
