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

type Params = {
  params: {
    id: string
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params
    const body = await request.json()
    const { date, time, notes } = body

    if (!id || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("scheduled_posts")
      .update({ date, time, notes })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ post: mapRowToPost(data) })
  } catch (error) {
    console.error("Error updating post", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase.from("scheduled_posts").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
