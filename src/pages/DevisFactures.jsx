import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { slugify, formatEuros } from '../utils'

const TYPES = ['Devis', 'Facture']
const STATUTS = ['Envoyé', 'Accepté', 'Payé', 'En attente']

const emptyForm = {
  client_id: '',
  type: 'Devis',
  numero: '',
  date: '',
  montant: '',
  statut: 'Envoyé',
}

export default function DevisFactures() {
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('Tous')

  async function load() {
    setLoading(true)
    setError('')
    const [itemsRes, clientsRes] = await Promise.all([
      supabase.from('devis_factures').select('*, clients(nom)').order('date', { ascending: false }),
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
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({
      client_id: item.client_id,
      type: item.type,
      numero: item.numero || '',
      date: item.date || '',
      montant: item.montant ?? '',
      statut: item.statut,
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
      type: form.type,
      numero: form.numero || null,
      date: form.date || null,
      montant: form.montant === '' ? 0 : Number(form.montant),
      statut: form.statut,
    }
    const { error } = editingId
      ? await supabase.from('devis_factures').update(payload).eq('id', editingId)
      : await supabase.from('devis_factures').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setShowForm(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce document ?')) return
    const { error } = await supabase.from('devis_factures').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  const filtered = filterType === 'Tous' ? items : items.filter((i) => i.type === filterType)

  return (
    <div>
      <div className="page-header">
        <h1>Devis & Factures</h1>
        <button className="btn-primary" onClick={openNew} disabled={clients.length === 0}>
          + Nouveau
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {clients.length === 0 && !loading && <p className="empty">Ajoute d'abord un client dans la section Clients.</p>}

      <div className="filter-row">
        {['Tous', ...TYPES].map((t) => (
          <button
            key={t}
            className={`chip ${filterType === t ? 'chip-active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Modifier le document' : 'Nouveau document'}</h2>
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
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Numéro
              <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </label>
            <label>
              Date
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label>
              Montant (€)
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
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
          {filtered.map((d) => (
            <div key={d.id} className="card">
              <div className="card-main">
                <div className="card-title-row">
                  <strong>{d.clients?.nom}</strong>
                  <span className={`badge badge-${slugify(d.statut)}`}>{d.statut}</span>
                </div>
                <div className="meta-row">
                  <span>
                    {d.type}
                    {d.numero ? ` n°${d.numero}` : ''}
                  </span>
                  <span>{d.date}</span>
                  <span>{formatEuros(d.montant)}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn-ghost" onClick={() => openEdit(d)}>
                  Modifier
                </button>
                <button className="btn-danger" onClick={() => handleDelete(d.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="empty">Aucun document.</p>}
        </div>
      )}
    </div>
  )
}
