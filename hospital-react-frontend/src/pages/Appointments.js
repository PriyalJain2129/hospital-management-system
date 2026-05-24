
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
