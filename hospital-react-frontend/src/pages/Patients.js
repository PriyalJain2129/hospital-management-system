
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
