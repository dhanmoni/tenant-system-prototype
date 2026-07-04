import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'
import { formatApiErrors } from '../utils/formatApiErrors'

function Register({ onLogin }) {
	const navigate = useNavigate()
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
		phone: '',
		district_id: '',
		gender: '',
		date_of_birth: '',
	})
	const [districts, setDistricts] = useState([])
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
	}

	useEffect(() => {
		const loadDistricts = async () => {
			try {
				const { data } = await api.get('/api/public/districts')
				const list = Array.isArray(data.districts) ? data.districts : []
				setDistricts(
					[...list].sort((a, b) =>
						(a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
					)
				)
			} catch (err) {
				console.error('Failed to load districts', err)
			}
		}

		loadDistricts()
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/register', {
				...form,
				district_id: Number(form.district_id),
			})
			onLogin(data.user)
			navigate('/dashboard')
		} catch (err) {
			setError(formatApiErrors(err, 'Registration failed. Please check your details.'))
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
						District
						<select
							name="district_id"
							value={form.district_id}
							onChange={handleChange}
							required
						>
							<option value="">Select district</option>
							{districts.map((district) => (
								<option key={district.id} value={district.id}>
									{district.name}
								</option>
							))}
						</select>
					</label>
					<label>
						Gender
						<select name="gender" value={form.gender} onChange={handleChange} required>
							<option value="">Select gender</option>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Other">Other</option>
						</select>
					</label>
					<label>
						Date of birth
						<input
							type="date"
							name="date_of_birth"
							value={form.date_of_birth}
							onChange={handleChange}
							max={new Date().toISOString().split('T')[0]}
							required
						/>
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

