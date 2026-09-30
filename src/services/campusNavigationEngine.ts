export interface CampusCounter {
  id: string;
  number: string;
  roomNumber: string;
  name: string;
  officerTitle: string;
  serviceIds: string[];
}

export interface CampusFloor {
  id: string;
  buildingId: string;
  level: number;
  name: string; // e.g. "Ground Floor", "First Floor", "Second Floor"
  rooms: string[];
  counters: CampusCounter[];
}

export interface CampusBuilding {
  id: string;
  code: string; // "Building A", "Building B", etc.
  name: string;
  shortName: string;
  departmentIds: string[];
  departmentNames: string[];
  description: string;
  // SVG layout coordinates on the 800x520 campus canvas
  svgRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  entranceNodeId: string;
  colorAccent: string;
  floors: CampusFloor[];
}

export interface NavigationPoint {
  id: string;
  label: string;
  shortLabel: string;
  type: 'gate' | 'junction' | 'building_entrance' | 'floor_node' | 'office_room';
  buildingId?: string;
  floorLevel?: number;
  roomNumber?: string;
  counterName?: string;
  // Coordinates on the 800x520 SVG campus canvas
  x: number;
  y: number;
}

export interface NavigationEdge {
  from: string;
  to: string;
  distanceMeters: number;
  instructionForward: string;
  instructionReverse: string;
  isIndoor?: boolean;
}

export interface NavigationInstructionStep {
  stepNumber: number;
  fromNode: NavigationPoint;
  toNode: NavigationPoint;
  distanceMeters: number;
  instruction: string;
  isIndoor: boolean;
}

export interface ShortestPathResult {
  startNode: NavigationPoint;
  destinationNode: NavigationPoint;
  pathNodes: NavigationPoint[];
  steps: NavigationInstructionStep[];
  totalDistanceMeters: number;
  estimatedWalkMinutes: number;
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'bldg-a',
    code: 'Building A',
    name: 'Building A — Revenue & Citizen Services Wing',
    shortName: 'Revenue Dept',
    departmentIds: ['dept-revenue'],
    departmentNames: ['Revenue Department'],
    description:
      'Houses the Citizen Services Office, Income & Caste Certificate Counters, Domicile Verification, and District Treasury DDO Clearance.',
    svgRect: { x: 70, y: 70, width: 200, height: 125 },
    entranceNodeId: 'node-bldg-a-entrance',
    colorAccent: '#1E3A8A',
    floors: [
      {
        id: 'fl-a-0',
        buildingId: 'bldg-a',
        level: 0,
        name: 'Ground Floor',
        rooms: ['Room 001 (Reception)', 'Room 007 (Domicile Desk)'],
        counters: [
          {
            id: 'cnt-a-7',
            number: 'Counter 7',
            roomNumber: 'Room 007',
            name: 'Domicile & Nationality Counter',
            officerTitle: 'Revenue Verification Officer',
            serviceIds: ['srv-domicile-certificate'],
          },
        ],
      },
      {
        id: 'fl-a-1',
        buildingId: 'bldg-a',
        level: 1,
        name: 'First Floor',
        rooms: ['Room 105 (Income Cert)', 'Room 106 (Caste Cert)', 'Room 108 (Residence Cert)'],
        counters: [
          {
            id: 'cnt-a-4',
            number: 'Counter 4',
            roomNumber: 'Room 105',
            name: 'Citizen Services Office — Income Certificates',
            officerTitle: 'Deputy Tahsildar (Revenue)',
            serviceIds: ['srv-income-certificate'],
          },
          {
            id: 'cnt-a-5',
            number: 'Counter 5',
            roomNumber: 'Room 106',
            name: 'Social & Caste Certificate Counter',
            officerTitle: 'Revenue Inspector (Caste Verification)',
            serviceIds: ['srv-caste-certificate'],
          },
          {
            id: 'cnt-a-6',
            number: 'Counter 6',
            roomNumber: 'Room 108',
            name: 'Residence & Address Proof Counter',
            officerTitle: 'Revenue Circle Officer',
            serviceIds: ['srv-residence-certificate'],
          },
        ],
      },
      {
        id: 'fl-a-2',
        buildingId: 'bldg-a',
        level: 2,
        name: 'Second Floor',
        rooms: ['Room 204 (DDO & Treasury Clearance)'],
        counters: [
          {
            id: 'cnt-a-ddo',
            number: 'Counter 4 (Treasury)',
            roomNumber: 'Room 204',
            name: 'DDO Signature & Bill Clearance Counter',
            officerTitle: 'Drawing and Disbursing Officer (DDO)',
            serviceIds: ['srv-ddo-signature'],
          },
        ],
      },
    ],
  },
  {
    id: 'bldg-b',
    code: 'Building B',
    name: 'Building B — Education & Scholarship Wing',
    shortName: 'Education Dept',
    departmentIds: ['dept-education'],
    departmentNames: ['Education Department'],
    description:
      'Handles State & National Scholarship Verification, Student Bonafide Certificates, Educational Attestation, and Institution Endorsements.',
    svgRect: { x: 530, y: 70, width: 200, height: 125 },
    entranceNodeId: 'node-bldg-b-entrance',
    colorAccent: '#2563EB',
    floors: [
      {
        id: 'fl-b-0',
        buildingId: 'bldg-b',
        level: 0,
        name: 'Ground Floor',
        rooms: ['Room 005 (Student Facilitation)'],
        counters: [
          {
            id: 'cnt-b-2',
            number: 'Counter 2',
            roomNumber: 'Room 005',
            name: 'Student Certificate & Attestation Desk',
            officerTitle: 'Block Education Officer (BEO)',
            serviceIds: ['srv-student-certificate'],
          },
        ],
      },
      {
        id: 'fl-b-1',
        buildingId: 'bldg-b',
        level: 1,
        name: 'First Floor',
        rooms: ['Room 112 (Scholarship Cell)'],
        counters: [
          {
            id: 'cnt-b-3',
            number: 'Counter 3',
            roomNumber: 'Room 112',
            name: 'Scholarship Verification & Signature Counter',
            officerTitle: 'District Scholarship Nodal Officer',
            serviceIds: ['srv-scholarship-verification'],
          },
        ],
      },
    ],
  },
  {
    id: 'bldg-c',
    code: 'Building C',
    name: 'Building C — Municipal & Vital Records Center',
    shortName: 'Municipal Dept',
    departmentIds: ['dept-municipal'],
    departmentNames: ['Municipal Department'],
    description:
      'Processes Birth & Death Certificates, Municipal Property Tax Assessment, Khata Records, and Civic Ward Services.',
    svgRect: { x: 70, y: 260, width: 200, height: 125 },
    entranceNodeId: 'node-bldg-c-entrance',
    colorAccent: '#0D9488',
    floors: [
      {
        id: 'fl-c-0',
        buildingId: 'bldg-c',
        level: 0,
        name: 'Ground Floor',
        rooms: ['Room 002 (Vital Statistics)'],
        counters: [
          {
            id: 'cnt-c-2',
            number: 'Counter 2',
            roomNumber: 'Room 002',
            name: 'Birth & Death Registration Counter',
            officerTitle: 'Chief Registrar of Births & Deaths',
            serviceIds: ['srv-birth-certificate'],
          },
        ],
      },
      {
        id: 'fl-c-1',
        buildingId: 'bldg-c',
        level: 1,
        name: 'First Floor',
        rooms: ['Room 104 (Property Tax & Assessment)'],
        counters: [
          {
            id: 'cnt-c-8',
            number: 'Counter 8',
            roomNumber: 'Room 104',
            name: 'Municipal Property Tax & Khata Counter',
            officerTitle: 'Assistant Revenue Officer (Municipal)',
            serviceIds: ['srv-property-tax'],
          },
        ],
      },
    ],
  },
  {
    id: 'bldg-d',
    code: 'Building D',
    name: 'Building D — Social Welfare & Pension Bhavan',
    shortName: 'Social Welfare',
    departmentIds: ['dept-pensions'],
    departmentNames: ['Social Welfare Department'],
    description:
      'Dedicated ground-floor accessible counters for Senior Citizen Pensions, Superannuation PPO Claims, and Social Security Schemes.',
    svgRect: { x: 530, y: 260, width: 200, height: 125 },
    entranceNodeId: 'node-bldg-d-entrance',
    colorAccent: '#4F46E5',
    floors: [
      {
        id: 'fl-d-0',
        buildingId: 'bldg-d',
        level: 0,
        name: 'Ground Floor',
        rooms: ['Room 003 (Pension Sanction Cell)'],
        counters: [
          {
            id: 'cnt-d-1',
            number: 'Counter 1',
            roomNumber: 'Room 003',
            name: 'Pension Application & Life Certificate Counter',
            officerTitle: 'Assistant Director of Social Welfare',
            serviceIds: ['srv-pension-application'],
          },
        ],
      },
    ],
  },
  {
    id: 'bldg-e',
    code: 'Building E',
    name: 'Building E — Licensing & Commercial Registry Block',
    shortName: 'Licensing Dept',
    departmentIds: ['dept-licensing', 'dept-property'],
    departmentNames: ['Licensing Department'],
    description:
      'Administers Municipal Trade Licenses, Shop & Establishment Registrations, Driving/Transport Endorsements, and Deed Registrations.',
    svgRect: { x: 300, y: 55, width: 200, height: 110 },
    entranceNodeId: 'node-bldg-e-entrance',
    colorAccent: '#D97706',
    floors: [
      {
        id: 'fl-e-0',
        buildingId: 'bldg-e',
        level: 0,
        name: 'Ground Floor',
        rooms: ['Room 001 (Transport & Licensing)'],
        counters: [
          {
            id: 'cnt-e-3',
            number: 'Counter 3',
            roomNumber: 'Room 001',
            name: 'Driving & Regional Licensing Counter',
            officerTitle: 'Licensing Inspector',
            serviceIds: ['srv-driving-license'],
          },
        ],
      },
      {
        id: 'fl-e-1',
        buildingId: 'bldg-e',
        level: 1,
        name: 'First Floor',
        rooms: ['Room 109 (Trade License)', 'Room 110 (Sub-Registrar)'],
        counters: [
          {
            id: 'cnt-e-9',
            number: 'Counter 9',
            roomNumber: 'Room 109',
            name: 'Commercial Trade License Counter',
            officerTitle: 'Senior Licensing Officer',
            serviceIds: ['srv-trade-license', 'srv-sale-deed-registration'],
          },
        ],
      },
    ],
  },
];

export const NAVIGATION_POINTS: NavigationPoint[] = [
  // Campus Entrances & Gates
  {
    id: 'node-main-gate',
    label: 'Main Gate (South Campus Entrance)',
    shortLabel: 'Main Gate',
    type: 'gate',
    x: 400,
    y: 475,
  },
  {
    id: 'node-west-gate',
    label: 'West Pedestrian Gate (Bus Stand Side)',
    shortLabel: 'West Gate',
    type: 'gate',
    x: 45,
    y: 230,
  },
  {
    id: 'node-east-gate',
    label: 'East Metro & Parking Gate',
    shortLabel: 'East Gate',
    type: 'gate',
    x: 755,
    y: 230,
  },

  // Outdoor Walkway Junctions
  {
    id: 'node-south-plaza',
    label: 'Citizen Helpdesk & South Courtyard',
    shortLabel: 'Helpdesk Plaza',
    type: 'junction',
    x: 400,
    y: 385,
  },
  {
    id: 'node-central-hub',
    label: 'Central Civic Plaza Crosswalk',
    shortLabel: 'Central Plaza',
    type: 'junction',
    x: 400,
    y: 230,
  },
  {
    id: 'node-west-walkway',
    label: 'West Campus Walkway (Between Bldg A & C)',
    shortLabel: 'West Walkway',
    type: 'junction',
    x: 170,
    y: 230,
  },
  {
    id: 'node-east-walkway',
    label: 'East Campus Walkway (Between Bldg B & D)',
    shortLabel: 'East Walkway',
    type: 'junction',
    x: 630,
    y: 230,
  },

  // Building Entrances
  {
    id: 'node-bldg-a-entrance',
    label: 'Building A Main Entrance (Revenue Department)',
    shortLabel: 'Enter Building A',
    type: 'building_entrance',
    buildingId: 'bldg-a',
    floorLevel: 0,
    x: 170,
    y: 195,
  },
  {
    id: 'node-bldg-b-entrance',
    label: 'Building B Main Entrance (Education Department)',
    shortLabel: 'Enter Building B',
    type: 'building_entrance',
    buildingId: 'bldg-b',
    floorLevel: 0,
    x: 630,
    y: 195,
  },
  {
    id: 'node-bldg-c-entrance',
    label: 'Building C Main Entrance (Municipal Department)',
    shortLabel: 'Enter Building C',
    type: 'building_entrance',
    buildingId: 'bldg-c',
    floorLevel: 0,
    x: 170,
    y: 260,
  },
  {
    id: 'node-bldg-d-entrance',
    label: 'Building D Main Entrance (Social Welfare Department)',
    shortLabel: 'Enter Building D',
    type: 'building_entrance',
    buildingId: 'bldg-d',
    floorLevel: 0,
    x: 630,
    y: 260,
  },
  {
    id: 'node-bldg-e-entrance',
    label: 'Building E Main Entrance (Licensing Department)',
    shortLabel: 'Enter Building E',
    type: 'building_entrance',
    buildingId: 'bldg-e',
    floorLevel: 0,
    x: 400,
    y: 165,
  },

  // Indoor Floor Nodes & Office Rooms — Building A (Revenue)
  {
    id: 'node-bldg-a-f1',
    label: 'Building A — First Floor Landing',
    shortLabel: 'Bldg A · Floor 1',
    type: 'floor_node',
    buildingId: 'bldg-a',
    floorLevel: 1,
    x: 170,
    y: 150,
  },
  {
    id: 'node-bldg-a-r105',
    label: 'Building A, First Floor, Room 105 — Counter 4 (Income Certificate)',
    shortLabel: 'Room 105 · Counter 4',
    type: 'office_room',
    buildingId: 'bldg-a',
    floorLevel: 1,
    roomNumber: 'Room 105',
    counterName: 'Counter 4',
    x: 120,
    y: 115,
  },
  {
    id: 'node-bldg-a-r106',
    label: 'Building A, First Floor, Room 106 — Counter 5 (Caste Certificate)',
    shortLabel: 'Room 106 · Counter 5',
    type: 'office_room',
    buildingId: 'bldg-a',
    floorLevel: 1,
    roomNumber: 'Room 106',
    counterName: 'Counter 5',
    x: 170,
    y: 105,
  },
  {
    id: 'node-bldg-a-r108',
    label: 'Building A, First Floor, Room 108 — Counter 6 (Residence Certificate)',
    shortLabel: 'Room 108 · Counter 6',
    type: 'office_room',
    buildingId: 'bldg-a',
    floorLevel: 1,
    roomNumber: 'Room 108',
    counterName: 'Counter 6',
    x: 225,
    y: 115,
  },
  {
    id: 'node-bldg-a-r007',
    label: 'Building A, Ground Floor, Room 007 — Counter 7 (Domicile Certificate)',
    shortLabel: 'Room 007 · Counter 7',
    type: 'office_room',
    buildingId: 'bldg-a',
    floorLevel: 0,
    roomNumber: 'Room 007',
    counterName: 'Counter 7',
    x: 220,
    y: 160,
  },
  {
    id: 'node-bldg-a-r204',
    label: 'Building A, Second Floor, Room 204 — Counter 4 (DDO Signature)',
    shortLabel: 'Room 204 · Counter 4',
    type: 'office_room',
    buildingId: 'bldg-a',
    floorLevel: 2,
    roomNumber: 'Room 204',
    counterName: 'Counter 4',
    x: 135,
    y: 95,
  },

  // Indoor Nodes — Building B (Education)
  {
    id: 'node-bldg-b-f1',
    label: 'Building B — First Floor Landing',
    shortLabel: 'Bldg B · Floor 1',
    type: 'floor_node',
    buildingId: 'bldg-b',
    floorLevel: 1,
    x: 630,
    y: 150,
  },
  {
    id: 'node-bldg-b-r112',
    label: 'Building B, First Floor, Room 112 — Counter 3 (Scholarship Verification)',
    shortLabel: 'Room 112 · Counter 3',
    type: 'office_room',
    buildingId: 'bldg-b',
    floorLevel: 1,
    roomNumber: 'Room 112',
    counterName: 'Counter 3',
    x: 600,
    y: 110,
  },
  {
    id: 'node-bldg-b-r005',
    label: 'Building B, Ground Floor, Room 005 — Counter 2 (Student Certificate)',
    shortLabel: 'Room 005 · Counter 2',
    type: 'office_room',
    buildingId: 'bldg-b',
    floorLevel: 0,
    roomNumber: 'Room 005',
    counterName: 'Counter 2',
    x: 665,
    y: 155,
  },

  // Indoor Nodes — Building C (Municipal)
  {
    id: 'node-bldg-c-r002',
    label: 'Building C, Ground Floor, Room 002 — Counter 2 (Birth Certificate)',
    shortLabel: 'Room 002 · Counter 2',
    type: 'office_room',
    buildingId: 'bldg-c',
    floorLevel: 0,
    roomNumber: 'Room 002',
    counterName: 'Counter 2',
    x: 130,
    y: 325,
  },
  {
    id: 'node-bldg-c-r104',
    label: 'Building C, First Floor, Room 104 — Counter 8 (Property Tax Service)',
    shortLabel: 'Room 104 · Counter 8',
    type: 'office_room',
    buildingId: 'bldg-c',
    floorLevel: 1,
    roomNumber: 'Room 104',
    counterName: 'Counter 8',
    x: 215,
    y: 335,
  },

  // Indoor Nodes — Building D (Social Welfare & Pensions)
  {
    id: 'node-bldg-d-r003',
    label: 'Building D, Ground Floor, Room 003 — Counter 1 (Pension Application)',
    shortLabel: 'Room 003 · Counter 1',
    type: 'office_room',
    buildingId: 'bldg-d',
    floorLevel: 0,
    roomNumber: 'Room 003',
    counterName: 'Counter 1',
    x: 630,
    y: 330,
  },

  // Indoor Nodes — Building E (Licensing)
  {
    id: 'node-bldg-e-r001',
    label: 'Building E, Ground Floor, Room 001 — Counter 3 (Driving License)',
    shortLabel: 'Room 001 · Counter 3',
    type: 'office_room',
    buildingId: 'bldg-e',
    floorLevel: 0,
    roomNumber: 'Room 001',
    counterName: 'Counter 3',
    x: 360,
    y: 115,
  },
  {
    id: 'node-bldg-e-r109',
    label: 'Building E, First Floor, Room 109 — Counter 9 (Trade License)',
    shortLabel: 'Room 109 · Counter 9',
    type: 'office_room',
    buildingId: 'bldg-e',
    floorLevel: 1,
    roomNumber: 'Room 109',
    counterName: 'Counter 9',
    x: 440,
    y: 100,
  },
];

export const NAVIGATION_EDGES: NavigationEdge[] = [
  // Outdoor Campus Paths
  {
    from: 'node-main-gate',
    to: 'node-south-plaza',
    distanceMeters: 30,
    instructionForward: 'Walk straight 30m from Main Gate to the Citizen Helpdesk Courtyard',
    instructionReverse: 'Walk straight 30m south to Main Gate',
  },
  {
    from: 'node-south-plaza',
    to: 'node-central-hub',
    distanceMeters: 50,
    instructionForward: 'Walk straight 50m north along Central Civic Avenue to the Central Plaza',
    instructionReverse: 'Walk straight 50m south to the Citizen Helpdesk Courtyard',
  },
  {
    from: 'node-central-hub',
    to: 'node-west-walkway',
    distanceMeters: 45,
    instructionForward: 'Turn left (west) and walk 45m along the West Campus Walkway',
    instructionReverse: 'Walk 45m east to the Central Civic Plaza',
  },
  {
    from: 'node-central-hub',
    to: 'node-east-walkway',
    distanceMeters: 45,
    instructionForward: 'Turn right (east) and walk 45m along the East Campus Walkway',
    instructionReverse: 'Walk 45m west to the Central Civic Plaza',
  },
  {
    from: 'node-west-gate',
    to: 'node-west-walkway',
    distanceMeters: 25,
    instructionForward: 'Walk straight 25m east from West Gate into the West Campus Walkway',
    instructionReverse: 'Walk 25m west to exit at West Gate',
  },
  {
    from: 'node-east-gate',
    to: 'node-east-walkway',
    distanceMeters: 25,
    instructionForward: 'Walk straight 25m west from East Gate into the East Campus Walkway',
    instructionReverse: 'Walk 25m east to exit at East Gate',
  },

  // Walkway to Building Entrances
  {
    from: 'node-west-walkway',
    to: 'node-bldg-a-entrance',
    distanceMeters: 15,
    instructionForward: 'Turn right to enter Building A (Revenue Department)',
    instructionReverse: 'Exit Building A onto the West Campus Walkway',
  },
  {
    from: 'node-west-walkway',
    to: 'node-bldg-c-entrance',
    distanceMeters: 15,
    instructionForward: 'Turn left to enter Building C (Municipal Department)',
    instructionReverse: 'Exit Building C onto the West Campus Walkway',
  },
  {
    from: 'node-east-walkway',
    to: 'node-bldg-b-entrance',
    distanceMeters: 15,
    instructionForward: 'Turn left to enter Building B (Education Department)',
    instructionReverse: 'Exit Building B onto the East Campus Walkway',
  },
  {
    from: 'node-east-walkway',
    to: 'node-bldg-d-entrance',
    distanceMeters: 15,
    instructionForward: 'Turn right to enter Building D (Social Welfare Department)',
    instructionReverse: 'Exit Building D onto the East Campus Walkway',
  },
  {
    from: 'node-central-hub',
    to: 'node-bldg-e-entrance',
    distanceMeters: 20,
    instructionForward: 'Walk straight 20m north to enter Building E (Licensing Department)',
    instructionReverse: 'Exit Building E to the Central Civic Plaza',
  },

  // Indoor Edges — Building A
  {
    from: 'node-bldg-a-entrance',
    to: 'node-bldg-a-r007',
    distanceMeters: 12,
    instructionForward: 'Turn right on Ground Floor corridor to Room 007 · Counter 7',
    instructionReverse: 'Return along Ground Floor corridor to Building A Entrance',
    isIndoor: true,
  },
  {
    from: 'node-bldg-a-entrance',
    to: 'node-bldg-a-f1',
    distanceMeters: 15,
    instructionForward: 'Go to First Floor via Main Staircase / Elevator',
    instructionReverse: 'Go down to Building A Ground Floor Entrance',
    isIndoor: true,
  },
  {
    from: 'node-bldg-a-f1',
    to: 'node-bldg-a-r105',
    distanceMeters: 10,
    instructionForward: 'Turn left into West Hallway → Room 105 · Counter 4 (Citizen Services Office)',
    instructionReverse: 'Exit Room 105 to First Floor Landing',
    isIndoor: true,
  },
  {
    from: 'node-bldg-a-f1',
    to: 'node-bldg-a-r106',
    distanceMeters: 8,
    instructionForward: 'Walk straight ahead to Room 106 · Counter 5 (Caste Certificate Desk)',
    instructionReverse: 'Exit Room 106 to First Floor Landing',
    isIndoor: true,
  },
  {
    from: 'node-bldg-a-f1',
    to: 'node-bldg-a-r108',
    distanceMeters: 12,
    instructionForward: 'Turn right into East Hallway → Room 108 · Counter 6 (Residence Certificate)',
    instructionReverse: 'Exit Room 108 to First Floor Landing',
    isIndoor: true,
  },
  {
    from: 'node-bldg-a-f1',
    to: 'node-bldg-a-r204',
    distanceMeters: 18,
    instructionForward: 'Continue up to Second Floor → Turn left to Room 204 · Counter 4 (DDO Signature)',
    instructionReverse: 'Go down to First Floor Landing',
    isIndoor: true,
  },

  // Indoor Edges — Building B
  {
    from: 'node-bldg-b-entrance',
    to: 'node-bldg-b-r005',
    distanceMeters: 10,
    instructionForward: 'Turn right on Ground Floor to Room 005 · Counter 2 (Student Certificate Desk)',
    instructionReverse: 'Return to Building B Entrance',
    isIndoor: true,
  },
  {
    from: 'node-bldg-b-entrance',
    to: 'node-bldg-b-f1',
    distanceMeters: 14,
    instructionForward: 'Go to First Floor via Education Wing Stairs / Lift',
    instructionReverse: 'Go down to Building B Ground Floor Entrance',
    isIndoor: true,
  },
  {
    from: 'node-bldg-b-f1',
    to: 'node-bldg-b-r112',
    distanceMeters: 10,
    instructionForward: 'Turn left to Room 112 · Counter 3 (Scholarship Verification Cell)',
    instructionReverse: 'Return to First Floor Landing',
    isIndoor: true,
  },

  // Indoor Edges — Building C
  {
    from: 'node-bldg-c-entrance',
    to: 'node-bldg-c-r002',
    distanceMeters: 12,
    instructionForward: 'Walk straight on Ground Floor to Room 002 · Counter 2 (Birth & Death Records)',
    instructionReverse: 'Return to Building C Entrance',
    isIndoor: true,
  },
  {
    from: 'node-bldg-c-entrance',
    to: 'node-bldg-c-r104',
    distanceMeters: 20,
    instructionForward: 'Go to First Floor → Turn right to Room 104 · Counter 8 (Property Tax Service)',
    instructionReverse: 'Go down to Building C Entrance',
    isIndoor: true,
  },

  // Indoor Edges — Building D
  {
    from: 'node-bldg-d-entrance',
    to: 'node-bldg-d-r003',
    distanceMeters: 10,
    instructionForward: 'Walk straight via accessible ramp to Room 003 · Counter 1 (Pension Cell)',
    instructionReverse: 'Return to Building D Entrance',
    isIndoor: true,
  },

  // Indoor Edges — Building E
  {
    from: 'node-bldg-e-entrance',
    to: 'node-bldg-e-r001',
    distanceMeters: 10,
    instructionForward: 'Turn left on Ground Floor to Room 001 · Counter 3 (Licensing Counter)',
    instructionReverse: 'Return to Building E Entrance',
    isIndoor: true,
  },
  {
    from: 'node-bldg-e-entrance',
    to: 'node-bldg-e-r109',
    distanceMeters: 18,
    instructionForward: 'Go to First Floor → Turn right to Room 109 · Counter 9 (Trade License & Registry)',
    instructionReverse: 'Go down to Building E Entrance',
    isIndoor: true,
  },
];

// Map each service ID or office ID to its exact destination NavigationPoint
export function resolveDestinationNodeId(serviceOrOfficeId?: string, buildingText?: string): string {
  const id = (serviceOrOfficeId || '').toLowerCase();
  const bldg = (buildingText || '').toLowerCase();

  if (id.includes('income')) return 'node-bldg-a-r105';
  if (id.includes('caste')) return 'node-bldg-a-r106';
  if (id.includes('residence') || id.includes('address')) return 'node-bldg-a-r108';
  if (id.includes('domicile')) return 'node-bldg-a-r007';
  if (id.includes('ddo') || id.includes('treasury')) return 'node-bldg-a-r204';
  if (id.includes('scholarship')) return 'node-bldg-b-r112';
  if (id.includes('student') || id.includes('bonafide')) return 'node-bldg-b-r005';
  if (id.includes('birth') || id.includes('death') || id.includes('marriage') || id.includes('vital')) {
    return 'node-bldg-c-r002';
  }
  if (id.includes('property-tax') || id.includes('khata') || id.includes('mutation')) {
    return 'node-bldg-c-r104';
  }
  if (id.includes('pension') || id.includes('life-certificate') || id.includes('senior')) {
    return 'node-bldg-d-r003';
  }
  if (id.includes('driving') || id.includes('transport')) return 'node-bldg-e-r001';
  if (id.includes('trade') || id.includes('deed') || id.includes('registrar') || id.includes('building')) {
    return 'node-bldg-e-r109';
  }

  if (bldg.includes('building b') || bldg.includes('education')) return 'node-bldg-b-r112';
  if (bldg.includes('building c') || bldg.includes('municipal')) return 'node-bldg-c-r002';
  if (bldg.includes('building d') || bldg.includes('welfare') || bldg.includes('pension')) {
    return 'node-bldg-d-r003';
  }
  if (bldg.includes('building e') || bldg.includes('licens')) return 'node-bldg-e-r109';

  // Default to Building A, First Floor, Room 105 (Income Certificate / Citizen Services Office)
  return 'node-bldg-a-r105';
}

/**
 * Dijkstra's Shortest-Path Algorithm over the Government Campus Graph
 * Computes the minimum-distance walking route from any start node (e.g. Main Gate)
 * to any destination office room/counter node.
 */
export function findShortestPathDijkstra(
  startNodeId: string,
  destinationNodeId: string
): ShortestPathResult | null {
  const nodeMap = new Map<string, NavigationPoint>();
  for (const pt of NAVIGATION_POINTS) {
    nodeMap.set(pt.id, pt);
  }

  const startNode = nodeMap.get(startNodeId) || nodeMap.get('node-main-gate')!;
  const destNode = nodeMap.get(destinationNodeId) || nodeMap.get('node-bldg-a-r105')!;

  const distances = new Map<string, number>();
  const previous = new Map<
    string,
    { prevNodeId: string; instruction: string; distance: number; isIndoor: boolean } | null
  >();
  const unvisited = new Set<string>();

  for (const pt of NAVIGATION_POINTS) {
    distances.set(pt.id, Infinity);
    previous.set(pt.id, null);
    unvisited.add(pt.id);
  }
  distances.set(startNode.id, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let smallestDist = Infinity;

    for (const nodeId of unvisited) {
      const d = distances.get(nodeId) ?? Infinity;
      if (d < smallestDist) {
        smallestDist = d;
        currentId = nodeId;
      }
    }

    if (currentId === null || smallestDist === Infinity) break;
    if (currentId === destNode.id) break;

    unvisited.delete(currentId);

    // Inspect all undirected neighbors of currentId
    for (const edge of NAVIGATION_EDGES) {
      let neighborId: string | null = null;
      let instruction = '';

      if (edge.from === currentId) {
        neighborId = edge.to;
        instruction = edge.instructionForward;
      } else if (edge.to === currentId) {
        neighborId = edge.from;
        instruction = edge.instructionReverse;
      }

      if (neighborId && unvisited.has(neighborId)) {
        const alt = smallestDist + edge.distanceMeters;
        if (alt < (distances.get(neighborId) ?? Infinity)) {
          distances.set(neighborId, alt);
          previous.set(neighborId, {
            prevNodeId: currentId,
            instruction,
            distance: edge.distanceMeters,
            isIndoor: Boolean(edge.isIndoor),
          });
        }
      }
    }
  }

  const pathNodes: NavigationPoint[] = [];
  const rawSteps: Array<{
    fromNode: NavigationPoint;
    toNode: NavigationPoint;
    distanceMeters: number;
    instruction: string;
    isIndoor: boolean;
  }> = [];

  let curr: string | undefined = destNode.id;
  while (curr) {
    const pt = nodeMap.get(curr);
    if (pt) pathNodes.unshift(pt);
    const prevInfo = previous.get(curr);
    if (prevInfo) {
      const fromPt = nodeMap.get(prevInfo.prevNodeId);
      const toPt = nodeMap.get(curr);
      if (fromPt && toPt) {
        rawSteps.unshift({
          fromNode: fromPt,
          toNode: toPt,
          distanceMeters: prevInfo.distance,
          instruction: prevInfo.instruction,
          isIndoor: prevInfo.isIndoor,
        });
      }
      curr = prevInfo.prevNodeId;
    } else {
      break;
    }
  }

  const totalDistanceMeters = distances.get(destNode.id) ?? 0;
  const steps: NavigationInstructionStep[] = rawSteps.map((s, idx) => ({
    stepNumber: idx + 1,
    ...s,
  }));

  return {
    startNode,
    destinationNode: destNode,
    pathNodes,
    steps,
    totalDistanceMeters: Number.isFinite(totalDistanceMeters) ? totalDistanceMeters : 120,
    estimatedWalkMinutes: Math.max(1, Math.round((totalDistanceMeters || 120) / 65)),
  };
}
