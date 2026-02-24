"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [clientUUID, setClientUUID] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOTP = async () => {
    try {
      setLoading(true);

      await api.post("/api/dashboard/login/request-otp", {
        client_uuid: clientUUID,
      });

      router.push(`/login/otp?client_uuid=${clientUUID}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">

      <Image
        src="/logo.png"
        alt="Company Logo"
        width={250}
        height={250}
        className="mb-8"
      />

      <div className="w-full max-w-md bg-black/40 p-8 rounded-xl border border-white/20">

        <h2 className="text-2xl mb-6 text-center">Dashboard Login</h2>

        <input
          type="text"
          placeholder="Enter Client UUID"
          value={clientUUID}
          onChange={(e) => setClientUUID(e.target.value)}
          className="w-full p-3 mb-6 rounded bg-black border border-white/30"
        />

        <Button onClick={handleRequestOTP}>
          {loading ? "Sending OTP..." : "Proceed to OTP Verification"}
        </Button>

      </div>
    </div>
  );
}