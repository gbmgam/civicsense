import {
  INITIAL_DEPARTMENTS,
  INITIAL_OFFICES,
  INITIAL_REQUIREMENTS,
  INITIAL_SERVICES,
  INITIAL_STEPS,
} from '../data/seedData';
import {
  Department,
  EnrichedService,
  Office,
  Requirement,
  SavedService,
  SearchHistory,
  Service,
  ServiceStep,
} from '../types/civic';

const STORAGE_KEYS = {
  DEPARTMENTS: 'civicguide_departments_v2',
  OFFICES: 'civicguide_offices_v2',
  SERVICES: 'civicguide_services_v2',
  REQUIREMENTS: 'civicguide_requirements_v2',
  STEPS: 'civicguide_steps_v2',
  SAVED_SERVICES: 'civicguide_saved_v2',
  SEARCH_HISTORY: 'civicguide_history_v2',
};

function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Unable to persist data to localStorage:', err);
  }
}

export const dataService = {
  // Initialize or reset seed data
  resetToSeedData(): void {
    writeToStorage(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    writeToStorage(STORAGE_KEYS.OFFICES, INITIAL_OFFICES);
    writeToStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    writeToStorage(STORAGE_KEYS.REQUIREMENTS, INITIAL_REQUIREMENTS);
    writeToStorage(STORAGE_KEYS.STEPS, INITIAL_STEPS);
  },

  // Departments
  getDepartments(): Department[] {
    return readFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  saveDepartment(dept: Department): Department[] {
    const list = this.getDepartments();
    const idx = list.findIndex((d) => d.id === dept.id);
    const updated =
      idx >= 0 ? list.map((d) => (d.id === dept.id ? dept : d)) : [...list, dept];
    writeToStorage(STORAGE_KEYS.DEPARTMENTS, updated);
    return updated;
  },

  deleteDepartment(id: string): Department[] {
    const updated = this.getDepartments().filter((d) => d.id !== id);
    writeToStorage(STORAGE_KEYS.DEPARTMENTS, updated);
    return updated;
  },

  // Offices
  getOffices(): Office[] {
    return readFromStorage<Office[]>(STORAGE_KEYS.OFFICES, INITIAL_OFFICES);
  },

  saveOffice(office: Office): Office[] {
    const list = this.getOffices();
    const idx = list.findIndex((o) => o.id === office.id);
    const updated =
      idx >= 0 ? list.map((o) => (o.id === office.id ? office : o)) : [...list, office];
    writeToStorage(STORAGE_KEYS.OFFICES, updated);
    return updated;
  },

  deleteOffice(id: string): Office[] {
    const updated = this.getOffices().filter((o) => o.id !== id);
    writeToStorage(STORAGE_KEYS.OFFICES, updated);
    return updated;
  },

  // Services
  getServices(): Service[] {
    return readFromStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  },

  getRequirements(): Requirement[] {
    return readFromStorage<Requirement[]>(STORAGE_KEYS.REQUIREMENTS, INITIAL_REQUIREMENTS);
  },

  getServiceSteps(): ServiceStep[] {
    return readFromStorage<ServiceStep[]>(STORAGE_KEYS.STEPS, INITIAL_STEPS);
  },

  saveServiceWithDetails(
    service: Service,
    requirements: Requirement[],
    steps: ServiceStep[]
  ): void {
    const services = this.getServices();
    const sIdx = services.findIndex((s) => s.id === service.id);
    const updatedServices =
      sIdx >= 0
        ? services.map((s) => (s.id === service.id ? service : s))
        : [...services, service];
    writeToStorage(STORAGE_KEYS.SERVICES, updatedServices);

    const otherReqs = this.getRequirements().filter((r) => r.serviceId !== service.id);
    writeToStorage(STORAGE_KEYS.REQUIREMENTS, [...otherReqs, ...requirements]);

    const otherSteps = this.getServiceSteps().filter((st) => st.serviceId !== service.id);
    const sortedSteps = [...steps]
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .map((st, idx) => ({ ...st, stepNumber: idx + 1 }));
    writeToStorage(STORAGE_KEYS.STEPS, [...otherSteps, ...sortedSteps]);
  },

  deleteService(id: string): void {
    const updatedServices = this.getServices().filter((s) => s.id !== id);
    writeToStorage(STORAGE_KEYS.SERVICES, updatedServices);

    const updatedReqs = this.getRequirements().filter((r) => r.serviceId !== id);
    writeToStorage(STORAGE_KEYS.REQUIREMENTS, updatedReqs);

    const updatedSteps = this.getServiceSteps().filter((st) => st.serviceId !== id);
    writeToStorage(STORAGE_KEYS.STEPS, updatedSteps);
  },

  // Enriched Services Join
  getAllEnrichedServices(): EnrichedService[] {
    const departments = this.getDepartments();
    const offices = this.getOffices();
    const services = this.getServices();
    const requirements = this.getRequirements();
    const steps = this.getServiceSteps();

    const deptMap = new Map(departments.map((d) => [d.id, d]));
    const officeMap = new Map(offices.map((o) => [o.id, o]));

    return services.map((service) => ({
      service,
      department: deptMap.get(service.departmentId),
      office: officeMap.get(service.officeId),
      requirements: requirements.filter((r) => r.serviceId === service.id),
      steps: steps
        .filter((st) => st.serviceId === service.id)
        .sort((a, b) => a.stepNumber - b.stepNumber),
    }));
  },

  getEnrichedServiceById(serviceId: string): EnrichedService | undefined {
    return this.getAllEnrichedServices().find((item) => item.service.id === serviceId);
  },

  // Saved Services (User specific)
  getSavedServices(userId: string): SavedService[] {
    const all = readFromStorage<SavedService[]>(STORAGE_KEYS.SAVED_SERVICES, []);
    return all
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  },

  isServiceSaved(userId: string, serviceId: string): boolean {
    if (!userId) return false;
    const all = readFromStorage<SavedService[]>(STORAGE_KEYS.SAVED_SERVICES, []);
    return all.some((s) => s.userId === userId && s.serviceId === serviceId);
  },

  toggleSaveService(userId: string, serviceId: string, notes?: string): boolean {
    const all = readFromStorage<SavedService[]>(STORAGE_KEYS.SAVED_SERVICES, []);
    const existingIdx = all.findIndex(
      (s) => s.userId === userId && s.serviceId === serviceId
    );
    if (existingIdx >= 0) {
      const updated = all.filter((_, idx) => idx !== existingIdx);
      writeToStorage(STORAGE_KEYS.SAVED_SERVICES, updated);
      return false;
    } else {
      const newEntry: SavedService = {
        id: `sav-${Date.now()}`,
        userId,
        serviceId,
        notes,
        savedAt: new Date().toISOString(),
      };
      writeToStorage(STORAGE_KEYS.SAVED_SERVICES, [newEntry, ...all]);
      return true;
    }
  },

  updateSavedServiceNote(userId: string, serviceId: string, notes: string): void {
    const all = readFromStorage<SavedService[]>(STORAGE_KEYS.SAVED_SERVICES, []);
    const updated = all.map((item) =>
      item.userId === userId && item.serviceId === serviceId
        ? { ...item, notes }
        : item
    );
    writeToStorage(STORAGE_KEYS.SAVED_SERVICES, updated);
  },

  // Search History
  getSearchHistory(userId: string): SearchHistory[] {
    const all = readFromStorage<SearchHistory[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
    return all
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addSearchHistory(
    userId: string,
    query: string,
    resultsCount: number,
    matchedServiceId?: string,
    matchedServiceName?: string
  ): void {
    const trimmed = query.trim();
    if (!trimmed || !userId) return;
    const all = readFromStorage<SearchHistory[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
    // Avoid duplicate consecutive identical searches for the same user
    const filtered = all.filter(
      (h) => !(h.userId === userId && h.query.toLowerCase() === trimmed.toLowerCase())
    );
    const entry: SearchHistory = {
      id: `hst-${Date.now()}`,
      userId,
      query: trimmed,
      matchedServiceId,
      matchedServiceName,
      resultsCount,
      timestamp: new Date().toISOString(),
    };
    writeToStorage(STORAGE_KEYS.SEARCH_HISTORY, [entry, ...filtered].slice(0, 50));
  },

  clearSearchHistory(userId: string): void {
    const all = readFromStorage<SearchHistory[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
    writeToStorage(
      STORAGE_KEYS.SEARCH_HISTORY,
      all.filter((h) => h.userId !== userId)
    );
  },
};
