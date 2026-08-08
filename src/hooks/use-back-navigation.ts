import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function getParentModule(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length <= 2) return '/admin'
  return '/' + parts.slice(0, 2).join('/')
}

export function useBackNavigation(fallback?: string) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const goBack = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback || getParentModule(pathname))
    }
  }, [navigate, pathname, fallback])

  return goBack
}
