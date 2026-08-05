import React from 'react';
import ReportCard from './ReportCard';

export default function ReportList({
  reports,
  onOpenReport,
  onDeleteReport,
  selectedForCompare,
  onToggleCompare,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {reports.map((report) => (
        <ReportCard
          key={report.incident_id}
          report={report}
          onOpen={onOpenReport}
          onDelete={onDeleteReport}
          isSelectedForCompare={selectedForCompare.includes(report.incident_id)}
          onToggleCompare={onToggleCompare}
        />
      ))}
    </div>
  );
}
