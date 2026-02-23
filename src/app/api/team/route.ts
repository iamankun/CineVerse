import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

interface TeamMember {
  id: string
  name: string
  username: string
  role: string
  bio: string | null
  avatar_url: string | null
  location: string | null
  website: string | null
  joined_date: string
  is_admin: boolean
  is_verified: boolean
  social_links?: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Fetch all profiles with correct column names
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // If no profiles exist, return demo data
    if (!profiles || profiles.length === 0) {
      return NextResponse.json(getDemoTeamMembers())
    }

    // Transform existing profiles using correct column names
    const teamMembers: TeamMember[] = profiles.map((profile: any) => {
      // Use the actual 'role' and 'verify' columns from database
      const role = profile.role || ''
      const verify = profile.verify || false
      
      // Check if user is admin based on role or verify field
      const isAdmin = role?.toLowerCase() === 'admin' || verify === true
      const isVerified = isAdmin || verify === true || role?.toLowerCase() === 'verified'
      
      return {
        id: profile.id,
        name: profile.full_name || profile.username || 'Unknown',
        username: profile.username || '',
        role: role || 'Thành viên',
        bio: profile.bio || 'Thành viên tích cực của CineVerse',
        avatar_url: profile.avatar_url,
        location: profile.location || 'Việt Nam',
        website: profile.website,
        joined_date: profile.created_at || new Date().toISOString(),
        is_admin: isAdmin,
        is_verified: isVerified,
        social_links: getSocialLinksForUser(profile.username || '')
      }
    }).filter(member => member.is_admin || member.is_verified)

    // If no admin/verified users found, return demo data
    if (teamMembers.length === 0) {
      return NextResponse.json(getDemoTeamMembers())
    }

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error in team API:', error)
    return NextResponse.json(getDemoTeamMembers()) // Return demo data on error
  }
}

function getDemoTeamMembers(): TeamMember[] {
  return [
    {
      id: 'demo-1',
      name: 'Admin CineVerse',
      username: 'admin',
      role: 'admin',
      bio: 'Người sáng lập và phát triển CineVerse với đam mê phim ảnh và công nghệ.',
      avatar_url: null,
      location: 'Hà Nội, Việt Nam',
      website: 'https://cineverse.movie',
      joined_date: '2024-01-01T00:00:00Z',
      is_admin: true,
      is_verified: true,
      social_links: {
        github: 'https://github.com/iamankun',
        twitter: 'https://twitter.com/iamankun',
        linkedin: 'https://linkedin.com/in/iamankun'
      }
    },
    {
      id: 'demo-2',
      name: 'Lead Developer',
      username: 'iamankun',
      role: 'admin',
      bio: 'Phát triển và duy trì hệ thống CineVerse với công nghệ hiện đại.',
      avatar_url: null,
      location: 'TP. Hồ Chí Minh, Việt Nam',
      website: 'https://ankun.dev',
      joined_date: '2024-02-01T00:00:00Z',
      is_admin: true,
      is_verified: true,
      social_links: {
        github: 'https://github.com/iamankun',
        twitter: 'https://twitter.com/iamankun',
        linkedin: 'https://linkedin.com/in/iamankun'
      }
    }
  ]
}

function getSocialLinksForUser(username: string): { github?: string; twitter?: string; linkedin?: string } {
  const socialLinks: Record<string, { github?: string; twitter?: string; linkedin?: string }> = {
    'admin': {
      github: 'https://github.com/iamankun',
      twitter: 'https://twitter.com/iamankun',
      linkedin: 'https://linkedin.com/in/iamankun'
    },
    'iamankun': {
      github: 'https://github.com/iamankun',
      twitter: 'https://twitter.com/iamankun',
      linkedin: 'https://linkedin.com/in/iamankun'
    }
  }
  
  return socialLinks[username] || {}
}
