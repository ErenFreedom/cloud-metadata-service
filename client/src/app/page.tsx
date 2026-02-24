import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={350}
          height={350}
          priority
          className="mx-auto"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12">
        IoT Cloud Admin Registration
      </h1>

      {/* Buttons */}
      <div className="flex gap-6">
        <Link href="/login">
          <Button>Login</Button>
        </Link>

        <Link href="/register">
          <Button>Sign Up</Button>
        </Link>
      </div>

    </div>
  );
}