// src/types/Reports/ReportType.ts

export interface ReportItem {
  id: string;
  title: string;
  category: string;
  createdBy: string;
  lastVisited: string;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  description?: string;
  path?: string;
}

export interface ReportCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  reports: ReportItem[];
}

export interface RecentReport {
  id: string;
  title: string;
  date: string;
  type: string;
}