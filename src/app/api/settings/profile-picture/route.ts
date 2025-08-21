import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { ProfilePictureUploadResponse } from '@/types/database';

// Helper function to get user from request (mock implementation)
function getUserFromRequest(request: NextRequest) {
  // In a real implementation, this would extract and validate the JWT token
  // For now, return a mock user
  return {
    userId: 1,
    role: 'admin'
  };
}

// Helper function to validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be a JPEG, PNG, or WebP image' };
  }

  return { valid: true };
}

// Helper function to generate unique filename
function generateFileName(originalName: string, userId: number): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `profile_${userId}_${timestamp}.${extension}`;
}

// POST /api/settings/profile-picture - Upload profile picture
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('profile_picture') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-pictures');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate unique filename
    const fileName = generateFileName(file.name, user.userId);
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const profileImageUrl = `/uploads/profile-pictures/${fileName}`;

    // Get current profile image to delete old one
    const currentUserResult = await query(
      'SELECT profile_image FROM users WHERE id = $1',
      [user.userId]
    );

    const currentProfileImage = currentUserResult.rows[0]?.profile_image;

    // Update user's profile image in database
    await query(
      'UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2',
      [profileImageUrl, user.userId]
    );

    // Log the profile picture change
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.userId,
        'profile_picture_updated',
        'user',
        user.userId,
        JSON.stringify({ 
          old_image: currentProfileImage,
          new_image: profileImageUrl,
          file_size: file.size,
          file_type: file.type,
          timestamp: new Date().toISOString()
        })
      ]
    );

    // TODO: In a production environment, you might want to:
    // 1. Delete the old profile image file
    // 2. Resize/optimize the image
    // 3. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 4. Generate multiple sizes (thumbnail, medium, large)

    const response: ProfilePictureUploadResponse = {
      success: true,
      data: {
        profile_image_url: profileImageUrl,
      },
      message: 'Profile picture updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/profile-picture - Remove profile picture
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get current profile image
    const currentUserResult = await query(
      'SELECT profile_image FROM users WHERE id = $1',
      [user.userId]
    );

    if (currentUserResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentProfileImage = currentUserResult.rows[0].profile_image;

    // Remove profile image from database
    await query(
      'UPDATE users SET profile_image = NULL, updated_at = NOW() WHERE id = $1',
      [user.userId]
    );

    // Log the profile picture removal
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.userId,
        'profile_picture_removed',
        'user',
        user.userId,
        JSON.stringify({ 
          old_image: currentProfileImage,
          timestamp: new Date().toISOString()
        })
      ]
    );

    // TODO: In a production environment, you might want to:
    // 1. Delete the actual image file from storage
    // 2. Clean up any cached versions

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed successfully',
    });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/settings/profile-picture/upload-info - Get upload requirements
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        max_file_size: 5 * 1024 * 1024, // 5MB
        allowed_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        recommended_dimensions: {
          width: 400,
          height: 400,
        },
        requirements: [
          'Maximum file size: 5MB',
          'Supported formats: JPEG, PNG, WebP',
          'Recommended size: 400x400 pixels',
          'Square images work best',
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching upload info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
