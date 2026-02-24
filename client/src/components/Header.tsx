"use client";

import Image from "next/image";
import { useState } from "react";
import RecoverKeysModal from "./RecoverKeysModal";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="w-full flex items-center justify-between px-8 py-4 border-b border-white/20 bg-black">

        {/* Left Logo */}
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={120}
        />

        {/* Right Section */}
        <div className="flex items-center gap-6">

          <button
            onClick={() => setOpen(true)}
            className="text-sm border border-white/30 px-4 py-2 rounded hover:bg-white/10"
          >
            Recover Your Keys
          </button>

          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            👤
          </div>

        </div>
      </header>

      {open && <RecoverKeysModal onClose={() => setOpen(false)} />}
    </>
  );
}