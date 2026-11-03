import { Suspense } from "react";
import { Catalog } from "@/components/catalog";

export default function HomePage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-sm text-gray-400">Loading products...</p>}>
      <Catalog />
    </Suspense>
  );
}
