import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MyBookings() {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/appointments/my", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAppointments(res.data || []));
  }, []);

  const cancel = async (id) => {
    await axios.patch(`/api/appointments/cancel/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const res = await axios.get("/api/appointments/my", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAppointments(res.data || []);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3 text-center">My Bookings</h2>
      <div className="grid gap-2 max-w-3xl mx-auto">
        {appointments.map((a,i) => (
          <div key={a._id} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
            <div>
              <p className="font-semibold">{i+1}. {a.provider?.name}</p>
              <p className="text-sm">{a.date} — {a.time} ({a.serviceType})</p>
              <p className={`text-xs ${a.status==="CANCELLED"?"text-red-400":"text-green-400"} font-bold`}>
                {a.status}
              </p>
            </div>
            {a.status !== "CANCELLED" && (
              <button onClick={() => cancel(a._id)} className="bg-red-500 px-3 py-1 rounded-xl font-bold">Cancel</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
