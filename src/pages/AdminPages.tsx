import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  DoorOpen,
  FileCheck2,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { analyticsService } from '../services/analyticsService';
import {
  Department,
  Office,
  Requirement,
  Service,
  ServiceStep,
} from '../types/civic';

const AdminShell: React.FC<{
  children: React.ReactNode;
  onResetSeed?: () => void;
}> = ({ children, onResetSeed }) => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="bg-white rounded-2xl border border-amber-300 p-8 space-y-5"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">
                Administrator Access Required
              </h1>
              <p className="text-xs text-slate-500">
                Protected Route — Role required: <code>admin</code>
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            The CivicGuide Admin Portal allows authorized administrators to add,
            edit, and delete departments, offices, counters, and service
            requirements.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono-tabular">
            <div className="font-sans font-bold text-slate-800">
              Demo Admin Credentials:
            </div>
            <div>Email: admin@civicguide.demo</div>
            <div>Password: Admin@123</div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={async () => {
                await login('admin@civicguide.demo', 'Admin@123', true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] cursor-pointer"
            >
              Sign In Instantly as Demo Admin
            </button>
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Go to Sign In Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navTabs = [
    { label: 'Overview', to: '/admin', exact: true },
    { label: 'Manage Services', to: '/admin/services', exact: false },
    { label: 'Manage Departments', to: '/admin/departments', exact: false },
    { label: 'Manage Offices & Counters', to: '/admin/offices', exact: false },
  ];

  const handleReset = () => {
    dataService.resetToSeedData();
    analyticsService.resetAnalytics();
    if (onResetSeed) onResetSeed();
    setResetFeedback('Demo dataset and local analytics restored to initial seed state.');
    window.setTimeout(() => setResetFeedback(null), 4000);
    navigate(location.pathname);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Admin Top Bar */}
      <div className="bg-[#0F172A] text-white rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>CivicGuide Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Civic Data & Counter Directory Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Signed in as <strong>{user.name}</strong> ({user.email})
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 self-start md:self-auto cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Demo Dataset</span>
          </button>
        </div>

        {resetFeedback && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetFeedback}</span>
          </div>
        )}

        {/* Sub-navigation Tabs */}
        <nav
          aria-label="Admin Sections"
          className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800"
        >
          {navTabs.map((tab) => {
            const active = tab.exact
              ? location.pathname === tab.to
              : location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1D4ED8] text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
};

/* ============================================================================
   1. ADMIN OVERVIEW PAGE (/admin)
   ============================================================================ */
export const AdminOverviewPage: React.FC = () => {
  const [version, setVersion] = useState(0);

  const departments = useMemo(() => dataService.getDepartments(), [version]);
  const offices = useMemo(() => dataService.getOffices(), [version]);
  const services = useMemo(() => dataService.getServices(), [version]);
  const requirements = useMemo(() => dataService.getRequirements(), [version]);
  const steps = useMemo(() => dataService.getServiceSteps(), [version]);
  const analytics = useMemo(() => analyticsService.getSnapshot(), [version]);

  return (
    <AdminShell onResetSeed={() => setVersion((v) => v + 1)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <span className="text-2xl font-bold font-mono-tabular text-[#0F172A]">
                {services.length}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              Government Services
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Includes {requirements.length} document checklist items and{' '}
              {steps.length} procedure steps linked to offices and departments.
            </p>
          </div>
          <Link
            to="/admin/services"
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold text-center hover:bg-[#172E6E]"
          >
            Add / Edit / Delete Services →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="text-2xl font-bold font-mono-tabular text-[#0F172A]">
                {departments.length}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Departments</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage responsible civic authorities, department codes, and
              verification metadata.
            </p>
          </div>
          <Link
            to="/admin/departments"
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold text-center hover:bg-[#172E6E]"
          >
            Add / Edit / Delete Departments →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <DoorOpen className="w-5 h-5" />
              </span>
              <span className="text-2xl font-bold font-mono-tabular text-[#0F172A]">
                {offices.length}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              Offices, Counters & Desks
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Configure exact building names, floors, counters, desk codes,
              working timings, and map coordinates.
            </p>
          </div>
          <Link
            to="/admin/offices"
            className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold text-center hover:bg-[#172E6E]"
          >
            Add / Edit / Delete Offices →
          </Link>
        </div>
      </div>

      {/* Local Analytics & Insights (Zero External API) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#1E3A8A]">
              Local Civic Analytics & Wayfinding Insights
            </span>
            <h2 className="text-lg font-bold text-[#0F172A]">
              Service Demand, Department Traffic & Dijkstra Route Metrics
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Avg. Campus Walk Distance</span>
              <strong className="text-[#0F172A] font-mono-tabular text-sm">
                {analytics.averageNavigationDistanceMeters} meters
              </strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-emerald-800 block">Completed Service Journeys</span>
              <strong className="text-emerald-950 font-mono-tabular text-sm">
                {analytics.completedServiceJourneys} citizens guided
              </strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Most Searched Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700">
              Most Searched Services
            </h3>
            <div className="space-y-2">
              {analytics.mostSearchedServices.slice(0, 5).map((item, idx) => (
                <div
                  key={item.serviceId}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F172A] truncate">
                      0{idx + 1}. {item.serviceName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.departmentName}
                    </p>
                  </div>
                  <span className="font-mono-tabular font-bold text-[#1E3A8A] shrink-0">
                    {item.searches} searches
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Visited Departments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700">
              Most Visited Campus Departments
            </h3>
            <div className="space-y-2">
              {analytics.mostVisitedDepartments.slice(0, 5).map((dept, idx) => (
                <div
                  key={dept.departmentId}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-semibold text-[#0F172A] truncate">
                    0{idx + 1}. {dept.departmentName}
                  </span>
                  <span className="font-mono-tabular font-bold text-emerald-700 shrink-0">
                    {dept.visits} visits
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Failed Searches */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700">
              Common Unmatched / Failed Searches
            </h3>
            <div className="space-y-2">
              {analytics.commonFailedSearches.slice(0, 4).map((fail) => (
                <div
                  key={fail.query}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F172A] truncate">
                      "{fail.query}"
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Suggested: {fail.suggestedCategory}
                    </p>
                  </div>
                  <span className="font-mono-tabular font-semibold text-amber-900 shrink-0">
                    {fail.attempts} tries
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Audit Table of All Services */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Active Service Directory Audit
            </h2>
            <p className="text-xs text-slate-500">
              Overview of all configured services and their assigned department
              and counter
            </p>
          </div>
          <Link
            to="/admin/services"
            className="px-3.5 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold"
          >
            + Add New Service
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold">Service Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Fee</th>
                <th className="py-3 px-4 font-semibold">Last Updated</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-semibold text-[#0F172A]">
                    {srv.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{srv.category}</td>
                  <td className="py-3 px-4 font-mono-tabular text-slate-600">
                    {srv.fee}
                  </td>
                  <td className="py-3 px-4 font-mono-tabular text-slate-500">
                    {srv.lastUpdated}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/services/${srv.id}`}
                      className="inline-flex items-center gap-1 text-[#1E3A8A] font-semibold hover:underline"
                    >
                      <span>View Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
};

/* ============================================================================
   2. ADMIN DEPARTMENTS PAGE (/admin/departments)
   ============================================================================ */
export const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(() =>
    dataService.getDepartments()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [dataSource, setDataSource] = useState(
    'Demo information — Admin Updated'
  );
  const [verified, setVerified] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setDescription('');
    setDataSource('Demo information — Admin Updated');
    setVerified(false);
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description);
    setDataSource(dept.dataSource);
    setVerified(dept.verified);
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setFeedback({
        type: 'error',
        text: 'Department name must be at least 3 characters.',
      });
      return;
    }
    if (code.trim().length < 2) {
      setFeedback({
        type: 'error',
        text: 'Please provide a short department code (e.g. REV-TR).',
      });
      return;
    }
    if (description.trim().length < 10) {
      setFeedback({
        type: 'error',
        text: 'Please enter a clear department description (at least 10 characters).',
      });
      return;
    }

    const record: Department = {
      id: editingId || `dept-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      dataSource: dataSource.trim() || 'Demo information',
      verified,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    const updated = dataService.saveDepartment(record);
    setDepartments(updated);
    setFeedback({
      type: 'success',
      text: editingId
        ? `Updated department "${record.name}".`
        : `Added new department "${record.name}".`,
    });
    resetForm();
  };

  const handleDelete = (id: string, deptName: string) => {
    const updated = dataService.deleteDepartment(id);
    setDepartments(updated);
    if (editingId === id) resetForm();
    setFeedback({
      type: 'success',
      text: `Deleted department "${deptName}".`,
    });
  };

  return (
    <AdminShell onResetSeed={() => setDepartments(dataService.getDepartments())}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 self-start">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">
              {editingId ? 'Edit Department' : 'Add New Department'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
              role="status"
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label
                htmlFor="dept-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Department Name *
              </label>
              <input
                id="dept-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Department of Civil Supplies & Ration"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="dept-code"
                className="block text-xs font-semibold text-slate-700"
              >
                Department Code *
              </label>
              <input
                id="dept-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CIV-SUP"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono-tabular focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="dept-desc"
                className="block text-xs font-semibold text-slate-700"
              >
                Responsibilities & Description *
              </label>
              <textarea
                id="dept-desc"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what services this department oversees..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="dept-source"
                className="block text-xs font-semibold text-slate-700"
              >
                Data Source Label
              </label>
              <input
                id="dept-source"
                type="text"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="rounded border-slate-300 text-[#1E3A8A]"
              />
              <span>Mark record as Verified Official Data</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Department Changes' : 'Add Department'}</span>
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Configured Departments ({departments.length})
          </h2>
          <div className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
                    <span className="font-bold text-[#1E3A8A]">{dept.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {dept.lastUpdated}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dept.dataSource}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {dept.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(dept)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(dept.id, dept.name)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

/* ============================================================================
   3. ADMIN OFFICES PAGE (/admin/offices)
   ============================================================================ */
export const AdminOfficesPage: React.FC = () => {
  const departments = useMemo(() => dataService.getDepartments(), []);
  const [offices, setOffices] = useState<Office[]>(() =>
    dataService.getOffices()
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [counter, setCounter] = useState('');
  const [desk, setDesk] = useState('');
  const [address, setAddress] = useState('');
  const [latStr, setLatStr] = useState('28.6139');
  const [lngStr, setLngStr] = useState('77.2090');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openingTime, setOpeningTime] = useState('09:30');
  const [closingTime, setClosingTime] = useState('17:00');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDepartmentId(departments[0]?.id || '');
    setBuilding('');
    setFloor('');
    setCounter('');
    setDesk('');
    setAddress('');
    setLatStr('28.6139');
    setLngStr('77.2090');
    setPhone('');
    setEmail('');
    setOpeningTime('09:30');
    setClosingTime('17:00');
  };

  const handleEdit = (off: Office) => {
    setEditingId(off.id);
    setName(off.name);
    setDepartmentId(off.departmentId);
    setBuilding(off.building);
    setFloor(off.floor);
    setCounter(off.counter);
    setDesk(off.desk);
    setAddress(off.address);
    setLatStr(off.lat !== null ? String(off.lat) : '');
    setLngStr(off.lng !== null ? String(off.lng) : '');
    setPhone(off.phone);
    setEmail(off.email);
    setOpeningTime(off.openingTime);
    setClosingTime(off.closingTime);
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3 || !building.trim() || !counter.trim() || !desk.trim()) {
      setFeedback({
        type: 'error',
        text: 'Please fill in Office Name, Building, Counter, and Desk fields.',
      });
      return;
    }
    if (!address.trim()) {
      setFeedback({
        type: 'error',
        text: 'Please provide the street address for this office.',
      });
      return;
    }

    const parsedLat = latStr.trim() === '' ? null : parseFloat(latStr);
    const parsedLng = lngStr.trim() === '' ? null : parseFloat(lngStr);

    const record: Office = {
      id: editingId || `off-${Date.now()}`,
      departmentId,
      name: name.trim(),
      building: building.trim(),
      floor: floor.trim() || 'Ground Floor',
      counter: counter.trim(),
      desk: desk.trim(),
      address: address.trim(),
      lat: parsedLat !== null && !Number.isNaN(parsedLat) ? parsedLat : null,
      lng: parsedLng !== null && !Number.isNaN(parsedLng) ? parsedLng : null,
      phone: phone.trim() || '+91 (011) 2300-0000',
      email: email.trim() || 'helpdesk.demo@civicguide.example',
      openingTime: openingTime || '09:30',
      closingTime: closingTime || '17:00',
      workingDays: 'Mon – Fri',
      dataSource: 'Demo information — Admin Updated',
      verified: false,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    const updated = dataService.saveOffice(record);
    setOffices(updated);
    setFeedback({
      type: 'success',
      text: editingId
        ? `Updated office "${record.name}".`
        : `Added new office "${record.name}".`,
    });
    resetForm();
  };

  const handleDelete = (id: string, offName: string) => {
    const updated = dataService.deleteOffice(id);
    setOffices(updated);
    if (editingId === id) resetForm();
    setFeedback({
      type: 'success',
      text: `Deleted office "${offName}".`,
    });
  };

  return (
    <AdminShell onResetSeed={() => setOffices(dataService.getOffices())}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Office Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 self-start">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">
              {editingId ? 'Edit Office & Counter' : 'Add New Office & Counter'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
              role="status"
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Office Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zonal Treasury Sub-Office"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Parent Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Building & Wing *
                </label>
                <input
                  type="text"
                  required
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="Block A, Annex"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Floor *
                </label>
                <input
                  type="text"
                  required
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="2nd Floor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Counter Number *
                </label>
                <input
                  type="text"
                  required
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                  placeholder="Counter 4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Exact Desk Code *
                </label>
                <input
                  type="text"
                  required
                  value={desk}
                  onChange={(e) => setDesk(e.target.value)}
                  placeholder="Desk B-12"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="14 Secretariat Marg, Civil Lines"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Latitude (Optional)
                </label>
                <input
                  type="text"
                  value={latStr}
                  onChange={(e) => setLatStr(e.target.value)}
                  placeholder="28.6139"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Longitude (Optional)
                </label>
                <input
                  type="text"
                  value={lngStr}
                  onChange={(e) => setLngStr(e.target.value)}
                  placeholder="77.2090"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Opening Time
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Closing Time
                </label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 (011) 2301-4410"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="office@civicguide.example"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Office Changes' : 'Add Office'}</span>
            </button>
          </form>
        </div>

        {/* Offices List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Configured Offices & Counters ({offices.length})
          </h2>
          <div className="space-y-3">
            {offices.map((off) => {
              const dept = departments.find((d) => d.id === off.departmentId);
              return (
                <div
                  key={off.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#1E3A8A]">
                        {dept?.name || 'Department'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        Hours: {off.openingTime}–{off.closingTime}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {off.name}
                    </h3>
                    <p className="text-xs font-mono-tabular font-semibold text-slate-800">
                      {off.building} · {off.floor} · {off.counter} ({off.desk})
                    </p>
                    <p className="text-xs text-slate-600">{off.address}</p>
                    <p className="text-[11px] font-mono-tabular text-slate-400">
                      GPS:{' '}
                      {off.lat !== null && off.lng !== null
                        ? `${off.lat}, ${off.lng}`
                        : 'Missing coordinates (Fallback enabled)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(off)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(off.id, off.name)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

/* ============================================================================
   4. ADMIN SERVICES PAGE (/admin/services)
   ============================================================================ */
export const AdminServicesPage: React.FC = () => {
  const departments = useMemo(() => dataService.getDepartments(), []);
  const offices = useMemo(() => dataService.getOffices(), []);

  const [enrichedList, setEnrichedList] = useState(() =>
    dataService.getAllEnrichedServices()
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Treasury & Finance');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [officeId, setOfficeId] = useState(offices[0]?.id || '');
  const [fee, setFee] = useState('No Fee');
  const [processingTime, setProcessingTime] = useState('3–5 working days');
  const [keywordsStr, setKeywordsStr] = useState('');

  // Dynamic Requirements & Steps in Form
  const [reqDrafts, setReqDrafts] = useState<
    Array<{ name: string; description: string; required: boolean }>
  >([
    {
      name: 'Government Photo ID Proof',
      description: 'Valid Aadhaar, Passport, or Voter ID card.',
      required: true,
    },
  ]);

  const [stepDrafts, setStepDrafts] = useState<
    Array<{ title: string; description: string }>
  >([
    {
      title: 'Present Application at Designated Counter',
      description: 'Submit completed application form and original ID for verification.',
    },
  ]);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const refreshList = () => {
    setEnrichedList(dataService.getAllEnrichedServices());
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory('Treasury & Finance');
    setDepartmentId(departments[0]?.id || '');
    setOfficeId(offices[0]?.id || '');
    setFee('No Fee');
    setProcessingTime('3–5 working days');
    setKeywordsStr('');
    setReqDrafts([
      {
        name: 'Government Photo ID Proof',
        description: 'Valid Aadhaar, Passport, or Voter ID card.',
        required: true,
      },
    ]);
    setStepDrafts([
      {
        title: 'Present Application at Designated Counter',
        description: 'Submit completed application form and original ID for verification.',
      },
    ]);
  };

  const handleEdit = (serviceId: string) => {
    const target = enrichedList.find((item) => item.service.id === serviceId);
    if (!target) return;
    const { service, requirements, steps } = target;
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description);
    setCategory(service.category);
    setDepartmentId(service.departmentId);
    setOfficeId(service.officeId);
    setFee(service.fee);
    setProcessingTime(service.processingTime);
    setKeywordsStr(service.keywords.join(', '));
    setReqDrafts(
      requirements.map((r) => ({
        name: r.name,
        description: r.description,
        required: r.required,
      }))
    );
    setStepDrafts(
      steps.map((st) => ({
        title: st.title,
        description: st.description,
      }))
    );
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) {
      setFeedback({
        type: 'error',
        text: 'Service name must be at least 3 characters.',
      });
      return;
    }
    if (description.trim().length < 10) {
      setFeedback({
        type: 'error',
        text: 'Please provide a clear service description.',
      });
      return;
    }

    const sId = editingId || `srv-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const meta = {
      dataSource: 'Demo information — Admin Updated',
      verified: false,
      lastUpdated: today,
    };

    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (!keywords.includes(name.trim().toLowerCase())) {
      keywords.unshift(name.trim().toLowerCase());
    }

    const serviceRecord: Service = {
      id: sId,
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'Civic Services',
      departmentId,
      officeId,
      fee: fee.trim() || 'No Fee',
      processingTime: processingTime.trim() || '3–5 working days',
      status: 'active',
      keywords,
      ...meta,
    };

    const finalReqs: Requirement[] = reqDrafts
      .filter((r) => r.name.trim())
      .map((r, idx) => ({
        id: `req-${sId}-${idx + 1}`,
        serviceId: sId,
        name: r.name.trim(),
        description: r.description.trim() || 'Required supporting document.',
        required: r.required,
        ...meta,
      }));

    const finalSteps: ServiceStep[] = stepDrafts
      .filter((st) => st.title.trim())
      .map((st, idx) => ({
        id: `stp-${sId}-${idx + 1}`,
        serviceId: sId,
        stepNumber: idx + 1,
        title: st.title.trim(),
        description: st.description.trim() || 'Complete this step at the counter.',
        ...meta,
      }));

    dataService.saveServiceWithDetails(serviceRecord, finalReqs, finalSteps);
    refreshList();
    setFeedback({
      type: 'success',
      text: editingId
        ? `Updated service "${serviceRecord.name}" along with ${finalReqs.length} requirements and ${finalSteps.length} steps.`
        : `Created new service "${serviceRecord.name}".`,
    });
    resetForm();
  };

  const handleDelete = (id: string, srvName: string) => {
    dataService.deleteService(id);
    refreshList();
    if (editingId === id) resetForm();
    setFeedback({
      type: 'success',
      text: `Deleted service "${srvName}".`,
    });
  };

  return (
    <AdminShell onResetSeed={refreshList}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Full Service + Requirements + Steps Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 self-start">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">
              {editingId
                ? 'Edit Service, Checklist & Procedure'
                : 'Add New Government Service'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
              role="status"
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Solvency Certificate Issuance"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Description *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this service provides to the citizen..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Revenue Certificates"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Search Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keywordsStr}
                  onChange={(e) => setKeywordsStr(e.target.value)}
                  placeholder="solvency, bank guarantee, tehsildar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Responsible Department *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Assigned Office & Counter *
                </label>
                <select
                  value={officeId}
                  onChange={(e) => setOfficeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.counter})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Official Fee
                </label>
                <input
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="₹50 Statutory Fee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Processing Time
                </label>
                <input
                  type="text"
                  value={processingTime}
                  onChange={(e) => setProcessingTime(e.target.value)}
                  placeholder="5–7 working days"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Dynamic Requirements Builder */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A]">
                  Required Documents Checklist ({reqDrafts.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setReqDrafts((prev) => [
                      ...prev,
                      { name: '', description: '', required: true },
                    ])
                  }
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  + Add Requirement
                </button>
              </div>

              {reqDrafts.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req.name}
                      onChange={(e) =>
                        setReqDrafts((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, name: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Document Name (e.g. Form TR-22)"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                    {reqDrafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setReqDrafts((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        aria-label="Remove requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={req.description}
                    onChange={(e) =>
                      setReqDrafts((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? { ...item, description: e.target.value }
                            : item
                        )
                      )
                    }
                    placeholder="Brief instruction (e.g. Bring original + 2 copies)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              ))}
            </div>

            {/* Dynamic Procedure Steps Builder */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A]">
                  Numbered Procedure Steps ({stepDrafts.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStepDrafts((prev) => [
                      ...prev,
                      { title: '', description: '' },
                    ])
                  }
                  className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  + Add Step
                </button>
              </div>

              {stepDrafts.map((st, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-tabular font-bold text-[#1E3A8A]">
                      0{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) =>
                        setStepDrafts((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, title: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Step Title"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                    {stepDrafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setStepDrafts((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        aria-label="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={st.description}
                    onChange={(e) =>
                      setStepDrafts((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? { ...item, description: e.target.value }
                            : item
                        )
                      )
                    }
                    placeholder="Step description..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Service & Checklist' : 'Create Service'}</span>
            </button>
          </form>
        </div>

        {/* Right 6 cols: Services List */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0F172A]">
            Configured Services ({enrichedList.length})
          </h2>
          <div className="space-y-3">
            {enrichedList.map(({ service, department, office, requirements, steps }) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#1E3A8A]">
                      {service.category} · {requirements.length} reqs · {steps.length}{' '}
                      steps
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600">{service.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(service.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id, service.name)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    Dept: <strong className="text-slate-700">{department?.name}</strong>{' '}
                    · Counter:{' '}
                    <strong className="text-[#1E3A8A] font-mono-tabular">
                      {office?.counter} ({office?.desk})
                    </strong>
                  </span>
                  <Link
                    to={`/services/${service.id}`}
                    className="font-semibold text-[#1E3A8A] hover:underline"
                  >
                    Preview Page →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
