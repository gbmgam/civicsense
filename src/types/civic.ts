export interface DataMetadata {
  dataSource: string;
  verified: boolean;
  lastUpdated: string;
}

export interface Department extends DataMetadata {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Office extends DataMetadata {
  id: string;
  departmentId: string;
  name: string;
  building: string;
  floor: string;
  counter: string;
  desk: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  workingDays?: string;
}

export type ServiceStatus = 'active' | 'draft' | 'archived';

export interface Service extends DataMetadata {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  officeId: string;
  category: string;
  fee: string;
  processingTime: string;
  status: ServiceStatus;
  keywords: string[];
}

export interface Requirement extends DataMetadata {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  required: boolean;
}

export interface ServiceStep extends DataMetadata {
  id: string;
  serviceId: string;
  stepNumber: number;
  title: string;
  description: string;
}

export type UserRole = 'citizen' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  matchedServiceId?: string;
  matchedServiceName?: string;
  resultsCount: number;
  timestamp: string;
}

export interface SavedService {
  id: string;
  userId: string;
  serviceId: string;
  notes?: string;
  savedAt: string;
}

export interface EnrichedService {
  service: Service;
  department: Department | undefined;
  office: Office | undefined;
  requirements: Requirement[];
  steps: ServiceStep[];
}

export interface SearchMatchResult {
  enriched: EnrichedService;
  score: number;
  matchReasons: string[];
}

export interface SearchResponse {
  query: string;
  normalizedQuery: string;
  extractedTerms: string[];
  exactMatches: SearchMatchResult[];
  relatedServices: EnrichedService[];
  suggestedCategories: string[];
}
