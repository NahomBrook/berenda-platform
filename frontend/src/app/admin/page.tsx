"use client";

import { useEffect, useState } from "react";
import { getAllUsers, getAllProperties, getAllBookings, updatePropertyStatus } from "../../utils/adminApi";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "properties" | "bookings">("users");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    getAllUsers(token).then((data) => setUsers(data.data || []));
    getAllProperties(token).then((data) => setProperties(data.data || []));
    getAllBookings(token).then((data) => setBookings(data.data || []));
  }, [token]);

  const handleApprove = async (propertyId: string) => {
    if (!token) return;
    await updatePropertyStatus(token, propertyId, "approved");
    setProperties(properties.map(p => p.id === propertyId ? { ...p, approvalStatus: "approved" } : p));
  };

  const handleReject = async (propertyId: string) => {
    if (!token) return;
    await updatePropertyStatus(token, propertyId, "rejected");
    setProperties(properties.map(p => p.id === propertyId ? { ...p, approvalStatus: "rejected" } : p));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <ul>
          <li
            className={`mb-4 cursor-pointer ${activeTab === "users" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </li>
          <li
            className={`mb-4 cursor-pointer ${activeTab === "properties" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            Properties
          </li>
          <li
            className={`mb-4 cursor-pointer ${activeTab === "bookings" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            Bookings
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>

        {activeTab === "users" && (
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Full Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Username</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">{user.fullName}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "properties" && (
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Title</th>
                <th className="p-2">Owner</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property.id} className="border-b">
                  <td className="p-2">{property.title}</td>
                  <td className="p-2">{property.owner.fullName}</td>
                  <td className="p-2">{property.approvalStatus}</td>
                  <td className="p-2 space-x-2">
                    {property.approvalStatus === "pending" && (
                      <>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded"
                          onClick={() => handleApprove(property.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => handleReject(property.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "bookings" && (
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Booking ID</th>
                <th className="p-2">Property</th>
                <th className="p-2">User</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id} className="border-b">
                  <td className="p-2">{booking.id}</td>
                  <td className="p-2">{booking.property.title}</td>
                  <td className="p-2">{booking.user.fullName}</td>
                  <td className="p-2">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}