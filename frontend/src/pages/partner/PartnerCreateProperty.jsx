import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PartnerCreateProperty() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    function handleFile(e) {

        const file = e.target.files[0];
        setImage(file);

        if (file) setPreview(URL.createObjectURL(file));
    }

    async function create() {

        if (!title) return alert("Enter property name");

        let filename = null;

        if (image) {

            const form = new FormData();
            form.append("image", image);

            const uploadRes = await fetch(`${API}/upload`, {
                method: "POST",
                body: form
            });

            const uploadData = await uploadRes.json();
            filename = uploadData.filename;
        }

        const res = await fetch(`${API}/listings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                location,
                price,
                image: filename
            })
        });

        const data = await res.json();

        if (data.ok) {
            navigate("/partner/properties");
        } else {
            alert("Failed to create property");
        }
    }

    return (

        <div style={{ padding: 40, maxWidth: 420 }}>

            <h2>Create Property</h2>

            <input
                placeholder="Property name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={input}
            />

            <input
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={input}
            />

            <input
                placeholder="Base price"
                value={price}
                onChange={e => setPrice(e.target.value)}
                style={input}
            />

            <input type="file" onChange={handleFile} />

            {preview && (
                <img src={preview} style={previewImg} />
            )}

            <button onClick={create} style={btn}>
                Create Property
            </button>

        </div>
    );
}

const input = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: 10
};

const previewImg = {
    width: "100%",
    height: 180,
    objectFit: "cover",
    marginBottom: 12
};

const btn = {
    padding: "12px 20px",
    background: "#0f172a",
    color: "white",
    border: "none"
};