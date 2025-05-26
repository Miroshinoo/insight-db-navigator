
import { Database, Globe, Settings, LogOut, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TableType } from "./Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  selectedTable: TableType;
  onTableSelect: (table: TableType) => void;
}

export const AppSidebar = ({ selectedTable, onTableSelect }: AppSidebarProps) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: "IIS Applications",
      key: "applications" as TableType,
      icon: Globe,
      count: 156,
    },
    {
      title: "SQL Databases",
      key: "databases" as TableType,
      icon: Database,
      count: 89,
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Infrastructure Dashboard</h2>
            <p className="text-xs text-muted-foreground">v2.1.0</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Data Tables</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onTableSelect(item.key)}
                    className={selectedTable === item.key ? "bg-accent" : ""}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.title}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
