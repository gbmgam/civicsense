/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ServicesSearchPage } from './pages/ServicesSearchPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PostLoginAssistantPage } from './pages/PostLoginAssistantPage';
import {
  SavedServicesPage,
  ProfilePage,
} from './pages/UserAreaPages';
import {
  AdminOverviewPage,
  AdminServicesPage,
  AdminDepartmentsPage,
  AdminOfficesPage,
} from './pages/AdminPages';

const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

const HomeOrPostLoginRoute: React.FC = () => {
  const { user } = useAuth();
  // After the user signs in, show the conversational government-office finder as the home experience
  if (user) {
    return <PostLoginAssistantPage />;
  }
  return <LandingPage />;
};

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-[#0F172A]">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-600">
        We couldn't find that page. Use our service search to locate the
        right government service, department, and office counter.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/dashboard"
          className="px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold"
        >
          Open Office Finder
        </Link>
        <Link
          to="/"
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollManager />
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1E3A8A] focus:text-white focus:rounded-lg focus:text-xs focus:font-semibold"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<HomeOrPostLoginRoute />} />
              <Route path="/dashboard" element={<PostLoginAssistantPage />} />
              <Route path="/assistant" element={<PostLoginAssistantPage />} />
              <Route path="/services" element={<ServicesSearchPage />} />
              <Route path="/services/:id" element={<ServiceDetailsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/saved" element={<SavedServicesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route
                path="/admin/departments"
                element={<AdminDepartmentsPage />}
              />
              <Route path="/admin/offices" element={<AdminOfficesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
