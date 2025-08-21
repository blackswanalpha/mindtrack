'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  Download,
  Share,
  Copy,
  Eye
} from 'lucide-react';
import { AIAnalysis } from '@/types/database';

interface AIAnalysisResultsProps {
  analysis: AIAnalysis;
  questionnaireTitle?: string;
  className?: string;
  showActions?: boolean;
}

export function AIAnalysisResults({ 
  analysis, 
  questionnaireTitle,
  className,
  showActions = true 
}: AIAnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  // Parse risk level from risk assessment
  const getRiskLevel = (riskAssessment?: string) => {
    if (!riskAssessment) return { level: 'unknown', color: 'gray' };
    
    const text = riskAssessment.toLowerCase();
    if (text.includes('critical')) return { level: 'Critical', color: 'red' };
    if (text.includes('high')) return { level: 'High', color: 'orange' };
    if (text.includes('medium') || text.includes('moderate')) return { level: 'Medium', color: 'yellow' };
    if (text.includes('low')) return { level: 'Low', color: 'green' };
    return { level: 'Unknown', color: 'gray' };
  };

  const riskInfo = getRiskLevel(analysis.risk_assessment);

  const handleCopyAnalysis = async () => {
    const analysisText = `
AI Analysis Report
==================
Questionnaire: ${questionnaireTitle || 'Unknown'}
Generated: ${new Date(analysis.created_at).toLocaleString()}
Model: ${analysis.model_used}

ANALYSIS:
${analysis.analysis}

${analysis.recommendations ? `RECOMMENDATIONS:\n${analysis.recommendations}` : ''}

${analysis.risk_assessment ? `RISK ASSESSMENT:\n${analysis.risk_assessment}` : ''}
    `.trim();

    try {
      await navigator.clipboard.writeText(analysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy analysis:', error);
    }
  };

  const handleExportAnalysis = () => {
    const analysisText = `
AI Analysis Report
==================
Questionnaire: ${questionnaireTitle || 'Unknown'}
Generated: ${new Date(analysis.created_at).toLocaleString()}
Model: ${analysis.model_used}
Analysis ID: ${analysis.id}

ANALYSIS:
${analysis.analysis}

${analysis.recommendations ? `RECOMMENDATIONS:\n${analysis.recommendations}` : ''}

${analysis.risk_assessment ? `RISK ASSESSMENT:\n${analysis.risk_assessment}` : ''}
    `.trim();

    const blob = new Blob([analysisText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-${analysis.id}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI Analysis Results
            </CardTitle>
            <CardDescription>
              Analysis for {questionnaireTitle || 'questionnaire response'}
            </CardDescription>
          </div>
          
          {/* Risk Level Badge */}
          {analysis.risk_assessment && (
            <Badge 
              variant={riskInfo.level === 'Critical' || riskInfo.level === 'High' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              {(riskInfo.level === 'Critical' || riskInfo.level === 'High') && (
                <AlertTriangle className="h-3 w-3" />
              )}
              {riskInfo.level === 'Low' && <CheckCircle className="h-3 w-3" />}
              Risk: {riskInfo.level}
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(analysis.created_at).toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {analysis.model_used}
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            ID: {analysis.id}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Analysis Summary</h4>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis.analysis}
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Key Insights</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analysis provides comprehensive mental health assessment based on response patterns
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Professional Review</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Results should be reviewed by qualified mental health professionals
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendations ? (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis.recommendations}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No specific recommendations were generated for this analysis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            {analysis.risk_assessment ? (
              <div>
                <h4 className="font-medium mb-2">Risk Assessment</h4>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis.risk_assessment}
                  </div>
                </div>
                
                {/* Risk Level Alert */}
                {(riskInfo.level === 'Critical' || riskInfo.level === 'High') && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High Risk Detected:</strong> This analysis indicates elevated risk factors. 
                      Immediate professional consultation is recommended.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No specific risk assessment was generated for this analysis.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        {showActions && (
          <>
            <Separator className="my-6" />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAnalysis}
                className="flex items-center gap-2"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied!' : 'Copy Analysis'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAnalysis}
                className="flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                Export Report
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share className="h-3 w-3" />
                Share
              </Button>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace 
            professional medical or psychological advice. Always consult with qualified healthcare providers for 
            proper diagnosis and treatment recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
