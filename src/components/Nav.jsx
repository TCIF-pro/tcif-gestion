import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Accueil', icon: '📊', end: true },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/suivi', label: 'Suivi', icon: '🛠️' },
  { to: '/abonnements', label: 'Abos', icon: '💳' },
  { to: '/devis-factures', label: 'Devis/Fact.', icon: '📄' },
]

export default function Nav() {
  const { signOut } = useAuth()

  return (
    <>
      <header className="topbar">
        <span className="brand">TCIF CRM</span>
        <nav className="topbar-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn-ghost" onClick={signOut}>Déconnexion</button>
      </header>

      <nav className="bottombar">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="icon">{l.icon}</span>
            <span className="label">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
