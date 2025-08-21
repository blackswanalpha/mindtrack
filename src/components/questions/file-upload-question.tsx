'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types/database';
import { QuestionValidationEngine, ValidationResult } from '@/lib/question-validation-engine';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  File, 
  Image as ImageIcon, 
  X, 
  Download,
  Eye
} from 'lucide-react';

interface FileUploadQuestionProps {
  question: Question;
  value?: File[];
  onChange: (value: File[]) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  disabled?: boolean;
  showValidation?: boolean;
}

export const FileUploadQuestion: React.FC<FileUploadQuestionProps> = ({
  question,
  value = [],
  onChange,
  onValidation,
  disabled = false,
  showValidation = true
}) => {
  const [localValue, setLocalValue] = useState<File[]>(value);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isTouched, setIsTouched] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isTouched) {
      const validationResult = QuestionValidationEngine.validateAnswer(question, localValue);
      setValidation(validationResult);
      onValidation?.(validationResult.isValid, validationResult.errors);
    }
  }, [localValue, question, isTouched, onValidation]);

  useEffect(() => {
    // Generate previews for image files
    if (question.type === 'image_upload') {
      const newPreviews: Record<string, string> = {};
      
      localValue.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews[file.name] = e.target?.result as string;
            setPreviews(prev => ({ ...prev, ...newPreviews }));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, [localValue, question.type]);

  const handleChange = (newFiles: File[]) => {
    setLocalValue(newFiles);
    setIsTouched(true);
    onChange(newFiles);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const maxFiles = question.validation_rules?.max_files || 10;
    
    // Combine with existing files, respecting max limit
    const combinedFiles = [...localValue, ...fileArray].slice(0, maxFiles);
    handleChange(combinedFiles);
    
    // Simulate upload progress
    fileArray.forEach(file => {
      simulateUploadProgress(file.name);
    });
  };

  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
    }, 200);
  };

  const removeFile = (index: number) => {
    const newFiles = localValue.filter((_, i) => i !== index);
    const removedFile = localValue[index];
    
    // Clean up progress and preview
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[removedFile.name];
      return newProgress;
    });
    
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[removedFile.name];
      return newPreviews;
    });
    
    handleChange(newFiles);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const getMaxFileSize = () => {
    return question.validation_rules?.max_file_size;
  };

  const getAllowedFileTypes = () => {
    return question.validation_rules?.allowed_file_types;
  };

  const getMaxFiles = () => {
    return question.validation_rules?.max_files || 10;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const getValidationIcon = () => {
    if (!isTouched) return null;
    
    if (validation.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const canAddMoreFiles = () => {
    return localValue.length < getMaxFiles();
  };

  return (
    <div className="space-y-3">
      {/* Question Label */}
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium leading-relaxed">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {getValidationIcon()}
      </div>

      {/* Help Text */}
      {question.help_text && (
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{question.help_text}</span>
        </div>
      )}

      {/* File Upload Area */}
      {canAddMoreFiles() && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600 mb-2">
            {question.type === 'image_upload' 
              ? 'Click to upload images or drag and drop'
              : 'Click to upload files or drag and drop'
            }
          </div>
          <input
            id="file-input"
            type="file"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={disabled}
            multiple={getMaxFiles() > 1}
            accept={
              question.type === 'image_upload' 
                ? 'image/*' 
                : getAllowedFileTypes()?.join(',')
            }
            className="hidden"
          />
          <Button variant="outline" size="sm" disabled={disabled} asChild>
            <span>Choose Files</span>
          </Button>
        </div>
      )}

      {/* File List */}
      {localValue.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Uploaded Files ({localValue.length}/{getMaxFiles()})
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {localValue.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {question.type === 'image_upload' && previews[file.name] ? (
                    <img
                      src={previews[file.name]}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                    <div className="mt-1">
                      <Progress value={uploadProgress[file.name]} className="h-1" />
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {question.type === 'image_upload' && previews[file.name] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(previews[file.name], '_blank');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Constraints */}
      <div className="flex flex-wrap gap-2">
        {getMaxFileSize() && (
          <Badge variant="outline" className="text-xs">
            Max size: {formatFileSize(getMaxFileSize()!)}
          </Badge>
        )}
        {getAllowedFileTypes() && (
          <Badge variant="outline" className="text-xs">
            Types: {getAllowedFileTypes()!.map(type => type.split('/')[1]).join(', ')}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          Max files: {getMaxFiles()}
        </Badge>
      </div>

      {/* Validation Messages */}
      {showValidation && isTouched && !validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
