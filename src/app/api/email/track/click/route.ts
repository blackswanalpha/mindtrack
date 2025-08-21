import { NextRequest, NextResponse } from 'next/server';
import { trackEmailEvent } from '@/lib/email-analytics';

// GET /api/email/track/click - Handle email link clicks with tracking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailLogId = searchParams.get('id');
    const originalUrl = searchParams.get('url');

    // If no email log ID or URL, redirect to home page
    if (!emailLogId || !originalUrl || isNaN(parseInt(emailLogId))) {
      return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com');
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track the click event
    try {
      await trackEmailEvent(
        parseInt(emailLogId),
        'clicked',
        {
          original_url: originalUrl,
          tracking_method: 'redirect',
          timestamp: new Date().toISOString()
        },
        ipAddress,
        userAgent
      );
    } catch (trackingError) {
      // Log the error but don't fail the redirect
      console.error('Error tracking email click:', trackingError);
    }

    // Validate the URL before redirecting
    try {
      const url = new URL(decodeURIComponent(originalUrl));
      
      // Only allow http and https protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }

      // Redirect to the original URL
      return NextResponse.redirect(url.toString());
    } catch (urlError) {
      console.error('Invalid URL for redirect:', originalUrl, urlError);
      // Redirect to home page if URL is invalid
      return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com');
    }

  } catch (error) {
    console.error('Error handling email click tracking:', error);
    // Redirect to home page on any error
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://mindtrack.com');
  }
}
