import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { slugify, formatEuros } from '../utils'

const STATUTS = ['À jour', 'En retard', 'Résilié']

const emptyForm = {
  client_id: '',
  montant_mensuel: '',
  date_renouvellement_domaine: '',
  statut_prelevement: 'À jour',
  derniere_facture_envoyee: '',
}

export default function Abonnements() {
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    const [itemsRes, clientsRes] = await Promise.all([
      supabase.from('abonnements').select('*, clients(nom)').order('date_renouvellement_domaine'),
      supabase.from('clients').select('id, nom').order('nom'),
    ])
    if (itemsRes.error) setError(itemsRes.error.message)
    else setItems(itemsRes.data)
    if (clientsRes.data) setClients(clientsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({
      client_id: item.client_id,
      montant_mensuel: item.montant_mensuel ?? '',
      date_renouvellement_domaine: item.date_renouvellement_domaine || '',
      statut_prelevement: item.statut_prelevement,
      derniere_facture_envoyee: item.derniere_facture_envoyee || '',
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      client_id: form.client_id,
      montant_mensuel: form.montant_mensuel === '' ? 0 : Number(form.montant_mensuel),
      date_renouvellement_domaine: form.date_renouvellement_domaine || null,
      statut_prelevement: form.statut_prelevement,
      derniere_facture_envoyee: form.derniere_facture_envoyee || null,
    }
    const { error } = editingId
      ? await supabase.from('abonnements').update(payload).eq('id', editingId)
      : await supabase.from('abonnements').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setShowForm(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet abonnement ?')) return
    const { error } = await supabase.from('abonnements').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Abonnements</h1>
        <button className="btn-primary" onClick={openNew} disabled={clients.length === 0}>
          + Nouvel abonnement
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {clients.length === 0 && !loading && <p className="empty">Ajoute d'abord un client dans la section Clients.</p>}

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Modifier l'abonnement" : 'Nouvel abonnement'}</h2>
          <div className="form-grid">
            <label>
              Client
              <select
                required
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Montant mensuel (€)
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.montant_mensuel}
                onChange={(e) => setForm({ ...form, montant_mensuel: e.target.value })}
              />
            </label>
            <label>
              Renouvellement du domaine
              <input
                type="date"
                value={form.date_renouvellement_domaine}
                onChange={(e) => setForm({ ...form, date_renouvellement_domaine: e.target.value })}
              />
            </label>
            <label>
              Statut du prélèvement
              <select
                value={form.statut_prelevement}
                onChange={(e) => setForm({ ...form, statut_prelevement: e.target.value })}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dernière facture envoyée
              <input
                type="date"
                value={form.derniere_facture_envoyee}
                onChange={(e) => setForm({ ...form, derniere_facture_envoyee: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="page-loading">Chargement…</p>
      ) : (
        <div className="card-list">
          {items.map((a) => (
            <div key={a.id} className="card">
              <div className="card-main">
                <div className="card-title-row">
                  <strong>{a.clients?.nom}</strong>
                  <span className={`badge badge-${slugify(a.statut_prelevement)}`}>{a.statut_prelevement}</span>
                </div>
                <div className="meta-row">
                  <span>{formatEuros(a.montant_mensuel)} / mois</span>
                  {a.date_renouvellement_domaine && (
                    <span>Domaine renouvelé le {a.date_renouvellement_domaine}</span>
                  )}
                  {a.derniere_facture_envoyee && <span>Dernière facture : {a.derniere_facture_envoyee}</span>}
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-ghost" onClick={() => openEdit(a)}>
                  Modifier
                </button>
                <button className="btn-danger" onClick={() => handleDelete(a.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="empty">Aucun abonnement.</p>}
        </div>
      )}
    </div>
  )
}
