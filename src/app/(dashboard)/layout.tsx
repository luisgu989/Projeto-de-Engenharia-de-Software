import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface DashboardRouteLayoutProps {
  children: React.ReactNode;
}

export default function DashboardRouteLayout({ children }: DashboardRouteLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
