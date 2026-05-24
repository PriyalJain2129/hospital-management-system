
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
