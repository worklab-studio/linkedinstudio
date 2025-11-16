import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabase"
import type { ProfileId } from "@/lib/prompts"

type PostRow = {
  id: string
  content: string | null
  date: string
  time: string
  notes: string | null
  profile: ProfileId
  profile_name: string
  created_at: string
}

const mapRowToPost = (row: PostRow) => ({
  id: row.id,
  content: row.content ?? "",
  date: row.date,
  time: row.time,
  notes: row.notes ?? "",
  profile: row.profile,
  profileName: row.profile_name,
  createdAt: row.created_at,
})

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("id, content, date, time, notes, profile, profile_name, created_at")
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      throw error
    }

    const posts = data?.map(mapRowToPost) ?? []

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error loading scheduled posts", error)
    return NextResponse.json({ posts: [], error: "Unable to load posts" }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, date, time, notes, profile, profileName } = body

    if (!content || !date || !time || !profile || !profileName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert({
        content,
        date,
        time,
        notes,
        profile,
        profile_name: profileName,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ post: mapRowToPost(data) })
  } catch (error) {
    console.error("Error creating scheduled post", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
