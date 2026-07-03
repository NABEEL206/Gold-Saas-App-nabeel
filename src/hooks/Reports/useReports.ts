// src/hooks/Reports/useReports.ts

import { useState, useCallback, useMemo } from 'react';
import type { ReportCategory, ReportItem, RecentReport } from '../../types/Reports/ReportType';

interface UseReportsOptions {
  initialCategory?: string;
  initialViewMode?: 'grid' | 'list';
}

export const useReports = (options: UseReportsOptions = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(options.initialCategory || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(options.initialViewMode || 'grid');
  const [loading, setLoading] = useState(false);
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

  // Filter categories based on active tab
  const filteredCategories = useMemo(() => {
    if (activeCategory === 'all') return reportCategories;
    return reportCategories.filter(cat => cat.id === activeCategory);
  }, [reportCategories, activeCategory]);

  // Get all reports flattened
  const allReports = useMemo(() => {
    return reportCategories.flatMap(cat => cat.reports);
  }, [reportCategories]);

  // Search across all reports
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allReports.filter(report =>
      report.title.toLowerCase().includes(query) ||
      (report.description && report.description.toLowerCase().includes(query))
    );
  }, [allReports, searchQuery]);

  // Fetch reports from API (placeholder for future implementation)
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await api.getReports();
      // setReportCategories(response.data.categories);
      // setRecentReports(response.data.recent);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate a report (placeholder)
  const generateReport = useCallback(async (reportId: string, params?: Record<string, any>) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.generateReport(reportId, params);
      // return response.data;
      console.log('Generating report:', reportId, params);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }, []);

  // Export report (placeholder)
  const exportReport = useCallback(async (reportId: string, format: 'pdf' | 'excel') => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.exportReport(reportId, format);
      // return response.data;
      console.log('Exporting report:', reportId, format);
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }, []);

  // Schedule report (placeholder)
  const scheduleReport = useCallback(async (reportId: string, schedule: any) => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.scheduleReport(reportId, schedule);
      // return response.data;
      console.log('Scheduling report:', reportId, schedule);
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  }, []);

  // Update report data (optional)
  const updateReports = useCallback((categories: ReportCategory[]) => {
    setReportCategories(categories);
  }, []);

  return {
    // State
    searchQuery,
    activeCategory,
    viewMode,
    loading,
    reportCategories,
    recentReports,
    
    // Computed
    filteredCategories,
    allReports,
    searchResults,
    
    // Actions - these are the setters
    setSearchQuery,
    setActiveCategory,
    setViewMode,
    setReportCategories,
    setRecentReports,
    updateReports, // Optional helper
    
    // API actions (for future use)
    fetchReports,
    generateReport,
    exportReport,
    scheduleReport,
  };
};