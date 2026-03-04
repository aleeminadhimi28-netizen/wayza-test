import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { WayzaLayout, WayzaHotelItem } from "../../WayzaUI.jsx";
import { useAuth } from "../../AuthContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Listings() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const realToken = token || localStorage.getItem("token");

    const [rows, setRows] = useState([]);
    const [saved, setSaved] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("");

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const location = params.get("location") || "";
    const start = params.get("start") || "";
    const end = params.get("end") || "";

    const fixImg = (img) => {
        if (!img) return "https://picsum.photos/300/200";
        if (img.startsWith("http")) return img;
        return `${API}/uploads/${img}`;
    };

    async function loadWishlist() {
        if (!realToken) return;

        try {
            const res = await fetch(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${realToken}` },
            });
            const data = await res.json();
            setSaved(new Set(data.map((x) => x.listingId)));
        } catch (err) {
            console.log(err);
        }
    }

    function loadListings() {
        const query = new URLSearchParams();

        if (location) query.set("location", location);
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        if (sort) query.set("sort", sort);
        if (start) query.set("start", start);
        if (end) query.set("end", end);

        query.set("page", page);
        query.set("limit", 6);

        setLoading(true);

        fetch(`${API}/listings?${query.toString()}`)
            .then((r) => r.json())
            .then((data) => {
                setRows(data.rows || []);
                setPages(data.pages || 1);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }

    async function toggleWishlist(e, listingId) {
        e.preventDefault();
        e.stopPropagation();

        if (!realToken) {
            navigate("/login");
            return;
        }

        await fetch(`${API}/wishlist/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${realToken}`,
            },
            body: JSON.stringify({ listingId }),
        });

        setSaved((prev) => {
            const s = new Set(prev);
            if (s.has(listingId)) s.delete(listingId);
            else s.add(listingId);
            return s;
        });
    }

    useEffect(() => {
        loadListings();
        loadWishlist();
    }, [location, minPrice, maxPrice, sort, page]);

    useEffect(() => {
        setPage(1);
    }, [location, minPrice, maxPrice, sort]);

    return (
        <WayzaLayout>
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* FILTERS */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-10 flex flex-wrap gap-4 items-center">

                    <input
                        placeholder="Min price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        placeholder="Max price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Sort</option>
                        <option value="price_asc">Price low → high</option>
                        <option value="price_desc">Price high → low</option>
                        <option value="new">Newest</option>
                    </select>

                </div>

                {/* TITLE */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>
                        <h2 className="text-3xl font-bold">
                            {location ? `Stays in ${location}` : "All stays"}
                        </h2>

                        <p className="text-gray-500 text-sm mt-1">
                            {rows.length} properties found
                        </p>
                    </div>

                </div>

                {loading && <p>Loading results...</p>}
                {!loading && rows.length === 0 && <p>No stays found.</p>}

                {/* LISTINGS GRID */}
                {!loading && rows.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rows.map((l) => {
                            const isSaved = saved.has(l._id);

                            return (
                                <div key={l._id} className="relative">

                                    {/* HEART BUTTON */}
                                    <div
                                        onClick={(e) => toggleWishlist(e, l._id)}
                                        className="absolute top-4 right-4 z-10 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition"
                                    >
                                        {isSaved ? "❤️" : "🤍"}
                                    </div>

                                    <WayzaHotelItem
                                        hotel={{
                                            id: l._id,
                                            name: l.title,
                                            location: l.location || "Varkala",
                                            price: l.price,
                                            image: fixImg(l.image),
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {!loading && pages > 1 && (
                    <div className="flex justify-center mt-20">

                        <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-2xl shadow-lg border border-gray-100">

                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-6 py-2 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40"
                            >
                                ← Prev
                            </button>

                            <span className="text-gray-600 font-medium">
                                Page <span className="text-black font-semibold">{page}</span> of {pages}
                            </span>

                            <button
                                disabled={page >= pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-6 py-2 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40"
                            >
                                Next →
                            </button>

                        </div>

                    </div>
                )}
            </div>
        </WayzaLayout>
    );
}

const pageBtn = {
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
};