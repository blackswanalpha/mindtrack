import React from 'react';

export const metadata = {
  title: 'MindTrack - Mental Health Assessment',
  description: 'Complete your mental health questionnaire securely and confidentially.',
  robots: 'noindex, nofollow', // Prevent indexing of client questionnaire pages
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
