import React from "react";

export default function ServiceTypeSelector({ serviceTypes, selectedServiceType, setSelectedServiceType }) {
  return (
    <div className="mb-4">
      <label className="font-semibold">Service Type</label>
      <select
        value={selectedServiceType}
        onChange={(e) => setSelectedServiceType(e.target.value)}
        className="w-full p-2 mt-1 rounded-xl"
      >
        {serviceTypes.map((s, i) => (
          <option key={i} value={s.name}>{s.name} ({s.durationMinutes} min)</option>
        ))}
      </select>
    </div>
  );
}
