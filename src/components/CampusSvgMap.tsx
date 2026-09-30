import React, { useMemo, useState } from 'react';
import {
  Building2,
  Navigation,
  MapPin,
  Footprints,
  Layers,
  DoorOpen,
  CheckCircle2,
  Compass,
  Route,
  Sparkles,
} from 'lucide-react';
import {
  CAMPUS_BUILDINGS,
  CampusBuilding,
  findShortestPathDijkstra,
  NAVIGATION_EDGES,
  NAVIGATION_POINTS,
  resolveDestinationNodeId,
} from '../services/campusNavigationEngine';
import { analyticsService } from '../services/analyticsService';

interface CampusSvgMapProps {
  serviceOrOfficeId?: string;
  officeName?: string;
  departmentName?: string;
  buildingName?: string;
  floorName?: string;
  counterName?: string;
  roomName?: string;
  address?: string;
  showBuildingInspector?: boolean;
}

const START_GATE_OPTIONS = [
  { id: 'node-main-gate', label: 'Main Gate (South Entrance)' },
  { id: 'node-west-gate', label: 'West Gate (Bus Stand Side)' },
  { id: 'node-east-gate', label: 'East Gate (Metro & Parking)' },
  { id: 'node-south-plaza', label: 'Citizen Helpdesk Courtyard' },
  { id: 'node-central-hub', label: 'Central Civic Plaza' },
];

export const CampusSvgMap: React.FC<CampusSvgMapProps> = ({
  serviceOrOfficeId,
  officeName = 'Citizen Services Office',
  departmentName = 'Revenue Department',
  buildingName = 'Building A',
  floorName = 'First Floor',
  counterName = 'Counter 4',
  roomName = 'Room 105',
  address = 'Government Administrative Campus, Sector 1',
  showBuildingInspector = true,
}) => {
  const defaultDestNodeId = useMemo(
    () => resolveDestinationNodeId(serviceOrOfficeId || officeName, buildingName),
    [serviceOrOfficeId, officeName, buildingName]
  );

  const [startNodeId, setStartNodeId] = useState<string>('node-main-gate');
  const [targetNodeId, setTargetNodeId] = useState<string>(defaultDestNodeId);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(() => {
    const matched = CAMPUS_BUILDINGS.find(
      (b) =>
        buildingName.toLowerCase().includes(b.code.toLowerCase()) ||
        b.name.toLowerCase().includes(buildingName.toLowerCase())
    );
    return matched ? matched.id : 'bldg-a';
  });

  // Sync targetNodeId if prop changes
  React.useEffect(() => {
    setTargetNodeId(defaultDestNodeId);
    const pt = NAVIGATION_POINTS.find((n) => n.id === defaultDestNodeId);
    if (pt?.buildingId) {
      setSelectedBuildingId(pt.buildingId);
    }
  }, [defaultDestNodeId]);

  const routeResult = useMemo(() => {
    const res = findShortestPathDijkstra(startNodeId, targetNodeId);
    if (res) {
      analyticsService.recordNavigationRoute(res.totalDistanceMeters);
    }
    return res;
  }, [startNodeId, targetNodeId]);

  const selectedBuilding: CampusBuilding = useMemo(
    () =>
      CAMPUS_BUILDINGS.find((b) => b.id === selectedBuildingId) ||
      CAMPUS_BUILDINGS[0],
    [selectedBuildingId]
  );

  const activePathNodeIds = useMemo(
    () => new Set(routeResult?.pathNodes.map((n) => n.id) || []),
    [routeResult]
  );

  const polylinePoints = useMemo(() => {
    if (!routeResult || routeResult.pathNodes.length === 0) return '';
    return routeResult.pathNodes.map((pt) => `${pt.x},${pt.y}`).join(' ');
  }, [routeResult]);

  const startNode = routeResult?.startNode || NAVIGATION_POINTS[0];
  const destNode =
    routeResult?.destinationNode ||
    NAVIGATION_POINTS.find((n) => n.id === defaultDestNodeId) ||
    NAVIGATION_POINTS[0];

  const handleSelectBuilding = (bldg: CampusBuilding) => {
    setSelectedBuildingId(bldg.id);
    // Find first office room node inside this building so user can also route to it if desired
    const firstRoomNode = NAVIGATION_POINTS.find(
      (n) => n.buildingId === bldg.id && n.type === 'office_room'
    );
    if (firstRoomNode && !serviceOrOfficeId) {
      setTargetNodeId(firstRoomNode.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      {/* Top Map Header & Dijkstra Controls */}
      <div className="p-4 sm:p-5 bg-[#0F172A] text-white border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-mono-tabular font-bold uppercase tracking-wider">
              100% Local SVG Campus Map · Zero External API
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-mono-tabular font-bold">
              Dijkstra Shortest Path: {routeResult?.totalDistanceMeters ?? 120}m (~
              {routeResult?.estimatedWalkMinutes ?? 2} min walk)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Government Campus Interactive Map & Indoor Navigation
            </span>
          </h3>
          <p className="text-xs text-slate-300">
            Click any building to inspect departments, floors, and counters, or
            change your starting gate below.
          </p>
        </div>

        {/* Starting Point Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          <label
            htmlFor="campus-start-node-select"
            className="text-xs font-semibold text-slate-300 whitespace-nowrap"
          >
            Start Location (● YOU):
          </label>
          <select
            id="campus-start-node-select"
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
          >
            {START_GATE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map + Indoor Navigation Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 7 Cols: Interactive Custom SVG Campus Map */}
        <div className="lg:col-span-7 p-4 sm:p-5 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between gap-4">
          <div className="relative w-full rounded-xl border border-slate-300 bg-[#F1F5F9] overflow-hidden shadow-inner">
            <svg
              viewBox="0 0 800 520"
              className="w-full h-auto block select-none"
              role="img"
              aria-label="Interactive Government Campus SVG Map showing Buildings A through E and walking route"
            >
              <defs>
                <pattern
                  id="campus-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width="800" height="520" fill="url(#campus-grid)" />

              {/* Outer Campus Boundary Wall */}
              <rect
                x="20"
                y="20"
                width="760"
                height="480"
                rx="18"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="3"
                strokeDasharray="8 4"
              />

              {/* Campus Title Banner */}
              <rect
                x="250"
                y="10"
                width="300"
                height="26"
                rx="6"
                fill="#0F172A"
              />
              <text
                x="400"
                y="27"
                textAnchor="middle"
                fill="#F8FAFC"
                fontSize="11"
                fontWeight="700"
                letterSpacing="1.5"
              >
                GOVERNMENT CAMPUS (DEMO DATA)
              </text>

              {/* Paved Campus Walkways / Roads */}
              <path
                d="M 400 480 L 400 165 M 45 230 L 755 230"
                stroke="#CBD5E1"
                strokeWidth="34"
                strokeLinecap="round"
              />
              <path
                d="M 400 480 L 400 165 M 45 230 L 755 230"
                stroke="#F8FAFC"
                strokeWidth="2"
                strokeDasharray="8 8"
              />

              {/* All Graph Edges (Light Connector Lines) */}
              {NAVIGATION_EDGES.map((edge, idx) => {
                const fromPt = NAVIGATION_POINTS.find((n) => n.id === edge.from);
                const toPt = NAVIGATION_POINTS.find((n) => n.id === edge.to);
                if (!fromPt || !toPt) return null;
                return (
                  <line
                    key={idx}
                    x1={fromPt.x}
                    y1={fromPt.y}
                    x2={toPt.x}
                    y2={toPt.y}
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeDasharray={edge.isIndoor ? '3 3' : undefined}
                    opacity="0.45"
                  />
                );
              })}

              {/* Clickable Campus Buildings (Building A – Building E) */}
              {CAMPUS_BUILDINGS.map((bldg) => {
                const isSelected = bldg.id === selectedBuilding.id;
                const isDestBuilding = destNode.buildingId === bldg.id;
                const { x, y, width, height } = bldg.svgRect;

                return (
                  <g
                    key={bldg.id}
                    onClick={() => handleSelectBuilding(bldg)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${bldg.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectBuilding(bldg);
                      }
                    }}
                  >
                    {/* Building Shadow & Footprint */}
                    <rect
                      x={x + 4}
                      y={y + 4}
                      width={width}
                      height={height}
                      rx="12"
                      fill="#0F172A"
                      opacity="0.12"
                    />
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx="12"
                      fill={isDestBuilding ? '#EFF6FF' : '#FFFFFF'}
                      stroke={
                        isDestBuilding
                          ? '#1E3A8A'
                          : isSelected
                          ? '#2563EB'
                          : '#475569'
                      }
                      strokeWidth={isDestBuilding || isSelected ? '3.5' : '2'}
                    />

                    {/* Top Header Band inside Building */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height="30"
                      rx="10"
                      fill={bldg.colorAccent}
                    />
                    <text
                      x={x + 12}
                      y={y + 20}
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {bldg.code.toUpperCase()}
                    </text>
                    <text
                      x={x + width - 10}
                      y={y + 19}
                      textAnchor="end"
                      fill="#E2E8F0"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {bldg.floors.length} Floor{bldg.floors.length > 1 ? 's' : ''}
                    </text>

                    {/* Department & Floor Summary */}
                    <text
                      x={x + 12}
                      y={y + 52}
                      fill="#0F172A"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {bldg.shortName}
                    </text>
                    <text
                      x={x + 12}
                      y={y + 70}
                      fill="#475569"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {bldg.floors.map((f) => f.name).join(' · ')}
                    </text>

                    {/* Highlight badge if this building contains the target office */}
                    {isDestBuilding && (
                      <g>
                        <rect
                          x={x + 12}
                          y={y + height - 30}
                          width={width - 24}
                          height="20"
                          rx="5"
                          fill="#DCFCE7"
                          stroke="#16A34A"
                          strokeWidth="1"
                        />
                        <text
                          x={x + width / 2}
                          y={y + height - 16}
                          textAnchor="middle"
                          fill="#15803D"
                          fontSize="10"
                          fontWeight="700"
                        >
                          ★ TARGET BUILDING ({destNode.shortLabel})
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Highlighted Dijkstra Shortest Walking Path */}
              {polylinePoints && (
                <>
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#1E3A8A"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.2"
                  />
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="10 6"
                  />
                </>
              )}

              {/* Gate & Junction Nodes */}
              {NAVIGATION_POINTS.map((pt) => {
                const isStart = pt.id === startNode.id;
                const isDest = pt.id === destNode.id;
                const isOnPath = activePathNodeIds.has(pt.id);

                if (pt.type === 'office_room' && !isDest && !isOnPath) {
                  return null;
                }

                return (
                  <g key={pt.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isStart || isDest ? 9 : isOnPath ? 5.5 : 4}
                      fill={
                        isStart
                          ? '#16A34A'
                          : isDest
                          ? '#F59E0B'
                          : isOnPath
                          ? '#1E3A8A'
                          : '#64748B'
                      }
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    {(pt.type === 'gate' || pt.id === 'node-south-plaza') &&
                      !isStart && (
                        <text
                          x={pt.x}
                          y={pt.y + 18}
                          textAnchor="middle"
                          fill="#334155"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {pt.shortLabel}
                        </text>
                      )}
                  </g>
                );
              })}

              {/* ● YOU Marker Badge */}
              <g transform={`translate(${startNode.x}, ${startNode.y})`}>
                <circle r="15" fill="#16A34A" opacity="0.2" />
                <rect
                  x="-42"
                  y="12"
                  width="84"
                  height="22"
                  rx="6"
                  fill="#15803D"
                />
                <text
                  x="0"
                  y="27"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="700"
                >
                  ● YOU ({startNode.shortLabel})
                </text>
              </g>

              {/* ● OFFICE Destination Pin Badge */}
              <g transform={`translate(${destNode.x}, ${destNode.y})`}>
                <circle r="16" fill="#F59E0B" opacity="0.25" />
                <rect
                  x="-68"
                  y="-34"
                  width="136"
                  height="24"
                  rx="6"
                  fill="#0F172A"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="-18"
                  textAnchor="middle"
                  fill="#FDE68A"
                  fontSize="10"
                  fontWeight="700"
                >
                  ● {destNode.shortLabel}
                </text>
              </g>
            </svg>
          </div>

          {/* Map Legend & Address Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 px-1">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                <span>● YOU ({startNode.shortLabel})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#1E3A8A]">
                <span className="w-5 h-1 bg-blue-600 inline-block rounded" />
                <span>Walking Path (Dijkstra)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>● Office ({destNode.shortLabel})</span>
              </span>
            </div>
            <span className="text-slate-500 font-mono-tabular">
              Campus Location: {address}
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Step-by-Step Indoor Navigation (Section 10 & 21) */}
        <div className="lg:col-span-5 p-5 bg-white flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5" />
                  <span>Indoor & Campus Navigation</span>
                </span>
                <span className="text-xs font-mono-tabular font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {routeResult?.totalDistanceMeters ?? 120}m Total
                </span>
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">
                {officeName} ({departmentName})
              </h4>
              <p className="text-xs text-slate-600">
                Destination: <strong>{buildingName}</strong> ·{' '}
                <strong>{floorName}</strong> · <strong>{roomName}</strong> ·{' '}
                <strong>{counterName}</strong>
              </p>
            </div>

            {/* Step-by-Step Walking & Indoor Directions */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {/* Step 0: Starting Point */}
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    ●
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      You are here (Start)
                    </span>
                    <strong className="text-[#0F172A]">
                      {startNode.label}
                    </strong>
                  </div>
                </div>
                <span className="font-mono-tabular text-[11px] font-semibold text-emerald-800">
                  0m
                </span>
              </div>

              {routeResult?.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#1E3A8A] text-white font-mono-tabular font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#0F172A] block leading-snug">
                        {step.instruction}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {step.isIndoor ? 'Indoor Corridor / Stairs' : 'Outdoor Campus Walkway'} →{' '}
                        {step.toNode.shortLabel}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono-tabular font-bold text-[#1E3A8A] shrink-0">
                    +{step.distanceMeters}m
                  </span>
                </div>
              ))}

              {/* Final Arrival Banner */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                      Destination Reached
                    </span>
                    <strong className="text-[#0F172A]">
                      {destNode.label}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Footprints className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Algorithm: Dijkstra Graph Shortest Path</span>
            </span>
            <span className="font-mono-tabular font-semibold text-[#0F172A]">
              {routeResult?.pathNodes.length || 0} Graph Nodes
            </span>
          </div>
        </div>
      </div>

      {/* Clickable Building Inspector Drawer (Section 9) */}
      {showBuildingInspector && (
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                Selected Building Inspector (Click any building on map or tabs below)
              </span>
              <h4 className="text-base font-bold text-[#0F172A]">
                {selectedBuilding.name}
              </h4>
              <p className="text-xs text-slate-600">
                {selectedBuilding.description}
              </p>
            </div>

            {/* Building Quick Switcher */}
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {CAMPUS_BUILDINGS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBuilding(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    b.id === selectedBuilding.id
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {b.code}
                </button>
              ))}
            </div>
          </div>

          {/* Floors & Counters inside Selected Building */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedBuilding.floors.map((fl) => (
              <div
                key={fl.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>{fl.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {fl.counters.length} Counter{fl.counters.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {fl.counters.map((cnt) => {
                    const roomNode = NAVIGATION_POINTS.find(
                      (n) =>
                        n.buildingId === selectedBuilding.id &&
                        n.roomNumber === cnt.roomNumber
                    );
                    const isCurrentDest = roomNode?.id === targetNodeId;

                    return (
                      <div
                        key={cnt.id}
                        className={`p-2.5 rounded-lg border space-y-1 ${
                          isCurrentDest
                            ? 'bg-blue-50/70 border-blue-300'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-[#1E3A8A] font-mono-tabular">
                            {cnt.roomNumber} · {cnt.number}
                          </strong>
                          {roomNode && (
                            <button
                              type="button"
                              onClick={() => setTargetNodeId(roomNode.id)}
                              className="px-2 py-0.5 rounded bg-[#1E3A8A] text-white text-[10px] font-semibold hover:bg-[#172E6E] cursor-pointer"
                            >
                              {isCurrentDest ? 'Active Route ✓' : 'Navigate Here'}
                            </button>
                          )}
                        </div>
                        <p className="font-semibold text-[#0F172A]">
                          {cnt.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Officer: {cnt.officerTitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
