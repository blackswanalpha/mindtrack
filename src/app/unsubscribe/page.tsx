'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const organizationId = searchParams.get('org');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      checkUnsubscribeStatus(decodeURIComponent(emailParam));
    }
  }, [emailParam]);

  const checkUnsubscribeStatus = async (emailAddress: string) => {
    try {
      const params = new URLSearchParams({ email: emailAddress });
      if (organizationId) params.append('org', organizationId);

      const response = await fetch(`/api/email/unsubscribe?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIsUnsubscribed(data.data.is_unsubscribed);
      }
    } catch (error) {
      console.error('Error checking unsubscribe status:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          reason: reason === 'other' ? customReason : reason,
          organization_id: organizationId ? parseInt(organizationId) : undefined
        })
      });

      if (response.ok) {
        setSuccess(true);
        setIsUnsubscribed(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      setError('An error occurred while unsubscribing');
    } finally {
      setIsLoading(false);
    }
  };

  const reasonOptions = [
    { value: 'too_frequent', label: 'Emails are too frequent' },
    { value: 'not_relevant', label: 'Content is not relevant to me' },
    { value: 'never_signed_up', label: 'I never signed up for these emails' },
    { value: 'privacy_concerns', label: 'Privacy concerns' },
    { value: 'technical_issues', label: 'Technical issues with emails' },
    { value: 'other', label: 'Other reason' }
  ];

  if (success || isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  {success ? 'Successfully Unsubscribed' : 'Already Unsubscribed'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {email} has been unsubscribed from MindTrack email notifications.
                </p>
                <div className="mt-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You will no longer receive marketing emails from us. However, you may still receive 
                      important account-related notifications and transactional emails.
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.href = process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com'}
                    className="w-full"
                  >
                    Return to MindTrack
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Unsubscribe from Emails
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry to see you go. You can unsubscribe from our email notifications below.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unsubscribe Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={!!emailParam}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason for unsubscribing (optional)</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reason === 'other' && (
              <div>
                <Label htmlFor="custom-reason">Please specify</Label>
                <Textarea
                  id="custom-reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Tell us why you're unsubscribing"
                  rows={3}
                />
              </div>
            )}

            <Button 
              onClick={handleUnsubscribe} 
              disabled={isLoading || !email}
              className="w-full"
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Changed your mind?{' '}
                <a 
                  href={process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com'}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Return to MindTrack
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By unsubscribing, you will no longer receive marketing emails from MindTrack. 
            You may still receive important account-related notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
