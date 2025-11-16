import { NextResponse } from "next/server"

import { getSupabaseClient } from "@/lib/supabase"
import { initialPrompts, type PromptState, type PromptSection, type ProfileId } from "@/lib/prompts"

const clonePrompts = (): PromptState => JSON.parse(JSON.stringify(initialPrompts))

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("prompts").select("profile, section, content")

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ prompts: initialPrompts })
    }

    const normalized = clonePrompts()

    data.forEach(row => {
      const section = row.section as PromptSection
      const profile = (row.profile as ProfileId) || "simmi"
      const content = row.content ?? ""

      normalized[section][profile] = content
    })

    return NextResponse.json({ prompts: normalized })
  } catch (error) {
    console.error("Error loading prompts from Supabase", error)
    return NextResponse.json(
      { prompts: initialPrompts, error: "Unable to fetch prompts from Supabase" },
      { status: 200 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const section = body.section as PromptSection
    const content = body.content as string
    const profileValue = body.profile as ProfileId

    if (!section || typeof content !== "string" || !profileValue) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("prompts").upsert(
      {
        profile: profileValue,
        section,
        content,
      },
      {
        onConflict: "profile,section",
      }
    )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving prompt", error)
    return NextResponse.json({ error: "Failed to save prompt" }, { status: 500 })
  }
}
