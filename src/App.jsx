import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Nav from './components/Nav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Suivi from './pages/Suivi'
import Abonnements from './pages/Abonnements'
import DevisFactures from './pages/DevisFactures'

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Nav />
      <main className="app-content">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/suivi" element={<Suivi />} />
                  <Route path="/abonnements" element={<Abonnements />} />
                  <Route path="/devis-factures" element={<DevisFactures />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
