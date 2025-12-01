import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

export default function App() {
  // ---------- Auth state ----------
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // {_id,name,email,role}
  const [authMsg, setAuthMsg] = useState("");

  // ---------- Booking state ----------
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingMsg, setBookingMsg] = useState("");

  // ---------- My bookings / Admin ----------
  const [myAppointments, setMyAppointments] = useState([]);
  const [adminDate, setAdminDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [adminAppointments, setAdminAppointments] = useState([]);

  // ---------- Helpers ----------
  const setToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Load token + user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error("Failed to parse saved user", e);
        setToken(null);
      }
    }
  }, []);

  // Load providers on first load
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await api.get("/api/providers");
        const list = res.data || [];
        setProviders(list);
        if (list.length > 0) {
          setSelectedProvider(list[0]._id);
          if (list[0].serviceTypes?.length) {
            setSelectedService(list[0].serviceTypes[0].name);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadProviders();
  }, []);

  const currentProvider = providers.find((p) => p._id === selectedProvider);

  // ---------- Auth handlers ----------
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMsg("");

    try {
      if (authMode === "register") {
        const res = await api.post("/api/auth/register", {
          name,
          email,
          password,
          role: "user",
        });
        setAuthMsg("Registered successfully, you can login now.");
        setAuthMode("login");
      } else {
        const res = await api.post("/api/auth/login", {
          email,
          password,
        });
        const loggedInUser = res.data;
        setUser(loggedInUser);
        setToken(loggedInUser.token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setAuthMsg(`Welcome, ${loggedInUser.name}!`);
      }
    } catch (err) {
      console.error(err);
      setAuthMsg(
        err.response?.data?.message || "Auth failed, please check details."
      );
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    setMyAppointments([]);
    setAdminAppointments([]);
    setAuthMsg("Logged out.");
  };

  // ---------- Availability ----------
  const loadAvailability = async () => {
    if (!selectedProvider || !selectedDate || !selectedService) return;
    setBookingMsg("");
    setAvailableSlots([]);

    try {
      const res = await api.get("/api/appointments/availability", {
        params: {
          providerId: selectedProvider,
          date: selectedDate,
          serviceType: selectedService,
        },
      });
      setAvailableSlots(res.data?.availableSlots || []);
      if ((res.data?.availableSlots || []).length === 0) {
        setBookingMsg("No free slots for this date.");
      }
    } catch (err) {
      console.error(err);
      setBookingMsg("Failed to load availability.");
    }
  };

  // ---------- Booking ----------
  const handleBook = async (time) => {
    if (!user) {
      setBookingMsg("Please login first to book.");
      return;
    }
    try {
      const res = await api.post("/api/appointments/book", {
        providerId: selectedProvider,
        date: selectedDate,
        time,
        serviceType: selectedService,
      });
      setBookingMsg("Booking confirmed!");
      loadAvailability();
      loadMyAppointments();
      if (user.role === "admin") loadAdminAppointments();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setBookingMsg("Slot already booked, refresh availability.");
        loadAvailability();
      } else {
        setBookingMsg("Booking failed.");
      }
    }
  };

  // ---------- My Appointments ----------
  const loadMyAppointments = async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/appointments/my");
      setMyAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) loadMyAppointments();
  }, [user]);

  // ---------- Admin ----------
  const loadAdminAppointments = async () => {
    if (!user || user.role !== "admin") return;
    try {
      const res = await api.get("/api/appointments/admin/list", {
        params: {
          providerId: selectedProvider,
          date: adminDate,
        },
      });
      setAdminAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id, isAdminList = false) => {
    try {
      await api.patch(`/api/appointments/cancel/${id}`);
      if (isAdminList) loadAdminAppointments();
      else loadMyAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- UI ----------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#f5f5f5",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
              BookWise – Appointment Scheduler
            </h1>
            <p style={{ opacity: 0.8, fontSize: "0.95rem" }}>
              Multi-provider booking with JWT auth & admin panel.
            </p>
          </div>

          {/* Auth Box */}
          <div
            style={{
              background: "#151515",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              minWidth: "230px",
            }}
          >
            {!user ? (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <button
                    onClick={() => setAuthMode("login")}
                    style={{
                      flex: 1,
                      padding: "0.3rem 0.5rem",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        authMode === "login" ? "#4ECDC4" : "transparent",
                      color: authMode === "login" ? "#003135" : "#f5f5f5",
                      fontWeight: 600,
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode("register")}
                    style={{
                      flex: 1,
                      padding: "0.3rem 0.5rem",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        authMode === "register" ? "#4ECDC4" : "transparent",
                      color: authMode === "register" ? "#003135" : "#f5f5f5",
                      fontWeight: 600,
                    }}
                  >
                    Sign up
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit}>
                  {authMode === "register" && (
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        marginBottom: "0.4rem",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #333",
                        background: "#111",
                        color: "#f5f5f5",
                        fontSize: "0.85rem",
                      }}
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      marginBottom: "0.4rem",
                      padding: "0.35rem 0.6rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #333",
                      background: "#111",
                      color: "#f5f5f5",
                      fontSize: "0.85rem",
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      marginBottom: "0.4rem",
                      padding: "0.35rem 0.6rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #333",
                      background: "#111",
                      color: "#f5f5f5",
                      fontSize: "0.85rem",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.65rem",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background: "#4ECDC4",
                      color: "#003135",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {authMode === "login" ? "Login" : "Register"}
                  </button>
                </form>
                {authMsg && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      marginTop: "0.4rem",
                      opacity: 0.9,
                    }}
                  >
                    {authMsg}
                  </p>
                )}
              </>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  Logged in as{" "}
                  <span style={{ fontWeight: 600 }}>{user.name}</span>{" "}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.1rem 0.5rem",
                      borderRadius: "999px",
                      background: "#333",
                      marginLeft: "0.3rem",
                    }}
                  >
                    {user.role}
                  </span>
                </p>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    background: "#ff6b6b",
                    color: "#0b0b0b",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Logout
                </button>
                {authMsg && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      marginTop: "0.3rem",
                      opacity: 0.9,
                    }}
                  >
                    {authMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Booking card */}
        <section
          style={{
            background: "#111",
            borderRadius: "1.2rem",
            padding: "1.5rem",
            boxShadow: "0 18px 45px rgba(0,0,0,0.5)",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Book an Appointment
          </h2>

          {providers.length === 0 ? (
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>
              No providers found. (Make sure backend seed route ran.)
            </p>
          ) : (
            <>
              {/* Provider */}
              <div style={{ marginBottom: "0.9rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.2rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #333",
                    background: "#151515",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                >
                  {providers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service type */}
              <div style={{ marginBottom: "0.9rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.2rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Service Type
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #333",
                    background: "#151515",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                >
                  {(currentProvider?.serviceTypes || []).map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ marginBottom: "0.9rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.2rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #333",
                    background: "#151515",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <button
                onClick={loadAvailability}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.7rem",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: "#4ECDC4",
                  color: "#003135",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginTop: "0.3rem",
                }}
              >
                Check Availability
              </button>

              {/* Slots */}
              <div style={{ marginTop: "1rem" }}>
                {availableSlots.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleBook(slot)}
                        style={{
                          padding: "0.35rem 0.7rem",
                          borderRadius: "999px",
                          border: "none",
                          cursor: "pointer",
                          background: "#2ecc71",
                          color: "#0b0b0b",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                {bookingMsg && (
                  <p style={{ marginTop: "0.6rem", fontSize: "0.85rem" }}>
                    {bookingMsg}
                  </p>
                )}
              </div>
            </>
          )}
        </section>

        {/* My bookings */}
        {user && (
          <section style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.7rem" }}>
              My Appointments
            </h2>
            {myAppointments.length === 0 ? (
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                No bookings yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {myAppointments.map((a, idx) => (
                  <div
                    key={a._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "0.75rem",
                      background: "#151515",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {idx + 1}. {a.provider?.name}
                      </div>
                      <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                        {a.date} – {a.time} ({a.serviceType})
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          marginTop: "0.1rem",
                          color:
                            a.status === "CANCELLED"
                              ? "#ff6b6b"
                              : "#2ecc71",
                        }}
                      >
                        {a.status}
                      </div>
                    </div>
                    {a.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(a._id, false)}
                        style={{
                          padding: "0.25rem 0.7rem",
                          borderRadius: "999px",
                          border: "none",
                          cursor: "pointer",
                          background: "#ff6b6b",
                          color: "#0b0b0b",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Admin panel */}
        {user?.role === "admin" && (
          <section style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.7rem" }}>
              Admin – All Appointments
            </h2>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "0.6rem",
              }}
            >
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #333",
                  background: "#151515",
                  color: "#f5f5f5",
                  fontSize: "0.85rem",
                }}
              >
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={adminDate}
                onChange={(e) => setAdminDate(e.target.value)}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #333",
                  background: "#151515",
                  color: "#f5f5f5",
                  fontSize: "0.85rem",
                }}
              />

              <button
                onClick={loadAdminAppointments}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: "#4ECDC4",
                  color: "#003135",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                Load
              </button>
            </div>

            {adminAppointments.length === 0 ? (
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                No appointments for this date/provider.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {adminAppointments.map((a, idx) => (
                  <div
                    key={a._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "0.75rem",
                      background: "#151515",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {idx + 1}. {a.user?.name} ({a.user?.email})
                      </div>
                      <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                        {a.date} – {a.time} ({a.serviceType})
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          marginTop: "0.1rem",
                          color:
                            a.status === "CANCELLED"
                              ? "#ff6b6b"
                              : "#2ecc71",
                        }}
                      >
                        {a.status}
                      </div>
                    </div>

                    {a.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(a._id, true)}
                        style={{
                          padding: "0.25rem 0.7rem",
                          borderRadius: "999px",
                          border: "none",
                          cursor: "pointer",
                          background: "#ff6b6b",
                          color: "#0b0b0b",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
