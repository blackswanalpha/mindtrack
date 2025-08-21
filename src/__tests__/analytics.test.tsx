/**
 * Analytics Components Test Suite
 * Tests for analytics and reporting functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { ReportManager } from '@/components/analytics/report-manager';
import { ChartGallery } from '@/components/analytics/chart-gallery';
import { DashboardBuilder } from '@/components/analytics/dashboard-builder';
import { DataExporter } from '@/components/analytics/data-exporter';
import { AnalyticsPermissionManager } from '@/lib/analytics-permissions';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />
}));

describe('Analytics Components', () => {
  describe('AnalyticsOverview', () => {
    it('renders key performance indicators', () => {
      render(<AnalyticsOverview />);
      
      expect(screen.getByText('Response Rate')).toBeInTheDocument();
      expect(screen.getByText('87.3%')).toBeInTheDocument();
      expect(screen.getByText('Avg. Completion Time')).toBeInTheDocument();
      expect(screen.getByText('4.2 min')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('2,847')).toBeInTheDocument();
      expect(screen.getByText('High Risk Alerts')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('renders charts with proper data visualization', () => {
      render(<AnalyticsOverview />);
      
      expect(screen.getByText('Response Trends')).toBeInTheDocument();
      expect(screen.getByText('Risk Level Distribution')).toBeInTheDocument();
      expect(screen.getByText('Mental Health Trends')).toBeInTheDocument();
      
      // Check for chart components
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('displays recent activity and quick actions', () => {
      render(<AnalyticsOverview />);
      
      expect(screen.getByText('Recent Reports')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Weekly Mental Health Summary')).toBeInTheDocument();
      expect(screen.getByText('Create Report')).toBeInTheDocument();
    });

    it('handles time range selection', () => {
      render(<AnalyticsOverview />);
      
      const timeRangeButtons = screen.getAllByRole('button');
      const sixMonthButton = timeRangeButtons.find(button => button.textContent === '6m');
      
      if (sixMonthButton) {
        fireEvent.click(sixMonthButton);
        expect(sixMonthButton).toHaveClass('bg-primary');
      }
    });
  });

  describe('ReportManager', () => {
    it('renders report list with filtering options', () => {
      render(<ReportManager />);
      
      expect(screen.getByText('Report Manager')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search reports...')).toBeInTheDocument();
      expect(screen.getByText('Create New Report')).toBeInTheDocument();
    });

    it('displays report cards with metadata', () => {
      render(<ReportManager />);
      
      expect(screen.getByText('Weekly Mental Health Summary')).toBeInTheDocument();
      expect(screen.getByText('GAD-7 Questionnaire Analysis')).toBeInTheDocument();
      expect(screen.getByText('User Engagement Report')).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
      render(<ReportManager />);
      
      const searchInput = screen.getByPlaceholderText('Search reports...');
      fireEvent.change(searchInput, { target: { value: 'GAD-7' } });
      
      await waitFor(() => {
        expect(screen.getByText('GAD-7 Questionnaire Analysis')).toBeInTheDocument();
      });
    });

    it('filters reports by type and status', async () => {
      render(<ReportManager />);
      
      // Test type filtering
      const typeSelect = screen.getByDisplayValue('All Reports');
      fireEvent.click(typeSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Questionnaire Reports')).toBeInTheDocument();
      });
    });
  });

  describe('ChartGallery', () => {
    it('renders different chart types', () => {
      render(<ChartGallery />);
      
      expect(screen.getByText('Chart Gallery')).toBeInTheDocument();
      expect(screen.getByText('Bar Chart')).toBeInTheDocument();
      expect(screen.getByText('Line Chart')).toBeInTheDocument();
      expect(screen.getByText('Pie Chart')).toBeInTheDocument();
      expect(screen.getByText('Area Chart')).toBeInTheDocument();
      expect(screen.getByText('Radar Chart')).toBeInTheDocument();
      expect(screen.getByText('Scatter Chart')).toBeInTheDocument();
    });

    it('displays chart previews and use cases', () => {
      render(<ChartGallery />);
      
      expect(screen.getByText('Compare values across categories')).toBeInTheDocument();
      expect(screen.getByText('Show trends over time')).toBeInTheDocument();
      expect(screen.getByText('Display proportions of a whole')).toBeInTheDocument();
    });

    it('handles category filtering', () => {
      render(<ChartGallery />);
      
      const comparisonTab = screen.getByText('Comparison');
      fireEvent.click(comparisonTab);
      
      expect(comparisonTab).toHaveAttribute('data-state', 'active');
    });

    it('renders custom chart builder section', () => {
      render(<ChartGallery />);
      
      expect(screen.getByText('Custom Chart Builder')).toBeInTheDocument();
      expect(screen.getByText('1. Select Data Source')).toBeInTheDocument();
      expect(screen.getByText('2. Choose Chart Type')).toBeInTheDocument();
      expect(screen.getByText('3. Configure & Create')).toBeInTheDocument();
    });
  });

  describe('DashboardBuilder', () => {
    it('renders dashboard management interface', () => {
      render(<DashboardBuilder />);
      
      expect(screen.getByText('Dashboard Builder')).toBeInTheDocument();
      expect(screen.getByText('Create Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Quick Start Templates')).toBeInTheDocument();
    });

    it('displays existing dashboards', () => {
      render(<DashboardBuilder />);
      
      expect(screen.getByText('Executive Mental Health Overview')).toBeInTheDocument();
      expect(screen.getByText('GAD-7 Assessment Dashboard')).toBeInTheDocument();
      expect(screen.getByText('User Engagement Analytics')).toBeInTheDocument();
    });

    it('handles dashboard creation', async () => {
      render(<DashboardBuilder />);
      
      const createButton = screen.getByText('Create Dashboard');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(createButton).toHaveTextContent('Creating...');
      });
    });

    it('shows dashboard templates', () => {
      render(<DashboardBuilder />);
      
      expect(screen.getByText('Mental Health Overview')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('User Engagement')).toBeInTheDocument();
    });
  });

  describe('DataExporter', () => {
    it('renders export configuration interface', () => {
      render(<DataExporter />);
      
      expect(screen.getByText('Data Export')).toBeInTheDocument();
      expect(screen.getByText('Export Details')).toBeInTheDocument();
      expect(screen.getByText('Data to Export')).toBeInTheDocument();
      expect(screen.getByText('Export Format')).toBeInTheDocument();
    });

    it('displays export format options', () => {
      render(<DataExporter />);
      
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('Excel')).toBeInTheDocument();
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('JPEG')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    it('shows export history', () => {
      render(<DataExporter />);
      
      const historyTab = screen.getByText('Export History');
      fireEvent.click(historyTab);
      
      expect(screen.getByText('Mental Health Summary Report')).toBeInTheDocument();
      expect(screen.getByText('GAD-7 Response Data')).toBeInTheDocument();
    });

    it('handles export configuration', () => {
      render(<DataExporter />);
      
      const exportNameInput = screen.getByPlaceholderText('Enter export name...');
      fireEvent.change(exportNameInput, { target: { value: 'Test Export' } });
      
      expect(exportNameInput).toHaveValue('Test Export');
    });
  });
});

describe('Analytics Permissions', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user' as const,
    organization_id: 'org-456',
    permissions: []
  };

  const mockResource = {
    id: 'resource-123',
    title: 'Test Report',
    created_by: 'user-123',
    organization_id: 'org-456',
    visibility: 'private' as const,
    shared_with: [],
    tags: []
  };

  it('checks user permissions correctly', () => {
    expect(AnalyticsPermissionManager.hasPermission(mockUser, 'analytics:view')).toBe(true);
    expect(AnalyticsPermissionManager.hasPermission(mockUser, 'analytics:delete')).toBe(false);
  });

  it('validates resource access permissions', () => {
    expect(AnalyticsPermissionManager.canAccessResource(mockUser, mockResource, 'view')).toBe(true);
    expect(AnalyticsPermissionManager.canAccessResource(mockUser, mockResource, 'delete')).toBe(true);
  });

  it('filters accessible resources', () => {
    const resources = [mockResource];
    const accessible = AnalyticsPermissionManager.filterAccessibleResources(mockUser, resources, 'view');
    
    expect(accessible).toHaveLength(1);
    expect(accessible[0].id).toBe('resource-123');
  });

  it('validates export permissions', () => {
    expect(AnalyticsPermissionManager.canExportDataType(mockUser, 'responses')).toBe(true);
    expect(AnalyticsPermissionManager.canExportDataType(mockUser, 'user_personal_data')).toBe(false);
  });

  it('returns allowed export formats', () => {
    const formats = AnalyticsPermissionManager.getAllowedExportFormats(mockUser);
    
    expect(formats).toContain('csv');
    expect(formats).toContain('json');
    expect(formats).toContain('pdf');
    expect(formats).toContain('excel');
  });

  it('calculates data retention period', () => {
    const retentionPeriod = AnalyticsPermissionManager.getDataRetentionPeriod(mockUser);
    expect(retentionPeriod).toBe(30); // 30 days for regular users
  });
});
