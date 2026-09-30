import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Office } from '../types/civic';
import { CampusSvgMap } from './CampusSvgMap';

interface OfficeMapProps {
  office: Office | undefined;
  serviceName: string;
}

export const OfficeMap: React.FC<OfficeMapProps> = ({ office, serviceName }) => {
  if (!office || !office.building) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-sm text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Office location has not been configured.</p>
          <p className="text-xs text-amber-800">
            This service does not have a mapped building or counter in the local
            demo database yet. An administrator can configure it in the Admin
            Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CampusSvgMap
      serviceOrOfficeId={`${serviceName} ${office.id}`}
      officeName={office.name}
      departmentName={serviceName}
      buildingName={office.building}
      floorName={office.floor}
      counterName={office.counter}
      roomName={office.desk}
      address={office.address}
      showBuildingInspector={true}
    />
  );
};
