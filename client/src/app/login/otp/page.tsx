"use client";

import { Suspense } from "react";
import OTPContent from "./OTPContent";

export const dynamic = "force-dynamic";

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <OTPContent />
    </Suspense>
  );
}