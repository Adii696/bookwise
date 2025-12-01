import React from "react";

export default function ProviderSelector({ providers, selectedProvider, setSelectedProvider }) {
  return (
    <div className="mb-4">
      <label className="font-semibold">Service Provider</label>
      <select
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        className="w-full p-2 mt-1 rounded-xl"
      >
        {providers.map((p) => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}
