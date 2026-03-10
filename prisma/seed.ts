import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Use Supabase client for all operations (more reliable than direct Postgres connection)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🌱 Seeding database...\n')

  // Create demo users in Supabase Auth and our User table
  const demoUsers = [
    { email: 'president@acik.org', name: 'Айдос Тажбенов', role: 'President', department: 'Executive', isDemo: true },
    { email: 'ceo@acik.org', name: 'Арман Касымов', role: 'CEO', department: 'Executive', isDemo: true },
    { email: 'pm@acik.org', name: 'Дана Сулейменова', role: 'ProjectManager', department: 'Projects', isDemo: true },
    { email: 'member@acik.org', name: 'Нурлан Абдиров', role: 'Member', department: 'Operations', isDemo: true },
    { email: 'admin@acik.org', name: 'Admin User', role: 'Admin', department: 'IT', isDemo: true },
  ]

  const createdUsers: { id: string; email: string; role: string }[] = []

  for (const user of demoUsers) {
    // Check if user already exists in our User table
    const { data: existingUser } = await supabase
      .from('User')
      .select('id, email, role')
      .eq('email', user.email)
      .single()

    if (existingUser) {
      console.log(`  ⏭️  User ${user.email} already exists`)
      createdUsers.push({ id: existingUser.id, email: existingUser.email, role: existingUser.role })
      continue
    }

    // Check if auth user exists
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = authUsers?.users?.find(u => u.email === user.email)

    let supabaseId: string

    if (existingAuthUser) {
      console.log(`  ⏭️  Auth user ${user.email} already exists, using existing`)
      supabaseId = existingAuthUser.id
    } else {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'Demo123!',
        email_confirm: true,
        user_metadata: { name: user.name }
      })

      if (authError) {
        console.error(`  ❌ Failed to create auth user ${user.email}:`, authError.message)
        continue
      }

      supabaseId = authData.user.id
      console.log(`  ✅ Created auth user: ${user.email}`)
    }

    // Create user in our database using Supabase
    const { data: newUser, error: dbError } = await supabase
      .from('User')
      .insert({
        id: crypto.randomUUID(),
        supabaseId: supabaseId,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        isActive: true,
        isDemo: user.isDemo,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error(`  ❌ Failed to create user ${user.email}:`, dbError.message)
      continue
    }

    createdUsers.push({ id: newUser.id, email: newUser.email, role: newUser.role })
    console.log(`  ✅ Created user: ${user.email}`)
  }

  // Get user IDs for relations
  const presidentId = createdUsers.find(u => u.role === 'President')?.id
  const ceoId = createdUsers.find(u => u.role === 'CEO')?.id
  const pmId = createdUsers.find(u => u.role === 'ProjectManager')?.id
  const memberId = createdUsers.find(u => u.role === 'Member')?.id

  if (!presidentId || !ceoId || !pmId || !memberId) {
    console.error('❌ Missing required users for seeding')
    return
  }

  // Create demo projects
  console.log('\n📁 Creating projects...')

  const projectsData = [
    {
      id: 'project-1',
      name: 'ACIK Website Redesign',
      description: 'Полный редизайн и оптимизация веб-сайта организации',
      category: 'Technology',
      status: 'Active',
      priority: 'High',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      progress: 65,
      budgetAllocated: 50000,
      budgetSpent: 32500,
      budgetRemaining: 17500,
      tags: ['web', 'design', 'frontend'],
      managerId: pmId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'project-2',
      name: 'Member Portal Development',
      description: 'Разработка портала для членов организации',
      category: 'Technology',
      status: 'Planning',
      priority: 'Medium',
      startDate: '2026-02-15',
      endDate: '2026-06-30',
      progress: 10,
      budgetAllocated: 75000,
      budgetSpent: 7500,
      budgetRemaining: 67500,
      tags: ['portal', 'members', 'backend'],
      managerId: ceoId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'project-3',
      name: 'Annual Conference 2026',
      description: 'Организация ежегодной конференции ACIK',
      category: 'Community',
      status: 'Active',
      priority: 'Critical',
      startDate: '2026-01-15',
      endDate: '2026-05-15',
      progress: 40,
      budgetAllocated: 150000,
      budgetSpent: 60000,
      budgetRemaining: 90000,
      tags: ['conference', 'event', 'networking'],
      managerId: presidentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  for (const project of projectsData) {
    const { data: existing } = await supabase
      .from('Project')
      .select('id')
      .eq('id', project.id)
      .single()

    if (!existing) {
      const { error } = await supabase.from('Project').insert(project)
      if (error) console.error(`  ❌ Project ${project.name}:`, error.message)
      else console.log(`  ✅ Created project: ${project.name}`)
    } else {
      console.log(`  ⏭️  Project ${project.name} already exists`)
    }
  }

  // Create demo tasks
  console.log('\n📋 Creating tasks...')

  const tasksData = [
    {
      id: 'task-1',
      title: 'Design new homepage mockups',
      description: 'Create wireframes and mockups for the new homepage design',
      status: 'InProgress',
      priority: 'High',
      dueDate: '2026-02-20',
      estimatedHours: 16,
      actualHours: 8,
      tags: ['design', 'ui'],
      projectId: 'project-1',
      assignedToId: pmId,
      createdById: ceoId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Implement responsive navigation',
      description: 'Build responsive navigation component using React',
      status: 'TODO',
      priority: 'Medium',
      dueDate: '2026-02-25',
      estimatedHours: 8,
      actualHours: 0,
      tags: ['development', 'frontend'],
      projectId: 'project-1',
      assignedToId: memberId,
      createdById: pmId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Database schema design',
      description: 'Design the database schema for member portal',
      status: 'Review',
      priority: 'High',
      dueDate: '2026-02-18',
      estimatedHours: 12,
      actualHours: 10,
      tags: ['backend', 'database'],
      projectId: 'project-2',
      assignedToId: ceoId,
      createdById: presidentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Book conference venue',
      description: 'Finalize and book the venue for annual conference',
      status: 'Done',
      priority: 'Critical',
      dueDate: '2026-02-01',
      estimatedHours: 4,
      actualHours: 6,
      completedAt: '2026-01-28',
      tags: ['logistics', 'venue'],
      projectId: 'project-3',
      assignedToId: presidentId,
      createdById: presidentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Send speaker invitations',
      description: 'Reach out to potential speakers and send formal invitations',
      status: 'InProgress',
      priority: 'High',
      dueDate: '2026-02-28',
      estimatedHours: 8,
      actualHours: 3,
      tags: ['speakers', 'outreach'],
      projectId: 'project-3',
      assignedToId: memberId,
      createdById: presidentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  for (const task of tasksData) {
    const { data: existing } = await supabase
      .from('Task')
      .select('id')
      .eq('id', task.id)
      .single()

    if (!existing) {
      const { error } = await supabase.from('Task').insert(task)
      if (error) console.error(`  ❌ Task ${task.title}:`, error.message)
      else console.log(`  ✅ Created task: ${task.title}`)
    } else {
      console.log(`  ⏭️  Task ${task.title} already exists`)
    }
  }

  // Create demo members
  console.log('\n👥 Creating members...')

  const membersData = [
    {
      firstName: 'Али',
      lastName: 'Султанов',
      email: 'ali.sultanov@example.com',
      phone: '+7 (701) 123-4567',
      category: 'Diamond',
      status: 'Active',
      joinDate: '2023-01-15',
      companyName: 'TechCorp KZ',
      companyPosition: 'CTO',
      skills: ['Leadership', 'Strategy', 'Technology'],
      interests: ['Innovation', 'AI', 'Startups'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      firstName: 'Аиша',
      lastName: 'Омарова',
      email: 'aisha.omarova@example.com',
      phone: '+7 (702) 234-5678',
      category: 'Platinum',
      status: 'Active',
      joinDate: '2023-06-20',
      companyName: 'InnoHub',
      companyPosition: 'CEO',
      skills: ['Business Development', 'Marketing', 'Finance'],
      interests: ['Entrepreneurship', 'Women in Tech'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      firstName: 'Нурлан',
      lastName: 'Ахметов',
      email: 'nurlan.akhmetov@example.com',
      phone: '+7 (705) 345-6789',
      category: 'Gold',
      status: 'Active',
      joinDate: '2024-02-10',
      companyName: 'DataLab',
      companyPosition: 'Data Scientist',
      skills: ['Data Analysis', 'Machine Learning', 'Python'],
      interests: ['Big Data', 'Research'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  for (const member of membersData) {
    const { data: existing } = await supabase
      .from('Member')
      .select('id')
      .eq('email', member.email)
      .single()

    if (!existing) {
      const { error } = await supabase.from('Member').insert({ id: crypto.randomUUID(), ...member })
      if (error) console.error(`  ❌ Member ${member.firstName}:`, error.message)
      else console.log(`  ✅ Created member: ${member.firstName} ${member.lastName}`)
    } else {
      console.log(`  ⏭️  Member ${member.firstName} ${member.lastName} already exists`)
    }
  }

  // Create demo events
  console.log('\n📅 Creating events...')

  const eventsData = [
    {
      id: 'event-1',
      title: 'ACIK Annual Conference 2026',
      description: 'Ежегодная конференция ACIK с участием ведущих экспертов отрасли',
      type: 'Conference',
      status: 'Planned',
      startDate: '2026-05-15T09:00:00',
      endDate: '2026-05-16T18:00:00',
      capacity: 500,
      locationVenue: 'Ritz-Carlton Almaty',
      locationCity: 'Almaty',
      locationCountry: 'Kazakhstan',
      locationIsVirtual: false,
      pricingIsFree: false,
      pricingMemberPrice: 50000,
      pricingNonMemberPrice: 75000,
      budgetEstimated: 150000,
      budgetActual: 0,
      tags: ['conference', 'networking', 'keynote'],
      isPublished: true,
      organizerId: presidentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'event-2',
      title: 'AI Workshop: Machine Learning Basics',
      description: 'Практический воркшоп по основам машинного обучения',
      type: 'Workshop',
      status: 'Active',
      startDate: '2026-02-25T14:00:00',
      endDate: '2026-02-25T18:00:00',
      capacity: 30,
      locationVenue: 'ACIK Hub',
      locationCity: 'Astana',
      locationCountry: 'Kazakhstan',
      locationIsVirtual: true,
      locationVirtualLink: 'https://zoom.us/j/123456789',
      pricingIsFree: true,
      budgetEstimated: 5000,
      budgetActual: 0,
      tags: ['workshop', 'AI', 'education'],
      isPublished: true,
      organizerId: ceoId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  for (const event of eventsData) {
    const { data: existing } = await supabase
      .from('Event')
      .select('id')
      .eq('id', event.id)
      .single()

    if (!existing) {
      const { error } = await supabase.from('Event').insert(event)
      if (error) console.error(`  ❌ Event ${event.title}:`, error.message)
      else console.log(`  ✅ Created event: ${event.title}`)
    } else {
      console.log(`  ⏭️  Event ${event.title} already exists`)
    }
  }

  // Create demo sponsors
  console.log('\n🏢 Creating sponsors...')

  const sponsorsData = [
    {
      id: 'sponsor-1',
      name: 'TechCorp Kazakhstan',
      level: 'Diamond',
      status: 'Active',
      type: 'Corporate',
      industry: 'Technology',
      contactName: 'Ержан Мусин',
      contactTitle: 'Marketing Director',
      contactEmail: 'e.musin@techcorp.kz',
      contactPhone: '+7 (727) 123-4567',
      companyWebsite: 'https://techcorp.kz',
      companyCity: 'Almaty',
      companyCountry: 'Kazakhstan',
      sponsorshipAmount: 500000,
      sponsorshipCurrency: 'KZT',
      sponsorshipFrequency: 'Yearly',
      sponsorshipStartDate: '2026-01-01',
      sponsorshipEndDate: '2026-12-31',
      sponsorshipTotalCommitted: 500000,
      sponsorshipTotalReceived: 250000,
      tags: ['tech', 'platinum sponsor'],
      managedById: presidentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sponsor-2',
      name: 'InnoBank',
      level: 'Gold',
      status: 'Active',
      type: 'Corporate',
      industry: 'Finance',
      contactName: 'Сауле Каримова',
      contactTitle: 'Head of Partnerships',
      contactEmail: 's.karimova@innobank.kz',
      contactPhone: '+7 (727) 234-5678',
      companyWebsite: 'https://innobank.kz',
      companyCity: 'Astana',
      companyCountry: 'Kazakhstan',
      sponsorshipAmount: 200000,
      sponsorshipCurrency: 'KZT',
      sponsorshipFrequency: 'Yearly',
      sponsorshipStartDate: '2026-01-01',
      sponsorshipEndDate: '2026-12-31',
      sponsorshipTotalCommitted: 200000,
      sponsorshipTotalReceived: 200000,
      tags: ['finance', 'gold sponsor'],
      managedById: ceoId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  for (const sponsor of sponsorsData) {
    const { data: existing } = await supabase
      .from('Sponsor')
      .select('id')
      .eq('id', sponsor.id)
      .single()

    if (!existing) {
      const { error } = await supabase.from('Sponsor').insert(sponsor)
      if (error) console.error(`  ❌ Sponsor ${sponsor.name}:`, error.message)
      else console.log(`  ✅ Created sponsor: ${sponsor.name}`)
    } else {
      console.log(`  ⏭️  Sponsor ${sponsor.name} already exists`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('✅ Seeding completed!')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('\n📝 Demo accounts:')
  console.log('   Email: president@acik.org | Password: Demo123!')
  console.log('   Email: ceo@acik.org | Password: Demo123!')
  console.log('   Email: pm@acik.org | Password: Demo123!')
  console.log('   Email: member@acik.org | Password: Demo123!')
  console.log('   Email: admin@acik.org | Password: Demo123!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
