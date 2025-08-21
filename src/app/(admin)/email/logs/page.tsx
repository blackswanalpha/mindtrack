'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MousePointer
} from 'lucide-react';
import { EmailLog } from '@/types/database';

interface EmailLogWithDetails extends EmailLog {
  template_name?: string;
  sent_by_name?: string;
  organization_name?: string;
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7d');
  const [selectedLog, setSelectedLog] = useState<EmailLogWithDetails | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchEmailLogs();
  }, [statusFilter, dateFilter, pagination.offset]);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('recipient', searchTerm);
      }

      // Calculate date range
      if (dateFilter !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (dateFilter) {
          case '1d':
            startDate.setDate(endDate.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        }

        params.append('date_from', startDate.toISOString().split('T')[0]);
        params.append('date_to', endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/email/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data.logs);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          hasMore: data.data.pagination.has_more
        }));
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchEmailLogs();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        limit: '1000',
        offset: '0'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/email/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const csv = convertToCSV(data.data.logs);
        downloadCSV(csv, 'email-logs.csv');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const convertToCSV = (data: EmailLogWithDetails[]) => {
    const headers = ['Date', 'Recipient', 'Subject', 'Status', 'Template', 'Sent By', 'Organization'];
    const rows = data.map(log => [
      new Date(log.sent_at).toLocaleString(),
      log.recipient,
      log.subject,
      log.status,
      log.template_name || 'Custom',
      log.sent_by_name || 'System',
      log.organization_name || 'N/A'
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'bounced':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'bounced':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const openLogDetail = (log: EmailLogWithDetails) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const filteredLogs = logs.filter(log =>
    log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Logs</h1>
          <p className="text-gray-600">View and analyze email sending history</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by recipient or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs ({pagination.total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading email logs...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.sent_at).toLocaleDateString()} <br />
                        <span className="text-xs text-gray-500">
                          {new Date(log.sent_at).toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.recipient}</div>
                          {log.organization_name && (
                            <div className="text-xs text-gray-500">{log.organization_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.subject}>
                          {log.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.template_name || 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <Badge variant={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {log.opened_at && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Opened
                            </Badge>
                          )}
                          {log.clicked_at && (
                            <Badge variant="secondary" className="text-xs">
                              <MousePointer className="h-3 w-3 mr-1" />
                              Clicked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLogDetail(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.offset === 0}
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipient</Label>
                  <div className="font-medium">{selectedLog.recipient}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedLog.status)}
                    <Badge variant={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Sent At</Label>
                  <div>{new Date(selectedLog.sent_at).toLocaleString()}</div>
                </div>
                <div>
                  <Label>Template</Label>
                  <div>{selectedLog.template_name || 'Custom Email'}</div>
                </div>
              </div>

              {/* Tracking Info */}
              {(selectedLog.opened_at || selectedLog.clicked_at || selectedLog.bounced_at) && (
                <div>
                  <Label>Tracking Information</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {selectedLog.opened_at && (
                      <div className="p-3 bg-green-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Opened</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(selectedLog.opened_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedLog.clicked_at && (
                      <div className="p-3 bg-blue-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <MousePointer className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Clicked</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(selectedLog.clicked_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedLog.bounced_at && (
                      <div className="p-3 bg-yellow-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Bounced</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(selectedLog.bounced_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subject */}
              <div>
                <Label>Subject</Label>
                <div className="p-3 bg-gray-50 rounded border mt-1">{selectedLog.subject}</div>
              </div>

              {/* Email Content */}
              <div>
                <Label>Email Content</Label>
                <div className="mt-2">
                  {selectedLog.html_body ? (
                    <div 
                      className="p-4 bg-white border rounded max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: selectedLog.html_body }}
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 border rounded max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {selectedLog.body}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Info */}
              {selectedLog.error && (
                <div>
                  <Label>Error Details</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded mt-1 text-red-800">
                    {selectedLog.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
