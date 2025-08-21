'use client'

import React, { useState } from 'react';
import { useVersionControl } from '@/hooks/use-questionnaires';
import { QuestionnaireVersion } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  History, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  User, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VersionControlProps {
  questionnaireId: number;
  onVersionRestored?: (newVersion: number) => void;
  className?: string;
}

export const VersionControl: React.FC<VersionControlProps> = ({
  questionnaireId,
  onVersionRestored,
  className
}) => {
  const { versions, currentVersion, loading, error, restoreVersion } = useVersionControl(questionnaireId);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  const handleRestoreVersion = async (versionNumber: number) => {
    if (versionNumber === currentVersion) return;

    const confirmed = window.confirm(
      `Are you sure you want to restore to version ${versionNumber}? This will create a new version with the restored content.`
    );

    if (!confirmed) return;

    setRestoringVersion(versionNumber);
    const success = await restoreVersion(versionNumber);
    setRestoringVersion(null);

    if (success && onVersionRestored) {
      onVersionRestored(currentVersion + 1);
    }
  };

  const getVersionBadgeVariant = (version: QuestionnaireVersion) => {
    if (version.version_number === currentVersion) {
      return 'default';
    }
    return 'outline';
  };

  const getVersionBadgeText = (version: QuestionnaireVersion) => {
    if (version.version_number === currentVersion) {
      return 'Current';
    }
    return `v${version.version_number}`;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Error loading version history: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Version History
        </CardTitle>
        <p className="text-sm text-gray-600">
          Track changes and restore previous versions of your questionnaire
        </p>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading version history...
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No version history</h3>
            <p>Version history will appear here as you make changes to your questionnaire.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id}>
                <div className="flex items-start gap-4">
                  {/* Version indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      version.version_number === currentVersion 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                    }`} />
                    {index < versions.length - 1 && (
                      <div className="w-px h-16 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Version content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getVersionBadgeVariant(version)}>
                          {getVersionBadgeText(version)}
                        </Badge>
                        {version.version_number === currentVersion && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      {version.version_number !== currentVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.version_number)}
                          disabled={restoringVersion !== null}
                          className="flex items-center gap-1"
                        >
                          {restoringVersion === version.version_number ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          Restore
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {version.title}
                      </h4>
                      
                      {version.change_summary && (
                        <p className="text-sm text-gray-600">
                          {version.change_summary}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.created_by_name || 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {version.type} • {version.category || 'No category'}
                        </div>
                      </div>

                      {/* Version details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <div className="mt-1">
                            <Badge variant={version.is_active ? 'default' : 'secondary'} className="text-xs">
                              {version.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Access:</span>
                          <div className="mt-1">
                            <Badge variant={version.is_public ? 'outline' : 'secondary'} className="text-xs">
                              {version.is_public ? 'Public' : 'Private'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Anonymous:</span>
                          <div className="mt-1">
                            <Badge variant={version.allow_anonymous ? 'outline' : 'secondary'} className="text-xs">
                              {version.allow_anonymous ? 'Allowed' : 'Not Allowed'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Time:</span>
                          <div className="mt-1 text-gray-600">
                            {version.estimated_time ? `${version.estimated_time} min` : 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {index < versions.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {versions.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <History className="w-4 h-4" />
              <span className="font-medium">Version Summary</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Versions:</span>
                <div className="font-medium text-blue-900">{versions.length}</div>
              </div>
              <div>
                <span className="text-blue-700">Current Version:</span>
                <div className="font-medium text-blue-900">v{currentVersion}</div>
              </div>
              <div>
                <span className="text-blue-700">Last Updated:</span>
                <div className="font-medium text-blue-900">
                  {versions.length > 0 && formatDistanceToNow(new Date(versions[0].created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
