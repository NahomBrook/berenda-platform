const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/admin"; // backend admin routes

export async function getAllUsers(token: string) {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getAllProperties(token: string) {
  const res = await fetch(`${API_BASE}/properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getAllBookings(token: string) {
  const res = await fetch(`${API_BASE}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Optional: Approve or reject a property
export async function updatePropertyStatus(token: string, propertyId: string, status: "approved" | "rejected") {
  const res = await fetch(`${API_BASE}/properties/${propertyId}`, {
    method: "PATCH",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ approvalStatus: status }),
  });
  return res.json();
}