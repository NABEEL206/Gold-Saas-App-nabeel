// src/types/sidebar/sidebartype.ts
export interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
}

export interface SubMenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  subItems?: SubMenuItem[];
}

export interface SidebarProps {
  sidebarOpen: boolean;
}