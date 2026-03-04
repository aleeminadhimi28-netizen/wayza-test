import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerProperty() {

    const { id } = useParams();

    const [listing, setListing] = useState(null);

    const [type, setType] = useState("Room");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [desc, setDesc] = useState("");
    const [available, setAvailable] = useState(true);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => { load(); }, [id]);

    async function load() {
        const r = await fetch(`${API}/listings/${id}`);
        setListing(await r.json());
    }

    function resetForm() {
        setName("");
        setPrice("");
        setDesc("");
        setAvailable(true);
        setFile(null);
        setPreview("");
        setEditIndex(null);
    }

    function handleFile(e) {
        const f = e.target.files[0];
        setFile(f);
        if (f) setPreview(URL.createObjectURL(f));
    }

    async function uploadImage() {
        if (!file) return null;

        const fd = new FormData();
        fd.append("image", file);

        const r = await fetch(`${API}/upload`, {
            method: "POST",
            body: fd
        });

        const d = await r.json();
        return d.filename;
    }

    async function save() {

        if (!name) return alert("Enter name");

        let image = null;

        if (file) {
            const uploaded = await uploadImage();
            if (uploaded) image = `uploads/${uploaded}`;
        }

        const payload = {
            type,
            name,
            price: Number(price) || 0,
            desc,
            available,
            ...(image && { image })
        };

        if (editIndex === null) {

            await fetch(`${API}/listings/${id}/variant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

        } else {

            await fetch(`${API}/listings/${id}/variant/${editIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

        }

        resetForm();
        load();
    }

    function startEdit(v, i) {
        setEditIndex(i);
        setType(v.type || "Room");
        setName(v.name || "");
        setPrice(v.price || "");
        setDesc(v.desc || "");
        setAvailable(v.available !== false);
        setPreview(v.image ? `${API}/${v.image}` : "");
    }

    async function remove(i) {
        if (!confirm("Delete this item?")) return;
        await fetch(`${API}/listings/${id}/variant/${i}`, { method: "DELETE" });
        load();
    }

    async function toggleAvailable(i, current) {

        const updated = {
            ...listing.variants[i],
            available: !current
        };

        await fetch(`${API}/listings/${id}/variant/${i}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        load();
    }

    if (!listing) return <div style={{ padding: 40 }}>Loading...</div>;

    const fixImg = (img) => img ? `${API}/${img}` : "https://picsum.photos/400/300";

    return (

        <div style={{ padding: 40 }}>

            <h2>{listing.title}</h2>
            <p>Manage your rooms, bikes, cars & availability</p>

            {/* FORM */}
            <div style={formCard}>

                <h3>{editIndex === null ? "Add Item" : "Edit Item"}</h3>

                <select value={type} onChange={e => setType(e.target.value)} style={input}>
                    <option>Room</option>
                    <option>Bike</option>
                    <option>Car</option>
                </select>

                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={input} />
                <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={input} />

                <textarea placeholder="Description"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    style={{ ...input, height: 90 }}
                />

                <label style={{ display: "block", marginBottom: 10 }}>
                    <input type="checkbox"
                        checked={available}
                        onChange={e => setAvailable(e.target.checked)}
                    /> Available for booking
                </label>

                <input type="file" onChange={handleFile} />

                {preview && (
                    <img src={preview} style={previewImg} />
                )}

                <button onClick={save} style={primaryBtn}>
                    {editIndex === null ? "Add" : "Save changes"}
                </button>

                {editIndex !== null && (
                    <button onClick={resetForm} style={secondaryBtn}>
                        Cancel edit
                    </button>
                )}

            </div>

            {/* ITEMS */}
            <div style={grid}>

                {(listing.variants || []).map((v, i) => (
                    <div key={i} style={card}>

                        <img src={fixImg(v.image)} style={cardImg} />

                        <h4>{v.name}</h4>
                        <div style={{ fontWeight: 700 }}>₹{v.price}</div>

                        {v.desc && <div style={descText}>{v.desc}</div>}

                        {/* TOGGLE SWITCH */}
                        <div
                            onClick={() => toggleAvailable(i, v.available)}
                            style={{
                                width: 46,
                                height: 26,
                                borderRadius: 20,
                                background: v.available ? "#22c55e" : "#d1d5db",
                                position: "relative",
                                margin: "12px auto",
                                cursor: "pointer",
                                transition: "0.2s"
                            }}
                        >
                            <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "white",
                                position: "absolute",
                                top: 3,
                                left: v.available ? 23 : 3,
                                transition: "0.2s",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                            }} />
                        </div>

                        <div style={{
                            fontSize: 13,
                            color: v.available ? "#16a34a" : "#dc2626",
                            fontWeight: 600
                        }}>
                            {v.available ? "Available" : "Not available"}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button onClick={() => startEdit(v, i)} style={editBtn}>Edit</button>
                            <button onClick={() => remove(i)} style={delBtn}>Delete</button>
                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}

/* ---------- STYLES ---------- */

const formCard = {
    background: "white",
    padding: 20,
    borderRadius: 12,
    maxWidth: 420,
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    marginBottom: 30
};

const input = {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd"
};

const previewImg = {
    width: "100%",
    height: 160,
    objectFit: "cover",
    borderRadius: 8,
    marginTop: 10
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
    gap: 20
};

const card = {
    background: "white",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    textAlign: "center"
};

const cardImg = {
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 10
};

const descText = {
    fontSize: 13,
    color: "#555",
    marginTop: 6
};

const primaryBtn = {
    width: "100%",
    padding: 12,
    marginTop: 12,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
};

const secondaryBtn = {
    width: "100%",
    padding: 12,
    marginTop: 8,
    background: "#64748b",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
};

const editBtn = {
    flex: 1,
    background: "#0284c7",
    color: "white",
    border: "none",
    padding: "8px 0",
    borderRadius: 8,
    cursor: "pointer"
};

const delBtn = {
    flex: 1,
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 0",
    borderRadius: 8,
    cursor: "pointer"
};