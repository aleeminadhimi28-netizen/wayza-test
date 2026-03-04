import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import { useToast } from "../../ToastContext.jsx";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {

        e.preventDefault();

        if (!email || !password) {
            showToast("Enter email & password", "error");
            return;
        }

        try {

            setLoading(true);

            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await res.json();

            console.log("Login response:", data);

            if (!data.ok || !data.data?.token) {
                showToast("Invalid credentials", "error");
                setLoading(false);
                return;
            }

            const token = data.data.token;
            const emailUser = data.data.email;
            const role = data.data.role;

            // save token
            localStorage.setItem("token", token);

            // update auth context
            login({
                email: emailUser,
                role: role
            });

            showToast("Login successful", "success");

            navigate("/");

        } catch (error) {

            console.error("Login error:", error);

            showToast("Server error. Try again.", "error");

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

                    <h1 className="text-4xl font-bold mb-4">
                        Welcome back 👋
                    </h1>

                    <p className="opacity-80">
                        Sign in to continue booking hotels, bikes and cars.
                    </p>

                </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">

                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
                >

                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
                        Sign In
                    </h2>


                    {/* EMAIL */}

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


                    {/* PASSWORD */}

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
                            Password
                        </label>

                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className="absolute right-3 top-3 text-sm text-blue-600 dark:text-blue-400"
                        >
                            {show ? "Hide" : "Show"}
                        </button>

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-60"
                    >

                        {loading ? "Signing in..." : "Sign In"}

                    </button>


                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">

                        Don’t have an account?{" "}

                        <Link
                            to="/signup"
                            className="text-blue-600 font-semibold"
                        >
                            Create account
                        </Link>

                    </p>

                </form>

            </div>

        </motion.div>

    );
}