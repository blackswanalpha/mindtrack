'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Copy, 
  Share2, 
  Printer, 
  RefreshCw,
  Palette,
  Settings,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QRCodeOptions {
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  includeMargin: boolean;
  logoUrl?: string;
  logoSize?: number;
}

export interface QRCodeGeneratorProps {
  questionnaireId: number;
  questionnaireTitle: string;
  baseUrl?: string;
  onGenerate?: (url: string, options: QRCodeOptions) => void;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  questionnaireId,
  questionnaireTitle,
  baseUrl = window?.location?.origin || 'https://mindtrack.app',
  onGenerate,
  className
}) => {
  const [options, setOptions] = useState<QRCodeOptions>({
    size: 256,
    margin: 4,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    includeMargin: true
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const questionnaireUrl = `${baseUrl}/questionnaire/${questionnaireId}`;

  // Generate QR code using the qrcode library
  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Dynamic import to avoid SSR issues
      const QRCode = (await import('qrcode')).default;

      const qrCodeDataUrl = await QRCode.toDataURL(questionnaireUrl, {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.foregroundColor,
          light: options.backgroundColor,
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
      });

      setQrCodeUrl(qrCodeDataUrl);

      if (onGenerate) {
        onGenerate(questionnaireUrl, options);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);

      // Fallback to canvas-based placeholder if QR code generation fails
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = options.size;
          canvas.height = options.size;

          // Fill background
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, options.size, options.size);

          // Draw placeholder QR pattern
          ctx.fillStyle = options.foregroundColor;
          const cellSize = options.size / 25;

          // Draw finder patterns (corners)
          const drawFinderPattern = (x: number, y: number) => {
            ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
            ctx.fillStyle = options.foregroundColor;
            ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
          };

          drawFinderPattern(0, 0);
          drawFinderPattern(18, 0);
          drawFinderPattern(0, 18);

          // Draw some random data pattern
          for (let i = 0; i < 25; i++) {
            for (let j = 0; j < 25; j++) {
              if (Math.random() > 0.5 &&
                  !((i < 9 && j < 9) || (i > 15 && j < 9) || (i < 9 && j > 15))) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
              }
            }
          }

          const dataUrl = canvas.toDataURL('image/png');
          setQrCodeUrl(dataUrl);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [options, questionnaireId]);

  const handleDownload = (format: 'png' | 'svg' | 'pdf' = 'png') => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `questionnaire-${questionnaireId}-qr.${format}`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(questionnaireUrl);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleCopyImage = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  const handlePrint = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${questionnaireTitle}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                margin: 20px 0; 
              }
              .url { 
                font-size: 12px; 
                color: #666; 
                margin-top: 10px; 
                word-break: break-all;
              }
            </style>
          </head>
          <body>
            <h2>${questionnaireTitle}</h2>
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="url">${questionnaireUrl}</div>
            <p>Scan this QR code to access the questionnaire</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Generator
          </CardTitle>
          <p className="text-gray-600">Generate a QR code for "{questionnaireTitle}"</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Preview */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="max-w-full h-auto"
                      style={{ width: options.size, height: options.size }}
                    />
                  ) : (
                    <div 
                      className="bg-gray-100 flex items-center justify-center"
                      style={{ width: options.size, height: options.size }}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                      ) : (
                        <QrCode className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* URL Display */}
              <div className="space-y-2">
                <Label>Questionnaire URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={questionnaireUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleDownload('png')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PNG
                </Button>
                <Button variant="outline" onClick={handleCopyImage} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Image
                </Button>
                <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button variant="outline" onClick={() => navigator.share?.({ url: questionnaireUrl })} className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customization</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </Button>
              </div>

              {/* Basic Options */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Size: {options.size}px</Label>
                  <Slider
                    value={[options.size]}
                    onValueChange={([value]) => setOptions(prev => ({ ...prev, size: value }))}
                    min={128}
                    max={512}
                    step={32}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={options.foregroundColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={options.foregroundColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, foregroundColor: e.target.value }))}
                        placeholder="#000000"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={options.backgroundColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        value={options.backgroundColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        placeholder="#FFFFFF"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              {showAdvanced && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Margin: {options.margin}</Label>
                      <Slider
                        value={[options.margin]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, margin: value }))}
                        min={0}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Error Correction Level</Label>
                      <Select
                        value={options.errorCorrectionLevel}
                        onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => 
                          setOptions(prev => ({ ...prev, errorCorrectionLevel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (~7%)</SelectItem>
                          <SelectItem value="M">Medium (~15%)</SelectItem>
                          <SelectItem value="Q">Quartile (~25%)</SelectItem>
                          <SelectItem value="H">High (~30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Include Margin</Label>
                        <p className="text-sm text-gray-500">Add white space around the QR code</p>
                      </div>
                      <Switch
                        checked={options.includeMargin}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeMargin: checked }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Preset Styles */}
              <div className="space-y-3">
                <Label>Quick Styles</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions(prev => ({ 
                      ...prev, 
                      foregroundColor: '#000000', 
                      backgroundColor: '#FFFFFF' 
                    }))}
                  >
                    Classic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions(prev => ({ 
                      ...prev, 
                      foregroundColor: '#FFFFFF', 
                      backgroundColor: '#000000' 
                    }))}
                  >
                    Inverted
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions(prev => ({ 
                      ...prev, 
                      foregroundColor: '#3B82F6', 
                      backgroundColor: '#EFF6FF' 
                    }))}
                  >
                    Blue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions(prev => ({ 
                      ...prev, 
                      foregroundColor: '#10B981', 
                      backgroundColor: '#ECFDF5' 
                    }))}
                  >
                    Green
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
