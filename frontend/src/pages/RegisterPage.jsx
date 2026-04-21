import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      const { token, user } = response.data;

      login(user, token);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-dark flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-dark-card border border-dark-border rounded-card p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            Create your account
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Join millions of event enthusiasts
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-dark border border-dark-border rounded-btn text-white placeholder-gray-600 focus:border-brand focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-dark border border-dark-border rounded-btn text-white placeholder-gray-600 focus:border-brand focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-dark border border-dark-border rounded-btn text-white placeholder-gray-600 focus:border-brand focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-red-500 disabled:bg-gray-700 text-white font-semibold py-3 rounded-btn transition"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:text-red-500 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
