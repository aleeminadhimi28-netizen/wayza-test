import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSignup(e) {
        e.preventDefault();

        if (!email || !password) return;

        setLoading(true);

        const r = await fetch(`${API}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await r.json();

        if (data.ok) {
            navigate("/login");
        }

        setLoading(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col md:flex-row"
        >
            {/* LEFT SIDE */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-16 items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Join Wayza 🚀</h1>
                    <p className="opacity-80">
                        Create your account and start booking instantly.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                <form
                    onSubmit={handleSignup}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
                >
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
                        Create Account
                    </h2>

                    {/* Email */}
                    <div className="relative">
                        <input
                            type="email"
                            required
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all
              peer-placeholder-shown:top-4
              peer-placeholder-shown:text-base
              peer-focus:top-2
              peer-focus:text-sm">
                            Email address
                        </label>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            required
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer w-full border rounded-lg px-4 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all
              peer-placeholder-shown:top-4
              peer-placeholder-shown:text-base
              peer-focus:top-2
              peer-focus:text-sm">
                            Create password
                        </label>

                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="absolute right-3 top-3 text-sm text-blue-600 dark:text-blue-400"
                        >
                            {show ? "Hide" : "Show"}
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </motion.div>
    );
}