const fs = require("fs");

fs.writeFileSync("src/pages/Dashboard.js", `
import React, { useEffect, useState } from "react";
import api from "../services/api";
export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, billing: 0 });
  useEffect(() => {
    const load = async () => {
      try {
        const [p, d, a, b] = await Promise.all([api.get("/patients"), api.get("/doctors"), api.get("/appointments"), api.get("/billing")]);
        setStats({ patients: p.data.length, doctors: d.data.length, appointments: a.data.length, billing: b.data.length });
      } catch(e) { console.error(e); }
    };
    load();
  }, []);
  const cards = [
    { label: "Total Patients", value: stats.patients, color: "#6366f1" },
    { label: "Total Doctors", value: stats.doctors, color: "#0ea5e9" },
    { label: "Appointments", value: stats.appointments, color: "#10b981" },
    { label: "Billing Records", value: stats.billing, color: "#f59e0b" },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>Dashboard Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 30 }}>
        {cards.map(card => (
          <div key={card.label} style={{ background: "#1e293b", borderRadius: 12, padding: 24, borderLeft: "4px solid " + card.color }}>
            <div style={{ fontSize: 36, fontWeight: "bold", color: card.color }}>{card.value}</div>
            <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: 30, textAlign: "center" }}>
        <p style={{ color: "#475569", fontSize: 15 }}>Charts and analytics coming soon.</p>
      </div>
    </div>
  );
}
`);
console.log("Dashboard.js created");

fs.writeFileSync("src/pages/Patients.js", `
import React, { useEffect, useState } from "react";
import api from "../services/api";
const empty = { firstName:"", lastName:"", gender:"Male", dateOfBirth:"", phone:"", email:"", address:"", bloodGroup:"" };
export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const load = async () => { const r = await api.get("/patients"); setPatients(r.data); };
  useEffect(() => { load(); }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setError("Name required."); return; }
    try {
      if (editing) await api.put("/patients/" + editing, form);
      else await api.post("/patients", form);
      setShowForm(false); setForm(empty); setEditing(null); setError(""); load();
    } catch(ex) { setError("Save failed: " + (ex.response?.data || ex.message)); }
  };
  const handleEdit = (p) => {
    setForm({ firstName:p.firstName, lastName:p.lastName, gender:p.gender||"Male",
      dateOfBirth:p.dateOfBirth||"", phone:p.phone||"", email:p.email||"",
      address:p.address||"", bloodGroup:p.bloodGroup||"" });
    setEditing(p.id); setShowForm(true); setError("");
  };
  const handleDelete = async (id, name) => {
    if (window.confirm("Delete " + name + "?")) { await api.delete("/patients/" + id); load(); }
  };
  const filtered = patients.filter(p =>
    (p.firstName+" "+p.lastName+" "+p.phone+" "+p.email).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Patient Management</h2>
      {!showForm ? (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm(empty); setEditing(null); }}>+ Add Patient</button>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patients..." style={{ maxWidth:260 }} />
            <button className="btn btn-dark" onClick={load}>Refresh</button>
          </div>
          <div style={{ background:"#1e293b", borderRadius:10, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Gender</th><th>DOB</th><th>Phone</th><th>Email</th><th>Blood</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td><td>{p.firstName}</td><td>{p.lastName}</td>
                    <td>{p.gender}</td><td>{p.dateOfBirth}</td><td>{p.phone}</td>
                    <td>{p.email}</td><td>{p.bloodGroup}</td>
                    <td>
                      <button className="btn btn-sky" style={{padding:"5px 10px",fontSize:12,marginRight:6}} onClick={()=>handleEdit(p)}>Edit</button>
                      <button className="btn btn-slate" style={{padding:"5px 10px",fontSize:12}} onClick={()=>handleDelete(p.id, p.firstName+" "+p.lastName)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ background:"#1e293b", borderRadius:12, padding:30, maxWidth:800 }}>
          <h3 style={{ marginBottom:20, fontSize:18 }}>{editing ? "Edit Patient" : "Add New Patient"}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["First Name","firstName","text"],["Last Name","lastName","text"],
                ["Date of Birth","dateOfBirth","date"],["Phone","phone","text"],
                ["Email","email","email"],["Blood Group","bloodGroup","text"],
                ["Address","address","text"]].map(([label,field,type]) => (
                <div key={field}>
                  <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>{label}</label>
                  <input type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={label} />
                </div>
              ))}
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Gender</label>
                <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button type="submit" className="btn btn-primary">{editing?"Update":"Save"} Patient</button>
              <button type="button" className="btn btn-dark" onClick={()=>{setShowForm(false);setError("");}}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`);
console.log("Patients.js created");

fs.writeFileSync("src/pages/Doctors.js", `
import React, { useEffect, useState } from "react";
import api from "../services/api";
const empty = { firstName:"", lastName:"", specialization:"", phone:"", email:"", availableDays:"" };
export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const load = async () => { const r = await api.get("/doctors"); setDoctors(r.data); };
  useEffect(() => { load(); }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setError("Name required."); return; }
    try {
      if (editing) await api.put("/doctors/" + editing, form);
      else await api.post("/doctors", form);
      setShowForm(false); setForm(empty); setEditing(null); setError(""); load();
    } catch(ex) { setError("Save failed."); }
  };
  const handleEdit = (d) => {
    setForm({ firstName:d.firstName, lastName:d.lastName, specialization:d.specialization||"",
      phone:d.phone||"", email:d.email||"", availableDays:d.availableDays||"" });
    setEditing(d.id); setShowForm(true);
  };
  const handleDelete = async (id, name) => {
    if (window.confirm("Delete " + name + "?")) { await api.delete("/doctors/" + id); load(); }
  };
  const filtered = doctors.filter(d =>
    (d.firstName+" "+d.lastName+" "+d.specialization).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <h2 style={{ fontSize:24, fontWeight:"bold", marginBottom:20 }}>Doctor Management</h2>
      {!showForm ? (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <button className="btn btn-primary" onClick={()=>{setShowForm(true);setForm(empty);setEditing(null);}}>+ Add Doctor</button>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctors..." style={{maxWidth:260}} />
            <button className="btn btn-dark" onClick={load}>Refresh</button>
          </div>
          <div style={{ background:"#1e293b", borderRadius:10, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Specialization</th><th>Phone</th><th>Email</th><th>Available Days</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td><td>{d.firstName}</td><td>{d.lastName}</td>
                    <td>{d.specialization}</td><td>{d.phone}</td><td>{d.email}</td><td>{d.availableDays}</td>
                    <td>
                      <button className="btn btn-sky" style={{padding:"5px 10px",fontSize:12,marginRight:6}} onClick={()=>handleEdit(d)}>Edit</button>
                      <button className="btn btn-slate" style={{padding:"5px 10px",fontSize:12}} onClick={()=>handleDelete(d.id, d.firstName+" "+d.lastName)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ background:"#1e293b", borderRadius:12, padding:30, maxWidth:700 }}>
          <h3 style={{ marginBottom:20, fontSize:18 }}>{editing?"Edit Doctor":"Add New Doctor"}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["First Name","firstName"],["Last Name","lastName"],["Specialization","specialization"],
                ["Phone","phone"],["Email","email"],["Available Days","availableDays"]].map(([label,field]) => (
                <div key={field}>
                  <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>{label}</label>
                  <input value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={label} />
                </div>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button type="submit" className="btn btn-primary">{editing?"Update":"Save"} Doctor</button>
              <button type="button" className="btn btn-dark" onClick={()=>{setShowForm(false);setError("");}}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`);
console.log("Doctors.js created");

fs.writeFileSync("src/pages/Appointments.js", `
import React, { useEffect, useState } from "react";
import api from "../services/api";
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId:"", doctorId:"", appointmentDate:"", appointmentTime:"", status:"SCHEDULED", notes:"" });
  const [error, setError] = useState("");
  const load = async () => {
    const [a,p,d] = await Promise.all([api.get("/appointments"), api.get("/patients"), api.get("/doctors")]);
    setAppointments(a.data); setPatients(p.data); setDoctors(d.data);
  };
  useEffect(() => { load(); }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.appointmentDate || !form.appointmentTime) { setError("All fields required."); return; }
    try {
      await api.post("/appointments", form);
      setShowForm(false); setForm({ patientId:"", doctorId:"", appointmentDate:"", appointmentTime:"", status:"SCHEDULED", notes:"" });
      setError(""); load();
    } catch(ex) { setError("Save failed."); }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this appointment?")) { await api.delete("/appointments/" + id); load(); }
  };
  return (
    <div>
      <h2 style={{ fontSize:24, fontWeight:"bold", marginBottom:20 }}>Appointments</h2>
      {!showForm ? (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Book Appointment</button>
            <button className="btn btn-dark" onClick={load}>Refresh</button>
          </div>
          <div style={{ background:"#1e293b", borderRadius:10, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.patient ? a.patient.firstName+" "+a.patient.lastName : "-"}</td>
                    <td>{a.doctor ? a.doctor.firstName+" "+a.doctor.lastName : "-"}</td>
                    <td>{a.appointmentDate}</td><td>{a.appointmentTime}</td>
                    <td><span style={{ background: a.status==="SCHEDULED"?"#1d4ed8":a.status==="COMPLETED"?"#065f46":"#7f1d1d", color:"white", padding:"3px 8px", borderRadius:4, fontSize:11 }}>{a.status}</span></td>
                    <td>{a.notes}</td>
                    <td><button className="btn btn-slate" style={{padding:"5px 10px",fontSize:12}} onClick={()=>handleDelete(a.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ background:"#1e293b", borderRadius:12, padding:30, maxWidth:700 }}>
          <h3 style={{ marginBottom:20, fontSize:18 }}>Book Appointment</h3>
          <form onSubmit={handleSave}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Patient</label>
                <select value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}>
                  <option value="">Select Patient</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Doctor</label>
                <select value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d=><option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Date</label>
                <input type="date" value={form.appointmentDate} onChange={e=>setForm({...form,appointmentDate:e.target.value})} />
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Time</label>
                <input type="time" value={form.appointmentTime} onChange={e=>setForm({...form,appointmentTime:e.target.value})} />
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option>SCHEDULED</option><option>COMPLETED</option><option>CANCELLED</option>
                </select>
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Notes</label>
                <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional notes" />
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button type="submit" className="btn btn-primary">Book Appointment</button>
              <button type="button" className="btn btn-dark" onClick={()=>{setShowForm(false);setError("");}}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`);
console.log("Appointments.js created");

fs.writeFileSync("src/pages/Billing.js", `
import React, { useEffect, useState } from "react";
import api from "../services/api";
export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId:"", amount:"", status:"PENDING", paymentDate:"", description:"" });
  const [error, setError] = useState("");
  const load = async () => {
    const [b,p] = await Promise.all([api.get("/billing"), api.get("/patients")]);
    setBills(b.data); setPatients(p.data);
  };
  useEffect(() => { load(); }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) { setError("Patient and amount required."); return; }
    try {
      await api.post("/billing", form);
      setShowForm(false); setForm({ patientId:"", amount:"", status:"PENDING", paymentDate:"", description:"" });
      setError(""); load();
    } catch(ex) { setError("Save failed."); }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this bill?")) { await api.delete("/billing/" + id); load(); }
  };
  return (
    <div>
      <h2 style={{ fontSize:24, fontWeight:"bold", marginBottom:20 }}>Billing</h2>
      {!showForm ? (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Add Bill</button>
            <button className="btn btn-dark" onClick={load}>Refresh</button>
          </div>
          <div style={{ background:"#1e293b", borderRadius:10, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>Patient</th><th>Amount</th><th>Status</th><th>Payment Date</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.patient ? b.patient.firstName+" "+b.patient.lastName : "-"}</td>
                    <td>Rs.{b.amount}</td>
                    <td><span style={{ background: b.status==="PAID"?"#065f46":b.status==="PENDING"?"#92400e":"#7f1d1d", color:"white", padding:"3px 8px", borderRadius:4, fontSize:11 }}>{b.status}</span></td>
                    <td>{b.paymentDate||"-"}</td><td>{b.description}</td>
                    <td><button className="btn btn-slate" style={{padding:"5px 10px",fontSize:12}} onClick={()=>handleDelete(b.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ background:"#1e293b", borderRadius:12, padding:30, maxWidth:600 }}>
          <h3 style={{ marginBottom:20, fontSize:18 }}>Add Bill</h3>
          <form onSubmit={handleSave}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Patient</label>
                <select value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}>
                  <option value="">Select Patient</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Amount (Rs)</label>
                <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="e.g. 500" />
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option>PENDING</option><option>PAID</option><option>CANCELLED</option>
                </select>
              </div>
              <div>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Payment Date</label>
                <input type="date" value={form.paymentDate} onChange={e=>setForm({...form,paymentDate:e.target.value})} />
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{color:"#94a3b8",fontSize:12,fontWeight:"bold",display:"block",marginBottom:6}}>Description</label>
                <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="e.g. Consultation fee" />
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button type="submit" className="btn btn-primary">Save Bill</button>
              <button type="button" className="btn btn-dark" onClick={()=>{setShowForm(false);setError("");}}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`);
console.log("Billing.js created");
console.log("All files created successfully!");
