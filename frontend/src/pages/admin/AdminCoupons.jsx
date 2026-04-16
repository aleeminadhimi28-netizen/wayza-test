import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Trash2, Plus, Percent } from "lucide-react";
import { api } from "../../utils/api.js";
import { useToast } from "../../ToastContext.jsx";

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState("");
    const [newDiscount, setNewDiscount] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const d = await api.adminGetCoupons();
            if (d.ok) setCoupons(d.data || []);
        } catch (err) {
            console.error(err);
            showToast("Failed to load coupons", "error");
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCode || !newDiscount) return;

        const discountPercentage = parseFloat(newDiscount) / 100;
        if (discountPercentage <= 0 || discountPercentage >= 1) {
            showToast("Discount must be between 1 and 99", "error");
            return;
        }

        try {
            const d = await api.adminCreateCoupon({
                code: newCode.toUpperCase(),
                discountPercentage
            });

            if (d.ok) {
                showToast("Coupon created successfully", "success");
                setNewCode("");
                setNewDiscount("");
                loadCoupons();
            } else {
                showToast(d.message || "Failed to create coupon", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Server error", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this coupon? It will no longer be usable.")) return;
        try {
            const d = await api.adminDeleteCoupon(id);
            if (d.ok) {
                showToast("Coupon deleted", "success");
                loadCoupons();
            } else {
                showToast("Failed to delete", "error");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Tag size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Promotions Engine</h2>
                        <p className="text-sm text-slate-500">Create subsidized discount codes. The reduction is absorbed by the partner.</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                    <div className="flex-1 w-full relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Coupon Code</label>
                        <Tag className="absolute left-3 top-[34px] text-slate-400" size={16} />
                        <input
                            type="text"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            placeholder="e.g. WELCOME10"
                            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-sm font-semibold uppercase focus:border-emerald-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="w-full sm:w-32 relative">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Discount %</label>
                        <Percent className="absolute left-3 top-[34px] text-slate-400" size={16} />
                        <input
                            type="number"
                            value={newDiscount}
                            onChange={(e) => setNewDiscount(e.target.value)}
                            placeholder="10"
                            min="1"
                            max="99"
                            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto h-11 px-6 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Mint Code
                    </button>
                </form>

                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Active Promotions</h3>
                
                {coupons.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                        <Tag size={32} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No coupons minted yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coupons.map((c) => (
                            <div key={c._id} className="relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold tracking-widest uppercase text-sm">
                                        {c.code}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(c._id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors"
                                        title="Revoke code"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-extrabold text-slate-900">{Math.round(c.discountPercentage * 100)}%</span>
                                    <span className="text-slate-500 font-medium pb-1">OFF</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-3 font-medium">Created {new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
