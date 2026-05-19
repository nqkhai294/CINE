"use client";

import { ReactNode } from "react";
import PageWrapper from "@/components/layout/page-wrapper";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <PageWrapper>{children}</PageWrapper>;
}
