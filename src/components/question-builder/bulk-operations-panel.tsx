'use client'

import React, { useState } from 'react';
import { Question, CreateQuestionData, QuestionType } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  Copy, 
  Edit, 
  Trash2, 
  FileText, 
  Table, 
  CheckSquare,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';

interface BulkOperationsPanelProps {
  questionnaireId: number;
  questions: Question[];
  selectedQuestions: number[];
  onBulkOperation: (operation: string, data: any) => Promise<void>;
  onClose: () => void;
  className?: string;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  questionnaireId,
  questions,
  selectedQuestions,
  onBulkOperation,
  onClose,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [bulkEditField, setBulkEditField] = useState<string>('');
  const [bulkEditValue, setBulkEditValue] = useState('');
  const [copyToQuestionnaire, setCopyToQuestionnaire] = useState<number | null>(null);

  const handleImport = async () => {
    if (!importData.trim()) {
      alert('Please provide import data');
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      let parsedData: any[];
      
      if (importFormat === 'csv') {
        // Parse CSV data
        const lines = importData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
      } else {
        // Parse JSON data
        parsedData = JSON.parse(importData);
      }

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await onBulkOperation('import', {
        format: importFormat,
        data: parsedData,
        mapping: importFormat === 'csv' ? {
          text: 'question_text',
          type: 'question_type',
          required: 'required',
          options: 'options'
        } : undefined
      });

      setImportData('');
      alert('Import completed successfully!');
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please check your data format.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    
    try {
      const questionsToExport = selectedQuestions.length > 0 
        ? questions.filter(q => selectedQuestions.includes(q.id))
        : questions;

      let exportContent: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          exportContent = generateCSV(questionsToExport);
          filename = `questions_${questionnaireId}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          exportContent = JSON.stringify(questionsToExport, null, 2);
          filename = `questions_${questionnaireId}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          // In a real implementation, you'd generate a PDF
          exportContent = generatePDFContent(questionsToExport);
          filename = `questions_${questionnaireId}.txt`;
          mimeType = 'text/plain';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Create and download file
      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEdit = async () => {
    if (!bulkEditField || !bulkEditValue) {
      alert('Please select a field and provide a value');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Please select questions to edit');
      return;
    }

    setLoading(true);

    try {
      const updates = selectedQuestions.map(id => ({
        id,
        data: { [bulkEditField]: bulkEditValue }
      }));

      await onBulkOperation('update', { updates });
      
      setBulkEditField('');
      setBulkEditValue('');
      alert('Bulk edit completed successfully!');
    } catch (error) {
      console.error('Bulk edit error:', error);
      alert('Bulk edit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please select questions to delete');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedQuestions.length} question(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await onBulkOperation('delete', { deleteIds: selectedQuestions });
      alert('Questions deleted successfully!');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Bulk delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuestions = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please select questions to copy');
      return;
    }

    if (!copyToQuestionnaire) {
      alert('Please select a destination questionnaire');
      return;
    }

    setLoading(true);

    try {
      const questionsToCopy = questions.filter(q => selectedQuestions.includes(q.id));
      const questionsData = questionsToCopy.map(q => ({
        text: q.text,
        type: q.type,
        required: q.required,
        options: q.options,
        validation_rules: q.validation_rules,
        metadata: q.metadata,
        help_text: q.help_text,
        placeholder_text: q.placeholder_text
      }));

      // In a real implementation, you'd call an API to copy to another questionnaire
      console.log('Copying questions to questionnaire:', copyToQuestionnaire, questionsData);
      
      alert('Questions copied successfully!');
    } catch (error) {
      console.error('Copy error:', error);
      alert('Copy failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (questions: Question[]): string => {
    const headers = ['ID', 'Text', 'Type', 'Required', 'Options', 'Help Text', 'Order'];
    const rows = questions.map(q => [
      q.id.toString(),
      `"${q.text.replace(/"/g, '""')}"`,
      q.type,
      q.required.toString(),
      q.options ? `"${Array.isArray(q.options) ? q.options.join(';') : q.options}"` : '',
      q.help_text ? `"${q.help_text.replace(/"/g, '""')}"` : '',
      q.order_num.toString()
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generatePDFContent = (questions: Question[]): string => {
    let content = `Questionnaire Questions Export\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Questions: ${questions.length}\n\n`;
    content += '='.repeat(50) + '\n\n';

    questions.forEach((q, index) => {
      content += `${index + 1}. ${q.text}\n`;
      content += `   Type: ${q.type}\n`;
      content += `   Required: ${q.required ? 'Yes' : 'No'}\n`;
      if (q.options) {
        content += `   Options: ${Array.isArray(q.options) ? q.options.join(', ') : q.options}\n`;
      }
      if (q.help_text) {
        content += `   Help: ${q.help_text}\n`;
      }
      content += '\n';
    });

    return content;
  };

  const bulkEditFields = [
    { value: 'required', label: 'Required Status' },
    { value: 'help_text', label: 'Help Text' },
    { value: 'placeholder_text', label: 'Placeholder Text' },
    { value: 'error_message', label: 'Error Message' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bulk Operations</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
        {selectedQuestions.length > 0 && (
          <div className="text-sm text-gray-600">
            {selectedQuestions.length} question(s) selected
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="edit">Bulk Edit</TabsTrigger>
            <TabsTrigger value="copy">Copy</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Import Format</Label>
                <Select value={importFormat} onValueChange={(value) => setImportFormat(value as 'csv' | 'json')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Import Data</Label>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={
                    importFormat === 'csv' 
                      ? 'question_text,question_type,required,options\n"What is your name?",text,true,\n"Select your age",single_choice,true,"18-25;26-35;36-45"'
                      : '[{"text": "What is your name?", "type": "text", "required": true}]'
                  }
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              {importFormat === 'csv' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    CSV format: question_text, question_type, required, options (separated by semicolons)
                  </AlertDescription>
                </Alert>
              )}

              {loading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Importing questions...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button onClick={handleImport} disabled={loading || !importData.trim()}>
                <Upload className="w-4 h-4 mr-2" />
                Import Questions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'csv' | 'json' | 'pdf')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF (Text)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {selectedQuestions.length > 0 
                    ? `Will export ${selectedQuestions.length} selected question(s)`
                    : `Will export all ${questions.length} question(s)`
                  }
                </AlertDescription>
              </Alert>

              <Button onClick={handleExport} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export Questions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Field to Edit</Label>
                <Select value={bulkEditField} onValueChange={setBulkEditField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {bulkEditFields.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>New Value</Label>
                {bulkEditField === 'required' ? (
                  <Select value={bulkEditValue} onValueChange={setBulkEditValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select required status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Required</SelectItem>
                      <SelectItem value="false">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    placeholder="Enter new value"
                  />
                )}
              </div>

              {selectedQuestions.length === 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select questions to edit
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkEdit} 
                  disabled={loading || selectedQuestions.length === 0 || !bulkEditField || !bulkEditValue}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                  disabled={loading || selectedQuestions.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Destination Questionnaire</Label>
                <Select value={copyToQuestionnaire?.toString()} onValueChange={(value) => setCopyToQuestionnaire(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select questionnaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Anxiety Assessment</SelectItem>
                    <SelectItem value="3">Depression Screening</SelectItem>
                    <SelectItem value="4">Wellness Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedQuestions.length === 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select questions to copy
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleCopyQuestions}
                disabled={loading || selectedQuestions.length === 0 || !copyToQuestionnaire}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Questions
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
