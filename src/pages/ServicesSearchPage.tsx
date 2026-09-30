import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Building2,
  X,
  HelpCircle,
  Sparkles,
  Info,
  FolderOpen,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { searchCivicServices } from '../services/searchService';
import { ServiceCard } from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

const NATURAL_LANGUAGE_EXAMPLES = [
  'I need a DDO signature',
  'Where do I apply for an income certificate?',
  'Birth certificate',
  'Pension application',
  'Trade license',
  'Property document',
  'Building approval',
];

export const ServicesSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialDept = searchParams.get('dept') || 'All';

  const [queryInput, setQueryInput] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDeptId, setSelectedDeptId] = useState(initialDept);

  const allEnriched = useMemo(() => dataService.getAllEnrichedServices(), []);
  const departments = useMemo(() => dataService.getDepartments(), []);
  const categories = useMemo(() => {
    const set = new Set(allEnriched.map((item) => item.service.category));
    return ['All', ...Array.from(set)];
  }, [allEnriched]);

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    if (!user) return new Set();
    return new Set(dataService.getSavedServices(user.id).map((s) => s.serviceId));
  });

  // Sync URL query parameter changes
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || 'All';
    const deptParam = searchParams.get('dept') || 'All';
    setQueryInput(qParam);
    setActiveQuery(qParam);
    setSelectedCategory(catParam);
    setSelectedDeptId(deptParam);
  }, [searchParams]);

  const searchResult = useMemo(() => {
    return searchCivicServices(
      activeQuery,
      allEnriched,
      selectedCategory,
      selectedDeptId
    );
  }, [activeQuery, allEnriched, selectedCategory, selectedDeptId]);

  // Record search history when user searches
  useEffect(() => {
    if (user && activeQuery.trim().length >= 2) {
      const topMatch = searchResult.exactMatches[0]?.enriched.service;
      dataService.addSearchHistory(
        user.id,
        activeQuery.trim(),
        searchResult.exactMatches.length,
        topMatch?.id,
        topMatch?.name
      );
    }
  }, [activeQuery, user, searchResult.exactMatches]);

  const updateUrlParams = (q: string, category: string, dept: string) => {
    const next = new URLSearchParams();
    if (q.trim()) next.set('q', q.trim());
    if (category && category !== 'All') next.set('category', category);
    if (dept && dept !== 'All') next.set('dept', dept);
    setSearchParams(next);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(queryInput);
    updateUrlParams(queryInput, selectedCategory, selectedDeptId);
  };

  const handleInputChange = (val: string) => {
    setQueryInput(val);
    setActiveQuery(val);
  };

  const handleSelectExample = (example: string) => {
    setQueryInput(example);
    setActiveQuery(example);
    setSelectedCategory('All');
    setSelectedDeptId('All');
    updateUrlParams(example, 'All', 'All');
  };

  const handleClearFilters = () => {
    setQueryInput('');
    setActiveQuery('');
    setSelectedCategory('All');
    setSelectedDeptId('All');
    setSearchParams({});
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-[#1E3A8A] font-semibold">
            <span>SERVICE → DEPARTMENT → OFFICE → REQUIREMENTS → DIRECTIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Search Government Services & Exact Offices
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Describe what you need in plain language (for example:{' '}
            <em>"I need a DDO signature"</em> or{' '}
            <em>"Where do I apply for an income certificate?"</em>) or filter by
            category and department.
          </p>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={handleFormSubmit}
          role="search"
          aria-label="Search government services"
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1 flex items-center">
            <Search
              className="w-5 h-5 text-[#1E3A8A] absolute left-4 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="service-directory-search" className="sr-only">
              Search services by name, keyword, or natural question
            </label>
            <input
              id="service-directory-search"
              type="text"
              value={queryInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g. I need a DDO signature, income certificate, birth certificate..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border-2 border-slate-300 focus:border-[#1E3A8A] focus:outline-none text-sm sm:text-base text-[#0F172A] bg-white"
            />
            {queryInput && (
              <button
                type="button"
                onClick={() => handleInputChange('')}
                aria-label="Clear search query"
                className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            Find Service
          </button>
        </form>

        {/* Natural Language Example Prompts */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">
            Try natural-language or keyword searches:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {NATURAL_LANGUAGE_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleSelectExample(example)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  activeQuery.toLowerCase() === example.toLowerCase()
                    ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A]'
                }`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Department Filter Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Segmented Category Buttons */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  updateUrlParams(activeQuery, cat, selectedDeptId);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Department Dropdown Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <label htmlFor="dept-filter-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Department:
            </label>
            <select
              id="dept-filter-select"
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                updateUrlParams(activeQuery, selectedCategory, e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-2 focus:outline-[#1E3A8A]"
            >
              <option value="All">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Extracted Search Intent Banner (when natural language is used) */}
      {activeQuery.trim() && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1E3A8A] shrink-0" aria-hidden="true" />
            <span>
              Showing results for <strong>"{activeQuery}"</strong>
            </span>
            {searchResult.extractedTerms.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Matched terms:{' '}
                  <strong className="text-[#1E3A8A] font-mono-tabular">
                    {searchResult.extractedTerms.join(', ')}
                  </strong>
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular font-semibold">
              {searchResult.exactMatches.length} service
              {searchResult.exactMatches.length === 1 ? '' : 's'} found
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer whitespace-nowrap"
          >
            Reset search & filters
          </button>
        </div>
      )}

      {/* RESULTS AREA */}
      {searchResult.exactMatches.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A]">
              {activeQuery.trim()
                ? `Matched Civic Services (${searchResult.exactMatches.length})`
                : `All Available Civic Services (${searchResult.exactMatches.length})`}
            </h2>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Demo information — click View Service for exact counter & map</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {searchResult.exactMatches.map(({ enriched, matchReasons }) => (
              <ServiceCard
                key={enriched.service.id}
                item={enriched}
                matchReasons={activeQuery.trim() ? matchReasons : undefined}
                isSaved={savedIds.has(enriched.service.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </div>
      ) : (
        /* NO EXACT RESULT STATE — Friendly message + Related Services & Categories (Never empty!) */
        <div className="space-y-8">
          <div
            className="bg-white rounded-2xl border border-amber-300 p-6 sm:p-8 space-y-5"
            role="status"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  We couldn't find an exact match.
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  No service directly matched{' '}
                  <strong>"{activeQuery}"</strong> with your current filters. Try
                  selecting one of the service categories below, or browse the
                  related government services we have prepared for you.
                </p>
              </div>
            </div>

            {/* Suggested Categories */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <FolderOpen className="w-4 h-4 text-[#1E3A8A]" aria-hidden="true" />
                <span>Browse by Service Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchResult.suggestedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setQueryInput('');
                      setActiveQuery('');
                      setSelectedCategory(cat);
                      setSelectedDeptId('All');
                      updateUrlParams('', cat, 'All');
                    }}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Show All Services
                </button>
              </div>
            </div>
          </div>

          {/* Related Services Grid (Always shown so screen is never empty) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Related & Popular Government Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResult.relatedServices.map((item) => (
                <ServiceCard
                  key={item.service.id}
                  item={item}
                  isSaved={savedIds.has(item.service.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
