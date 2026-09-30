export type TaskCategory =
  | 'ddo_signature'
  | 'income_certificate'
  | 'birth_certificate'
  | 'property_registration'
  | 'trade_license'
  | 'pension_service'
  | 'building_approval'
  | 'domicile_certificate'
  | 'document_submission'
  | 'general_civic';

export interface ExtractedDocumentInfo {
  fileName: string;
  documentType?: string;
  department?: string;
  serviceName?: string;
  officeMentioned?: string;
  applicationReferenceNumber?: string;
  state?: string;
  district?: string;
  taluk?: string;
  cityOrVillage?: string;
  locality?: string;
  address?: string;
  officerDesignation?: string;
  requiredSignatureOrApproval?: string;
  dates?: string;
  summary?: string;
}

export interface ConversationSlots {
  rawInitialTask: string;
  taskCategory?: TaskCategory;
  serviceName?: string;
  // Task-specific context slots
  documentType?: string;
  documentPurpose?: string;
  requestSubType?: string; // e.g., "New registration" | "Certified copy" | "Correction"
  propertyType?: string; // e.g., "Residential Plot / Flat", "Agricultural Land"
  businessType?: string;
  // Progressive Location slots
  state?: string;
  district?: string;
  taluk?: string;
  cityOrTown?: string;
  locality?: string;
  pinCode?: string;
  // Uploaded document context
  uploadedDoc?: ExtractedDocumentInfo;
}

export interface ResolvedOfficeDestination {
  isVerifiedSource: boolean;
  verificationLabel: 'VERIFIED INFORMATION' | 'UNVERIFIED / DEMONSTRATION INFORMATION';
  lastVerifiedDate: string;
  dataSourceName: string;
  officialPortalUrl: string;
  officeCategoryHeader: string;
  serviceName: string;
  departmentName: string;
  officeName: string;
  // Complete address fields
  buildingName: string;
  doorOrBuildingNumber: string;
  blockName: string | null;
  floorName: string | null;
  counterName: string | null;
  deskName: string | null;
  officerDesignation: string | null;
  street: string;
  area: string;
  locality: string;
  cityOrTown: string;
  taluk: string;
  district: string;
  state: string;
  pinCode: string;
  completeAddress: string;
  // Contact & Hours
  officeHours: string;
  contactPhone: string;
  contactEmail?: string;
  // Coordinates (null if not verified for that custom locality, never fabricated)
  lat: number | null;
  lng: number | null;
  // Office Image (null if no verified real image is available)
  officeImageUrl: string | null;
  officeImageCaption?: string;
  // Requirements
  requirementsVerified: boolean;
  requirements: Array<{
    id: string;
    label: string;
    detail: string;
    mandatory: boolean;
  }>;
  // Summary explanation
  locationChainText: string;
  whyDirectedSummary: string;
}

export interface AssistantTurnResponse {
  assistantMessage: string;
  quickReplies?: string[];
  updatedSlots: ConversationSlots;
  nextMissingStage:
    | 'understand_task'
    | 'task_details'
    | 'location_district'
    | 'location_taluk'
    | 'location_locality'
    | 'ready';
  progressState: {
    taskUnderstood: boolean;
    locationCollectedCount: number;
    locationTotalNeeded: number;
    departmentFound: boolean;
    officeFound: boolean;
    destinationReady: boolean;
  };
  resolvedDestination?: ResolvedOfficeDestination;
}

// Known Location Knowledge Base (for smart inference of District / Taluk / Locality)
interface KnownLocalityRecord {
  localityAliases: string[];
  locality: string;
  cityOrTown: string;
  taluk: string;
  district: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
}

const KNOWN_LOCALITIES: KnownLocalityRecord[] = [
  {
    localityAliases: ['yelahanka', 'yelahanka new town', 'yelahanka old town'],
    locality: 'Yelahanka',
    cityOrTown: 'Bengaluru',
    taluk: 'Bangalore North (Yelahanka)',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560064',
    lat: 13.1007,
    lng: 77.5963,
  },
  {
    localityAliases: ['jayanagar', 'jp nagar', 'banashankari', 'basavanagudi'],
    locality: 'Jayanagar',
    cityOrTown: 'Bengaluru',
    taluk: 'Bangalore South',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560041',
    lat: 12.925,
    lng: 77.5938,
  },
  {
    localityAliases: ['indiranagar', 'kr puram', 'whitefield', 'marathahalli'],
    locality: 'K.R. Puram / Indiranagar',
    cityOrTown: 'Bengaluru',
    taluk: 'Bangalore East',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560036',
    lat: 13.0012,
    lng: 77.6715,
  },
  {
    localityAliases: ['malleshwaram', 'rajajinagar', 'hebbal', 'yeswanthpur'],
    locality: 'Malleshwaram',
    cityOrTown: 'Bengaluru',
    taluk: 'Bangalore North',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560003',
    lat: 13.0031,
    lng: 77.5643,
  },
  {
    localityAliases: ['kengeri', 'rajarajeshwari nagar', 'rr nagar'],
    locality: 'Kengeri',
    cityOrTown: 'Bengaluru',
    taluk: 'Kengeri',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560060',
    lat: 12.9172,
    lng: 77.4833,
  },
  {
    localityAliases: ['civil lines', 'connaught place', 'sansad marg', 'patel chowk'],
    locality: 'Civil Lines',
    cityOrTown: 'New Delhi',
    taluk: 'Civil Lines Sub-Division',
    district: 'Central Delhi',
    state: 'Delhi',
    pinCode: '110054',
    lat: 28.6767,
    lng: 77.2167,
  },
];

const KNOWN_DISTRICTS: Array<{
  aliases: string[];
  district: string;
  state: string;
  sampleTaluks: string[];
}> = [
  {
    aliases: ['bengaluru urban', 'bangalore urban', 'bengaluru', 'bangalore', 'blr'],
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    sampleTaluks: ['Bangalore North', 'Bangalore South', 'Bangalore East', 'Yelahanka', 'Anekal'],
  },
  {
    aliases: ['bengaluru rural', 'bangalore rural'],
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    sampleTaluks: ['Devanahalli', 'Doddaballapura', 'Hoskote', 'Nelamangala'],
  },
  {
    aliases: ['mysuru', 'mysore'],
    district: 'Mysuru',
    state: 'Karnataka',
    sampleTaluks: ['Mysuru North', 'Mysuru South', 'Nanjangud', 'Hunsur'],
  },
  {
    aliases: ['central delhi', 'new delhi', 'delhi'],
    district: 'Central Delhi',
    state: 'Delhi',
    sampleTaluks: ['Civil Lines', 'Connaught Place', 'Karol Bagh'],
  },
  {
    aliases: ['mumbai city', 'mumbai suburban', 'mumbai'],
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    sampleTaluks: ['Andheri', 'Bandra', 'Borivali', 'Kurla'],
  },
  {
    aliases: ['chennai'],
    district: 'Chennai',
    state: 'Tamil Nadu',
    sampleTaluks: ['Egmore', 'Mylapore', 'Guindy', 'Ambattur'],
  },
];

export function detectTaskCategory(input: string): {
  category?: TaskCategory;
  serviceName?: string;
} {
  const lower = input.toLowerCase();

  if (
    lower.includes('ddo') ||
    lower.includes('drawing and disbursing') ||
    lower.includes('treasury bill') ||
    lower.includes('countersign')
  ) {
    return {
      category: 'ddo_signature',
      serviceName: 'DDO Signature & Bill Authorization',
    };
  }

  if (lower.includes('income certificate') || lower.includes('annual income') || lower.includes('income proof')) {
    return {
      category: 'income_certificate',
      serviceName: 'Income Certificate',
    };
  }

  if (lower.includes('birth certificate') || lower.includes('birth registration') || lower.includes('birth record')) {
    return {
      category: 'birth_certificate',
      serviceName: 'Birth Certificate',
    };
  }

  if (
    lower.includes('property') ||
    lower.includes('sale deed') ||
    lower.includes('sub-registrar') ||
    lower.includes('sub registrar') ||
    lower.includes('land registration') ||
    lower.includes('deed registration')
  ) {
    return {
      category: 'property_registration',
      serviceName: 'Property Document & Deed Registration',
    };
  }

  if (lower.includes('trade license') || lower.includes('shop license') || lower.includes('business license')) {
    return {
      category: 'trade_license',
      serviceName: 'Municipal Trade License',
    };
  }

  if (lower.includes('pension') || lower.includes('jeevan pramaan') || lower.includes('ppo')) {
    return {
      category: 'pension_service',
      serviceName: 'Pension & Retiree Service',
    };
  }

  if (lower.includes('building') || lower.includes('construction permit') || lower.includes('occupancy certificate')) {
    return {
      category: 'building_approval',
      serviceName: 'Building Plan Approval & Permit',
    };
  }

  if (lower.includes('domicile') || lower.includes('residence certificate') || lower.includes('caste certificate')) {
    return {
      category: 'domicile_certificate',
      serviceName: 'Domicile / Residence Certificate',
    };
  }

  if (
    lower.includes('signature') ||
    lower.includes('document') ||
    lower.includes('submit') ||
    lower.includes('approval') ||
    lower.includes('certificate') ||
    lower.includes('form')
  ) {
    return {
      category: 'document_submission',
      serviceName: 'Government Document / Signature Verification',
    };
  }

  return {};
}

const KNOWN_STATES = [
  'karnataka',
  'delhi',
  'maharashtra',
  'tamil nadu',
  'kerala',
  'telangana',
  'andhra pradesh',
  'uttar pradesh',
  'gujarat',
  'west bengal',
  'rajasthan',
];

export function extractLocationFromText(
  text: string,
  currentSlots: ConversationSlots
): Partial<ConversationSlots> {
  const lower = text.toLowerCase().trim();
  const updates: Partial<ConversationSlots> = {};

  // Check if a 6-digit PIN code is mentioned
  const pinMatch = text.match(/\b([1-8]\d{5})\b/);
  if (pinMatch) {
    updates.pinCode = pinMatch[1];
  }

  // Check known states
  for (const st of KNOWN_STATES) {
    if (lower.includes(st)) {
      updates.state = st
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      break;
    }
  }

  // Check known localities
  for (const loc of KNOWN_LOCALITIES) {
    if (loc.localityAliases.some((alias) => lower.includes(alias))) {
      updates.locality = loc.locality;
      if (!currentSlots.cityOrTown) updates.cityOrTown = loc.cityOrTown;
      if (!currentSlots.district) updates.district = loc.district;
      if (!currentSlots.state) updates.state = loc.state;
      if (!currentSlots.pinCode) updates.pinCode = loc.pinCode;
      break;
    }
  }

  // Check known districts
  for (const dist of KNOWN_DISTRICTS) {
    if (dist.aliases.some((alias) => lower.includes(alias))) {
      updates.district = dist.district;
      if (!currentSlots.state) updates.state = dist.state;
      break;
    }
  }

  // Check common taluks explicitly mentioned
  const talukKeywords = [
    'bangalore north',
    'bengaluru north',
    'bangalore south',
    'bengaluru south',
    'bangalore east',
    'bengaluru east',
    'anekal',
    'devanahalli',
    'doddaballapura',
    'hoskote',
    'nelamangala',
    'kengeri',
    'civil lines',
    'connaught place',
    'andheri',
    'bandra',
    'borivali',
    'egmore',
    'mylapore',
    'guindy',
  ];

  for (const tk of talukKeywords) {
    if (lower.includes(tk)) {
      updates.taluk = tk
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      break;
    }
  }

  return updates;
}

export function buildResolvedDestination(
  slots: ConversationSlots
): ResolvedOfficeDestination {
  const district = slots.district || 'Bengaluru Urban';
  const taluk = slots.taluk || 'Bangalore North';
  const locality = slots.locality || 'Yelahanka';
  const state = slots.state || (district.toLowerCase().includes('delhi') ? 'Delhi' : 'Karnataka');

  const matchedLocality = KNOWN_LOCALITIES.find(
    (l) =>
      l.locality.toLowerCase() === locality.toLowerCase() ||
      l.localityAliases.some((a) => locality.toLowerCase().includes(a))
  );

  const cityOrTown = slots.cityOrTown || matchedLocality?.cityOrTown || district.replace(' Urban', '');
  const pinCode = slots.pinCode || matchedLocality?.pinCode || '560064';
  const lat = matchedLocality ? matchedLocality.lat : null;
  const lng = matchedLocality ? matchedLocality.lng : null;

  const isYelahankaDemo =
    locality.toLowerCase().includes('yelahanka') ||
    taluk.toLowerCase().includes('north') ||
    district.toLowerCase().includes('bengaluru');

  const locationChainText = `${district} → ${taluk} → ${locality}`;

  switch (slots.taskCategory) {
    case 'income_certificate': {
      const officeName = `Nadakacheri / Taluk Revenue Office — ${locality}`;
      return {
        isVerifiedSource: false,
        verificationLabel: 'UNVERIFIED / DEMONSTRATION INFORMATION',
        lastVerifiedDate: '2026-09-15',
        dataSourceName: 'CivicGuide Demonstration Directory (Verify before visiting)',
        officialPortalUrl: 'https://nadakacheri.karnataka.gov.in',
        officeCategoryHeader: 'DISTRICT / TALUK OFFICE',
        serviceName: 'Income Certificate',
        departmentName: 'Revenue Department',
        officeName: 'Taluk Office (Atalji Janasnehi Kendra / Nadakacheri)',
        buildingName: 'Government Administrative Building (Mini Vidhana Soudha)',
        doorOrBuildingNumber: 'Building No. 14, Ward Office Complex',
        blockName: 'Block A',
        floorName: 'Ground Floor',
        counterName: 'Counter 4',
        deskName: 'Citizen Services Desk (Caste & Income Certificates)',
        officerDesignation: 'Deputy Tahsildar / Revenue Inspector',
        street: `${locality} Main Road, Near Bus Stand`,
        area: locality,
        locality,
        cityOrTown,
        taluk,
        district,
        state,
        pinCode,
        completeAddress: `Taluk Office, Government Administrative Building, Block A, Ground Floor, ${locality} Main Road, ${locality}, ${taluk} Taluk, ${district}, ${state} – ${pinCode}`,
        officeHours: '10:00 AM – 5:30 PM (Monday – Saturday, except 2nd & 4th Saturday)',
        contactPhone: isYelahankaDemo ? '+91 (080) 2846-0120 (Demo)' : 'Contact local Taluk Revenue Helpdesk',
        contactEmail: 'tah-north-blr.demo@civicguide.example',
        lat,
        lng,
        officeImageUrl: null, // Never fabricate office photos
        requirementsVerified: false,
        requirements: [
          {
            id: 'req-inc-1',
            label: 'Identity document',
            detail: 'Aadhaar Card, Voter ID, PAN Card, or Passport of the applicant.',
            mandatory: true,
          },
          {
            id: 'req-inc-2',
            label: 'Application form',
            detail: 'Completed Income Certificate Form / Nadakacheri application slip.',
            mandatory: true,
          },
          {
            id: 'req-inc-3',
            label: 'Address & Ration Card document',
            detail: 'Ration card, electricity bill, or residential proof in the taluk.',
            mandatory: true,
          },
          {
            id: 'req-inc-4',
            label: 'Supporting income document / self-declaration',
            detail: 'Salary slip, Form 16, or signed family income declaration.',
            mandatory: true,
          },
        ],
        locationChainText,
        whyDirectedSummary: `You are looking for an Income Certificate. Based on your location (${locationChainText}), income and revenue certificates are issued by the Revenue Department at the ${locality} Taluk / Nadakacheri Office (${officeName}).`,
      };
    }

    case 'ddo_signature': {
      const docLabel = slots.documentType || 'Official Treasury / Departmental Document';
      const purposeLabel = slots.documentPurpose || 'DDO Counter-Signature & Authorization';
      return {
        isVerifiedSource: false,
        verificationLabel: 'UNVERIFIED / DEMONSTRATION INFORMATION',
        lastVerifiedDate: '2026-09-15',
        dataSourceName: 'CivicGuide Demonstration Directory (Verify before visiting)',
        officialPortalUrl: 'https://khajane2.karnataka.gov.in',
        officeCategoryHeader: 'DISTRICT / TALUK TREASURY OFFICE',
        serviceName: `DDO Signature (${docLabel})`,
        departmentName: 'Department of Treasury & Accounts / Revenue Department',
        officeName: `District / Sub-Treasury Office — ${locality}`,
        buildingName: 'Treasury & Administrative Annex Building',
        doorOrBuildingNumber: 'Plot No. 8, Institutional Treasury Wing',
        blockName: 'Block A',
        floorName: '2nd Floor',
        counterName: 'Counter 4 (DDO & Bill Clearance)',
        deskName: 'DDO Verification & Token Desk (Desk B-12)',
        officerDesignation: 'Drawing and Disbursing Officer (DDO) / Assistant Treasury Officer',
        street: `Administrative Complex Road, ${locality}`,
        area: locality,
        locality,
        cityOrTown,
        taluk,
        district,
        state,
        pinCode,
        completeAddress: `Sub-Treasury & DDO Office, Treasury Annex Building, Block A, 2nd Floor, ${locality}, ${taluk} Taluk, ${district}, ${state} – ${pinCode}`,
        officeHours: '10:00 AM – 5:00 PM (Bill submission up to 3:30 PM, Mon – Fri)',
        contactPhone: '+91 (080) 2221-3940 (Demo Helpdesk)',
        contactEmail: 'ddo.treasury.demo@civicguide.example',
        lat,
        lng,
        officeImageUrl: null,
        requirementsVerified: false,
        requirements: [
          {
            id: 'req-ddo-1',
            label: `Original ${docLabel} (In Duplicate)`,
            detail: `Prepared for: ${purposeLabel}. Must include section head initials.`,
            mandatory: true,
          },
          {
            id: 'req-ddo-2',
            label: 'Departmental Forwarding Memo / Sanction Order',
            detail: 'Official covering letter with dispatch number and head of account.',
            mandatory: true,
          },
          {
            id: 'req-ddo-3',
            label: 'Identity document / Employee ID Card',
            detail: 'Valid government or applicant identity card for counter entry.',
            mandatory: true,
          },
        ],
        locationChainText,
        whyDirectedSummary: `You need a DDO signature on your ${docLabel} for ${purposeLabel}. Based on your location (${locationChainText}), this is handled by the Drawing and Disbursing Officer at the Treasury & Administrative Office in ${locality}.`,
      };
    }

    case 'birth_certificate': {
      const subType = slots.requestSubType || 'Certified Copy / Registration';
      return {
        isVerifiedSource: false,
        verificationLabel: 'UNVERIFIED / DEMONSTRATION INFORMATION',
        lastVerifiedDate: '2026-09-15',
        dataSourceName: 'CivicGuide Demonstration Directory (Verify before visiting)',
        officialPortalUrl: 'https://crsorgi.gov.in',
        officeCategoryHeader: 'MUNICIPAL ZONAL / VITAL STATISTICS OFFICE',
        serviceName: `Birth Certificate (${subType})`,
        departmentName: 'Municipal Corporation — Chief Registrar of Births & Deaths',
        officeName: `Zonal Municipal Citizen Service Center — ${locality}`,
        buildingName: 'Municipal Zonal Administrative Complex',
        doorOrBuildingNumber: 'No. 42, Civic Center Main Road',
        blockName: 'North Wing',
        floorName: 'Ground Floor',
        counterName: 'Counter 2 (Birth & Death Registration)',
        deskName: 'Vital Statistics Citizen Desk (VR-01)',
        officerDesignation: 'Sub-Registrar of Births and Deaths / Health Inspector',
        street: `Civic Center Road, ${locality}`,
        area: locality,
        locality,
        cityOrTown,
        taluk,
        district,
        state,
        pinCode,
        completeAddress: `Municipal Zonal Office, North Wing, Ground Floor, Counter 2, ${locality}, ${taluk}, ${district}, ${state} – ${pinCode}`,
        officeHours: '09:30 AM – 5:00 PM (Monday – Saturday)',
        contactPhone: '+91 (080) 2266-0000 (Demo Municipal Helpline)',
        lat,
        lng,
        officeImageUrl: null,
        requirementsVerified: false,
        requirements: [
          {
            id: 'req-bir-1',
            label: 'Hospital Birth Discharge Slip / Existing Birth Record Copy',
            detail: `Required for ${subType.toLowerCase()}.`,
            mandatory: true,
          },
          {
            id: 'req-bir-2',
            label: 'Parents Identity Documents (Mother & Father)',
            detail: 'Aadhaar Card, Passport, or Voter ID of both parents.',
            mandatory: true,
          },
          {
            id: 'req-bir-3',
            label: 'Completed Municipal Birth Application Form',
            detail: 'Available at Counter 2 or downloadable from the civil registration portal.',
            mandatory: true,
          },
        ],
        locationChainText,
        whyDirectedSummary: `You are applying for a Birth Certificate (${subType}). Based on your location (${locationChainText}), civil registration and birth certificate issuance are handled at the Municipal Zonal Vital Statistics Office in ${locality}.`,
      };
    }

    case 'property_registration': {
      const propType = slots.propertyType || 'Property Sale / Conveyance Deed';
      const subAction = slots.requestSubType || 'Deed Registration';
      return {
        isVerifiedSource: false,
        verificationLabel: 'UNVERIFIED / DEMONSTRATION INFORMATION',
        lastVerifiedDate: '2026-09-15',
        dataSourceName: 'CivicGuide Demonstration Directory (Verify before visiting)',
        officialPortalUrl: 'https://igr.karnataka.gov.in',
        officeCategoryHeader: 'OFFICE OF THE SUB-REGISTRAR',
        serviceName: `Property Registration — ${propType} (${subAction})`,
        departmentName: 'Department of Stamps and Registration',
        officeName: `Sub-Registrar Office (SRO) — ${locality}`,
        buildingName: 'Sub-Registrar & Revenue Complex',
        doorOrBuildingNumber: 'No. 28, Registration Complex',
        blockName: 'Block B (Registration Wing)',
        floorName: '1st Floor',
        counterName: 'Counter 6 (Deed Scrutiny & Biometrics)',
        deskName: 'Registration Execution Desk (SR-06)',
        officerDesignation: 'Senior Sub-Registrar',
        street: `Sub-Registrar Office Road, ${locality}`,
        area: locality,
        locality,
        cityOrTown,
        taluk,
        district,
        state,
        pinCode,
        completeAddress: `Office of the Sub-Registrar, Block B, 1st Floor, Counter 6, ${locality}, ${taluk} Taluk, ${district}, ${state} – ${pinCode}`,
        officeHours: '10:00 AM – 5:30 PM (Monday – Saturday, except 2nd & 4th Saturday)',
        contactPhone: '+91 (080) 2222-9110 (Demo SRO Helpdesk)',
        lat,
        lng,
        officeImageUrl: null,
        requirementsVerified: false,
        requirements: [
          {
            id: 'req-prp-1',
            label: 'Original Deed Printed on e-Stamp Paper',
            detail: `Prepared for ${propType} (${subAction}).`,
            mandatory: true,
          },
          {
            id: 'req-prp-2',
            label: 'Identity & PAN Documents (Buyer, Seller & 2 Witnesses)',
            detail: 'Original Aadhaar/Voter ID/Passport and PAN cards for all parties.',
            mandatory: true,
          },
          {
            id: 'req-prp-3',
            label: 'Khata Extract, Tax Paid Receipt & Encumbrance Certificate (EC)',
            detail: 'Up-to-date municipal/panchayat property tax receipt and title chain.',
            mandatory: true,
          },
          {
            id: 'req-prp-4',
            label: 'Stamp Duty & Registration Fee Challan / Receipt',
            detail: 'Proof of statutory payment via Kaveri / Khajane portal.',
            mandatory: true,
          },
        ],
        locationChainText,
        whyDirectedSummary: `You need ${subAction} for ${propType}. Based on your property jurisdiction (${locationChainText}), deed registration and biometric execution take place at the Sub-Registrar Office (SRO) in ${locality}.`,
      };
    }

    case 'trade_license': {
      const bizInfo = slots.businessType || 'Commercial Establishment';
      const subAction = slots.requestSubType || 'License Renewal / New Application';
      return {
        isVerifiedSource: false,
        verificationLabel: 'UNVERIFIED / DEMONSTRATION INFORMATION',
        lastVerifiedDate: '2026-09-15',
        dataSourceName: 'CivicGuide Demonstration Directory (Verify before visiting)',
        officialPortalUrl: 'https://site.bbmp.gov.in',
        officeCategoryHeader: 'MUNICIPAL TRADE LICENSING OFFICE',
        serviceName: `Trade License (${subAction})`,
        departmentName: 'Municipal Corporation — Health & Trade Licensing Department',
        officeName: `Zonal Trade Licensing Office — ${locality}`,
        buildingName: 'Municipal Zonal Annex Building',
        doorOrBuildingNumber: 'No. 45, Municipal Square',
        blockName: 'East Block',
        floorName: '1st Floor',
        counterName: 'Counter 9 (Trade & Commercial Permits)',
        deskName: 'Trade Licensing Desk (TL-04)',
        officerDesignation: 'Medical Officer of Health (MOH) / Senior Health Inspector',
        street: `Municipal Main Road, ${locality}`,
        area: locality,
        locality,
        cityOrTown,
        taluk,
        district,
        state,
        pinCode,
        completeAddress: `Municipal Zonal Trade Licensing Office, East Block, 1st Floor, Counter 9, ${locality}, ${taluk}, ${district}, ${state} – ${pinCode}`,
        officeHours: '10:00 AM – 5:00 PM (Monday – Friday)',
        contactPhone: '+91 (080) 2266-1122 (Demo Licensing Helpdesk)',
        lat,
        lng,
        officeImageUrl: null,
        requirementsVerified: false,
        requirements: [
          {
            id: 'req-trd-1',
            label: 'Identity & PAN Document of Proprietor / Entity',
            detail: `For ${bizInfo}.`,
            mandatory: true,
          },
          {
            id: 'req-trd-2',
            label: 'Commercial Rental Agreement / Ownership Tax Receipt & NOC',
            detail: 'Proof of legal occupancy of the business premises.',
            mandatory: true,
          },
          {
            id: 'req-trd-3',
            label: 'Previous Trade License Copy (for Renewal) or Layout Plan',
            detail: 'Original license number or floor area sketch.',
            mandatory: true,
          },
        ],
        locationChainText,
        whyDirectedSummary: `You are looking for ${subAction} for a ${bizInfo}. Based on your location (${locationChainText}), municipal trade permits are processed at the Zonal Trade Licensing Office in ${locality}.`,
      };
    }

    default: {
      const srvTitle =
        slots.serviceName ||
        slots.documentType ||
        slots.rawInitialTask ||
        'Government Citizen Service';
      return {
        isVerifiedSource: false,
        verificationLabel: 'UNVERIFIED / DEMONSTRATION INFORMATION',
        lastVerifiedDate: '2026-09-15',
        dataSourceName: 'CivicGuide Demonstration Directory (Verify before visiting)',
        officialPortalUrl: 'https://india.gov.in',
        officeCategoryHeader: 'DISTRICT / TALUK CITIZEN FACILITATION OFFICE',
        serviceName: srvTitle,
        departmentName:
          slots.uploadedDoc?.department ||
          'District Administration & Revenue Citizen Services',
        officeName:
          slots.uploadedDoc?.officeMentioned ||
          `Taluk Administrative & Citizen Service Office — ${locality}`,
        buildingName: 'Government Administrative Complex',
        doorOrBuildingNumber: 'Main Administrative Block',
        blockName: null, // Explicitly demonstrates "Counter information not available" if unknown
        floorName: 'Ground Floor',
        counterName: null,
        deskName: 'Citizen Helpdesk & Inward Counter',
        officerDesignation:
          slots.uploadedDoc?.officerDesignation || 'Designated Nodal Officer',
        street: `Main Road, ${locality}`,
        area: locality,
        locality,
        cityOrTown,
        taluk,
        district,
        state,
        pinCode,
        completeAddress: `Government Administrative Complex, Ground Floor, ${locality}, ${taluk} Taluk, ${district}, ${state} – ${pinCode}`,
        officeHours: '10:00 AM – 5:30 PM (Monday – Friday)',
        contactPhone: 'Contact District Citizen Helpline (1902 / Local Taluk Office)',
        lat,
        lng,
        officeImageUrl: null,
        requirementsVerified: false,
        requirements: [
          {
            id: 'req-gen-1',
            label: 'Government Photo Identity Document',
            detail: 'Aadhaar Card, Voter ID, PAN Card, or Passport.',
            mandatory: true,
          },
          {
            id: 'req-gen-2',
            label: 'Original Application Form / Document to Submit',
            detail: slots.documentPurpose
              ? `Prepared for: ${slots.documentPurpose}`
              : 'Carry original plus one self-attested photocopy set.',
            mandatory: true,
          },
          {
            id: 'req-gen-3',
            label: 'Supporting Address / Reference Proof',
            detail: 'Local address proof or prior acknowledgment receipt if applicable.',
            mandatory: true,
          },
        ],
        locationChainText,
        whyDirectedSummary: `You are looking for help with "${srvTitle}". Based on your location (${locationChainText}), the relevant jurisdiction office is the Taluk Administrative & Citizen Service Office in ${locality}.`,
      };
    }
  }
}

function isDontKnowResponse(input: string): boolean {
  const lower = input.toLowerCase().trim();
  if (lower === 'no' || lower === 'none' || lower === 'na' || lower === 'n/a') {
    return true;
  }
  return (
    lower.includes("don't know") ||
    lower.includes('dont know') ||
    lower.includes('dont nknow') ||
    lower.includes("don't nknow") ||
    lower.includes('dont have') ||
    lower.includes("don't have") ||
    lower.includes('do not have') ||
    lower.includes('no values') ||
    lower.includes('no details') ||
    lower.includes('not sure') ||
    lower.includes('no idea') ||
    lower.includes('idk') ||
    lower.includes('skip') ||
    lower.includes('auto-detect') ||
    lower.includes('auto-fill') ||
    lower.includes('use demo') ||
    lower.includes('show office') ||
    lower.includes('just show') ||
    lower.includes('instant') ||
    lower.includes('help me')
  );
}

function fillDefaultTaskAndLocationSlots(slots: ConversationSlots): void {
  if (slots.taskCategory === 'ddo_signature') {
    slots.documentType =
      slots.documentType || 'Official Treasury / Departmental Document';
    slots.documentPurpose =
      slots.documentPurpose || 'DDO Verification & Counter-Signature';
  } else if (slots.taskCategory === 'birth_certificate') {
    slots.requestSubType =
      slots.requestSubType || 'Certified Copy / Registration';
  } else if (slots.taskCategory === 'property_registration') {
    slots.propertyType =
      slots.propertyType || 'Residential Plot / Apartment Sale Deed';
    slots.requestSubType =
      slots.requestSubType || 'New deed registration';
  } else if (slots.taskCategory === 'trade_license') {
    slots.businessType =
      slots.businessType || 'Commercial Shop / Establishment';
    slots.requestSubType =
      slots.requestSubType || 'License Renewal / New Application';
  } else if (slots.taskCategory === 'document_submission') {
    slots.documentType =
      slots.documentType || 'Government Application / Official Form';
    slots.documentPurpose =
      slots.documentPurpose || 'Official Submission & Verification';
  }

  const matchedLoc = KNOWN_LOCALITIES.find(
    (l) => l.locality.toLowerCase() === (slots.locality || '').toLowerCase()
  );
  slots.state = slots.state || matchedLoc?.state || 'Karnataka';
  slots.district = slots.district || matchedLoc?.district || 'Bengaluru Urban';
  slots.taluk = slots.taluk || matchedLoc?.taluk || 'Bangalore North';
  slots.locality = slots.locality || 'Yelahanka';
}

export function processConversationTurnLocal(
  userMessage: string,
  currentSlots: ConversationSlots,
  isFirstTurn: boolean
): AssistantTurnResponse {
  const cleanMsg = userMessage.trim();
  const lower = cleanMsg.toLowerCase();
  const userSaidDontKnow = isDontKnowResponse(cleanMsg);
  const nextSlots: ConversationSlots = { ...currentSlots };

  if (isFirstTurn || !nextSlots.rawInitialTask) {
    nextSlots.rawInitialTask = userSaidDontKnow
      ? 'I need an income certificate'
      : cleanMsg;
  }

  const wasAlreadyResolved = Boolean(
    currentSlots.district && currentSlots.taluk && currentSlots.locality
  );

  // Check if we were asking a task-specific question BEFORE processing this turn's answer
  const wasAskingTaskDetails =
    !isFirstTurn && checkNeedsTaskSpecificQuestion(currentSlots).needed;

  // 1. Detect or refine task category
  if (!nextSlots.taskCategory || nextSlots.taskCategory === 'document_submission') {
    const detected = detectTaskCategory(
      userSaidDontKnow && isFirstTurn ? 'I need an income certificate' : cleanMsg
    );
    if (detected.category) {
      nextSlots.taskCategory = detected.category;
      nextSlots.serviceName = detected.serviceName;
    } else if (!nextSlots.taskCategory) {
      nextSlots.taskCategory = 'income_certificate';
      nextSlots.serviceName = userSaidDontKnow ? 'Income Certificate' : cleanMsg;
    }
  }

  // 2. Always check if user explicitly mentioned a known location in this message
  const locUpdates = extractLocationFromText(cleanMsg, nextSlots);
  Object.assign(nextSlots, locUpdates);

  // If the destination was already resolved and the user asks a follow-up question or changes location
  if (wasAlreadyResolved && !isFirstTurn && !wasAskingTaskDetails) {
    const resolvedCurrent = buildResolvedDestination(nextSlots);

    if (locUpdates.locality || locUpdates.taluk || locUpdates.district) {
      const updatedResolved = buildResolvedDestination(nextSlots);
      return {
        assistantMessage: `Updated your location to **${nextSlots.district} → ${nextSlots.taluk} → ${nextSlots.locality}**.\n\n**Updated Office:** ${updatedResolved.officeName} (${updatedResolved.departmentName}). The destination card and map below have been refreshed.`,
        updatedSlots: nextSlots,
        nextMissingStage: 'ready',
        progressState: {
          taskUnderstood: true,
          locationCollectedCount: 3,
          locationTotalNeeded: 3,
          departmentFound: true,
          officeFound: true,
          destinationReady: true,
        },
        resolvedDestination: updatedResolved,
      };
    }

    if (lower.includes('document') || lower.includes('require') || lower.includes('bring') || lower.includes('take')) {
      const reqList = resolvedCurrent.requirements.map((r) => `• **${r.label}** (${r.detail})`).join('\n');
      return {
        assistantMessage: `For **${resolvedCurrent.serviceName}** at **${resolvedCurrent.officeName}**, please carry:\n\n${reqList}`,
        updatedSlots: nextSlots,
        nextMissingStage: 'ready',
        progressState: {
          taskUnderstood: true,
          locationCollectedCount: 3,
          locationTotalNeeded: 3,
          departmentFound: true,
          officeFound: true,
          destinationReady: true,
        },
        resolvedDestination: resolvedCurrent,
      };
    }

    if (lower.includes('hour') || lower.includes('time') || lower.includes('timing') || lower.includes('open')) {
      return {
        assistantMessage: `**Office Hours for ${resolvedCurrent.officeName}:**\n\n${resolvedCurrent.officeHours}\n\n**Contact:** ${resolvedCurrent.contactPhone}`,
        updatedSlots: nextSlots,
        nextMissingStage: 'ready',
        progressState: {
          taskUnderstood: true,
          locationCollectedCount: 3,
          locationTotalNeeded: 3,
          departmentFound: true,
          officeFound: true,
          destinationReady: true,
        },
        resolvedDestination: resolvedCurrent,
      };
    }

    if (lower.includes('counter') || lower.includes('floor') || lower.includes('where') || lower.includes('desk')) {
      return {
        assistantMessage: `Inside **${resolvedCurrent.buildingName}**, go to **${resolvedCurrent.blockName || 'Main Wing'} → ${resolvedCurrent.floorName || 'Ground Floor'} → ${resolvedCurrent.counterName || 'Counter information not available'} → ${resolvedCurrent.deskName || 'Citizen Helpdesk'}** (${resolvedCurrent.officerDesignation || 'Designated Officer'}).`,
        updatedSlots: nextSlots,
        nextMissingStage: 'ready',
        progressState: {
          taskUnderstood: true,
          locationCollectedCount: 3,
          locationTotalNeeded: 3,
          departmentFound: true,
          officeFound: true,
          destinationReady: true,
        },
        resolvedDestination: resolvedCurrent,
      };
    }
  }

  // 3. If user says they don't know / don't have these values at ANY point, fill all defaults immediately so they see the office & map right away!
  if (userSaidDontKnow) {
    fillDefaultTaskAndLocationSlots(nextSlots);
    const resolved = buildResolvedDestination(nextSlots);
    return {
      assistantMessage: `No problem at all — you don't need those details! I've used our default demonstration jurisdiction (**${nextSlots.district} → ${nextSlots.taluk} → ${nextSlots.locality}**) to show you the complete office, counter, and campus map immediately.\n\n**Office found:** ${resolved.officeName} (${resolved.departmentName}). *(You can type a different city or locality anytime to switch locations.)*`,
      updatedSlots: nextSlots,
      nextMissingStage: 'ready',
      progressState: {
        taskUnderstood: true,
        locationCollectedCount: 4,
        locationTotalNeeded: 4,
        departmentFound: true,
        officeFound: true,
        destinationReady: true,
      },
      resolvedDestination: resolved,
    };
  }

  // 4. Task-specific slot extraction when answering a task-specific question
  if (wasAskingTaskDetails) {
    if (nextSlots.taskCategory === 'ddo_signature') {
      if (!currentSlots.documentType) {
        nextSlots.documentType = cleanMsg;
      } else if (currentSlots.documentType && !currentSlots.documentPurpose) {
        nextSlots.documentPurpose = cleanMsg;
      }
    } else if (nextSlots.taskCategory === 'birth_certificate') {
      if (lower.includes('correction') || lower.includes('name')) {
        nextSlots.requestSubType = 'Correction / Name Addition';
      } else if (lower.includes('copy') || lower.includes('extract')) {
        nextSlots.requestSubType = 'Certified Copy';
      } else if (lower.includes('new')) {
        nextSlots.requestSubType = 'New Registration';
      } else if (!currentSlots.requestSubType) {
        nextSlots.requestSubType = cleanMsg;
      }
    } else if (nextSlots.taskCategory === 'property_registration') {
      if (!currentSlots.propertyType) {
        nextSlots.propertyType = cleanMsg;
      } else if (currentSlots.propertyType && !currentSlots.requestSubType) {
        nextSlots.requestSubType = cleanMsg;
      }
    } else if (nextSlots.taskCategory === 'trade_license') {
      if (lower.includes('renew')) {
        nextSlots.requestSubType = 'License Renewal';
      } else if (lower.includes('new')) {
        nextSlots.requestSubType = 'New Trade License';
      }
      if (!currentSlots.businessType) {
        nextSlots.businessType = cleanMsg;
      }
    } else if (nextSlots.taskCategory === 'document_submission') {
      if (!currentSlots.documentType) {
        nextSlots.documentType = cleanMsg;
        const recheck = detectTaskCategory(cleanMsg);
        if (recheck.category && recheck.category !== 'document_submission') {
          nextSlots.taskCategory = recheck.category;
          nextSlots.serviceName = recheck.serviceName;
        }
      } else if (currentSlots.documentType && !currentSlots.documentPurpose) {
        nextSlots.documentPurpose = cleanMsg;
      }
    }
  }

  // 4. Only assign free-text location slots when we were asking a location question (not a task-detail question)
  if (!isFirstTurn && !wasAskingTaskDetails) {
    if (userSaidDontKnow) {
      // User doesn't know their District, Taluk, or Locality — auto-fill from known locality or use demo Bengaluru Urban -> Bangalore North -> Yelahanka!
      const matchedLoc = KNOWN_LOCALITIES.find(
        (l) =>
          l.locality.toLowerCase() === (nextSlots.locality || '').toLowerCase()
      );
      nextSlots.state = nextSlots.state || matchedLoc?.state || 'Karnataka';
      nextSlots.district =
        nextSlots.district || matchedLoc?.district || 'Bengaluru Urban';
      nextSlots.taluk =
        nextSlots.taluk || matchedLoc?.taluk || 'Bangalore North';
      nextSlots.locality = nextSlots.locality || 'Yelahanka';
    } else {
      const isStateOnlyAnswer = Boolean(locUpdates.state && !locUpdates.district);
      if (!currentSlots.district && !locUpdates.district && !isStateOnlyAnswer) {
        nextSlots.district = cleanMsg;
      } else if (currentSlots.district && !currentSlots.taluk && !locUpdates.taluk) {
        nextSlots.taluk = cleanMsg;
      } else if (
        currentSlots.district &&
        currentSlots.taluk &&
        !currentSlots.locality &&
        !locUpdates.locality
      ) {
        nextSlots.locality = cleanMsg;
      }
    }
  }

  if (nextSlots.district && !nextSlots.state) {
    nextSlots.state = 'Karnataka';
  }

  // Re-evaluate what is still needed
  const afterTaskCheck = checkNeedsTaskSpecificQuestion(nextSlots);
  const locCount =
    (nextSlots.state ? 1 : 0) +
    (nextSlots.district ? 1 : 0) +
    (nextSlots.taluk ? 1 : 0) +
    (nextSlots.locality ? 1 : 0);

  if (afterTaskCheck.needed) {
    return {
      assistantMessage: afterTaskCheck.question!,
      quickReplies: afterTaskCheck.quickReplies,
      updatedSlots: nextSlots,
      nextMissingStage: 'task_details',
      progressState: {
        taskUnderstood: true,
        locationCollectedCount: locCount,
        locationTotalNeeded: 4,
        departmentFound: false,
        officeFound: false,
        destinationReady: false,
      },
    };
  }

  // Progressive Location Questions: District -> Taluk -> Area/Locality
  if (!nextSlots.district) {
    const introPrefix = isFirstTurn
      ? `Sure. You're looking for **${
          nextSlots.serviceName || 'a government office'
        }**. I can help you find the exact office.\n\n`
      : userSaidDontKnow
      ? 'No problem at all — you do not need to know those technical details! '
      : nextSlots.state
      ? `Got it (**${nextSlots.state}**). `
      : 'Got it. ';
    return {
      assistantMessage: `${introPrefix}Which **district** are you applying from? *(Or click "I don't know" below to use a demo location)*`,
      quickReplies: [
        'Bengaluru Urban',
        'Mysuru',
        'Central Delhi',
        'Mumbai Suburban',
        'Chennai',
        "I don't know — use demo location",
      ],
      updatedSlots: nextSlots,
      nextMissingStage: 'location_district',
      progressState: {
        taskUnderstood: true,
        locationCollectedCount: locCount,
        locationTotalNeeded: 4,
        departmentFound: true,
        officeFound: false,
        destinationReady: false,
      },
    };
  }

  if (!nextSlots.taluk) {
    const matchedDist = KNOWN_DISTRICTS.find(
      (d) => d.district.toLowerCase() === nextSlots.district?.toLowerCase()
    );
    const talukSuggestions = [
      ...(matchedDist?.sampleTaluks || [
        'Bangalore North',
        'Bangalore South',
        'Bangalore East',
        'Yelahanka',
      ]),
      "I don't know my taluk (Auto-detect)",
    ];

    const prefix = nextSlots.locality
      ? `I have **${nextSlots.district}** and **${nextSlots.locality}**. Which **taluk** should I use?`
      : `Which **taluk** in ${nextSlots.district}? *(Or click "I don't know my taluk" below)*`;

    return {
      assistantMessage: prefix,
      quickReplies: talukSuggestions,
      updatedSlots: nextSlots,
      nextMissingStage: 'location_taluk',
      progressState: {
        taskUnderstood: true,
        locationCollectedCount: locCount,
        locationTotalNeeded: 4,
        departmentFound: true,
        officeFound: false,
        destinationReady: false,
      },
    };
  }

  if (!nextSlots.locality) {
    const baseLocalities =
      nextSlots.taluk.toLowerCase().includes('north') ||
      nextSlots.taluk.toLowerCase().includes('yelahanka')
        ? ['Yelahanka', 'Hebbal', 'Malleshwaram', 'Yeswanthpur']
        : nextSlots.taluk.toLowerCase().includes('south')
        ? ['Jayanagar', 'Banashankari', 'JP Nagar', 'Basavanagudi']
        : ['Yelahanka', 'Indiranagar', 'Kengeri', 'Civil Lines'];

    return {
      assistantMessage: `Which **area or locality** in ${nextSlots.taluk} are you located in?`,
      quickReplies: [...baseLocalities, "I don't know — use main area"],
      updatedSlots: nextSlots,
      nextMissingStage: 'location_locality',
      progressState: {
        taskUnderstood: true,
        locationCollectedCount: locCount,
        locationTotalNeeded: 4,
        departmentFound: true,
        officeFound: false,
        destinationReady: false,
      },
    };
  }

  // All required task + location information collected! Resolve final office destination.
  const resolved = buildResolvedDestination(nextSlots);

  return {
    assistantMessage: `Thanks. I'll use **${nextSlots.district} → ${nextSlots.taluk} → ${nextSlots.locality}** to identify the relevant office.\n\n**Office found:** ${resolved.officeName} (${resolved.departmentName}). Scroll down or review the complete destination card below.`,
    updatedSlots: nextSlots,
    nextMissingStage: 'ready',
    progressState: {
      taskUnderstood: true,
      locationCollectedCount: 4,
      locationTotalNeeded: 4,
      departmentFound: true,
      officeFound: true,
      destinationReady: true,
    },
    resolvedDestination: resolved,
  };
}

function checkNeedsTaskSpecificQuestion(slots: ConversationSlots): {
  needed: boolean;
  question?: string;
  quickReplies?: string[];
} {
  switch (slots.taskCategory) {
    case 'ddo_signature': {
      if (!slots.documentType) {
        return {
          needed: true,
          question:
            'Got it. You need a **DDO signature**.\n\nTo find the correct office for you, I need a few details. **What document needs the DDO signature?**',
          quickReplies: [
            'Salary / Contingent Bill (Form TR-22)',
            'Service Book / Deputation Certificate',
            'Grant-in-Aid / Sanction Voucher',
            "I don't know — help me find out",
          ],
        };
      }
      if (!slots.documentPurpose) {
        return {
          needed: true,
          question: `Understood — **${slots.documentType}**.\n\n**What is the purpose of this document?**`,
          quickReplies: [
            'Treasury bill clearance & token authorization',
            'Departmental salary / allowance claim',
            'Official counter-signature for state scheme',
            "I don't know — help me find out",
          ],
        };
      }
      return { needed: false };
    }

    case 'birth_certificate': {
      if (!slots.requestSubType) {
        return {
          needed: true,
          question:
            'Got it. You need help with a **Birth Certificate**.\n\n**What type of request is this?**',
          quickReplies: [
            'New registration',
            'Certified copy',
            'Correction / Name addition',
            "I don't know — help me find out",
          ],
        };
      }
      return { needed: false };
    }

    case 'property_registration': {
      if (!slots.propertyType) {
        return {
          needed: true,
          question:
            'Understood. You need help with **Property Registration**.\n\n**What type of property or document is this for?**',
          quickReplies: [
            'Residential Plot / Apartment Sale Deed',
            'Agricultural Land Deed',
            'Gift Deed / Lease Agreement',
            "I don't know — help me find out",
          ],
        };
      }
      if (!slots.requestSubType) {
        return {
          needed: true,
          question: `Got it (${slots.propertyType}). **Is this for new deed registration, certified document collection, or another service?**`,
          quickReplies: [
            'New deed registration',
            'Document collection / Certified copy',
            'Encumbrance search / Valuation',
            "I don't know — help me find out",
          ],
        };
      }
      return { needed: false };
    }

    case 'trade_license': {
      if (!slots.businessType) {
        return {
          needed: true,
          question:
            'Got it. You need help with a **Trade License**.\n\n**What type of business or establishment is this for, and is it a new license or renewal?**',
          quickReplies: [
            'Retail Shop — License Renewal',
            'Restaurant / Food Business — New License',
            'Commercial Office / Service — Renewal',
            "I don't know — help me find out",
          ],
        };
      }
      return { needed: false };
    }

    case 'document_submission': {
      if (!slots.documentType) {
        return {
          needed: true,
          question:
            'I can help you find the exact office for your document.\n\n**What type of document is it?** (You can also upload the document using the attachment button below.)',
          quickReplies: [
            'DDO-related document',
            'Revenue / Income / Caste application',
            'Property / Land mutation form',
            "I don't know — help me find out",
          ],
        };
      }
      if (!slots.documentPurpose) {
        return {
          needed: true,
          question: `Understood (${slots.documentType}). **What is the purpose of the document?**`,
          quickReplies: [
            'Official signature / endorsement',
            'New certificate application submission',
            'Verification & counter clearance',
            "I don't know — help me find out",
          ],
        };
      }
      return { needed: false };
    }

    // For income_certificate, domicile_certificate, pension_service, etc., jump straight to progressive location questions!
    default:
      return { needed: false };
  }
}

export function analyzeDocumentLocally(
  fileName: string,
  textContent = ''
): {
  extracted: ExtractedDocumentInfo;
  clarifyingQuestion?: string;
} {
  const safeFileName = fileName || 'uploaded_document';
  const combined = `${safeFileName} ${textContent}`;
  const lower = combined.toLowerCase();

  let documentType: string | undefined;
  let department: string | undefined;
  let serviceName: string | undefined;
  let officeMentioned: string | undefined;
  let officerDesignation: string | undefined;
  let requiredSignatureOrApproval: string | undefined;

  if (
    lower.includes('ddo') ||
    lower.includes('tr-22') ||
    lower.includes('tr22') ||
    lower.includes('drawing and disbursing') ||
    lower.includes('treasury bill')
  ) {
    documentType = 'DDO / Treasury Bill Document';
    department = 'Department of Treasury & Accounts';
    serviceName = 'DDO Signature & Bill Authorization';
    officerDesignation = 'Drawing and Disbursing Officer (DDO)';
    requiredSignatureOrApproval = 'DDO Counter-Signature & Token Authorization';
  } else if (lower.includes('income')) {
    documentType = 'Income Certificate Application / Form';
    department = 'Revenue Department';
    serviceName = 'Income Certificate';
    officeMentioned = 'Nadakacheri / Taluk Revenue Office';
    officerDesignation = 'Deputy Tahsildar / Revenue Inspector';
    requiredSignatureOrApproval = 'Tahsildar Digital Signature & Verification';
  } else if (lower.includes('birth')) {
    documentType = 'Birth Certificate / Registration Form';
    department = 'Municipal Vital Statistics Department';
    serviceName = 'Birth Certificate';
    officerDesignation = 'Registrar of Births & Deaths';
  } else if (
    lower.includes('deed') ||
    lower.includes('property') ||
    lower.includes('sale') ||
    lower.includes('sub-registrar')
  ) {
    documentType = 'Property Deed / Registration Document';
    department = 'Department of Stamps and Registration';
    serviceName = 'Property Document & Deed Registration';
    officeMentioned = 'Office of the Sub-Registrar (SRO)';
    officerDesignation = 'Senior Sub-Registrar';
    requiredSignatureOrApproval = 'Sub-Registrar Execution & Endorsement';
  } else if (lower.includes('trade') || lower.includes('license')) {
    documentType = 'Municipal Trade License Document';
    department = 'Municipal Health & Licensing Department';
    serviceName = 'Municipal Trade License';
    officerDesignation = 'Medical Officer of Health (MOH)';
  } else if (lower.includes('pension') || lower.includes('ppo') || lower.includes('jeevan')) {
    documentType = 'Pension / PPO / Life Certificate Document';
    department = 'Department of Social Welfare & Pensions';
    serviceName = 'Pension & Retiree Service';
  }

  // Extract Reference / Application Number if present in text
  const refMatch = textContent.match(
    /(?:ref(?:erence)?|app(?:lication)?|token|bill)\s*(?:no|number|id|#)?\s*[:\-]?\s*([A-Z0-9\-\/]{4,22})/i
  );
  const applicationReferenceNumber = refMatch ? refMatch[1] : undefined;

  // Extract Date if present in text
  const dateMatch = textContent.match(
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/
  );
  const dates = dateMatch ? dateMatch[1] : undefined;

  // Extract any location mentioned in the document text or filename
  const locExtracted = extractLocationFromText(combined, { rawInitialTask: '' });

  const extracted: ExtractedDocumentInfo = {
    fileName: safeFileName,
    documentType,
    department,
    serviceName,
    officeMentioned,
    applicationReferenceNumber,
    state: locExtracted.state,
    district: locExtracted.district,
    taluk: locExtracted.taluk,
    locality: locExtracted.locality,
    officerDesignation,
    requiredSignatureOrApproval,
    dates,
    summary: documentType
      ? `Analyzed "${safeFileName}" locally — identified as ${documentType}.`
      : `Received "${safeFileName}". Only details explicitly present in the file are shown below.`,
  };

  let clarifyingQuestion: string | undefined;
  if (!documentType) {
    clarifyingQuestion = `I received your file **"${safeFileName}"**. What type of government document is this, and what task or signature do you need for it?`;
  }

  return {
    extracted,
    clarifyingQuestion,
  };
}
