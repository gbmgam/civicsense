export interface LocalAnalyticsSnapshot {
  mostSearchedServices: Array<{
    serviceId: string;
    serviceName: string;
    departmentName: string;
    searches: number;
  }>;
  mostVisitedDepartments: Array<{
    departmentId: string;
    departmentName: string;
    visits: number;
  }>;
  commonFailedSearches: Array<{
    query: string;
    attempts: number;
    suggestedCategory: string;
  }>;
  averageNavigationDistanceMeters: number;
  completedServiceJourneys: number;
  totalRoutesComputed: number;
}

const ANALYTICS_STORAGE_KEY = 'civicguide_local_analytics_v1';

const DEFAULT_ANALYTICS: LocalAnalyticsSnapshot = {
  mostSearchedServices: [
    {
      serviceId: 'srv-income-certificate',
      serviceName: 'Income Certificate',
      departmentName: 'Revenue Department',
      searches: 148,
    },
    {
      serviceId: 'srv-scholarship-verification',
      serviceName: 'Scholarship Verification',
      departmentName: 'Education Department',
      searches: 112,
    },
    {
      serviceId: 'srv-birth-certificate',
      serviceName: 'Birth Certificate',
      departmentName: 'Municipal Department',
      searches: 96,
    },
    {
      serviceId: 'srv-residence-certificate',
      serviceName: 'Residence Certificate',
      departmentName: 'Revenue Department',
      searches: 84,
    },
    {
      serviceId: 'srv-pension-application',
      serviceName: 'Pension Application',
      departmentName: 'Social Welfare Department',
      searches: 71,
    },
    {
      serviceId: 'srv-trade-license',
      serviceName: 'Trade License',
      departmentName: 'Licensing Department',
      searches: 63,
    },
  ],
  mostVisitedDepartments: [
    {
      departmentId: 'dept-revenue',
      departmentName: 'Revenue Department (Building A)',
      visits: 285,
    },
    {
      departmentId: 'dept-education',
      departmentName: 'Education Department (Building B)',
      visits: 164,
    },
    {
      departmentId: 'dept-municipal',
      departmentName: 'Municipal Department (Building C)',
      visits: 142,
    },
    {
      departmentId: 'dept-pensions',
      departmentName: 'Social Welfare Department (Building D)',
      visits: 98,
    },
    {
      departmentId: 'dept-licensing',
      departmentName: 'Licensing Department (Building E)',
      visits: 89,
    },
  ],
  commonFailedSearches: [
    {
      query: 'passport renewal counter',
      attempts: 19,
      suggestedCategory: 'Certificates (External PSK Service)',
    },
    {
      query: 'electricity bill payment',
      attempts: 14,
      suggestedCategory: 'Other Services (Utility Board)',
    },
    {
      query: 'aadhaar biometric update',
      attempts: 11,
      suggestedCategory: 'Certificates (Citizen Facilitation)',
    },
    {
      query: 'ration card split form',
      attempts: 8,
      suggestedCategory: 'Social Welfare',
    },
  ],
  averageNavigationDistanceMeters: 156,
  completedServiceJourneys: 342,
  totalRoutesComputed: 418,
};

function loadAnalytics(): LocalAnalyticsSnapshot {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(DEFAULT_ANALYTICS));
      return DEFAULT_ANALYTICS;
    }
    return JSON.parse(raw) as LocalAnalyticsSnapshot;
  } catch {
    return DEFAULT_ANALYTICS;
  }
}

function saveAnalytics(snapshot: LocalAnalyticsSnapshot): void {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors
  }
}

export const analyticsService = {
  getSnapshot(): LocalAnalyticsSnapshot {
    return loadAnalytics();
  },

  recordServiceSearch(serviceId: string, serviceName: string, departmentName: string): void {
    const snap = loadAnalytics();
    const existing = snap.mostSearchedServices.find((s) => s.serviceId === serviceId);
    if (existing) {
      existing.searches += 1;
    } else {
      snap.mostSearchedServices.push({
        serviceId,
        serviceName,
        departmentName,
        searches: 1,
      });
    }
    snap.mostSearchedServices.sort((a, b) => b.searches - a.searches);
    saveAnalytics(snap);
  },

  recordDepartmentVisit(departmentId: string, departmentName: string): void {
    const snap = loadAnalytics();
    const existing = snap.mostVisitedDepartments.find((d) => d.departmentId === departmentId);
    if (existing) {
      existing.visits += 1;
    } else {
      snap.mostVisitedDepartments.push({
        departmentId,
        departmentName,
        visits: 1,
      });
    }
    snap.mostVisitedDepartments.sort((a, b) => b.visits - a.visits);
    saveAnalytics(snap);
  },

  recordFailedSearch(query: string, suggestedCategory = 'Certificates'): void {
    const clean = query.trim().toLowerCase();
    if (!clean) return;
    const snap = loadAnalytics();
    const existing = snap.commonFailedSearches.find((f) => f.query.toLowerCase() === clean);
    if (existing) {
      existing.attempts += 1;
    } else {
      snap.commonFailedSearches.unshift({
        query: clean,
        attempts: 1,
        suggestedCategory,
      });
    }
    snap.commonFailedSearches.sort((a, b) => b.attempts - a.attempts);
    saveAnalytics(snap);
  },

  recordNavigationRoute(distanceMeters: number): void {
    if (!distanceMeters || distanceMeters <= 0) return;
    const snap = loadAnalytics();
    const totalPrev = snap.averageNavigationDistanceMeters * snap.totalRoutesComputed;
    snap.totalRoutesComputed += 1;
    snap.averageNavigationDistanceMeters = Math.round(
      (totalPrev + distanceMeters) / snap.totalRoutesComputed
    );
    saveAnalytics(snap);
  },

  recordCompletedJourney(): void {
    const snap = loadAnalytics();
    snap.completedServiceJourneys += 1;
    saveAnalytics(snap);
  },

  resetAnalytics(): LocalAnalyticsSnapshot {
    saveAnalytics(DEFAULT_ANALYTICS);
    return DEFAULT_ANALYTICS;
  },
};
