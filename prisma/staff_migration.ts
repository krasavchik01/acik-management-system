import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const staff = [
  // ACIK
  { email: 'm.beretta@ccik.kz', name: 'Marco Beretta', role: 'President', department: 'Executive' },
  { email: 'm.kau@ccik.kz', name: 'Michele Kauchtschischvili', role: 'VicePresident', department: 'Executive' },
  { email: 'v.timofeyevich@ccik.kz', name: 'Valeriya Timofeyevich', role: 'CEO', department: 'Executive' },
  { email: 'olzhas@ccik.kz', name: 'Olzhas Shintayev', role: 'VicePresident', department: 'Executive' },
  { email: 's.pancaldi@ccik.kz', name: 'Saule Pancaldi', role: 'ProjectManager', department: 'Projects' },
  { email: 'm.trotta@ccik.kz', name: 'Micaela Trotta', role: 'MarketingManager', department: 'Marketing' },
  { email: 's.salsi@ccik.kz', name: 'Sara Salsi', role: 'Member', department: 'Operations' },
  { email: 'admin@ccik.kz', name: 'Anna Pankratova', role: 'Admin', department: 'Operations' },
  
  // NEOS
  { email: 'a.zhuman@ccik.kz', name: 'Aiman Zhuman', role: 'Member', department: 'Marketing' },
  { email: 'makpal@ccik.kz', name: 'Makpal', role: 'Member', department: 'Marketing' },
  
  // Tomiris tour
  { email: 'g.pancaldi@tomiristour.com', name: 'Gustavo Pancaldi', role: 'CEO', department: 'Executive' },
  { email: 'info@tomiristour.com', name: 'Ramazan Kenessov', role: 'ProjectManager', department: 'Projects' },
  { email: 'visit-kazakhstan@tomiristour.com', name: 'Marco', role: 'Member', department: 'Marketing' },
  
  // Finance
  { email: 'f.nurmukan@ccik.kz', name: 'Farkhad Nurmukan', role: 'CFO', department: 'Finance' },
]

async function migrate() {
  console.log('🚀 Starting staff migration...')

  // 1. Get all users to identify demo users
  const { data: users, error: userError } = await supabase.from('User').select('id, email, supabaseId, isDemo')
  if (userError) throw userError

  const demoUsers = users?.filter(u => u.isDemo || u.email.endsWith('@acik.org')) || []
  
  console.log(`🗑️ Removing ${demoUsers.length} legacy/demo users...`)
  
  for (const user of demoUsers) {
    // Delete from Auth
    if (user.supabaseId) {
      await supabase.auth.admin.deleteUser(user.supabaseId)
    }
    // Delete from DB (Prisma/Supabase will handle cascades if configured, but let's be safe)
    await supabase.from('User').delete().eq('id', user.id)
    console.log(`   - Removed ${user.email}`)
  }

  // 2. Add new staff
  for (const person of staff) {
    console.log(`👤 Processing ${person.name} (${person.email})...`)
    
    // Check if exists
    const { data: existing } = await supabase.from('User').select('id').eq('email', person.email).single()
    if (existing) {
      console.log(`   ⏭️ Already exists, skipping.`)
      continue
    }

    // Create Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: person.email,
      password: 'AcikManager2026!',
      email_confirm: true,
      user_metadata: { name: person.name }
    })

    if (authError) {
      console.error(`   ❌ Auth error for ${person.email}:`, authError.message)
      continue
    }

    // Create DB user
    const { error: dbError } = await supabase.from('User').insert({
      id: crypto.randomUUID(),
      supabaseId: authUser.user.id,
      email: person.email,
      name: person.name,
      role: person.role,
      department: person.department,
      isActive: true,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    if (dbError) {
      console.error(`   ❌ DB error for ${person.email}:`, dbError.message)
      // Cleanup auth user
      await supabase.auth.admin.deleteUser(authUser.user.id)
      continue
    }

    console.log(`   ✅ Success!`)
  }

  console.log('🏁 Migration finished!')
}

migrate().catch(console.error)
