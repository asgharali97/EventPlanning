import React from "react";
import { SidebarProvider,SidebarTrigger } from "../ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
const HostDashboard = () => {
  return (
    <>
      <SidebarProvider>
        <DashboardSidebar/>
        <SidebarTrigger />
      </SidebarProvider>
    </>
  );
};

export default HostDashboard;
