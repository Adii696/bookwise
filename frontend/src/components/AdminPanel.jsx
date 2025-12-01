import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filterProvider, setFilterProvider] = useState("");
  const [filterDate, setFilterDate] = useState(dayjs().format("YYYY-MM-DD"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const res = await axios.get("/api/providers");
    setProviders(res.data || []);
    if (res.data && res.data.length) setFilterProvider(res.data[0]._id);
  };

  const loadAppointments = async () => {
    const res = await axios.get("/api/appointments/admin/list", {
      params: { provider: filterProvider, date: filterDate },
      headers: { Authorization: `Bearer ${token}` }
    });
    setAppointments(res.data || []);
  };

  const cancelAppointment = async (id) => {
    await axios.patch(`/api/appointments/cancel/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadAppointments();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg mt-8">
      <h2 className="text-xl font-bold text-center mb-4">Admin Panel</h2>

      <div className="flex gap-3 justify-center flex-wrap mb-4">
        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="p-2 rounded-xl"
        >
          {providers.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="p-2 rounded-xl"
        />

        <button onClick={loadAppointments} className="bg-teal-400 text-black px-4 py-2 rounded-xl font-semibold">
          Load Bookings
        </button>
      </div>

      <div className="grid gap-2 max-w-3xl mx-auto">
        {appointments.map((a, i) => (
          <div key={a._id} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
            <div>
              <p className="font-semibold">{i+1}. {a.user?.name || "Unknown"}</p>
              <p className="text-sm">{a.date} — {a.time} ({a.serviceType})</p>
              <p className={`text-xs ${a.status==="CANCELLED"?"text-red-400":"text-green-400"} font-bold`}>
                {a.status}
              </p>
            </div>

            {a.status !== "CANCELLED" && (
              <button onClick={() => cancelAppointment(a._id)} className="bg-red-500 px-3 py-1 rounded-xl font-bold">
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
