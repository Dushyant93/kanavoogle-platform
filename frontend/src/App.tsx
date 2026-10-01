import { assessmentRoutes } from './pages/assessments/routes'
import { ComingSoon } from './pages/public/ComingSoon'
import { Home } from './pages/public/Home'
import { Login } from './pages/public/Login'
import { Register } from './pages/public/Register'
import { Dashboard } from './pages/student/Dashboard'
import { SkillsWallet } from './pages/wallet'
import { Profile } from './pages/profile'
import { Profile as EditProfile } from './pages/student/Profile'

// Links that exist in the UI but whose pages aren't built yet.
// Remove a path from here once its real page is added below.
const COMING_SOON_PAGES: Record<string, { title: string; signedIn: boolean }> = {
  '/forgot-password': { title: 'Password reset', signedIn: false },
  '/profile/share': { title: 'Share profile', signedIn: true },
  '/wallet/export': { title: 'Export ledger', signedIn: true },
  '/privacy': { title: 'Privacy policy', signedIn: false },
  '/terms': { title: 'Terms of accreditation', signedIn: false },
  '/audit-ledger': { title: 'Audit ledger', signedIn: false },
}

export default function App() {
  const path = window.location.pathname
  if (path === '/login') return <Login />
  if (path === '/register') return <Register />
  if (path === '/student') return <Dashboard />
  if (path === '/wallet') return <SkillsWallet />
  if (path === '/profile/edit') return <EditProfile />
  if (path === '/profile') return <Profile />
  const AssessmentPage = assessmentRoutes[path]
  if (AssessmentPage) return <AssessmentPage />
  const comingSoon = COMING_SOON_PAGES[path]
  if (comingSoon) return <ComingSoon {...comingSoon} />
  return <Home />
}
