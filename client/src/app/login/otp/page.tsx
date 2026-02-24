"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import { api } from "@/lib/api";

export default function OTPPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientUUID = searchParams.get("client_uuid") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/api/dashboard/login/verify-otp",
        {
          client_uuid: clientUUID,
          otp,
        }
      );

      localStorage.setItem("token", res.data.token);

      router.push("/dashboard");

    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">

      <div className="w-full max-w-md bg-black/40 p-8 rounded-xl border border-white/20">

        <h2 className="text-2xl mb-6 text-center">Enter OTP</h2>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 mb-6 rounded bg-black border border-white/30"
        />

        <Button onClick={handleVerify}>
          {loading ? "Verifying..." : "Login"}
        </Button>

      </div>
    </div>
  );
}