import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { email } = await req.json()
  // Log the test email (real sending requires Resend/SMTP config)
  console.log(`[Test Email] Sending to: ${email}`)
  // TODO: Integrate Resend when RESEND_API_KEY is configured
  return NextResponse.json({ ok: true })
}
