'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Clock, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Mail,
  Flag,
  Eye,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Answer {
  id: number;
  question_id: number;
  question_text: string;
  question_type: string;
  value: string;
  question_order: number;
}

export interface ResponseDetail {
  id: number;
  questionnaire_id: number;
  questionnaire_title: string;
  questionnaire_description?: string;
  patient_identifier?: string;
  patient_name?: string;
  patient_email?: string;
  patient_age?: number;
  patient_gender?: string;
  score?: number;
  risk_level?: string;
  flagged_for_review: boolean;
  completion_time?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  answers: Answer[];
  organization_id?: number;
}

export interface ResponseDetailProps {
  response: ResponseDetail;
  onFlag?: (id: number, flagged: boolean) => void;
  onSendEmail?: (email: string) => void;
  onExport?: (response: ResponseDetail) => void;
  onViewQuestionnaire?: (questionnaireId: number) => void;
  className?: string;
}

export const ResponseDetailComponent: React.FC<ResponseDetailProps> = ({
  response,
  onFlag,
  onSendEmail,
  onExport,
  onViewQuestionnaire,
  className
}) => {
  const getRiskLevelConfig = (riskLevel?: string) => {
    const configs = {
      minimal: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        title: 'Minimal Risk',
        description: 'Low risk level - routine monitoring recommended'
      },
      mild: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: AlertTriangle,
        title: 'Mild Risk',
        description: 'Mild symptoms present - consider follow-up'
      },
      moderate: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: AlertTriangle,
        title: 'Moderate Risk',
        description: 'Moderate symptoms - professional consultation recommended'
      },
      severe: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        title: 'Severe Risk',
        description: 'High risk level - immediate attention required'
      }
    };
    
    return configs[riskLevel as keyof typeof configs] || configs.minimal;
  };

  const formatCompletionTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderAnswerValue = (answer: Answer) => {
    switch (answer.question_type) {
      case 'multiple_choice':
        try {
          const values = JSON.parse(answer.value);
          if (Array.isArray(values)) {
            return (
              <div className="flex flex-wrap gap-1">
                {values.map((value, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
            );
          }
        } catch {
          // Fall through to default case
        }
        return <span className="text-gray-900">{answer.value}</span>;
      
      case 'boolean':
        return (
          <Badge variant={answer.value === 'true' ? 'default' : 'secondary'}>
            {answer.value === 'true' ? 'Yes' : 'No'}
          </Badge>
        );
      
      case 'rating':
        const rating = parseInt(answer.value) || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-900">{answer.value}</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    i < rating ? "bg-yellow-400" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        );
      
      case 'slider':
        return (
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium">{answer.value}</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(parseInt(answer.value) || 0)}%` }}
              />
            </div>
          </div>
        );
      
      default:
        return <span className="text-gray-900">{answer.value}</span>;
    }
  };

  const riskConfig = getRiskLevelConfig(response.risk_level);
  const RiskIcon = riskConfig.icon;

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                Response #{response.id}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {response.questionnaire_title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {response.flagged_for_review && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  Flagged
                </Badge>
              )}
              {onFlag && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFlag(response.id, !response.flagged_for_review)}
                  className={cn(
                    "flex items-center gap-2",
                    response.flagged_for_review && "text-red-600 hover:text-red-700"
                  )}
                >
                  <Flag className="w-4 h-4" />
                  {response.flagged_for_review ? 'Unflag' : 'Flag'}
                </Button>
              )}
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(response)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Assessment */}
          {response.risk_level && (
            <Card className={cn("border-2", riskConfig.color.split(' ')[2])}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RiskIcon className={cn("w-6 h-6", riskConfig.color.split(' ')[1])} />
                  <div>
                    <CardTitle className="text-lg">{riskConfig.title}</CardTitle>
                    {response.score !== undefined && (
                      <p className="text-sm text-gray-600">Score: {response.score}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{riskConfig.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Answers */}
          <Card>
            <CardHeader>
              <CardTitle>Responses ({response.answers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {response.answers
                  .sort((a, b) => a.question_order - b.question_order)
                  .map((answer, index) => (
                    <div key={answer.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {answer.question_text}
                          </h4>
                          <div className="pl-4 border-l-2 border-gray-100">
                            {renderAnswerValue(answer)}
                          </div>
                        </div>
                      </div>
                      {index < response.answers.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">
                  {response.patient_name || 'Anonymous'}
                </p>
              </div>
              
              {response.patient_identifier && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-gray-900 font-mono text-sm">
                    {response.patient_identifier}
                  </p>
                </div>
              )}
              
              {response.patient_email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 text-sm">
                      {response.patient_email}
                    </p>
                    {onSendEmail && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSendEmail(response.patient_email!)}
                        className="p-1 h-auto"
                      >
                        <Mail className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                {response.patient_age && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <p className="text-gray-900">{response.patient_age}</p>
                  </div>
                )}
                
                {response.patient_gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900 capitalize">{response.patient_gender}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Response Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Submitted:</span>
                <span>{new Date(response.created_at).toLocaleDateString()}</span>
              </div>

              {response.completed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Completed:</span>
                  <span>{new Date(response.completed_at).toLocaleDateString()}</span>
                </div>
              )}
              
              {response.completion_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Duration:</span>
                  <span>{formatCompletionTime(response.completion_time)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Answers:</span>
                <span>{response.answers.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onViewQuestionnaire && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onViewQuestionnaire(response.questionnaire_id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Questionnaire
                </Button>
              )}
              
              {response.patient_email && onSendEmail && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onSendEmail(response.patient_email!)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              )}
              
              {onExport && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onExport(response)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Response
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
