"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/layout/NavBar";
import { loginUser } from "../../../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
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
          <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

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
            className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
          >
            Login
          </button>

          <p className="mt-4 text-center text-gray-600">
            New here?{" "}
            <span
              className="text-red-500 cursor-pointer hover:underline"
              onClick={() => router.push("/auth/register")}
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </>
  );
}