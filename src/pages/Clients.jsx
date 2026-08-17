import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { slugify } from '../utils'

const STATUTS = ['Prospect', 'Actif', 'En pause', 'Terminé']

const emptyForm = {
  nom: '',
  email: '',
  telephone: '',
  activite: '',
  site_url: '',
  statut: 'Prospect',
  date_signature: '',
  notes: '',
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('clients').select('*').order('nom')
    if (error) setError(error.message)
    else setClients(data)
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

  function openEdit(client) {
    setForm({
      nom: client.nom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      activite: client.activite || '',
      site_url: client.site_url || '',
      statut: client.statut || 'Prospect',
      date_signature: client.date_signature || '',
      notes: client.notes || '',
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = { ...form, date_signature: form.date_signature || null }
    const { error } = editingId
      ? await supabase.from('clients').update(payload).eq('id', editingId)
      : await supabase.from('clients').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setShowForm(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce client et toutes ses données liées (suivi, abonnements, devis/factures) ?')) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Clients</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nouveau client
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Modifier le client' : 'Nouveau client'}</h2>
          <div className="form-grid">
            <label>
              Nom / raison sociale
              <input
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              Téléphone
              <input
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </label>
            <label>
              Activité
              <input
                value={form.activite}
                onChange={(e) => setForm({ ...form, activite: e.target.value })}
              />
            </label>
            <label>
              Site (URL)
              <input
                value={form.site_url}
                onChange={(e) => setForm({ ...form, site_url: e.target.value })}
              />
            </label>
            <label>
              Statut
              <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date de signature
              <input
                type="date"
                value={form.date_signature || ''}
                onChange={(e) => setForm({ ...form, date_signature: e.target.value })}
              />
            </label>
          </div>
          <label>
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
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
          {clients.length === 0 && <p className="empty">Aucun client pour le moment.</p>}
          {clients.map((c) => (
            <div key={c.id} className="card">
              <div className="card-main">
                <div className="card-title-row">
                  <strong>{c.nom}</strong>
                  <span className={`badge badge-${slugify(c.statut)}`}>{c.statut}</span>
                </div>
                {c.activite && <p className="muted">{c.activite}</p>}
                <div className="meta-row">
                  {c.email && <span>{c.email}</span>}
                  {c.telephone && <span>{c.telephone}</span>}
                  {c.site_url && (
                    <a href={c.site_url} target="_blank" rel="noreferrer">
                      {c.site_url}
                    </a>
                  )}
                  {c.date_signature && <span>Signé le {c.date_signature}</span>}
                </div>
                {c.notes && <p className="notes">{c.notes}</p>}
              </div>
              <div className="card-actions">
                <button className="btn-ghost" onClick={() => openEdit(c)}>
                  Modifier
                </button>
                <button className="btn-danger" onClick={() => handleDelete(c.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
