"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/dashboard/profile");
      setData(res.data);
    } catch (err) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <Header />

      {/* CONTENT AREA */}
      <main className="p-10 space-y-10">

        {/* Welcome Section */}
        <h1 className="text-3xl font-semibold">
          Welcome {data.client.client_admin_name}
        </h1>

        {/* Client Card */}
        <div className="border border-white/20 p-6 rounded-xl bg-black/40">
          <h2 className="text-xl mb-4">Client Information</h2>

          <div className="space-y-2">
            <p><span className="text-gray-400">Company:</span> {data.client.client_name}</p>
            <p><span className="text-gray-400">City:</span> {data.client.city}</p>
            <p><span className="text-gray-400">Email:</span> {data.client.client_admin_email}</p>
          </div>
        </div>

        {/* Sites Card */}
        <div className="border border-white/20 p-6 rounded-xl bg-black/40">
          <h2 className="text-xl mb-6">Sites</h2>

          <div className="space-y-6">
            {data.sites.map((site: any, index: number) => (
              <div
                key={index}
                className="border-b border-white/20 pb-4 last:border-none"
              >
                <p><span className="text-gray-400">Site Name:</span> {site.site_name}</p>
                <p><span className="text-gray-400">Admin:</span> {site.site_admin_name}</p>
                <p><span className="text-gray-400">Phone:</span> {site.site_admin_phone}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}