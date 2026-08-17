import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { slugify } from '../utils'

const ETAPES = [
  'Premier échange',
  'Devis envoyé',
  'Acompte reçu',
  'En création',
  'Livré',
  'Abonnement actif',
]

export default function Suivi() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingClientId, setEditingClientId] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('clients')
      .select('id, nom, statut, suivi_projet(id, etape, date_derniere_action, prochaine_action, notes)')
      .order('nom')
    if (error) {
      setError(error.message)
    } else {
      setRows(
        data.map((c) => ({
          ...c,
          suivi: Array.isArray(c.suivi_projet) ? c.suivi_projet[0] : c.suivi_projet,
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openEdit(row) {
    const s = row.suivi || {}
    setForm({
      etape: s.etape || '',
      date_derniere_action: s.date_derniere_action || '',
      prochaine_action: s.prochaine_action || '',
      notes: s.notes || '',
    })
    setEditingClientId(row.id)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      client_id: editingClientId,
      etape: form.etape || null,
      date_derniere_action: form.date_derniere_action || null,
      prochaine_action: form.prochaine_action || null,
      notes: form.notes || null,
    }
    const { error } = await supabase.from('suivi_projet').upsert(payload, { onConflict: 'client_id' })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setEditingClientId(null)
    load()
  }

  if (loading) return <p className="page-loading">Chargement…</p>

  return (
    <div>
      <h1>Suivi de projet</h1>
      {error && <p className="error">{error}</p>}

      <div className="card-list">
        {rows.map((row) => (
          <div key={row.id} className="card">
            {editingClientId === row.id ? (
              <form className="form" onSubmit={handleSubmit}>
                <h2>{row.nom}</h2>
                <div className="form-grid">
                  <label>
                    Étape actuelle
                    <select value={form.etape} onChange={(e) => setForm({ ...form, etape: e.target.value })}>
                      <option value="">—</option>
                      {ETAPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Date de dernière action
                    <input
                      type="date"
                      value={form.date_derniere_action || ''}
                      onChange={(e) => setForm({ ...form, date_derniere_action: e.target.value })}
                    />
                  </label>
                  <label>
                    Prochaine action
                    <input
                      value={form.prochaine_action}
                      onChange={(e) => setForm({ ...form, prochaine_action: e.target.value })}
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
                  <button type="button" className="btn-ghost" onClick={() => setEditingClientId(null)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="card-main">
                <div className="card-title-row">
                  <strong>{row.nom}</strong>
                  {row.suivi?.etape && (
                    <span className={`badge badge-${slugify(row.suivi.etape)}`}>{row.suivi.etape}</span>
                  )}
                </div>
                <div className="meta-row">
                  {row.suivi?.date_derniere_action && (
                    <span>Dernière action : {row.suivi.date_derniere_action}</span>
                  )}
                  {row.suivi?.prochaine_action && <span>Prochaine : {row.suivi.prochaine_action}</span>}
                </div>
                {row.suivi?.notes && <p className="notes">{row.suivi.notes}</p>}
                <div className="card-actions">
                  <button className="btn-ghost" onClick={() => openEdit(row)}>
                    Modifier le suivi
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="empty">Aucun client. Ajoute des clients dans la section Clients.</p>
        )}
      </div>
    </div>
  )
}
