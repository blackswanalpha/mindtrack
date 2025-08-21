'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Image, 
  Database,
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  File,
  History
} from 'lucide-react';

// Mock data for export history
const exportHistory = [
  {
    id: '1',
    name: 'Mental Health Summary Report',
    format: 'PDF',
    size: '2.4 MB',
    created_at: '2024-01-20T15:30:00Z',
    status: 'completed',
    download_count: 5,
    expires_at: '2024-02-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'GAD-7 Response Data',
    format: 'CSV',
    size: '856 KB',
    created_at: '2024-01-19T10:15:00Z',
    status: 'completed',
    download_count: 12,
    expires_at: '2024-02-19T10:15:00Z'
  },
  {
    id: '3',
    name: 'User Analytics Dashboard',
    format: 'Excel',
    size: '3.2 MB',
    created_at: '2024-01-18T14:45:00Z',
    status: 'processing',
    download_count: 0,
    expires_at: '2024-02-18T14:45:00Z'
  },
  {
    id: '4',
    name: 'Risk Distribution Chart',
    format: 'PNG',
    size: '1.1 MB',
    created_at: '2024-01-17T09:20:00Z',
    status: 'completed',
    download_count: 8,
    expires_at: '2024-02-17T09:20:00Z'
  }
];

const exportFormats = [
  { 
    value: 'pdf', 
    label: 'PDF', 
    icon: FileText, 
    description: 'Formatted document with charts and tables',
    size: 'Large',
    compatibility: 'Universal'
  },
  { 
    value: 'csv', 
    label: 'CSV', 
    icon: FileSpreadsheet, 
    description: 'Raw data in comma-separated format',
    size: 'Small',
    compatibility: 'Excel, Google Sheets'
  },
  { 
    value: 'excel', 
    label: 'Excel', 
    icon: FileSpreadsheet, 
    description: 'Formatted spreadsheet with multiple sheets',
    size: 'Medium',
    compatibility: 'Microsoft Excel'
  },
  { 
    value: 'png', 
    label: 'PNG', 
    icon: FileImage, 
    description: 'High-quality image format',
    size: 'Medium',
    compatibility: 'All image viewers'
  },
  { 
    value: 'jpeg', 
    label: 'JPEG', 
    icon: FileImage, 
    description: 'Compressed image format',
    size: 'Small',
    compatibility: 'All image viewers'
  },
  { 
    value: 'json', 
    label: 'JSON', 
    icon: File, 
    description: 'Structured data format',
    size: 'Small',
    compatibility: 'APIs, Databases'
  }
];

const dataTypes = [
  { id: 'responses', label: 'Questionnaire Responses', description: 'All response data with scores' },
  { id: 'users', label: 'User Analytics', description: 'User activity and engagement metrics' },
  { id: 'scores', label: 'Scoring Data', description: 'Calculated scores and risk assessments' },
  { id: 'reports', label: 'Generated Reports', description: 'Previously created reports and analyses' },
  { id: 'dashboards', label: 'Dashboard Data', description: 'Dashboard configurations and data' }
];

interface DataExporterProps {}

export function DataExporter({}: DataExporterProps) {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['responses']);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [isExporting, setIsExporting] = useState(false);
  const [exportName, setExportName] = useState('');

  const handleDataTypeChange = (dataTypeId: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes(prev => [...prev, dataTypeId]);
    } else {
      setSelectedDataTypes(prev => prev.filter(id => id !== dataTypeId));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsExporting(false);
    // In a real app, this would trigger the actual export
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFormatIcon = (format: string) => {
    const formatConfig = exportFormats.find(f => f.value === format.toLowerCase());
    if (!formatConfig) return File;
    return formatConfig.icon;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedFormatConfig = exportFormats.find(f => f.value === selectedFormat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Export</h2>
          <p className="text-gray-600">Export your analytics data in various formats</p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList>
          <TabsTrigger value="export">New Export</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Export Name */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Details</CardTitle>
                  <CardDescription>Configure your export settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="export-name">Export Name</Label>
                    <Input
                      id="export-name"
                      placeholder="Enter export name..."
                      value={exportName}
                      onChange={(e) => setExportName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_7_days">Last 7 days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 days</SelectItem>
                        <SelectItem value="last_90_days">Last 90 days</SelectItem>
                        <SelectItem value="last_year">Last year</SelectItem>
                        <SelectItem value="all_time">All time</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Data to Export</CardTitle>
                  <CardDescription>Select the types of data to include</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataTypes.map((dataType) => (
                      <div key={dataType.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={dataType.id}
                          checked={selectedDataTypes.includes(dataType.id)}
                          onCheckedChange={(checked) => 
                            handleDataTypeChange(dataType.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label htmlFor={dataType.id} className="font-medium">
                            {dataType.label}
                          </Label>
                          <p className="text-sm text-gray-600">{dataType.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Format</CardTitle>
                  <CardDescription>Choose the output format for your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {exportFormats.map((format) => {
                      const IconComponent = format.icon;
                      const isSelected = selectedFormat === format.value;
                      
                      return (
                        <div
                          key={format.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedFormat(format.value)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-blue-500' : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                isSelected ? 'text-white' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{format.label}</h4>
                              <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {format.size}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {format.compatibility}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Preview & Actions */}
            <div className="space-y-6">
              {/* Export Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">{selectedFormatConfig?.label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Data types:</span>
                      <span className="font-medium">{selectedDataTypes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date range:</span>
                      <span className="font-medium">{dateRange.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Est. size:</span>
                      <span className="font-medium">{selectedFormatConfig?.size}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleExport}
                    disabled={isExporting || selectedDataTypes.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Start Export'}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Exports</CardTitle>
                  <CardDescription>Common export configurations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Weekly Report (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Response Data (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileImage className="w-4 h-4 mr-2" />
                    Charts (PNG)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>View and download your previous exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportHistory.map((export_item) => {
                  const FormatIcon = getFormatIcon(export_item.format);
                  
                  return (
                    <div key={export_item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FormatIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{export_item.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatDate(export_item.created_at)}</span>
                            <span>{export_item.size}</span>
                            <span>{export_item.download_count} downloads</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusIcon(export_item.status)}
                        <Badge variant="outline">{export_item.format}</Badge>
                        {export_item.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
