"use client";

import { Suspense } from "react";
import VerifyOTPInner from "./VerifyOTPInner";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPInner />
    </Suspense>
  );
}
