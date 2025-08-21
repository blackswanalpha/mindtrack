'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Settings,
  Clock,
  Mail,
  Users,
  FileText
} from 'lucide-react';

interface EmailAutomation {
  id: number;
  trigger_type: string;
  template_type: string;
  is_active: boolean;
  delay_minutes: number;
  conditions?: Record<string, any>;
  organization_id?: number;
  questionnaire_id?: number;
  created_by_name: string;
  organization_name?: string;
  questionnaire_title?: string;
  created_at: string;
  updated_at: string;
}

interface AutomationFormData {
  trigger_type: string;
  template_type: string;
  is_active: boolean;
  delay_minutes: number;
  conditions: string;
  organization_id?: number;
  questionnaire_id?: number;
}

export default function EmailAutomationsPage() {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(null);
  const [formData, setFormData] = useState<AutomationFormData>({
    trigger_type: '',
    template_type: '',
    is_active: true,
    delay_minutes: 0,
    conditions: '{}',
    organization_id: undefined,
    questionnaire_id: undefined
  });

  const triggerTypes = [
    { value: 'questionnaire_completed', label: 'Questionnaire Completed' },
    { value: 'assessment_results_ready', label: 'Assessment Results Ready' },
    { value: 'follow_up_reminder', label: 'Follow-up Reminder' },
    { value: 'incomplete_response_reminder', label: 'Incomplete Response Reminder' },
    { value: 'user_registered', label: 'User Registered' },
    { value: 'organization_invitation', label: 'Organization Invitation' }
  ];

  const templateTypes = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'email_verification', label: 'Email Verification' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'questionnaire_invitation', label: 'Questionnaire Invitation' },
    { value: 'questionnaire_reminder', label: 'Questionnaire Reminder' },
    { value: 'assessment_completion', label: 'Assessment Completion' },
    { value: 'assessment_results', label: 'Assessment Results' },
    { value: 'ai_analysis_report', label: 'AI Analysis Report' },
    { value: 'organization_invitation', label: 'Organization Invitation' },
    { value: 'role_change', label: 'Role Change' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'bulk_communication', label: 'Bulk Communication' }
  ];

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/automations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAutomations(data.data.automations);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    try {
      const payload = {
        ...formData,
        conditions: formData.conditions ? JSON.parse(formData.conditions) : undefined
      };

      const response = await fetch('/api/email/automations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAutomations();
      }
    } catch (error) {
      console.error('Error creating automation:', error);
    }
  };

  const handleEditAutomation = async () => {
    if (!selectedAutomation) return;

    try {
      const payload = {
        id: selectedAutomation.id,
        ...formData,
        conditions: formData.conditions ? JSON.parse(formData.conditions) : undefined
      };

      const response = await fetch('/api/email/automations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedAutomation(null);
        resetForm();
        fetchAutomations();
      }
    } catch (error) {
      console.error('Error updating automation:', error);
    }
  };

  const handleToggleAutomation = async (automation: EmailAutomation) => {
    try {
      const response = await fetch('/api/email/automations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: automation.id,
          is_active: !automation.is_active
        })
      });

      if (response.ok) {
        fetchAutomations();
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      trigger_type: '',
      template_type: '',
      is_active: true,
      delay_minutes: 0,
      conditions: '{}',
      organization_id: undefined,
      questionnaire_id: undefined
    });
  };

  const openEditDialog = (automation: EmailAutomation) => {
    setSelectedAutomation(automation);
    setFormData({
      trigger_type: automation.trigger_type,
      template_type: automation.template_type,
      is_active: automation.is_active,
      delay_minutes: automation.delay_minutes,
      conditions: automation.conditions ? JSON.stringify(automation.conditions, null, 2) : '{}',
      organization_id: automation.organization_id,
      questionnaire_id: automation.questionnaire_id
    });
    setIsEditDialogOpen(true);
  };

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return 'Immediate';
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Automations</h1>
          <p className="text-gray-600">Manage automated email triggers and workflows</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Automation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trigger">Trigger Type</Label>
                  <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(trigger => (
                        <SelectItem key={trigger.value} value={trigger.value}>{trigger.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template">Template Type</Label>
                  <Select value={formData.template_type} onValueChange={(value) => setFormData({ ...formData, template_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map(template => (
                        <SelectItem key={template.value} value={template.value}>{template.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delay">Delay (minutes)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="0"
                    max="10080"
                    value={formData.delay_minutes}
                    onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) || 0 })}
                    placeholder="0 for immediate"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="conditions">Conditions (JSON)</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder='{"min_score": 10, "risk_level": "high"}'
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional conditions in JSON format (e.g., score thresholds, risk levels)
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAutomation}>
                  Create Automation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Automations</p>
                <p className="text-2xl font-bold">{automations.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold">{automations.filter(a => a.is_active).length}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{automations.filter(a => a.delay_minutes > 0).length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Used</p>
                <p className="text-2xl font-bold">{new Set(automations.map(a => a.template_type)).size}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Automations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading automations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Delay</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {triggerTypes.find(t => t.value === automation.trigger_type)?.label || automation.trigger_type}
                        </div>
                        {automation.questionnaire_title && (
                          <div className="text-xs text-gray-500">{automation.questionnaire_title}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {templateTypes.find(t => t.value === automation.template_type)?.label || automation.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatDelay(automation.delay_minutes)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {automation.organization_name || 'All Organizations'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={automation.is_active ? "default" : "secondary"}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAutomation(automation)}
                        >
                          {automation.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{automation.created_by_name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(automation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this automation?')) {
                              // Handle delete
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Automation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-trigger">Trigger Type</Label>
                <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(trigger => (
                      <SelectItem key={trigger.value} value={trigger.value}>{trigger.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-template">Template Type</Label>
                <Select value={formData.template_type} onValueChange={(value) => setFormData({ ...formData, template_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map(template => (
                      <SelectItem key={template.value} value={template.value}>{template.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-delay">Delay (minutes)</Label>
                <Input
                  id="edit-delay"
                  type="number"
                  min="0"
                  max="10080"
                  value={formData.delay_minutes}
                  onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-conditions">Conditions (JSON)</Label>
              <Textarea
                id="edit-conditions"
                value={formData.conditions}
                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAutomation}>
                Update Automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
