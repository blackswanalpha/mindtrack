'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mail,
  Shield,
  Users,
  Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface InvitationData {
  id: number;
  organization: {
    id: number;
    name: string;
  };
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setInvitation(data.data.invitation);
      } else {
        setError(data.error || 'Invitation not found or expired');
      }
    } catch (err) {
      setError('Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }

    try {
      setIsAccepting(true);
      setError(null);

      const authToken = localStorage.getItem('token');
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        
        // Redirect to organization dashboard after a delay
        setTimeout(() => {
          router.push('/organizations');
        }, 2000);
      } else {
        setError(data.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'member':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'viewer':
        return <Eye className="h-5 w-5 text-gray-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Can manage members, questionnaires, and organization settings';
      case 'member':
        return 'Can create and manage questionnaires, view responses';
      case 'viewer':
        return 'Can view organization data and questionnaires (read-only)';
      default:
        return 'Organization member';
    }
  };

  const isExpired = invitation && new Date(invitation.expires_at) < new Date();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-900">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'This invitation is invalid or has expired.'}
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-900">Welcome to {invitation.organization.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                You have successfully joined the organization as a {invitation.role}.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your organization dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle>You're Invited!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {invitation.organization.name}
            </h2>
            <p className="text-gray-600">
              You've been invited to join this organization
            </p>
          </div>

          {/* Invitation Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Invited Email</p>
                <p className="text-sm text-gray-600">{invitation.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {getRoleIcon(invitation.role)}
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {invitation.role} Role
                </p>
                <p className="text-sm text-gray-600">
                  {getRoleDescription(invitation.role)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Expires</p>
                <p className="text-sm text-gray-600">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Email Verification */}
          {isAuthenticated && user && user.email.toLowerCase() !== invitation.email.toLowerCase() && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation is for {invitation.email}, but you're logged in as {user.email}. 
                Please log in with the correct account or contact the organization administrator.
              </AlertDescription>
            </Alert>
          )}

          {/* Expiration Warning */}
          {isExpired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation has expired. Please contact the organization administrator for a new invitation.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!isAuthenticated ? (
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    const returnUrl = encodeURIComponent(window.location.pathname);
                    router.push(`/auth/login?returnUrl=${returnUrl}`);
                  }}
                  className="w-full"
                >
                  Sign In to Accept
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Don't have an account? You'll be able to create one after signing in.
                </p>
              </div>
            ) : isExpired ? (
              <Button disabled className="w-full">
                Invitation Expired
              </Button>
            ) : user && user.email.toLowerCase() !== invitation.email.toLowerCase() ? (
              <Button disabled className="w-full">
                Wrong Account
              </Button>
            ) : (
              <Button
                onClick={acceptInvitation}
                disabled={isAccepting}
                className="w-full flex items-center space-x-2"
              >
                {isAccepting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Accept Invitation</span>
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
