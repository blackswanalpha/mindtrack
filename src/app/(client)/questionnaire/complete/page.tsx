'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  XCircle,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Share2,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionData {
  score: number;
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe';
  questionnaireName: string;
  completedAt: string;
}

const riskLevelConfig = {
  minimal: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Minimal Anxiety',
    description: 'Your responses suggest minimal anxiety symptoms.',
    recommendations: [
      'Continue with your current self-care practices',
      'Maintain regular exercise and healthy sleep habits',
      'Consider mindfulness or relaxation techniques',
      'Monitor your mental health regularly'
    ]
  },
  mild: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'Mild Anxiety',
    description: 'Your responses suggest mild anxiety symptoms that may benefit from attention.',
    recommendations: [
      'Consider speaking with a healthcare provider',
      'Practice stress management techniques',
      'Maintain regular exercise and good sleep hygiene',
      'Consider counseling or therapy if symptoms persist',
      'Monitor your symptoms over time'
    ]
  },
  moderate: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Moderate Anxiety',
    description: 'Your responses suggest moderate anxiety symptoms that warrant professional attention.',
    recommendations: [
      'Schedule an appointment with a healthcare provider',
      'Consider professional counseling or therapy',
      'Discuss treatment options with a mental health professional',
      'Practice daily stress management techniques',
      'Reach out to trusted friends or family for support'
    ]
  },
  severe: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Severe Anxiety',
    description: 'Your responses suggest severe anxiety symptoms that require immediate professional attention.',
    recommendations: [
      'Contact a healthcare provider as soon as possible',
      'Consider seeking immediate professional help',
      'Reach out to a mental health crisis line if needed',
      'Don\'t hesitate to go to an emergency room if you feel unsafe',
      'Inform trusted friends or family about your situation'
    ]
  }
};

const crisisResources = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 crisis support'
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: '24/7 text-based crisis support'
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service'
  }
];

export default function CompletionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);

  useEffect(() => {
    const score = searchParams.get('score');
    const risk = searchParams.get('risk');
    
    if (score && risk) {
      setCompletionData({
        score: parseInt(score),
        riskLevel: risk as CompletionData['riskLevel'],
        questionnaireName: 'GAD-7 Anxiety Assessment',
        completedAt: new Date().toISOString()
      });
    }
  }, [searchParams]);

  const handleDownloadResults = () => {
    if (!completionData) return;

    const config = riskLevelConfig[completionData.riskLevel];
    const resultsText = `
${completionData.questionnaireName} Results
Completed: ${new Date(completionData.completedAt).toLocaleDateString()}

Score: ${completionData.score}
Risk Level: ${config.title}

${config.description}

Recommendations:
${config.recommendations.map(rec => `• ${rec}`).join('\n')}

Important: This assessment is for informational purposes only and should not replace professional medical advice.
    `.trim();

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anxiety-assessment-results-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = async () => {
    if (!completionData) return;

    const config = riskLevelConfig[completionData.riskLevel];
    const shareText = `I completed the ${completionData.questionnaireName} and received a score of ${completionData.score} (${config.title}). Taking care of my mental health is important to me.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mental Health Assessment Results',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  if (!completionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = riskLevelConfig[completionData.riskLevel];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MindTrack</h1>
              <p className="text-gray-600">Assessment Complete</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Thank You Message */}
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully completed the {completionData.questionnaireName}.
            </p>
            <p className="text-sm text-gray-500">
              Completed on {new Date(completionData.completedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={cn("mb-8", config.bgColor, config.borderColor)}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <IconComponent className={cn("w-6 h-6", config.color)} />
              <div>
                <CardTitle className="text-xl">{config.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Score: {completionData.score}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{config.description}</p>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommendations:</h4>
              <ul className="space-y-2">
                {config.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Crisis Resources (for moderate/severe) */}
        {(completionData.riskLevel === 'moderate' || completionData.riskLevel === 'severe') && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Crisis Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                If you are experiencing a mental health crisis or having thoughts of self-harm, 
                please reach out for immediate help:
              </p>
              <div className="space-y-3">
                {crisisResources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <h4 className="font-medium text-gray-900">{resource.name}</h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium text-gray-900">{resource.phone}</p>
                      <Button variant="outline" size="sm" className="mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Professional Support</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Schedule an appointment with your healthcare provider
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Consider online therapy platforms
                  </p>
                  <p className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    Find local mental health resources
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Self-Care Resources</h4>
                <div className="space-y-2 text-sm">
                  <p>• Mindfulness and meditation apps</p>
                  <p>• Regular exercise and physical activity</p>
                  <p>• Maintain healthy sleep habits</p>
                  <p>• Connect with supportive friends and family</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleDownloadResults} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Results
              </Button>
              <Button variant="outline" onClick={handleShareResults} className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share (Anonymous)
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-sm text-gray-500 max-w-2xl mx-auto">
          <p className="mb-2">
            <strong>Important Disclaimer:</strong> This assessment is for informational purposes only 
            and should not replace professional medical advice, diagnosis, or treatment.
          </p>
          <p>
            Always seek the advice of qualified healthcare providers with any questions you may have 
            regarding your mental health or medical condition.
          </p>
        </div>
      </div>
    </div>
  );
}
