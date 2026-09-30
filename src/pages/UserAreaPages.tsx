import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Clock,
  Search,
  Trash2,
  User as UserIcon,
  LogOut,
  ArrowRight,
  Building2,
  DoorOpen,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileEdit,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [historyVersion, setHistoryVersion] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allEnriched = useMemo(() => dataService.getAllEnrichedServices(), []);
  const enrichedMap = useMemo(
    () => new Map(allEnriched.map((item) => [item.service.id, item])),
    [allEnriched]
  );

  const savedRecords = useMemo(
    () => dataService.getSavedServices(user.id),
    [user.id, savedVersion]
  );

  const recentSearches = useMemo(
    () => dataService.getSearchHistory(user.id),
    [user.id, historyVersion]
  );

  const handleClearHistory = () => {
    dataService.clearSearchHistory(user.id);
    setHistoryVersion((v) => v + 1);
  };

  const handleRemoveSaved = (serviceId: string) => {
    dataService.toggleSaveService(user.id, serviceId);
    setSavedVersion((v) => v + 1);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome Banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#1E3A8A] font-semibold">
            <span>Citizen Workspace</span>
            <span aria-hidden="true">·</span>
            <span>{user.role === 'admin' ? 'Administrator Account' : 'Citizen Account'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-slate-600">
            Access your saved government service checklists, office counter
            locations, and recent search queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          )}
          <Link
            to="/services"
            className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Service Search</span>
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT 7 COLS: Saved Services */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#0F172A]">
                Saved Services ({savedRecords.length})
              </h2>
            </div>
            <Link
              to="/saved"
              className="text-xs font-semibold text-[#1E3A8A] hover:underline"
            >
              Manage All Saved →
            </Link>
          </div>

          {savedRecords.length > 0 ? (
            <div className="space-y-3.5">
              {savedRecords.map((sav) => {
                const item = enrichedMap.get(sav.serviceId);
                if (!item) return null;
                const { service, department, office, requirements } = item;
                return (
                  <div
                    key={sav.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <Link
                        to={`/services/${service.id}`}
                        className="text-sm font-bold text-[#0F172A] hover:text-[#1E3A8A] block"
                      >
                        {service.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                        <span>{department?.name}</span>
                        <span aria-hidden="true">·</span>
                        <strong className="text-[#1E3A8A] font-mono-tabular">
                          {office?.building}, {office?.floor}, {office?.counter} (
                          {office?.desk})
                        </strong>
                      </div>
                      {sav.notes && (
                        <p className="text-xs text-slate-500 italic pt-0.5">
                          Note: "{sav.notes}"
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 font-mono-tabular">
                        {requirements.length} required documents · Hours:{' '}
                        {office?.openingTime}–{office?.closingTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/services/${service.id}`}
                        className="px-3.5 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] whitespace-nowrap"
                      >
                        View Counter & Map
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(service.id)}
                        aria-label={`Remove ${service.name} from saved`}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-slate-600">
                You haven't bookmarked any government services yet.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold"
              >
                <span>Browse Services to Save</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* RIGHT 5 COLS: Recent Searches */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#0F172A]">
                Recent Searches ({recentSearches.length})
              </h2>
            </div>
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
              >
                Clear History
              </button>
            )}
          </div>

          {recentSearches.length > 0 ? (
            <ul className="space-y-2.5">
              {recentSearches.map((item) => (
                <li
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      to={`/services?q=${encodeURIComponent(item.query)}`}
                      className="text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#1E3A8A] truncate block"
                    >
                      "{item.query}"
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono-tabular">
                      <span>{item.resultsCount} matches</span>
                      {item.matchedServiceName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate text-emerald-700 font-sans font-medium">
                            Top: {item.matchedServiceName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    to={
                      item.matchedServiceId
                        ? `/services/${item.matchedServiceId}`
                        : `/services?q=${encodeURIComponent(item.query)}`
                    }
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 shrink-0 whitespace-nowrap"
                  >
                    Open →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-slate-600">
                Your recent service searches will appear here automatically.
              </p>
              <Link
                to="/services?q=I%20need%20a%20DDO%20signature"
                className="text-xs font-semibold text-[#1E3A8A] hover:underline inline-block"
              >
                Try searching "I need a DDO signature" →
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export const SavedServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allEnriched = useMemo(() => dataService.getAllEnrichedServices(), []);
  const enrichedMap = useMemo(
    () => new Map(allEnriched.map((item) => [item.service.id, item])),
    [allEnriched]
  );

  const savedList = useMemo(
    () => dataService.getSavedServices(user.id),
    [user.id, version]
  );

  const handleRemove = (serviceId: string) => {
    dataService.toggleSaveService(user.id, serviceId);
    setVersion((v) => v + 1);
  };

  const handleStartEditNote = (serviceId: string, currentNote = '') => {
    setEditingNoteId(serviceId);
    setNoteDraft(currentNote);
  };

  const handleSaveNote = (serviceId: string) => {
    dataService.updateSavedServiceNote(user.id, serviceId, noteDraft.trim());
    setEditingNoteId(null);
    setVersion((v) => v + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
            <Bookmark className="w-4 h-4" />
            <span>Saved Civic Visit Dossiers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
            Your Saved Government Services ({savedList.length})
          </h1>
          <p className="text-sm text-slate-600">
            Keep your required office counters, document checklists, and personal
            visit notes in one place.
          </p>
        </div>

        <Link
          to="/services"
          className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs sm:text-sm font-semibold hover:bg-[#172E6E] self-start sm:self-auto whitespace-nowrap"
        >
          + Find & Save More Services
        </Link>
      </div>

      {savedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedList.map((sav) => {
            const item = enrichedMap.get(sav.serviceId);
            if (!item) return null;
            const { service, department, office, requirements } = item;
            const isEditing = editingNoteId === service.id;

            return (
              <div
                key={sav.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-[#1E3A8A]">
                        {service.category} · Demo information
                      </span>
                      <h2 className="text-lg font-bold text-[#0F172A] mt-0.5">
                        <Link
                          to={`/services/${service.id}`}
                          className="hover:text-[#1E3A8A]"
                        >
                          {service.name}
                        </Link>
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(service.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                      <span className="font-semibold">{department?.name}</span>
                    </div>
                    {office && (
                      <>
                        <div className="flex items-center gap-2 text-[#1E3A8A] font-mono-tabular font-semibold">
                          <DoorOpen className="w-4 h-4 shrink-0" />
                          <span>
                            {office.building} · {office.floor} · {office.counter} (
                            {office.desk})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{office.address}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Personal Visit Note Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Personal Visit Note / Reminder:
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(service.id, sav.notes || '')}
                          className="text-[#1E3A8A] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>{sav.notes ? 'Edit Note' : 'Add Note'}</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="e.g. Bring 2 extra photocopies and arrive before 10:30 AM..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveNote(service.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold cursor-pointer"
                          >
                            Save Note
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 bg-blue-50/40 border border-blue-100 rounded-lg p-2.5">
                        {sav.notes || 'No personal reminder added yet.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono-tabular text-slate-500">
                    {requirements.length} required documents
                  </span>
                  <Link
                    to={`/services/${service.id}`}
                    className="px-4 py-2 rounded-lg bg-[#1E3A8A] text-white font-semibold hover:bg-[#172E6E] inline-flex items-center gap-1.5"
                  >
                    <span>Open Full Checklist & Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4">
          <p className="text-base font-bold text-[#0F172A]">
            No Saved Services Yet
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Click "Save Service" on any government service page to keep its
            counter location, required documents, and map directions handy.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold"
          >
            <span>Explore Services Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user, authMode, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const res = await updateProfile({ name, email, phone });
    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: 'Your profile details have been updated.',
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'Could not update profile.',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#1E3A8A]">
              Account Profile & Preferences
            </span>
            <h1 className="text-2xl font-bold text-[#0F172A]">{user.name}</h1>
            <p className="text-xs text-slate-500">
              Role: <strong className="uppercase">{user.role}</strong> · Auth
              Layer:{' '}
              <strong>
                {authMode === 'demo-local'
                  ? 'Demo Auth (Local Storage)'
                  : 'Firebase Auth'}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
            role="status"
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold text-slate-700"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-phone"
              className="block text-xs font-semibold text-slate-700"
            >
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-[#0F172A]"
            >
              ← Back to Dashboard
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs sm:text-sm font-semibold hover:bg-[#172E6E] cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
