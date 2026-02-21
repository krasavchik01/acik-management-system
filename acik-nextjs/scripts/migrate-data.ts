/**
 * Data Migration Script: MongoDB to Supabase/Postgres
 *
 * This script migrates data from the old MongoDB database to the new Supabase Postgres database.
 *
 * Prerequisites:
 * 1. Setup Supabase project and get credentials
 * 2. Run Prisma migrations: npx prisma migrate dev
 * 3. Install dependencies: npm install mongoose @supabase/supabase-js
 *
 * Usage:
 * npx ts-node scripts/migrate-data.ts
 *
 * IMPORTANT: Run this on a staging environment first!
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import mongoose from 'mongoose'

const prisma = new PrismaClient()

// Supabase admin client (needs service role key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/acik_management'

// ID mappings (old MongoDB _id -> new Postgres UUID)
const idMapping = {
  users: new Map<string, string>(),
  projects: new Map<string, string>(),
  tasks: new Map<string, string>(),
  members: new Map<string, string>(),
  events: new Map<string, string>(),
  finance: new Map<string, string>(),
  sponsors: new Map<string, string>(),
  attendance: new Map<string, string>(),
  reports: new Map<string, string>(),
}

// MongoDB Schemas (simplified for migration)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  avatar: String,
  department: String,
  phone: String,
  isActive: Boolean,
  isDemo: Boolean,
  lastLogin: Date,
  permissions: [String],
}, { timestamps: true })

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  status: String,
  priority: String,
  startDate: Date,
  endDate: Date,
  budget: {
    allocated: Number,
    spent: Number,
    remaining: Number,
  },
  progress: Number,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
  }],
  tags: [String],
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: Date,
  }],
  milestones: [{
    name: String,
    description: String,
    dueDate: Date,
    completed: Boolean,
  }],
}, { timestamps: true })

const MemberSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  category: String,
  status: String,
  joinDate: Date,
  dateOfBirth: Date,
  notes: String,
  interests: [String],
  skills: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  company: {
    name: String,
    position: String,
  },
}, { timestamps: true })

const UserMongo = mongoose.models.User || mongoose.model('User', UserSchema)
const ProjectMongo = mongoose.models.Project || mongoose.model('Project', ProjectSchema)
const MemberMongo = mongoose.models.Member || mongoose.model('Member', MemberSchema)

// Role mapping
function mapRole(role: string): string {
  const mapping: Record<string, string> = {
    'President': 'President',
    'Vice President': 'VicePresident',
    'CEO': 'CEO',
    'CFO': 'CFO',
    'Project Manager': 'ProjectManager',
    'Marketing Manager': 'MarketingManager',
    'Member': 'Member',
    'Admin': 'Admin',
  }
  return mapping[role] || 'Member'
}

// Department mapping
function mapDepartment(dept: string): string {
  const mapping: Record<string, string> = {
    'Executive': 'Executive',
    'Finance': 'Finance',
    'Projects': 'Projects',
    'Marketing': 'Marketing',
    'Operations': 'Operations',
    'HR': 'HR',
    'IT': 'IT',
  }
  return mapping[dept] || 'Operations'
}

// Status mapping for projects
function mapProjectStatus(status: string): string {
  const mapping: Record<string, string> = {
    'Planning': 'Planning',
    'Active': 'Active',
    'On Hold': 'OnHold',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled',
  }
  return mapping[status] || 'Planning'
}

async function migrateUsers() {
  console.log('\n📤 Migrating Users...')

  const users = await UserMongo.find({})
  let successCount = 0
  let errorCount = 0

  for (const user of users) {
    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'TempPassword123!', // Users will need to reset password
        email_confirm: true,
        user_metadata: {
          name: user.name,
        }
      })

      if (authError) {
        console.error(`  ❌ Auth error for ${user.email}:`, authError.message)
        errorCount++
        continue
      }

      // Create profile in Prisma
      const newUser = await prisma.user.create({
        data: {
          supabaseId: authData.user.id,
          email: user.email,
          name: user.name,
          role: mapRole(user.role) as any,
          avatar: user.avatar,
          department: mapDepartment(user.department) as any,
          phone: user.phone,
          isActive: user.isActive ?? true,
          isDemo: user.isDemo ?? false,
          lastLogin: user.lastLogin,
          permissions: user.permissions || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      })

      idMapping.users.set(user._id.toString(), newUser.id)
      successCount++
      console.log(`  ✅ Migrated user: ${user.email}`)
    } catch (error: any) {
      console.error(`  ❌ Error migrating ${user.email}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n  Users: ${successCount} migrated, ${errorCount} errors`)
}

async function migrateMembers() {
  console.log('\n📤 Migrating Members...')

  const members = await MemberMongo.find({})
  let successCount = 0
  let errorCount = 0

  for (const member of members) {
    try {
      const newMember = await prisma.member.create({
        data: {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          category: (member.category as any) || 'Bronze',
          status: (member.status as any) || 'Active',
          joinDate: member.joinDate || new Date(),
          dateOfBirth: member.dateOfBirth,
          notes: member.notes,
          interests: member.interests || [],
          skills: member.skills || [],
          addressStreet: member.address?.street,
          addressCity: member.address?.city,
          addressState: member.address?.state,
          addressZipCode: member.address?.zipCode,
          addressCountry: member.address?.country || 'USA',
          companyName: member.company?.name,
          companyPosition: member.company?.position,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        }
      })

      idMapping.members.set(member._id.toString(), newMember.id)
      successCount++
    } catch (error: any) {
      console.error(`  ❌ Error migrating member ${member.email}:`, error.message)
      errorCount++
    }
  }

  console.log(`  Members: ${successCount} migrated, ${errorCount} errors`)
}

async function migrateProjects() {
  console.log('\n📤 Migrating Projects...')

  const projects = await ProjectMongo.find({})
  let successCount = 0
  let errorCount = 0

  for (const project of projects) {
    try {
      const managerId = idMapping.users.get(project.manager?.toString())

      if (!managerId) {
        console.warn(`  ⚠️ Manager not found for project ${project.name}, skipping`)
        errorCount++
        continue
      }

      const newProject = await prisma.project.create({
        data: {
          name: project.name,
          description: project.description,
          category: (project.category as any) || 'Other',
          status: mapProjectStatus(project.status) as any,
          priority: (project.priority as any) || 'Medium',
          startDate: project.startDate || new Date(),
          endDate: project.endDate,
          progress: project.progress || 0,
          budgetAllocated: project.budget?.allocated || 0,
          budgetSpent: project.budget?.spent || 0,
          budgetRemaining: project.budget?.remaining || 0,
          tags: project.tags || [],
          managerId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        }
      })

      idMapping.projects.set(project._id.toString(), newProject.id)

      // Migrate team members
      if (project.team?.length) {
        for (const member of project.team) {
          const userId = idMapping.users.get(member.user?.toString())
          if (userId) {
            await prisma.projectTeamMember.create({
              data: {
                projectId: newProject.id,
                userId,
                role: member.role || 'Member',
              }
            }).catch(() => {}) // Ignore duplicates
          }
        }
      }

      // Migrate milestones
      if (project.milestones?.length) {
        for (const milestone of project.milestones) {
          await prisma.projectMilestone.create({
            data: {
              projectId: newProject.id,
              name: milestone.name,
              description: milestone.description,
              dueDate: milestone.dueDate,
              completed: milestone.completed || false,
            }
          })
        }
      }

      // Migrate notes
      if (project.notes?.length) {
        for (const note of project.notes) {
          const authorId = idMapping.users.get(note.author?.toString())
          if (authorId) {
            await prisma.projectNote.create({
              data: {
                projectId: newProject.id,
                authorId,
                content: note.content,
                createdAt: note.createdAt,
              }
            })
          }
        }
      }

      successCount++
      console.log(`  ✅ Migrated project: ${project.name}`)
    } catch (error: any) {
      console.error(`  ❌ Error migrating project ${project.name}:`, error.message)
      errorCount++
    }
  }

  console.log(`  Projects: ${successCount} migrated, ${errorCount} errors`)
}

async function migrate() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🚀 ACIK Data Migration: MongoDB -> Supabase/Postgres')
  console.log('═══════════════════════════════════════════════════════════')

  try {
    // Connect to MongoDB
    console.log('\n📥 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('  ✅ Connected to MongoDB')

    // Run migrations in order (dependencies first)
    await migrateUsers()
    await migrateMembers()
    await migrateProjects()

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('📊 Migration Summary')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`  Users:    ${idMapping.users.size}`)
    console.log(`  Members:  ${idMapping.members.size}`)
    console.log(`  Projects: ${idMapping.projects.size}`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('\n✅ Migration completed!')
    console.log('\n⚠️  IMPORTANT: Users need to reset their passwords!')
    console.log('   Send them a password reset email from Supabase Dashboard.')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    await prisma.$disconnect()
  }
}

// Run migration
migrate()
