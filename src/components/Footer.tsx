import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Info, X } from 'lucide-react';

type PolicyModalType = 'privacy' | 'terms' | 'contact' | null;

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<PolicyModalType>(null);

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand + Mission */}
          <div className="md:col-span-5 space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-white font-bold text-lg tracking-tight"
            >
              <span className="w-7 h-7 rounded-md bg-[#1D4ED8] text-white flex items-center justify-center">
                <Compass className="w-4 h-4" aria-hidden="true" />
              </span>
              <span>CivicGuide</span>
            </Link>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Helping citizens find the right place for the right service.
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              From knowing WHAT you need to knowing WHERE to go — connecting
              services, departments, exact office counters, document checklists,
              and directions.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Platform Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/how-it-works#about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Citizen & Admin Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="md:col-span-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Information & Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-start sm:items-center gap-2 text-amber-300/90">
            <Info className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <span>
              Demo platform — information may not represent official government requirements.
            </span>
          </div>
          <p className="shrink-0">
            © {new Date().getFullYear()} CivicGuide Public Navigation Demo.
          </p>
        </div>
      </div>

      {/* Accessible Info Modal for Privacy / Terms / Contact */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-modal-title"
        >
          <div className="bg-white text-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 id="footer-modal-title" className="text-base font-bold text-slate-900">
                {activeModal === 'privacy' && 'Privacy Notice (Demo Platform)'}
                {activeModal === 'terms' && 'Terms of Use & Civic Data Disclaimer'}
                {activeModal === 'contact' && 'Contact CivicGuide Demo Support'}
              </h4>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
              {activeModal === 'privacy' && (
                <>
                  <p>
                    CivicGuide operates in guest-first mode. You can search services,
                    inspect exact office counters, check required documents, and view
                    directions without creating an account.
                  </p>
                  <p>
                    In this demonstration environment, saved services and search
                    history are stored locally in your browser storage and can be
                    cleared at any time from your Dashboard.
                  </p>
                </>
              )}
              {activeModal === 'terms' && (
                <>
                  <p>
                    All departments, office counters, desk numbers, timings, fees,
                    and document checklists displayed in CivicGuide are clearly
                    marked as <strong>Demo information</strong> for demonstration
                    and presentation purposes.
                  </p>
                  <p>
                    Always verify statutory forms and timings with your local
                    municipal or district administration before visiting in person.
                  </p>
                </>
              )}
              {activeModal === 'contact' && (
                <>
                  <p>
                    Have feedback on a civic service listing, counter change, or
                    accessibility improvement?
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1.5 font-mono-tabular">
                    <div>Helpline (Demo): +91 (011) 2300-0100</div>
                    <div>Email: support.demo@civicguide.example</div>
                    <div>Hours: Monday – Saturday, 09:00 to 18:00</div>
                  </div>
                </>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E3A8A] text-white hover:bg-[#172E6E] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
