"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  onClose: () => void;
};

type Mode = "choose" | "form" | "otp" | "success";

export default function RecoverKeysModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [type, setType] = useState<"client" | "site" | null>(null);

  const [email, setEmail] = useState("");
  const [siteName, setSiteName] = useState("");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleRequest = async () => {
    try {
      if (!email) {
        alert("Email is required");
        return;
      }

      if (type === "site") {
        if (!siteName) {
          alert("Site name is required");
          return;
        }

        await api.post("/api/site/recover-site/request", {
          client_admin_email: email,
          site_name: siteName,
        });

      } else {
        await api.post("/api/clients/recover-client-id", {
          email,
        });
      }

      setMode("otp");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerify = async () => {
    try {
      if (!otp) {
        alert("OTP is required");
        return;
      }

      let res;

      if (type === "site") {
        res = await api.post("/api/site/recover-site/verify", {
          client_admin_email: email,
          site_name: siteName,
          otp,
        });

      } else {
        res = await api.post("/api/clients/recover-client-id/verify", {
          email,
          otp,
        });
      }

      setResult(res.data);
      setMode("success");

    } catch (error: any) {
      alert(error.response?.data?.message || "OTP verification failed");
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovered_keys.json";
    a.click();
  };

  const downloadCSV = () => {
    const rows = Object.entries(result)
      .map(([key, val]) => `${key},${val}`)
      .join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "recovered_keys.csv";
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-black border border-white/20 p-8 rounded-xl w-[400px] space-y-6">

        {mode === "choose" && (
          <>
            <h2 className="text-xl">Recover Keys</h2>

            <button
              onClick={() => {
                setType("client");
                setMode("form");
              }}
              className="w-full border p-2 rounded"
            >
              Recover Client UUID
            </button>

            <button
              onClick={() => {
                setType("site");
                setMode("form");
              }}
              className="w-full border p-2 rounded"
            >
              Recover Site UUID & Secret
            </button>
          </>
        )}

        {mode === "form" && (
          <>
            <input
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded bg-black"
            />

            {type === "site" && (
              <input
                placeholder="Site Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full p-2 border rounded bg-black"
              />
            )}

            <button
              onClick={handleRequest}
              className="w-full border p-2 rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {mode === "otp" && (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded bg-black"
            />

            <button
              onClick={handleVerify}
              className="w-full border p-2 rounded"
            >
              Verify OTP
            </button>
          </>
        )}

        {mode === "success" && (
          <>
            <h3 className="text-lg text-green-400">Recovered Successfully</h3>

            <pre className="bg-black border p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>

            <div className="flex gap-4">
              <button
                onClick={downloadJSON}
                className="flex-1 border p-2 rounded"
              >
                Download JSON
              </button>

              <button
                onClick={downloadCSV}
                className="flex-1 border p-2 rounded"
              >
                Download CSV
              </button>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full text-sm text-red-400 mt-4"
        >
          Close
        </button>

      </div>
    </div>
  );
}