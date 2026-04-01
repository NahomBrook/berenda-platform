"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/layout/NavBar";
import { registerUser } from "../../../utils/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("You must agree to terms and conditions.");
      return;
    }
    try {
      await registerUser(fullName, email, password);
      router.push("/"); // redirect home
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-3xl font-bold mb-6 text-center">Create an Account</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />

          <label className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              className="mr-2"
            />
            I agree to the Terms & Conditions
          </label>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
          >
            Register
          </button>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <span
              className="text-red-500 cursor-pointer hover:underline"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </>
  );
}