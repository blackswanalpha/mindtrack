'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Plus, 
  History, 
  BarChart3, 
  Settings,
  Sparkles
} from 'lucide-react';

import { AIAnalysisRequest, AIAnalysisResults, AIAnalysisHistory } from '@/components/ai-analysis';
import { AIAnalysisWidget } from '@/components/dashboard/ai-analysis-widget';
import { AIAnalysis } from '@/types/database';

export default function AIAnalysisPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAnalysisSelect = (analysis: AIAnalysis) => {
    setSelectedAnalysis(analysis);
    setActiveTab('results');
  };

  const handleAnalysisComplete = (analysis: AIAnalysis) => {
    setSelectedAnalysis(analysis);
    setActiveTab('results');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            AI Analysis Center
          </h1>
          <p className="text-gray-600 mt-2">
            Generate AI-powered insights and mental health assessments from questionnaire responses
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by Gemini AI
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="new-analysis" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Analysis
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Analysis Widget */}
            <div className="lg:col-span-2">
              <AIAnalysisWidget />
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>
                  Common AI analysis tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab('new-analysis')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Analysis
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('history')}
                >
                  <History className="h-4 w-4 mr-2" />
                  View Analysis History
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/ai-analysis/batch">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Batch Analysis
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/ai-analysis/reports">
                    <Brain className="h-4 w-4 mr-2" />
                    Analysis Reports
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Analyses</CardTitle>
              <CardDescription>
                Latest AI-powered assessments and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIAnalysisHistory 
                onAnalysisSelect={handleAnalysisSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Analysis Tab */}
        <TabsContent value="new-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New AI Analysis</CardTitle>
              <CardDescription>
                Select a questionnaire response to analyze with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Response Selection */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4">Select Response to Analyze</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a questionnaire response from the list below to generate AI insights.
                  </p>
                  
                  {/* This would typically be a response selector component */}
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Response Selector</p>
                    <p className="text-sm text-gray-500">
                      Integration with response selection component needed
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href="/responses">Browse Responses</a>
                    </Button>
                  </div>
                </Card>

                {/* Analysis Request Form */}
                <AIAnalysisRequest
                  responseId={1} // This would be dynamic based on selection
                  questionnaireTitle="Sample Questionnaire"
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <AIAnalysisHistory 
            onAnalysisSelect={handleAnalysisSelect}
          />
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {selectedAnalysis ? (
            <AIAnalysisResults 
              analysis={selectedAnalysis}
              questionnaireTitle="Sample Questionnaire"
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Analysis Selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Select an analysis from the history or generate a new one to view results
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setActiveTab('new-analysis')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Analysis
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('history')}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Information */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>• AI analysis powered by Google Gemini</span>
              <span>• Results for professional review only</span>
              <span>• HIPAA compliant processing</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/ai-analysis/help">Learn More</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
