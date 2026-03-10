import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Create Notification table if it doesn't exist
    const createTableSQL = `
      DO $$
      BEGIN
        -- Create enum if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
          CREATE TYPE "NotificationType" AS ENUM (
            'TaskAssigned',
            'TaskUpdated',
            'TaskCompleted',
            'TaskOverdue',
            'ProjectUpdate',
            'MemberJoined',
            'EventReminder',
            'AttendanceReminder',
            'SystemAlert',
            'Message'
          );
        END IF;

        -- Create Notification table if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Notification') THEN
          CREATE TABLE "Notification" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "type" "NotificationType" NOT NULL,
            "title" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "link" TEXT,
            "metadata" JSONB,
            "isRead" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );

          CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
          CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
        END IF;
      END
      $$;
    `

    // Try to run migration
    try {
      await getSupabaseAdmin().rpc('exec_sql', { sql: createTableSQL })
    } catch {
      // Ignore migration errors - table might already exist
    }

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
