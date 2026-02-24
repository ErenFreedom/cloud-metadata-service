"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import { api } from "@/lib/api";

type SiteConfig = {
  site_uuid: string;
  client_secret: string;
};

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const client_uuid = searchParams.get("client_uuid");

  const [otp, setOtp] = useState("");
  const [verifiedData, setVerifiedData] = useState<SiteConfig[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!client_uuid) return;

    try {
      setLoading(true);

      const response = await api.post(
        "/api/clients/verify-otp",
        { client_uuid, otp }
      );

      setVerifiedData(response.data.sites);
    } catch (error: any) {
      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    const data = {
      client_uuid,
      sites: verifiedData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site_credentials.json";
    a.click();
  };

  const downloadCSV = () => {
    let csv = "client_uuid,site_uuid,client_secret\n";

    verifiedData?.forEach((site) => {
      csv += `${client_uuid},${site.site_uuid},${site.client_secret}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site_credentials.csv";
    a.click();
  };

  const closeModal = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">

      <div className="max-w-md w-full text-center space-y-8">

        <h1 className="text-3xl font-semibold">
          OTP Verification
        </h1>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="
            w-full
            bg-neutral-900
            border border-neutral-700
            px-4 py-3
            rounded-xl
            focus:outline-none
            focus:border-white
            text-center
            text-lg
          "
        />

        <Button onClick={handleVerify}>
          {loading ? "Verifying..." : "Verify"}
        </Button>

      </div>

      {/* Modal */}
      {verifiedData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-neutral-900 p-8 rounded-2xl max-w-2xl w-full space-y-6">

            <h2 className="text-2xl font-semibold">
              Client Verified Successfully
            </h2>

            <div className="text-sm text-neutral-400">
              Client UUID:
            </div>

            <div className="bg-neutral-800 p-3 rounded-lg break-all">
              {client_uuid}
            </div>

            <div className="space-y-4">
              {verifiedData.map((site, index) => (
                <div
                  key={index}
                  className="border border-neutral-800 p-4 rounded-xl"
                >
                  <div className="text-sm text-neutral-400">
                    Site UUID:
                  </div>
                  <div className="break-all">
                    {site.site_uuid}
                  </div>

                  <div className="text-sm text-neutral-400 mt-3">
                    Client Secret:
                  </div>
                  <div className="break-all">
                    {site.client_secret}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={downloadJSON}>
                Download JSON
              </Button>

              <Button onClick={downloadCSV}>
                Download CSV
              </Button>

              <Button onClick={closeModal}>
                Continue
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}