"use client";

import { Suspense } from "react";
import VerifyContent from "./VerifyContent";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}