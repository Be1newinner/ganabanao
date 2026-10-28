import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/common";
import { CreateStudio } from "./create-studio";

export const metadata: Metadata = { title: "Create" };

export default function CreatePage() {
  // The studio reads ?prompt= from the dashboard's quick box, so it sits in a Suspense boundary
  return (
    <Suspense fallback={<PageLoader />}>
      <CreateStudio />
    </Suspense>
  );
}
