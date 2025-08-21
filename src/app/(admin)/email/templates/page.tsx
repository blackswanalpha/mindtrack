'use client';

import React from 'react';
import { EmailTemplateManager } from '@/components/email/email-template-manager';

export default function EmailTemplatesPage() {
  return (
    <div className="container mx-auto p-6">
      <EmailTemplateManager />
    </div>
  );
}
