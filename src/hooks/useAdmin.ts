import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AdminState = {
  loading: boolean
  signedIn: boolean
  isAdmin: boolean
  user: User | null
  error: string
}

export function useAdmin() {
  const [session, setSession] = useState<Session | null>(null)
  const [state, setState] = useState<AdminState>({
    loading: Boolean(supabase),
    signedIn: false,
    isAdmin: false,
    user: null,
    error: '',
  })

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setState((current) => ({ ...current, loading: true }))
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    let active = true

    async function checkAccess() {
      if (!session) {
        if (active) {
          setState({ loading: false, signedIn: false, isAdmin: false, user: null, error: '' })
        }
        return
      }

      const { data, error } = await supabase!.rpc('is_admin')
      if (!active) return

      setState({
        loading: false,
        signedIn: true,
        isAdmin: !error && data === true,
        user: session.user,
        error: error ? 'Could not verify admin access. Please try again.' : '',
      })
    }

    setState((current) => ({ ...current, loading: true }))
    void checkAccess()
    return () => {
      active = false
    }
  }, [session])

  const signIn = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    })
    if (error) setState((current) => ({ ...current, error: error.message }))
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  return { ...state, signIn, signOut }
}
