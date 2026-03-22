import { Suspense } from "react";
import { GuestHeader } from "./GuestHeader";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <GuestHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Suspense>{children}</Suspense>
      </main>

      <footer className="mt-16 border-t bg-white py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Hospitality Experience Orchestration
        Platform
      </footer>
    </div>
  );
}
