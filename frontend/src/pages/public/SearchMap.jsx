import { useEffect, useState } from "react";
import { WayzaLayout, WayzaCard } from "../../WayzaUI.jsx";
import MapView from "../../components/MapView.jsx";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SearchMap() {

    const [listings, setListings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        fetch(`${API}/listings`)
            .then(res => res.json())
            .then(data => {

                const rows = data.data || data;
                setListings(rows);

            });

    }, []);

    return (

        <WayzaLayout>

            <div style={{
                display: "grid",
                gridTemplateColumns: "45% 55%",
                height: "calc(100vh - 80px)"
            }}>

                {/* LEFT SIDE — LISTINGS */}

                <div style={{
                    overflowY: "auto",
                    padding: 20,
                    borderRight: "1px solid #eee"
                }}>

                    <h2 style={{ marginBottom: 20 }}>Available stays</h2>

                    {listings.map(l => (

                        <WayzaCard
                            key={l._id}
                            style={{ marginBottom: 16, cursor: "pointer" }}
                            onClick={() => navigate(`/listing/${l._id}`)}
                        >

                            <div style={{ fontWeight: 700 }}>
                                {l.title}
                            </div>

                            <div style={{ fontSize: 14, color: "#6b7280" }}>
                                📍 {l.location}
                            </div>

                            <div style={{ marginTop: 6, fontWeight: 700 }}>
                                ₹{l.price}
                            </div>

                        </WayzaCard>

                    ))}

                </div>


                {/* RIGHT SIDE — MAP */}

                <div style={{ height: "100%" }}>

                    <MapView
                        markers={listings.map(l => ({
                            lat: l.lat || 8.7379,
                            lng: l.lng || 76.7163,
                            title: l.title,
                            price: l.price
                        }))}
                    />

                </div>

            </div>

        </WayzaLayout>

    );

}