import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'

function Register({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    state_id: '',
    district_id: '',
  })
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  useEffect(() => {
    const loadStates = async () => {
      try {
        let page = 1
        let lastPage = 1
        const collected = []
        while (page <= lastPage) {
          const { data } = await api.get('/api/public/states')
          collected.push(...(data.states || []))
          lastPage = 1
          page = lastPage + 1
        }
        setStates(collected)
      } catch (err) {
        console.error('Failed to load states', err)
      }
    }

    const loadDistricts = async () => {
      try {
        let page = 1
        let lastPage = 1
        const collected = []
        while (page <= lastPage) {
          const { data } = await api.get('/api/public/districts')
          collected.push(...(data.districts || []))
          lastPage = 1
          page = lastPage + 1
        }
        setDistricts(collected)
      } catch (err) {
        console.error('Failed to load districts', err)
      }
    }

    loadStates()
    loadDistricts()
  }, [])

  const filteredDistricts = form.state_id
    ? districts.filter((district) => {
        const stateId = district.state_id ?? district.state?.id
        return String(stateId) === String(form.state_id)
      })
    : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await csrf()
      const hasXsrf = document.cookie
        .split('; ')
        .some((cookie) => cookie.startsWith('XSRF-TOKEN='))
      if (!hasXsrf) {
        console.warn('XSRF-TOKEN cookie missing after csrf() call')
      }
      const { data } = await api.post('/api/register', form)
      onLogin(data.user)
      navigate('/dashboard')
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="register-layout">
      <div className="auth-card register-info">
        <h1>Account instructions</h1>
        <p className="muted">Please read before creating your account.</p>
        <p className="register-copy">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p className="register-copy">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
      </div>
      <div className="auth-card register-form">
        <h1>Create account</h1>
        <p className="muted">Start your session in seconds.</p>
        {error ? <div className="error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            State
            <select
              name="state_id"
              value={form.state_id}
              onChange={(e) => {
                const value = e.target.value
                setForm((prev) => ({
                  ...prev,
                  state_id: value,
                  district_id: '',
                }))
              }}
              required
            >
              <option value="">---SELECT---</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            District
            <select
              name="district_id"
              value={form.district_id}
              onChange={handleChange}
              required
              disabled={!form.state_id}
            >
              <option value="">---SELECT---</option>
              {filteredDistricts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  )
}

export default Register
