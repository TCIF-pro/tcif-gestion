import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatEuros } from '../utils'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [clientsRes, abosRes, devisRes] = await Promise.all([
          supabase.from('clients').select('id, statut'),
          supabase.from('abonnements').select('montant_mensuel, statut_prelevement'),
          supabase.from('devis_factures').select('type, statut'),
        ])

        if (clientsRes.error) throw clientsRes.error
        if (abosRes.error) throw abosRes.error
        if (devisRes.error) throw devisRes.error

        const clientsActifs = clientsRes.data.filter((c) => c.statut === 'Actif').length

        const mrr = abosRes.data
          .filter((a) => a.statut_prelevement !== 'Résilié')
          .reduce((sum, a) => sum + Number(a.montant_mensuel || 0), 0)

        const devisEnAttente = devisRes.data.filter(
          (d) => d.type === 'Devis' && (d.statut === 'Envoyé' || d.statut === 'En attente')
        ).length

        const facturesImpayees = devisRes.data.filter(
          (d) => d.type === 'Facture' && d.statut !== 'Payé'
        ).length

        setStats({ clientsActifs, mrr, devisEnAttente, facturesImpayees })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="page-loading">Chargement…</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1>Tableau de bord</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.clientsActifs}</span>
          <span className="stat-label">Clients actifs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatEuros(stats.mrr)}</span>
          <span className="stat-label">Revenu mensuel récurrent</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.devisEnAttente}</span>
          <span className="stat-label">Devis en attente</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.facturesImpayees}</span>
          <span className="stat-label">Factures impayées</span>
        </div>
      </div>
    </div>
  )
}
