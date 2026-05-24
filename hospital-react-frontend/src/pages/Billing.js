
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
