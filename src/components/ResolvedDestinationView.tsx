import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Building2,
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Phone,
  FileCheck2,
  AlertTriangle,
  Image as ImageIcon,
  RotateCcw,
  Layers,
  DoorOpen,
  UserCheck,
  ShieldAlert,
  Globe,
  Plus,
} from 'lucide-react';
import { ResolvedOfficeDestination } from '../services/civicAssistantEngine';
import { CampusSvgMap } from './CampusSvgMap';

interface ResolvedDestinationViewProps {
  destination: ResolvedOfficeDestination;
  onStartNewSearch: () => void;
}

export const ResolvedDestinationView: React.FC<ResolvedDestinationViewProps> = ({
  destination,
  onStartNewSearch,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [checkedReqIds, setCheckedReqIds] = useState<Set<string>>(new Set());
  const [pinLanded, setPinLanded] = useState<boolean>(Boolean(prefersReducedMotion));

  const hasCoordinates =
    typeof destination.lat === 'number' &&
    typeof destination.lng === 'number' &&
    !Number.isNaN(destination.lat) &&
    !Number.isNaN(destination.lng);

  useEffect(() => {
    if (prefersReducedMotion) {
      setPinLanded(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setPinLanded(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [destination, prefersReducedMotion]);

  const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${destination.officeName}, ${destination.locality}, ${destination.district}, ${destination.state}`
  )}`;

  const googleMapsDirectionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${destination.officeName}, ${destination.completeAddress}`
      )}`;

  const toggleReq = (id: string) => {
    setCheckedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasExactCounterDetails = Boolean(
    destination.floorName || destination.counterName || destination.deskName
  );

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8 pt-4"
      aria-label="Identified Government Office Result"
    >
      {/* Top Status & Heading (Sections 9, 18, 20) */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Office Found ✓
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                Here's where you need to go.
              </h2>
            </div>
          </div>

          {/* Source & Accuracy Badge (Section 18) */}
          <div className="flex flex-col sm:items-end gap-1 text-xs">
            <span
              className={`font-bold flex items-center gap-1.5 ${
                destination.isVerifiedSource
                  ? 'text-emerald-700'
                  : 'text-amber-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{destination.verificationLabel}</span>
            </span>
            <span className="text-slate-500 font-mono-tabular">
              Last verified: {destination.lastVerifiedDate}
            </span>
          </div>
        </div>

        {/* Section 14: SERVICE SUMMARY */}
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
          <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wider">
            Service & Jurisdiction Summary
          </p>
          <p className="text-sm sm:text-base text-[#0F172A] leading-relaxed">
            You are looking for <strong>{destination.serviceName}</strong>.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Based on your location:{' '}
            <strong className="text-[#1E3A8A] font-mono-tabular">
              {destination.locationChainText}
            </strong>
            , the relevant office is:{' '}
            <strong>
              {destination.officeName} ({destination.departmentName})
            </strong>
            .
          </p>
          {!destination.isVerifiedSource && (
            <p className="text-xs text-amber-900 pt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Please verify the office information before visiting if the data
                source is not official.
              </span>
            </p>
          )}
        </div>

        {/* Section 9: PROMINENT OFFICE CARD */}
        <div className="rounded-2xl bg-[#0F172A] text-white p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1.5">
              <span className="text-xs font-mono-tabular font-semibold text-amber-400 tracking-wider uppercase">
                {destination.officeCategoryHeader}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {destination.officeName}
              </h3>
              <p className="text-sm text-blue-200 font-medium">
                {destination.locality} · {destination.district},{' '}
                {destination.state}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs space-y-1 shrink-0">
              <span className="text-slate-400 block">Target Service</span>
              <strong className="text-white text-sm block">
                {destination.serviceName}
              </strong>
            </div>
          </div>

          {/* Core Office Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Department</span>
              <strong className="text-white mt-0.5 block">
                {destination.departmentName}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Office</span>
              <strong className="text-white mt-0.5 block">
                {destination.officeName}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Area</span>
              <strong className="text-white mt-0.5 block">
                {destination.area}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Building</span>
              <strong className="text-white mt-0.5 block">
                {destination.buildingName}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Block</span>
              <strong className="text-white mt-0.5 block">
                {destination.blockName || 'Counter / block info not available'}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Floor</span>
              <strong className="text-white mt-0.5 block">
                {destination.floorName || 'Floor information not available'}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Counter</span>
              <strong className="text-amber-300 font-mono-tabular mt-0.5 block">
                {destination.counterName || 'Counter information not available.'}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">Desk</span>
              <strong className="text-white mt-0.5 block">
                {destination.deskName || 'Citizen Service Desk'}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400 text-xs block">
                Officer / Designation
              </span>
              <strong className="text-emerald-300 mt-0.5 block">
                {destination.officerDesignation || 'Designated Nodal Officer'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Section 10: EXACT ADDRESS & "WHERE EXACTLY SHOULD I GO?" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Complete Verified Address Breakdown */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[#0F172A]">
              Exact Address Details
            </h3>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-slate-500">Office name</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.officeName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Building name</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.buildingName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Door / Building number</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.doorOrBuildingNumber}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Street</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.street}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Area</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.area}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Locality</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.locality}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">City / Town</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.cityOrTown}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Taluk</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.taluk}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">District</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.district}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">State</dt>
              <dd className="font-semibold text-[#0F172A] mt-0.5">
                {destination.state}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">PIN code</dt>
              <dd className="font-mono-tabular font-bold text-[#1E3A8A] mt-0.5">
                {destination.pinCode}
              </dd>
            </div>
          </dl>
        </section>

        {/* Right 6 cols: "Where exactly should I go?" */}
        <section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <DoorOpen className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
              <h3 className="text-lg font-bold text-[#0F172A]">
                Where exactly should I go?
              </h3>
            </div>

            {hasExactCounterDetails ? (
              <div className="space-y-2.5">
                {[
                  {
                    label: 'Building',
                    value: destination.buildingName,
                    icon: Building2,
                  },
                  {
                    label: 'Block',
                    value: destination.blockName || 'Main Wing',
                    icon: Layers,
                  },
                  {
                    label: 'Floor',
                    value: destination.floorName || 'Ground Floor',
                    icon: Layers,
                  },
                  {
                    label: 'Counter',
                    value:
                      destination.counterName ||
                      'Counter information not available.',
                    icon: DoorOpen,
                  },
                  {
                    label: 'Desk',
                    value:
                      destination.deskName || 'Citizen Service Helpdesk',
                    icon: UserCheck,
                  },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-[#1E3A8A] text-white font-mono-tabular flex items-center justify-center text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <Icon className="w-4 h-4 text-[#1E3A8A]" />
                        <span className="text-slate-500 font-medium">
                          {step.label}:
                        </span>
                      </div>
                      <strong className="text-[#0F172A] font-semibold text-right">
                        {step.value}
                      </strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Counter information not available. Please report to the Main
                Reception / Citizen Facilitation Helpdesk upon entering{' '}
                <strong>{destination.buildingName}</strong>.
              </div>
            )}
          </div>

          {!destination.counterName && (
            <p className="text-xs text-amber-800 bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2">
              Counter information not available. We never invent floor, block,
              counter, or officer numbers.
            </p>
          )}
        </section>
      </div>

      {/* Section 13: YOUR DESTINATION (Complete Structured Directory Card) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-mono-tabular font-bold text-[#1E3A8A] uppercase tracking-wider">
              YOUR DESTINATION
            </span>
            <h3 className="text-xl font-bold text-[#0F172A]">
              Complete Office & Navigation Dossier
            </h3>
          </div>
          <span className="text-xs text-slate-500">{destination.dataSourceName}</span>
        </div>

        {/* Exact Destination Chain Banner (Section 20) */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#1E3A8A] uppercase tracking-wider">
            Exact Destination:
          </span>
          <span className="font-semibold text-[#0F172A] font-mono-tabular">
            {[
              destination.buildingName,
              destination.blockName || 'Block N/A',
              destination.floorName || 'Floor N/A',
              destination.counterName || 'Counter information not available.',
              destination.deskName || 'Citizen Service Desk',
            ].join(' → ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Department</span>
            <strong className="text-[#0F172A] text-sm block">
              {destination.departmentName}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Office</span>
            <strong className="text-[#0F172A] text-sm block">
              {destination.officeName}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <span className="text-slate-500 font-medium block">Address</span>
            <strong className="text-[#0F172A] block leading-relaxed">
              {destination.completeAddress}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Area</span>
            <strong className="text-[#0F172A] block">
              {destination.area}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">City/Town</span>
            <strong className="text-[#0F172A] block">
              {destination.cityOrTown}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Taluk</span>
            <strong className="text-[#0F172A] block">
              {destination.taluk}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">District</span>
            <strong className="text-[#0F172A] block">
              {destination.district}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Building</span>
            <strong className="text-[#0F172A] block">
              {destination.buildingName}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Block</span>
            <strong className="text-[#0F172A] block">
              {destination.blockName || 'Block information not available'}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Floor</span>
            <strong className="text-[#0F172A] block">
              {destination.floorName || 'Floor information not available'}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium block">Counter</span>
            <strong className="text-[#1E3A8A] font-mono-tabular block">
              {destination.counterName || 'Counter information not available.'}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <span className="text-slate-500 font-medium block">
              Desk / Officer
            </span>
            <strong className="text-[#0F172A] block">
              {destination.deskName || 'Citizen Service Desk'}
              {destination.officerDesignation
                ? ` · ${destination.officerDesignation}`
                : ''}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Office Hours</span>
            </span>
            <strong className="text-[#0F172A] block">
              {destination.officeHours}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Contact</span>
            </span>
            <strong className="text-[#0F172A] font-mono-tabular block">
              {destination.contactPhone}
            </strong>
          </div>
        </div>

        {/* Action Buttons inside YOUR DESTINATION */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={googleMapsPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-[#1E3A8A] text-white text-xs sm:text-sm font-semibold hover:bg-[#172E6E] transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>OPEN IN GOOGLE MAPS</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
          </a>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>GET DIRECTIONS</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
          </a>

          {destination.officialPortalUrl && (
            <a
              href={destination.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
              <span>Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </section>

      {/* Section 11: INTERACTIVE CUSTOM SVG CAMPUS MAP & DIJKSTRA NAVIGATION */}
      <CampusSvgMap
        serviceOrOfficeId={destination.serviceName}
        officeName={destination.officeName}
        departmentName={destination.departmentName}
        buildingName={destination.buildingName}
        floorName={destination.floorName || 'First Floor'}
        counterName={destination.counterName || 'Counter 4'}
        roomName={destination.deskName || 'Room 105'}
        address={destination.completeAddress}
        showBuildingInspector={true}
      />

      {/* Section 12: OFFICE IMAGE & EXTERNAL MAP LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A]">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Verified Office Address & External Navigation</span>
              </div>
              {pinLanded && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                  Office Found ✓
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">
              {destination.completeAddress}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              The interactive SVG Campus Map above computes the shortest walking
              route using our local Dijkstra navigation graph with zero external
              API dependencies. You can also open the address in an external map
              below if desired.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono-tabular">
              {hasCoordinates
                ? `Locality Coordinates: ${destination.lat?.toFixed(4)}° N, ${destination.lng?.toFixed(4)}° E`
                : `Address: ${destination.locality}, ${destination.district}`}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={googleMapsPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#172E6E] inline-flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </section>

        {/* Section 12: OFFICE IMAGE (5 cols — Strictly never invents a fictional photo!) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Office image
                </h3>
              </div>
              <span className="text-xs text-slate-500">Authenticity Policy</span>
            </div>

            {destination.officeImageUrl ? (
              <div className="space-y-2">
                <img
                  src={destination.officeImageUrl}
                  alt={destination.officeName}
                  referrerPolicy="no-referrer"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200"
                />
                {destination.officeImageCaption && (
                  <p className="text-xs text-slate-500">
                    {destination.officeImageCaption}
                  </p>
                )}
              </div>
            ) : (
              <div className="h-52 rounded-xl bg-slate-50 border border-dashed border-slate-300 p-5 flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  Office image unavailable
                </p>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  No verified official photograph is on file for{' '}
                  <strong>{destination.officeName}</strong>. CivicGuide never
                  generates fictional building images.
                </p>
              </div>
            )}
          </div>

          <a
            href={googleMapsPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View on Google Maps (Photos & Street View)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>
      </div>

      {/* Section 15: REQUIREMENTS ("What should you take with you?") */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
              <FileCheck2 className="w-4 h-4" />
              <span>Document Checklist</span>
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">
              What should you take with you?
            </h3>
          </div>

          {!destination.requirementsVerified && (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Requirements could not be verified.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {destination.requirements.map((req) => {
            const checked = checkedReqIds.has(req.id);
            return (
              <label
                key={req.id}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checked
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleReq(req.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1E3A8A]"
                />
                <div className="space-y-0.5 text-xs">
                  <span
                    className={`font-bold block text-sm ${
                      checked ? 'line-through text-slate-500' : 'text-[#0F172A]'
                    }`}
                  >
                    {req.label}
                  </span>
                  <span className="text-slate-600 block leading-relaxed">
                    {req.detail}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Always carry original documents plus 2 self-attested photocopies.
          </span>
          {destination.officialPortalUrl && (
            <a
              href={destination.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
            >
              <span>Check official requirements</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </section>

      {/* Section 21 & 25: BOTTOM PROMPT & START NEW SEARCH */}
      <section className="bg-[#0F172A] text-white rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Is there anything else you'd like to find?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Start a fresh conversation to find another government department,
            taluk office, or service counter.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartNewSearch}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Find another government office</span>
          </button>

          <button
            type="button"
            onClick={onStartNewSearch}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Search</span>
          </button>
        </div>
      </section>
    </motion.div>
  );
};
