import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { csrf } from '../api'

function UserDetail({ user: currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    office_id: '',
    designation_id: '',
    role: '',
  })
  const [offices, setOffices] = useState([])
  const [designations, setDesignations] = useState([])
  const [roles, setRoles] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUser = async () => {
    try {
      const { data } = await api.get(`/api/users/${id}`)
      setUser(data.user)
      setForm({
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        office_id: data.user?.office_id ? String(data.user.office_id) : '',
        designation_id: data.user?.designation_id
          ? String(data.user.designation_id)
          : '',
        role: data.user?.role || '',
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load user')
    }
  }

  const loadOptions = async () => {
    try {
      const [officeRes, designationRes, roleRes] = await Promise.all([
        api.get('/api/offices', { params: { page: 1 } }),
        api.get('/api/designations', { params: { page: 1 } }),
        api.get('/api/roles', { params: { page: 1 } }),
      ])
      setOffices(officeRes.data?.data || [])
      setDesignations(designationRes.data?.data || [])
      setRoles(roleRes.data?.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load options')
    }
  }

  useEffect(() => {
    loadUser()
    loadOptions()
  }, [id])

  const handleUpdate = async () => {
    setError('')
    setSuccess('')
    try {
      await csrf()
      await api.put(`/api/users/${id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        office_id: form.office_id || null,
        designation_id: form.designation_id || null,
        role: form.role,
      })
      setSuccess('User updated successfully.')
      setEditMode(false)
      await loadUser()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user')
    }
  }

  const handleApprove = async () => {
    setError('')
    setSuccess('')
    try {
      await csrf()
      await api.post(`/api/users/${id}/approve`)
      setSuccess('User approved successfully.')
      await loadUser()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to approve user')
    }
  }

  const handleDelete = async () => {
    setError('')
    setSuccess('')
    try {
      await csrf()
      await api.delete(`/api/users/${id}`)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  if (!user) {
    return (
      <div className="auth-card dashboard-card">
        <h1>User Details</h1>
        {error ? <div className="error">{error}</div> : null}
        <p className="muted">Loading user...</p>
      </div>
    )
  }

  return (
    <section className="dashboard-layout">
      <aside className="dashboard-menu">
        <nav className="dashboard-links">
          <Link className="dashboard-link" to="/dashboard">
            Dashboard
          </Link>
          {currentUser?.role !== 'tenant owner' ? (
            <>
              <Link className="dashboard-link" to="/dashboard">
                State Managment
              </Link>
              <Link className="dashboard-link" to="/dashboard">
                District Managment
              </Link>
              <Link className="dashboard-link" to="/dashboard">
                Office Managment
              </Link>
              <Link className="dashboard-link" to="/dashboard">
                Role Managment
              </Link>
              <Link className="dashboard-link" to="/dashboard">
                User Managment
              </Link>
            </>
          ) : null}
        </nav>
      </aside>
      <div className="auth-card dashboard-card">
      <div className="admin-header">
        <div>
          <h1>User Details</h1>
          <p className="muted">Manage user information and approvals.</p>
        </div>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="admin-success">{success}</div> : null}
      <div className="admin-card user-detail-grid user-detail-section">
        <label>
          Name
          {editMode ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          ) : (
            <div className="muted">{user.name}</div>
          )}
        </label>
        <label>
          Email
          {editMode ? (
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          ) : (
            <div className="muted">{user.email}</div>
          )}
        </label>
        <label>
          Phone
          {editMode ? (
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          ) : (
            <div className="muted">{user.phone || '-'}</div>
          )}
        </label>
        {String(user.role || '').toLowerCase().trim() === 'tenant owner' ||
        String(user.role || '').toLowerCase().trim() === 'tenant_owner' ? null : (
          <>
            <label>
              Office
              {editMode ? (
                <select
                  value={form.office_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, office_id: e.target.value }))
                  }
                >
                  <option value="">---SELECT---</option>
                  {offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="muted">{user.office?.name || 'Unassigned'}</div>
              )}
            </label>
            <label>
              Designation
              {editMode ? (
                <select
                  value={form.designation_id}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, designation_id: e.target.value }))
                  }
                >
                  <option value="">---SELECT---</option>
                  {designations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="muted">
                  {user.designation?.name || 'Unassigned'}
                </div>
              )}
            </label>
          </>
        )}
        {String(user.role || '').toLowerCase().trim() === 'tenant owner' ||
        String(user.role || '').toLowerCase().trim() === 'tenant_owner' ? null : (
          <label>
            Role
            {editMode ? (
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="">---SELECT---</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="muted">{user.role}</div>
            )}
          </label>
        )}
        <label>
          Status
          <div className="muted">
            {user.is_blocked
              ? 'Blocked'
              : user.approved_at
              ? 'Approved'
              : 'Pending'}
          </div>
        </label>
        <label>
          Created date
          <div className="muted">
            {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
          </div>
        </label>
        {currentUser?.role === 'system_admin' &&
        (String(user.role || '').toLowerCase().trim() === 'tenant owner' ||
          String(user.role || '').toLowerCase().trim() === 'tenant_owner') ? (
          <label>
            Block user
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={Boolean(user.is_blocked)}
                onChange={async () => {
                  setError('')
                  setSuccess('')
                  try {
                    await csrf()
                    await api.post(`/api/users/${user.id}/toggle-block`)
                    await loadUser()
                  } catch (err) {
                    setError(
                      err?.response?.data?.message || 'Failed to update status'
                    )
                  }
                }}
              />
              <span className="toggle-slider" />
            </label>
          </label>
        ) : null}
      </div>
      <div className="nav-actions user-detail-actions">
        {String(user.role || '').toLowerCase().trim() === 'tenant owner' ||
        String(user.role || '').toLowerCase().trim() === 'tenant_owner' ? null : editMode ? (
          <>
            <button type="button" onClick={handleUpdate}>
              Save
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditMode(true)}>
              Edit
            </button>
            {currentUser?.role === 'system_admin' && !user.approved_at ? (
              <button type="button" onClick={handleApprove}>
                Approve
              </button>
            ) : null}
            <button type="button" className="secondary" onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </div>
      </div>
    </section>
  )
}

export default UserDetail
