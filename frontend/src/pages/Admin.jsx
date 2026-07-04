import { useEffect, useState } from 'react'
import api, { csrf } from '../api'
import { ROLES, PRINCIPAL_ROLES } from '../constants/roles'

const roleOptions = [
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
  { value: ROLES.DISTRICT_ADMIN, label: 'District Admin' },
  { value: ROLES.RENT_AUTHORITY, label: 'Rent Authority' },
  { value: ROLES.RENT_COURT, label: 'Rent Court' },
  { value: ROLES.RENT_TRIBUNAL, label: 'Rent Tribunal' },
  { value: ROLES.RA_ASSISTANT, label: 'RA Assistant' },
  { value: ROLES.RC_ASSISTANT, label: 'RC Assistant' },
  { value: ROLES.RT_ASSISTANT, label: 'RT Assistant' },
  { value: ROLES.USER, label: 'User' },
]

function Admin({ user }) {
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [stateForm, setStateForm] = useState({ name: '' })
  const [districtForm, setDistrictForm] = useState({
    name: '',
    state_id: '',
    assistant_director_id: '',
    district_head_id: '',
  })
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'ra_assistant',
    district_id: '',
    reports_to_user_id: '',
  })

  const loadAll = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const [statesRes, districtsRes, usersRes] = await Promise.all([
        api.get('/api/states'),
        api.get('/api/districts'),
        api.get('/api/users'),
      ])
      setStates(statesRes.data.states || [])
      setDistricts(districtsRes.data.districts || [])
      setUsers(usersRes.data.users || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleStateSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await csrf()
      await api.post('/api/states', stateForm)
      setStateForm({ name: '' })
      setSuccess('State created.')
      setTimeout(() => setSuccess(''), 3000)
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create state')
    }
  }

  const handleDistrictSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await csrf()
      const payload = {
        name: districtForm.name,
        state_id: districtForm.state_id || null,
        assistant_director_id: districtForm.assistant_director_id || null,
        district_head_id: districtForm.district_head_id || null,
      }
      await api.post('/api/districts', payload)
      setDistrictForm({
        name: '',
        state_id: '',
        assistant_director_id: '',
        district_head_id: '',
      })
      setSuccess('District created.')
      setTimeout(() => setSuccess(''), 3000)
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create district')
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await csrf()
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
        district_id: userForm.district_id || null,
        reports_to_user_id: userForm.reports_to_user_id || null,
      }
      await api.post('/api/users', payload)
      setUserForm({
        name: '',
        email: '',
        phone: '',
        role: ROLES.RA_ASSISTANT,
        district_id: '',
        reports_to_user_id: '',
      })
      setSuccess('User created.')
      setTimeout(() => setSuccess(''), 3000)
      await loadAll()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create user')
    }
  }

  if (user?.role !== 'system_admin') {
    return (
      <div className="auth-card dashboard-card">
        <h1>Admin Access</h1>
        <p className="muted">
          You do not have permission to access this area.
        </p>
      </div>
    )
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">System administration</p>
          <h1>Admin Console</h1>
          <p className="muted">
            Create users, states, and districts from a single workspace.
          </p>
        </div>
        <button type="button" className="secondary" onClick={loadAll}>
          Refresh
        </button>
      </div>

      {loading ? <p className="muted">Loading admin data...</p> : null}
      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="admin-success">{success}</div> : null}

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Create State</h2>
          <form onSubmit={handleStateSubmit}>
            <label>
              State name
              <input
                type="text"
                value={stateForm.name}
                onChange={(e) => setStateForm({ name: e.target.value })}
                required
              />
            </label>
            <button type="submit">Add State</button>
          </form>
        </div>

        <div className="admin-card">
          <h2>Create District</h2>
          <form onSubmit={handleDistrictSubmit}>
            <label>
              District name
              <input
                type="text"
                value={districtForm.name}
                onChange={(e) =>
                  setDistrictForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </label>
            <label>
              State
              <select
                value={districtForm.state_id}
                onChange={(e) =>
                  setDistrictForm((prev) => ({
                    ...prev,
                    state_id: e.target.value,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assistant Director
              <select
                value={districtForm.assistant_director_id}
                onChange={(e) =>
                  setDistrictForm((prev) => ({
                    ...prev,
                    assistant_director_id: e.target.value,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {users
                  .filter((entry) => entry.role === ROLES.RENT_AUTHORITY)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              District Head
              <select
                value={districtForm.district_head_id}
                onChange={(e) =>
                  setDistrictForm((prev) => ({
                    ...prev,
                    district_head_id: e.target.value,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {users
                  .filter((entry) => entry.role === ROLES.RENT_COURT)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
              </select>
            </label>
            <button type="submit">Add District</button>
          </form>
        </div>

        <div className="admin-card">
          <h2>Create User</h2>
          <form onSubmit={handleUserSubmit}>
            <label>
              Full name
              <input
                type="text"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Phone
              <input
                type="text"
                value={userForm.phone}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </label>
            <label>
              Role
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              District (for district roles)
              <select
                value={userForm.district_id}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    district_id: e.target.value,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reports to (for heads/assistants)
              <select
                value={userForm.reports_to_user_id}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    reports_to_user_id: e.target.value,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {users
                  .filter((entry) =>
                    PRINCIPAL_ROLES.includes(entry.role)
                  )
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} ({entry.role.replace('_', ' ')})
                    </option>
                  ))}
              </select>
            </label>
            <button type="submit">Create User</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Admin
