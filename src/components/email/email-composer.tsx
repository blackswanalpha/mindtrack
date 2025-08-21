'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Eye, 
  Save, 
  Mail, 
  Users,
  FileText,
  Settings,
  TestTube
} from 'lucide-react';
import { EmailTemplate } from '@/types/database';

interface EmailComposerProps {
  organizationId?: number;
  responseId?: number;
  recipientEmail?: string;
  onEmailSent?: () => void;
}

interface EmailFormData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  text: string;
  template_type?: string;
  variables?: Record<string, any>;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({ 
  organizationId, 
  responseId, 
  recipientEmail,
  onEmailSent 
}) => {
  const [formData, setFormData] = useState<EmailFormData>({
    to: recipientEmail || '',
    subject: '',
    html: '',
    text: ''
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});
  const [previewContent, setPreviewContent] = useState<{ subject: string; html_content: string; text_content: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [availableVariables, setAvailableVariables] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTemplates();
  }, [organizationId]);

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (organizationId) params.append('organization_id', organizationId.toString());
      params.append('include_defaults', 'true');

      const response = await fetch(`/api/email/templates?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (!template) return;

    setSelectedTemplate(template);
    
    // Get template variables
    try {
      const response = await fetch(`/api/email/templates/${templateId}/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableVariables(data.data.template_variables);
        setTemplateVariables(data.data.example_variables);
        
        // Update form with template content
        setFormData(prev => ({
          ...prev,
          subject: template.subject,
          html: template.html_content || '',
          text: template.body,
          template_type: template.type
        }));
      }
    } catch (error) {
      console.error('Error fetching template variables:', error);
    }
  };

  const handlePreview = async () => {
    if (selectedTemplate) {
      // Preview with template
      try {
        const response = await fetch(`/api/email/templates/${selectedTemplate.id}/preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ variables: templateVariables })
        });

        if (response.ok) {
          const data = await response.json();
          setPreviewContent(data.data.preview);
          setIsPreviewOpen(true);
        }
      } catch (error) {
        console.error('Error previewing template:', error);
      }
    } else {
      // Preview custom content
      setPreviewContent({
        subject: formData.subject,
        html_content: formData.html,
        text_content: formData.text
      });
      setIsPreviewOpen(true);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSending(true);

      const emailData = {
        ...formData,
        organization_id: organizationId,
        response_id: responseId
      };

      if (selectedTemplate) {
        emailData.template_type = selectedTemplate.type;
        emailData.variables = templateVariables;
      }

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          to: recipientEmail || '',
          subject: '',
          html: '',
          text: ''
        });
        setSelectedTemplate(null);
        setTemplateVariables({});
        
        if (onEmailSent) {
          onEmailSent();
        }
        
        alert('Email sent successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: formData.to,
          is_test: true
        })
      });

      if (response.ok) {
        alert('Test email sent successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to send test email: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compose Email</h2>
          <p className="text-gray-600">Send emails using templates or custom content</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSendTestEmail} disabled={!formData.to}>
            <TestTube className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending || !formData.to || !formData.subject}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="compose">
            <Mail className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="template">
            <FileText className="h-4 w-4 mr-2" />
            Use Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    type="email"
                    value={formData.cc || ''}
                    onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                    placeholder="cc@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="bcc">BCC</Label>
                  <Input
                    id="bcc"
                    type="email"
                    value={formData.bcc || ''}
                    onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                    placeholder="bcc@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <Label htmlFor="html">HTML Content</Label>
                <Textarea
                  id="html"
                  value={formData.html}
                  onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                  placeholder="Enter HTML email content"
                  rows={10}
                />
              </div>

              <div>
                <Label htmlFor="text">Text Content</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter plain text email content"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Email Template</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <span>{template.name}</span>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="template-to">To *</Label>
                      <Input
                        id="template-to"
                        type="email"
                        value={formData.to}
                        onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-cc">CC</Label>
                      <Input
                        id="template-cc"
                        type="email"
                        value={formData.cc || ''}
                        onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                        placeholder="cc@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-bcc">BCC</Label>
                      <Input
                        id="template-bcc"
                        type="email"
                        value={formData.bcc || ''}
                        onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                        placeholder="bcc@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Template Variables</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {Object.entries(availableVariables).map(([key, config]: [string, any]) => (
                        <div key={key}>
                          <Label htmlFor={`var-${key}`}>
                            {key} {config.required && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id={`var-${key}`}
                            value={templateVariables[key] || ''}
                            onChange={(e) => setTemplateVariables({
                              ...templateVariables,
                              [key]: e.target.value
                            })}
                            placeholder={config.description || `Enter ${key}`}
                          />
                          {config.description && (
                            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          {previewContent && (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <div className="p-3 bg-gray-50 rounded border">{previewContent.subject}</div>
              </div>
              <div>
                <Label>HTML Preview</Label>
                <div 
                  className="p-4 bg-white border rounded max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: previewContent.html_content }}
                />
              </div>
              <div>
                <Label>Text Content</Label>
                <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {previewContent.text_content}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
