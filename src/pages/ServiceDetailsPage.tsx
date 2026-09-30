import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  Layers,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  FileCheck2,
  ListOrdered,
  AlertCircle,
  Info,
  Compass,
  ArrowRight,
  MonitorCheck,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { OfficeMap } from '../components/OfficeMap';
import { useAuth } from '../context/AuthContext';

export const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const enriched = useMemo(
    () => (id ? dataService.getEnrichedServiceById(id) : undefined),
    [id]
  );

  const [isSaved, setIsSaved] = useState<boolean>(() =>
    Boolean(user && id && dataService.isServiceSaved(user.id, id))
  );
  const [checkedReqIds, setCheckedReqIds] = useState<Set<string>>(new Set());
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Friendly Invalid Service State
  if (!enriched) {
    const fallbackServices = dataService.getAllEnrichedServices().slice(0, 4);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div
          className="bg-white rounded-2xl border border-amber-300 p-8 space-y-4"
          role="alert"
        >
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <h1 className="text-xl font-bold text-[#0F172A]">
              Service Record Not Found
            </h1>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            We could not find a government service matching the identifier{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono-tabular text-xs">
              {id}
            </code>
            . It may have been moved or removed. Please search for your service
            below or choose one of our popular civic services.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/services"
              className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Service Search</span>
            </Link>
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Go to Homepage
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#0F172A]">
            Popular Government Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fallbackServices.map((item) => (
              <Link
                key={item.service.id}
                to={`/services/${item.service.id}`}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#1E3A8A] transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">
                    {item.service.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.department?.name}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1E3A8A] shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { service, department, office, requirements, steps } = enriched;

  const handleToggleSave = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const nextState = dataService.toggleSaveService(user.id, service.id);
    setIsSaved(nextState);
    setSaveFeedback(
      nextState
        ? 'Saved to your account for quick offline/counter reference.'
        : 'Removed from your saved services.'
    );
    window.setTimeout(() => setSaveFeedback(null), 3500);
  };

  const toggleReqCheck = (reqId: string) => {
    setCheckedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId);
      else next.add(reqId);
      return next;
    });
  };

  const whereToGoNodes = [
    {
      label: 'Department',
      value: department?.name || 'Not specified',
      sub: department?.code || 'Authority',
      icon: Building2,
    },
    {
      label: 'Office',
      value: office?.name || 'Not specified',
      sub: 'Designated Civic Office',
      icon: Compass,
    },
    {
      label: 'Building',
      value: office?.building || 'Not specified',
      sub: office?.address || '',
      icon: MapPin,
    },
    {
      label: 'Floor',
      value: office?.floor || 'Ground Floor',
      sub: 'Level / Wing',
      icon: Layers,
    },
    {
      label: 'Counter',
      value: office?.counter || 'Main Counter',
      sub: 'Public Service Window',
      icon: DoorOpen,
    },
    {
      label: 'Exact Desk',
      value: office?.desk || 'Desk 01',
      sub: `Hours: ${office?.openingTime || '09:30'}–${office?.closingTime || '17:00'}`,
      icon: MonitorCheck,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 font-semibold text-[#1E3A8A] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Services</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span>{service.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium truncate max-w-[220px] sm:max-w-none">
            {service.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Demo information</strong> — Last updated {service.lastUpdated}
          </span>
        </div>
      </div>

      {/* 1. SERVICE HEADER CARD */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-[#1E3A8A]">{service.category}</span>
              <span aria-hidden="true">·</span>
              <span>Fee: {service.fee}</span>
              <span aria-hidden="true">·</span>
              <span>Turnaround: {service.processingTime}</span>
              <span aria-hidden="true">·</span>
              <span>Source: {service.dataSource}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight">
              {service.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Save Service Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                isSaved
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-[#1E3A8A] text-white hover:bg-[#172E6E]'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Saved in Your Account</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" aria-hidden="true" />
                  <span>{user ? 'Save Service' : 'Sign In to Save Service'}</span>
                </>
              )}
            </button>
            {saveFeedback && (
              <p className="text-xs text-emerald-700 font-medium" role="status">
                {saveFeedback}
              </p>
            )}
          </div>
        </div>

        {/* Department & Office Overview Grid */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Summary */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
                01. Responsible Department
              </span>
              {department?.code && (
                <span className="text-xs font-mono-tabular text-slate-500">
                  Code: {department.code}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {department?.name || 'Department Pending'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {department?.description ||
                'Responsible authority for processing and verifying this civic service.'}
            </p>
          </div>

          {/* Office Summary */}
          <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
                02. Designated Office & Counter
              </span>
              {office && (
                <span className="text-xs font-mono-tabular font-semibold text-emerald-800">
                  Open {office.openingTime} – {office.closingTime}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {office?.name || 'Office Pending'}
            </h2>
            {office ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500 block">Building & Floor</span>
                  <strong className="text-[#0F172A]">
                    {office.building} · {office.floor}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Counter & Desk</span>
                  <strong className="text-[#1E3A8A] font-mono-tabular">
                    {office.counter} · {office.desk}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Street Address</span>
                  <strong className="text-slate-800">{office.address}</strong>
                </div>
                <div className="flex items-center gap-1.5 font-mono-tabular">
                  <Phone className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                  <span>{office.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                  <span className="truncate">{office.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Office assignment details are currently being updated.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. VISUAL "WHERE EXACTLY SHOULD I GO?" CARD */}
      <section
        className="bg-white rounded-2xl border-2 border-[#1E3A8A]/20 p-6 sm:p-8 space-y-6"
        aria-labelledby="exact-destination-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
              Exact Wayfinding Path
            </span>
            <h2
              id="exact-destination-heading"
              className="text-xl sm:text-2xl font-bold text-[#0F172A]"
            >
              Where exactly should I go?
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Follow this 6-level hierarchy from department down to the exact desk
          </span>
        </div>

        {/* 6 Connected Nodes: Department -> Office -> Building -> Floor -> Counter -> Desk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {whereToGoNodes.map((node, index) => {
            const Icon = node.icon;
            const isFinalDesk = index === whereToGoNodes.length - 1;
            return (
              <div key={node.label} className="flex flex-col lg:flex-row items-stretch">
                <div
                  className={`flex-1 rounded-xl p-4 border flex flex-col justify-between gap-3 ${
                    isFinalDesk
                      ? 'bg-[#0F172A] border-[#0F172A] text-white'
                      : 'bg-slate-50/90 border-slate-200 text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isFinalDesk
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-[#1E3A8A] text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span
                      className={`text-xs font-mono-tabular font-semibold ${
                        isFinalDesk ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      0{index + 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`text-[11px] uppercase tracking-wider font-semibold block ${
                        isFinalDesk ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {node.label}
                    </span>
                    <p
                      className={`text-sm font-bold leading-snug ${
                        isFinalDesk ? 'text-white' : 'text-[#0F172A]'
                      }`}
                    >
                      {node.value}
                    </p>
                    <p
                      className={`text-xs leading-snug ${
                        isFinalDesk ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      {node.sub}
                    </p>
                  </div>
                </div>

                {index < whereToGoNodes.length - 1 && (
                  <div
                    className="flex items-center justify-center py-1 lg:py-0 lg:px-1 text-[#1E3A8A]"
                    aria-hidden="true"
                  >
                    <ArrowRight className="hidden lg:block w-4 h-4" />
                    <div className="block lg:hidden w-0.5 h-3 bg-[#1E3A8A]/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Office Hours & Contact Bar */}
        {office && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                <Clock className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
                Counter Timings: {office.openingTime} to {office.closingTime} (
                {office.workingDays || 'Mon – Fri'})
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">Helpline: {office.phone}</span>
            </div>
            <span className="text-emerald-700 font-semibold">
              Report directly to {office.counter}, {office.desk}
            </span>
          </div>
        )}
      </section>

      {/* 3. REQUIREMENTS CHECKLIST & NUMBERED PROCEDURE STEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Requirements Checklist */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
                <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                <span>Document Preparation</span>
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Requirements Checklist ({requirements.length})
              </h2>
              <p className="text-xs text-slate-500">
                Check off each document below to make sure you are ready before
                visiting {office?.counter || 'the office'}.
              </p>
            </div>
            {requirements.length > 0 && (
              <span className="text-xs font-mono-tabular font-semibold text-[#1E3A8A] shrink-0">
                {checkedReqIds.size}/{requirements.length} ready
              </span>
            )}
          </div>

          {requirements.length > 0 ? (
            <ul className="space-y-3">
              {requirements.map((req) => {
                const isChecked = checkedReqIds.has(req.id);
                return (
                  <li key={req.id}>
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-xl border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleReqCheck(req.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`text-sm font-bold ${
                              isChecked
                                ? 'line-through text-slate-500'
                                : 'text-[#0F172A]'
                            }`}
                          >
                            {req.name}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              req.required ? 'text-[#1E3A8A]' : 'text-slate-500'
                            }`}
                          >
                            {req.required ? 'Mandatory' : 'If Applicable'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {req.description}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 py-4">
              No specific document requirements are listed in the demo dataset for
              this service. Please carry a valid government photo ID.
            </p>
          )}
        </section>

        {/* Right 6 cols: Numbered Procedure Steps */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
              <ListOrdered className="w-4 h-4" aria-hidden="true" />
              <span>Step-by-Step Procedure</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              How to Complete This Service ({steps.length} Steps)
            </h2>
            <p className="text-xs text-slate-500">
              Follow these exact steps once you arrive at {office?.name || 'the office'}.
            </p>
          </div>

          {steps.length > 0 ? (
            <ol className="space-y-4">
              {steps.map((stepItem, idx) => (
                <li
                  key={stepItem.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/90"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#1E3A8A] text-white font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {stepItem.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-600 py-4">
              Procedure steps are being updated for this demo service.
            </p>
          )}
        </section>
      </div>

      {/* 4. MAP, ANIMATED NAVIGATION VISUAL & DIRECTIONS */}
      <section aria-label="Map and Directions">
        <OfficeMap office={office} serviceName={service.name} />
      </section>

      {/* 5. FINAL SUCCESS SEQUENCE */}
      <section
        className="bg-emerald-950 text-white rounded-2xl border border-emerald-700/60 p-6 sm:p-8 space-y-6"
        aria-label="Service Readiness Verification Summary"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Service Identified ✓', detail: service.name },
            {
              label: 'Department Identified ✓',
              detail: department?.name || 'Verified Department',
            },
            {
              label: 'Office Identified ✓',
              detail: office ? `${office.counter} · ${office.desk}` : 'Verified Office',
            },
            {
              label: 'Requirements Ready ✓',
              detail: `${requirements.length} checklist items listed`,
            },
            {
              label: 'Location Found ✓',
              detail: office?.building || 'Directions ready',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3.5 rounded-xl bg-emerald-900/50 border border-emerald-700/60 space-y-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item.label}</span>
              </div>
              <p className="text-xs text-emerald-100 truncate">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              You know where to go.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200">
              Right Service. Right Office. Right Place. Visit{' '}
              <strong>
                {office?.building}, {office?.floor}, {office?.counter} ({office?.desk})
              </strong>{' '}
              between {office?.openingTime} and {office?.closingTime}.
            </p>
          </div>

          <Link
            to="/services"
            className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-semibold text-xs sm:text-sm transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            Search Another Service
          </Link>
        </div>
      </section>
    </div>
  );
};
