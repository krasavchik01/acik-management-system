import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanup() {
  console.log('🧹 Starting thorough cleanup of demo data...')

  // 1. Delete all from tables that reference Users or other tables
  const tablesToClear = [
    'Notification',
    'ReportReviewer',
    'ReportProject',
    'ReportEvent',
    'Report',
    'FinanceAttachment',
    'Finance',
    'SponsorDocument',
    'SponsorPayment',
    'SponsorProject',
    'SponsorEvent',
    'SponsorBenefit',
    'Sponsor',
    'EventFeedback',
    'EventAttachment',
    'EventAgendaItem',
    'EventRegistration',
    'EventSpeaker',
    'MemberEventAttendance',
    'Event',
    'AttendanceTask',
    'Attendance',
    'Member',
    'TaskAttachment',
    'TaskComment',
    'TaskChecklistItem',
    'TaskDependency',
    'Task',
    'ProjectAttachment',
    'ProjectNote',
    'ProjectMilestone',
    'ProjectTeamMember',
    'Project'
  ]

  console.log(`🗑️ Clearing ${tablesToClear.length} tables...`)
  for (const table of tablesToClear) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) console.error(`   ⚠️ Failed to clear ${table}:`, error.message)
    else console.log(`   ✅ Table ${table} cleared.`)
  }

  // 2. Cleanup Users marked as demo or with demo emails
  const { data: users, error: userError } = await supabase
    .from('User')
    .select('id, email, supabaseId, isDemo')
  
  if (userError) throw userError

  const usersToDelete = users?.filter(u => u.isDemo || u.email.endsWith('@acik.org')) || []
  
  if (usersToDelete.length > 0) {
    console.log(`🗑️ Deleting ${usersToDelete.length} demo users...`)
    for (const user of usersToDelete) {
      // Delete from Auth
      if (user.supabaseId) {
        const { error: authError } = await supabase.auth.admin.deleteUser(user.supabaseId)
        if (authError && authError.message !== 'User not found') {
          console.error(`   ⚠️ Failed to delete auth user ${user.email}:`, authError.message)
        }
      }
      // Delete from DB
      const { error: dbError } = await supabase.from('User').delete().eq('id', user.id)
      if (dbError) console.error(`   ⚠️ Failed to delete DB user ${user.email}:`, dbError.message)
      else console.log(`   ✅ Removed ${user.email}`)
    }
  } else {
    console.log('⏭️ No demo users found.')
  }

  console.log('🏁 Cleanup finished!')
}

cleanup().catch(console.error)
