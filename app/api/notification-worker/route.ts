import { NextRequest, NextResponse } from 'next/server';
import { notificationGenerator } from '@/lib/notification-generator';

// API endpoint untuk menjalankan worker notifikasi
// Endpoint ini dapat dipanggil oleh cron job atau webhook
export async function POST(request: NextRequest) {
  try {
    // Verifikasi keamanan dengan API key sederhana
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.NOTIFICATION_WORKER_API_KEY;
    
    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dapatkan data pengguna dari request body
    const body = await request.json();
    const { userIds } = body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Daftar userIds diperlukan' }, { status: 400 });
    }
    
    const processedUsers: string[] = [];
    
    // Proses notifikasi untuk setiap pengguna
    for (const userId of userIds) {
      await notificationGenerator.checkAllUpdates(userId);
      processedUsers.push(userId);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Notifikasi diproses untuk ${processedUsers.length} pengguna`,
      processedUsers
    });
  } catch (error) {
    console.error('Error in notification worker:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
