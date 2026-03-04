import { useState } from "react";
import { useNotify } from "./NotificationContext.jsx";
import { useAuth } from "./AuthContext.jsx";

const API = "http://localhost:5000";

export default function OwnerPanel() {

    const { notify } = useNotify();
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [preview, setPreview] = useState([]);

    function handleFiles(e) {

        const selected = [...e.target.files];

        setFiles(selected);

        // preview images
        setPreview(selected.map(f => URL.createObjectURL(f)));
    }

    async function handleSubmit() {

        if (!user) {
            notify("Login required");
            return;
        }

        if (!title || !price) {
            notify("Title and price required");
            return;
        }

        try {

            notify("Uploading images...");

            // upload images one by one
            const filenames = [];

            for (const file of files) {

                const fd = new FormData();
                fd.append("image", file);

                const res = await fetch(`${API}/upload`, {
                    method: "POST",
                    body: fd
                });

                const data = await res.json();
                filenames.push(data.filename);
            }

            notify("Saving listing...");

            // save listing
            await fetch(`${API}/listings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    price,
                    ownerEmail: user.email,
                    location,
                    description,
                    images: filenames
                })
            });

            notify("Listing created!");

            // reset form
            setTitle("");
            setPrice("");
            setLocation("");
            setDescription("");
            setFiles([]);
            setPreview([]);

        } catch (err) {

            console.error(err);
            notify("Upload failed");

        }
    }

    return (

        <div style={{ padding: 40, maxWidth: 600 }}>

            <h2>Owner Panel — Add Listing</h2>

            <input
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: "100%", marginTop: 10 }}
            />

            <input
                placeholder="Price per night"
                value={price}
                onChange={e => setPrice(e.target.value)}
                style={{ width: "100%", marginTop: 10 }}
            />

            <input
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ width: "100%", marginTop: 10 }}
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: "100%", marginTop: 10 }}
            />

            <input
                type="file"
                multiple
                onChange={handleFiles}
                style={{ marginTop: 10 }}
            />

            {/* image previews */}
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                {preview.map((p, i) => (
                    <img key={i} src={p} style={{ width: 90, height: 70, objectFit: "cover" }} />
                ))}
            </div>

            <button
                onClick={handleSubmit}
                style={{
                    marginTop: 20,
                    padding: "12px 18px",
                    background: "#0f172a",
                    color: "white",
                    border: "none",
                    cursor: "pointer"
                }}
            >
                Create Listing
            </button>

        </div>
    );
}