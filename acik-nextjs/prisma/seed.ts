import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Prisma 7 requires an adapter for database connections
// Use DIRECT_URL (session mode) for seed operations
const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (existingUser) {
      console.log(`  ⏭️  User ${user.email} already exists`)
      createdUsers.push({ id: existingUser.id, email: existingUser.email, role: existingUser.role })
      continue
    }

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

    // Create user in our database
    const newUser = await prisma.user.create({
      data: {
        supabaseId: authData.user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        department: user.department as any,
        isActive: true,
        isDemo: user.isDemo,
        permissions: [],
      }
    })

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

  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'project-1' },
      update: {},
      create: {
        id: 'project-1',
        name: 'ACIK Website Redesign',
        description: 'Полный редизайн и оптимизация веб-сайта организации',
        category: 'Technology',
        status: 'Active',
        priority: 'High',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        progress: 65,
        budgetAllocated: 50000,
        budgetSpent: 32500,
        budgetRemaining: 17500,
        tags: ['web', 'design', 'frontend'],
        managerId: pmId,
      }
    }),
    prisma.project.upsert({
      where: { id: 'project-2' },
      update: {},
      create: {
        id: 'project-2',
        name: 'Member Portal Development',
        description: 'Разработка портала для членов организации',
        category: 'Technology',
        status: 'Planning',
        priority: 'Medium',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-06-30'),
        progress: 10,
        budgetAllocated: 75000,
        budgetSpent: 7500,
        budgetRemaining: 67500,
        tags: ['portal', 'members', 'backend'],
        managerId: ceoId,
      }
    }),
    prisma.project.upsert({
      where: { id: 'project-3' },
      update: {},
      create: {
        id: 'project-3',
        name: 'Annual Conference 2026',
        description: 'Организация ежегодной конференции ACIK',
        category: 'Community',
        status: 'Active',
        priority: 'Critical',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-05-15'),
        progress: 40,
        budgetAllocated: 150000,
        budgetSpent: 60000,
        budgetRemaining: 90000,
        tags: ['conference', 'event', 'networking'],
        managerId: presidentId,
      }
    }),
  ])

  console.log(`  ✅ Created ${projects.length} projects`)

  // Create demo tasks
  console.log('\n📋 Creating tasks...')

  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        title: 'Design new homepage mockups',
        description: 'Create wireframes and mockups for the new homepage design',
        status: 'InProgress',
        priority: 'High',
        dueDate: new Date('2026-02-20'),
        estimatedHours: 16,
        actualHours: 8,
        tags: ['design', 'ui'],
        projectId: 'project-1',
        assignedToId: pmId,
        createdById: ceoId,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-2' },
      update: {},
      create: {
        id: 'task-2',
        title: 'Implement responsive navigation',
        description: 'Build responsive navigation component using React',
        status: 'TODO',
        priority: 'Medium',
        dueDate: new Date('2026-02-25'),
        estimatedHours: 8,
        actualHours: 0,
        tags: ['development', 'frontend'],
        projectId: 'project-1',
        assignedToId: memberId,
        createdById: pmId,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-3' },
      update: {},
      create: {
        id: 'task-3',
        title: 'Database schema design',
        description: 'Design the database schema for member portal',
        status: 'Review',
        priority: 'High',
        dueDate: new Date('2026-02-18'),
        estimatedHours: 12,
        actualHours: 10,
        tags: ['backend', 'database'],
        projectId: 'project-2',
        assignedToId: ceoId,
        createdById: presidentId,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-4' },
      update: {},
      create: {
        id: 'task-4',
        title: 'Book conference venue',
        description: 'Finalize and book the venue for annual conference',
        status: 'Done',
        priority: 'Critical',
        dueDate: new Date('2026-02-01'),
        estimatedHours: 4,
        actualHours: 6,
        completedAt: new Date('2026-01-28'),
        tags: ['logistics', 'venue'],
        projectId: 'project-3',
        assignedToId: presidentId,
        createdById: presidentId,
      }
    }),
    prisma.task.upsert({
      where: { id: 'task-5' },
      update: {},
      create: {
        id: 'task-5',
        title: 'Send speaker invitations',
        description: 'Reach out to potential speakers and send formal invitations',
        status: 'InProgress',
        priority: 'High',
        dueDate: new Date('2026-02-28'),
        estimatedHours: 8,
        actualHours: 3,
        tags: ['speakers', 'outreach'],
        projectId: 'project-3',
        assignedToId: memberId,
        createdById: presidentId,
      }
    }),
  ])

  console.log(`  ✅ Created ${tasks.length} tasks`)

  // Create demo members
  console.log('\n👥 Creating members...')

  const members = await Promise.all([
    prisma.member.upsert({
      where: { email: 'ali.sultanov@example.com' },
      update: {},
      create: {
        firstName: 'Али',
        lastName: 'Султанов',
        email: 'ali.sultanov@example.com',
        phone: '+7 (701) 123-4567',
        category: 'Diamond',
        status: 'Active',
        joinDate: new Date('2023-01-15'),
        companyName: 'TechCorp KZ',
        companyPosition: 'CTO',
        skills: ['Leadership', 'Strategy', 'Technology'],
        interests: ['Innovation', 'AI', 'Startups'],
      }
    }),
    prisma.member.upsert({
      where: { email: 'aisha.omarova@example.com' },
      update: {},
      create: {
        firstName: 'Аиша',
        lastName: 'Омарова',
        email: 'aisha.omarova@example.com',
        phone: '+7 (702) 234-5678',
        category: 'Platinum',
        status: 'Active',
        joinDate: new Date('2023-06-20'),
        companyName: 'InnoHub',
        companyPosition: 'CEO',
        skills: ['Business Development', 'Marketing', 'Finance'],
        interests: ['Entrepreneurship', 'Women in Tech'],
      }
    }),
    prisma.member.upsert({
      where: { email: 'nurlan.akhmetov@example.com' },
      update: {},
      create: {
        firstName: 'Нурлан',
        lastName: 'Ахметов',
        email: 'nurlan.akhmetov@example.com',
        phone: '+7 (705) 345-6789',
        category: 'Gold',
        status: 'Active',
        joinDate: new Date('2024-02-10'),
        companyName: 'DataLab',
        companyPosition: 'Data Scientist',
        skills: ['Data Analysis', 'Machine Learning', 'Python'],
        interests: ['Big Data', 'Research'],
      }
    }),
    prisma.member.upsert({
      where: { email: 'diana.kim@example.com' },
      update: {},
      create: {
        firstName: 'Диана',
        lastName: 'Ким',
        email: 'diana.kim@example.com',
        phone: '+7 (707) 456-7890',
        category: 'Silver',
        status: 'Active',
        joinDate: new Date('2024-08-01'),
        companyName: 'DesignStudio',
        companyPosition: 'Lead Designer',
        skills: ['UI/UX', 'Figma', 'Branding'],
        interests: ['Design', 'Art'],
      }
    }),
    prisma.member.upsert({
      where: { email: 'timur.nazarov@example.com' },
      update: {},
      create: {
        firstName: 'Тимур',
        lastName: 'Назаров',
        email: 'timur.nazarov@example.com',
        phone: '+7 (708) 567-8901',
        category: 'Bronze',
        status: 'Active',
        joinDate: new Date('2025-01-05'),
        companyName: 'StartupXYZ',
        companyPosition: 'Founder',
        skills: ['Product Management', 'Agile'],
        interests: ['Startups', 'Venture Capital'],
      }
    }),
  ])

  console.log(`  ✅ Created ${members.length} members`)

  // Create demo events
  console.log('\n📅 Creating events...')

  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: 'event-1' },
      update: {},
      create: {
        id: 'event-1',
        title: 'ACIK Annual Conference 2026',
        description: 'Ежегодная конференция ACIK с участием ведущих экспертов отрасли',
        type: 'Conference',
        status: 'Planned',
        startDate: new Date('2026-05-15T09:00:00'),
        endDate: new Date('2026-05-16T18:00:00'),
        capacity: 500,
        locationVenue: 'Ritz-Carlton Almaty',
        locationCity: 'Almaty',
        locationCountry: 'Kazakhstan',
        locationIsVirtual: false,
        pricingIsFree: false,
        pricingMemberPrice: 50000,
        pricingNonMemberPrice: 75000,
        budgetEstimated: 150000,
        tags: ['conference', 'networking', 'keynote'],
        isPublished: true,
        organizerId: presidentId,
      }
    }),
    prisma.event.upsert({
      where: { id: 'event-2' },
      update: {},
      create: {
        id: 'event-2',
        title: 'AI Workshop: Machine Learning Basics',
        description: 'Практический воркшоп по основам машинного обучения',
        type: 'Workshop',
        status: 'Active',
        startDate: new Date('2026-02-25T14:00:00'),
        endDate: new Date('2026-02-25T18:00:00'),
        capacity: 30,
        locationVenue: 'ACIK Hub',
        locationCity: 'Astana',
        locationCountry: 'Kazakhstan',
        locationIsVirtual: true,
        locationVirtualLink: 'https://zoom.us/j/123456789',
        pricingIsFree: true,
        budgetEstimated: 5000,
        tags: ['workshop', 'AI', 'education'],
        isPublished: true,
        organizerId: ceoId,
      }
    }),
    prisma.event.upsert({
      where: { id: 'event-3' },
      update: {},
      create: {
        id: 'event-3',
        title: 'Monthly Networking Meetup',
        description: 'Ежемесячная встреча для нетворкинга членов ACIK',
        type: 'Networking',
        status: 'Completed',
        startDate: new Date('2026-01-25T18:00:00'),
        endDate: new Date('2026-01-25T21:00:00'),
        capacity: 50,
        locationVenue: 'Sky Lounge',
        locationCity: 'Almaty',
        locationCountry: 'Kazakhstan',
        locationIsVirtual: false,
        pricingIsFree: true,
        budgetEstimated: 10000,
        budgetActual: 8500,
        tags: ['networking', 'social'],
        isPublished: true,
        organizerId: pmId,
      }
    }),
  ])

  console.log(`  ✅ Created ${events.length} events`)

  // Create demo sponsors
  console.log('\n🏢 Creating sponsors...')

  const sponsors = await Promise.all([
    prisma.sponsor.upsert({
      where: { id: 'sponsor-1' },
      update: {},
      create: {
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
        sponsorshipStartDate: new Date('2026-01-01'),
        sponsorshipEndDate: new Date('2026-12-31'),
        sponsorshipTotalCommitted: 500000,
        sponsorshipTotalReceived: 250000,
        tags: ['tech', 'platinum sponsor'],
        managedById: presidentId,
      }
    }),
    prisma.sponsor.upsert({
      where: { id: 'sponsor-2' },
      update: {},
      create: {
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
        sponsorshipStartDate: new Date('2026-01-01'),
        sponsorshipEndDate: new Date('2026-12-31'),
        sponsorshipTotalCommitted: 200000,
        sponsorshipTotalReceived: 200000,
        tags: ['finance', 'gold sponsor'],
        managedById: ceoId,
      }
    }),
  ])

  console.log(`  ✅ Created ${sponsors.length} sponsors`)

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
  .finally(async () => {
    await prisma.$disconnect()
  })
