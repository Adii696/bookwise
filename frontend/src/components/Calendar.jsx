import React from "react";

export default function Calendar({ selectedDate, setSelectedDate }) {
  return (
    <div className="mb-4">
      <label className="font-semibold">Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full p-2 mt-1 rounded-xl"
      />
    </div>
  );
}
