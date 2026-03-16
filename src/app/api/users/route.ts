import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/users - Get all users with workload info (for dropdowns/assignments)
export async function GET() {
  try {
    // Get today's start and end for attendance checking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        department: true,
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: { notIn: ['Done', 'Review'] }
              }
            },
            managedProjects: {
              where: {
                status: 'Active'
              }
            }
          }
        },
        attendance: {
          where: {
            date: {
              gte: today,
              lt: tomorrow
            }
          },
          select: {
            workType: true,
            status: true,
            checkInTime: true
          },
          orderBy: { date: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format the data to be easier to consume on the frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
      activeTasks: user._count.assignedTasks,
      activeProjects: user._count.managedProjects,
      location: user.attendance.length > 0 ? user.attendance[0].workType : 'Unknown',
      attendanceStatus: user.attendance.length > 0 ? user.attendance[0].status : 'Absent'
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
