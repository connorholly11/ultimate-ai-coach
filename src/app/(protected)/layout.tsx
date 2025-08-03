import { redirect } from 'next/navigation'
import { sbServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'   // prevent static generation

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = sbServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/?unauth=1')
  }

  return <>{children}</>
}