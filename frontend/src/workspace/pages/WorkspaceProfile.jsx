import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import api, { csrf } from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import { getRoleLabel } from '../../constants/roleLabels'
import { formatDisplayEmail, formatDisplayName } from '../../utils/formatters'

function WorkspaceProfile() {
	const { user, onUserUpdate } = useOutletContext()
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileEditing, setProfileEditing] = useState(false)

	const [profileName, setProfileName] = useState('')
	const [profileEmail, setProfileEmail] = useState('')
	const [profilePhone, setProfilePhone] = useState('')
	const [profileAddress, setProfileAddress] = useState('')
	const [profileDistrict, setProfileDistrict] = useState('')
	const [profilePin, setProfilePin] = useState('')
	const [profilePan, setProfilePan] = useState('')
	const [profilePhoto, setProfilePhoto] = useState(null)
	const [profilePhotoPreview, setProfilePhotoPreview] = useState('')

	const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
	const displayName = formatDisplayName(profileName || user?.name)
	const displayEmail = formatDisplayEmail(profileEmail || user?.email)
	const roleLabel = getRoleLabel(user?.role)

	useEffect(() => {
		loadProfile()
	}, [])

	const loadProfile = async () => {
		setError('')
		setSuccess('')
		setProfileLoading(true)
		try {
			const { data } = await api.get('/api/profile')
			const profileUser = data.user || {}
			setProfileName(profileUser.name || '')
			setProfileEmail(profileUser.email || '')
			setProfilePhone(profileUser.phone || '')
			setProfileDistrict(profileUser.district?.name || '')
			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')

			const photoUrl = profileUser.passport_photo_url
			const photoPath =
				profileUser.passport_photo_path || profileUser.user_passport_photo_path

			if (photoUrl) {
				setProfilePhotoPreview(photoUrl)
			} else if (photoPath) {
				setProfilePhotoPreview(`${apiBaseUrl}/storage/${photoPath}`)
			} else {
				setProfilePhotoPreview('')
			}

			const hasFullProfile =
				profileUser.address &&
				profileUser.pin_code &&
				profileUser.pan_card &&
				(photoUrl || photoPath)

			setProfileEditing(!hasFullProfile)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load profile')
		} finally {
			setProfileLoading(false)
		}
	}

	const handleProfileSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		setProfileLoading(true)
		try {
			await csrf()
			const formData = new FormData()
			formData.append('_method', 'PUT')
			formData.append('address', (profileAddress || '').trim())
			formData.append('pin_code', (profilePin || '').trim().slice(0, 6))
			formData.append('pan_card', (profilePan || '').trim().toUpperCase().slice(0, 10))
			if (profilePhoto) {
				formData.append('passport_photo', profilePhoto)
			}

			const { data } = await api.post('/api/profile', formData)
			const profileUser = data.user || {}

			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')

			const photoUrl = profileUser.passport_photo_url
			const photoPath =
				profileUser.passport_photo_path || profileUser.user_passport_photo_path

			if (photoUrl) {
				setProfilePhotoPreview(photoUrl)
			} else if (photoPath) {
				setProfilePhotoPreview(`${apiBaseUrl}/storage/${photoPath}`)
			}

			if (typeof onUserUpdate === 'function') {
				onUserUpdate((prev) => ({ ...(prev || {}), ...profileUser }))
			}

			setProfilePhoto(null)
			setSuccess('Profile saved successfully.')
			setProfileEditing(false)
		} catch (err) {
			const data = err?.response?.data
			const errors = data?.errors || {}
			const firstError =
				errors.address?.[0] ||
				errors.pin_code?.[0] ||
				errors.pan_card?.[0] ||
				errors.passport_photo?.[0]
			setError(firstError || data?.message || 'Failed to save profile')
		} finally {
			setProfileLoading(false)
		}
	}

	const hasProfile =
		!!profileAddress && !!profilePin && !!profilePan && !!profilePhotoPreview

	if (profileLoading && !profileName) {
		return (
			<div className="ws-page ws-profile-page">
				<div className="ws-empty">Loading profile…</div>
			</div>
		)
	}

	return (
		<div className="ws-page ws-profile-page">
			<nav className="ws-breadcrumb" aria-label="Breadcrumb">
				<Link to="/dashboard">Dashboard</Link>
				<span className="ws-breadcrumb-sep">/</span>
				<span>My profile</span>
			</nav>

			<section className="ws-profile-hero">
				<div className="ws-profile-hero-main">
					{profilePhotoPreview ? (
						<img src={profilePhotoPreview} alt="" className="ws-profile-hero-photo" />
					) : (
						<span className="ws-profile-hero-photo-fallback" aria-hidden>
							<Icon name="user" />
						</span>
					)}
					<div className="ws-profile-hero-info">
						<h1 className="ws-profile-hero-name">{displayName}</h1>
						<p className="ws-profile-hero-email">{displayEmail}</p>
						<div className="ws-profile-hero-meta">
							<span className="ws-profile-hero-pill">{roleLabel}</span>
							{profileDistrict ? (
								<span className="ws-profile-hero-pill">{profileDistrict}</span>
							) : null}
							<span
								className={`ws-profile-hero-pill ws-profile-hero-pill--${
									hasProfile ? 'complete' : 'pending'
								}`}
							>
								{hasProfile ? 'Profile complete' : 'Profile incomplete'}
							</span>
						</div>
					</div>
				</div>
				{hasProfile && !profileEditing ? (
					<button
						type="button"
						className="ws-btn ws-btn--primary"
						onClick={() => {
							setProfileEditing(true)
							setSuccess('')
							setError('')
						}}
					>
						Edit profile
					</button>
				) : null}
			</section>

			{!hasProfile ? (
				<div className="ws-alert ws-alert--warning" role="status">
					Complete your profile so future applications can be auto-filled.
				</div>
			) : null}

			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}
			{success ? (
				<div className="ws-profile-alert ws-profile-alert--success" role="status">
					{success}
				</div>
			) : null}

			{hasProfile && !profileEditing ? (
				<div className="ws-profile-details">
					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Personal details</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body">
							<dl className="ws-profile-dl">
								<div className="ws-profile-dl-row">
									<dt>Name</dt>
									<dd>{profileName}</dd>
								</div>
								<div className="ws-profile-dl-row">
									<dt>Email</dt>
									<dd>{profileEmail}</dd>
								</div>
								<div className="ws-profile-dl-row">
									<dt>Phone</dt>
									<dd>{profilePhone || '—'}</dd>
								</div>
							</dl>
						</div>
					</section>

					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Address</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body">
							<dl className="ws-profile-dl">
								<div className="ws-profile-dl-row ws-profile-dl-row--full">
									<dt>Address</dt>
									<dd>{profileAddress}</dd>
								</div>
								<div className="ws-profile-dl-row">
									<dt>District</dt>
									<dd>{profileDistrict || '—'}</dd>
								</div>
								<div className="ws-profile-dl-row">
									<dt>PIN code</dt>
									<dd>{profilePin}</dd>
								</div>
							</dl>
						</div>
					</section>

					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Identity</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body">
							<dl className="ws-profile-dl">
								<div className="ws-profile-dl-row">
									<dt>PAN card</dt>
									<dd>{profilePan}</dd>
								</div>
							</dl>
						</div>
					</section>
				</div>
			) : (
				<form className="ws-profile-form" onSubmit={handleProfileSubmit} noValidate>
					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Profile photo</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body">
							<div className="ws-profile-photo-upload">
								{profilePhotoPreview ? (
									<img
										src={profilePhotoPreview}
										alt=""
										className="ws-profile-photo-preview"
									/>
								) : (
									<span className="ws-profile-photo-fallback" aria-hidden>
										<Icon name="user" />
									</span>
								)}
								<div className="ws-profile-photo-actions">
									<label className="ws-profile-file-label">
										<input
											type="file"
											accept="image/png,image/jpeg"
											required={!profilePhotoPreview}
											className="ws-profile-file-input"
											onChange={(e) => {
												const file = e.target.files?.[0] || null
												setProfilePhoto(file)
												if (file) {
													const reader = new FileReader()
													reader.onload = () =>
														setProfilePhotoPreview(
															reader.result?.toString() || ''
														)
													reader.readAsDataURL(file)
												}
											}}
										/>
										<span className="ws-btn ws-btn--outline">
											{profilePhotoPreview ? 'Change photo' : 'Upload photo'}
										</span>
									</label>
									<p className="ws-profile-hint">
										Passport-size photo. PNG or JPEG only.
									</p>
								</div>
							</div>
						</div>
					</section>

					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Account details</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body ws-profile-fields">
							<label className="ws-profile-field">
								<span className="ws-profile-field-label">Name</span>
								<input type="text" value={profileName} readOnly />
							</label>
							<label className="ws-profile-field">
								<span className="ws-profile-field-label">Email</span>
								<input type="email" value={profileEmail} readOnly />
							</label>
							<label className="ws-profile-field">
								<span className="ws-profile-field-label">Phone</span>
								<input type="text" value={profilePhone} readOnly />
							</label>
							<label className="ws-profile-field">
								<span className="ws-profile-field-label">District</span>
								<input type="text" value={profileDistrict} readOnly />
							</label>
						</div>
					</section>

					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Address</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body ws-profile-fields">
							<label className="ws-profile-field ws-profile-field--full">
								<span className="ws-profile-field-label">Address</span>
								<textarea
									rows={4}
									value={profileAddress}
									onChange={(e) => setProfileAddress(e.target.value)}
									maxLength={500}
									required
								/>
							</label>
							<label className="ws-profile-field">
								<span className="ws-profile-field-label">PIN code</span>
								<input
									type="text"
									inputMode="numeric"
									value={profilePin}
									onChange={(e) => {
										if (/^\d*$/.test(e.target.value)) {
											setProfilePin(e.target.value)
										}
									}}
									pattern="^\d{6}$"
									title="Enter a 6 digit PIN code."
									maxLength={6}
									required
								/>
							</label>
						</div>
					</section>

					<section className="ws-card ws-profile-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Identity</h2>
						</div>
						<div className="ws-card-body ws-profile-card-body ws-profile-fields">
							<label className="ws-profile-field">
								<span className="ws-profile-field-label">PAN card</span>
								<input
									type="text"
									value={profilePan}
									onChange={(e) => {
										const next = e.target.value.toUpperCase()
										if (/^[A-Z0-9]*$/.test(next)) {
											setProfilePan(next)
										}
									}}
									pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
									title="Enter a valid PAN (e.g. ABCDE1234F)."
									maxLength={10}
									required
								/>
							</label>
						</div>
					</section>

					<div className="ws-profile-form-actions">
						<button
							type="submit"
							className="ws-btn ws-btn--primary"
							disabled={profileLoading}
						>
							{profileLoading ? 'Saving…' : 'Save profile'}
						</button>
						{hasProfile ? (
							<button
								type="button"
								className="ws-btn ws-btn--outline"
								disabled={profileLoading}
								onClick={() => {
									setProfileEditing(false)
									setSuccess('')
									setError('')
									loadProfile()
								}}
							>
								Cancel
							</button>
						) : null}
					</div>
				</form>
			)}
		</div>
	)
}

export default WorkspaceProfile
