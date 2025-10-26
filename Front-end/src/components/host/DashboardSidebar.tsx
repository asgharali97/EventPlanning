import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger
} from "../ui/sidebar"
const DashboardSidebar = () => {
  return (
    <>
      <Sidebar>
        <SidebarHeader >

  <SidebarTrigger />
          </SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </>
  );
};

export default DashboardSidebar;
