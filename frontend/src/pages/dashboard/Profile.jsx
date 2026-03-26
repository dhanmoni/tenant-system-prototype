import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { csrf } from '../../api'

function Profile() {
	const { user } = useOutletContext()
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileEditing, setProfileEditing] = useState(false)

	const [profileType, setProfileType] = useState('')
	const [profileName, setProfileName] = useState('')
	const [profileEmail, setProfileEmail] = useState('')
	const [profilePhone, setProfilePhone] = useState('')
	const [profileAddress, setProfileAddress] = useState('')
	const [profileDistrict, setProfileDistrict] = useState('')
	const [profileState, setProfileState] = useState('')
	const [profilePin, setProfilePin] = useState('')
	const [profilePan, setProfilePan] = useState('')
	const [profilePhoto, setProfilePhoto] = useState(null)
	const [profilePhotoPreview, setProfilePhotoPreview] = useState('')

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
			setProfileState(profileUser.district?.state?.name || '')
			setProfileType(profileUser.profile_type || '')
			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')
			
			const photoUrl = profileUser.passport_photo_url
			const photoPath = profileUser.passport_photo_path || profileUser.user_passport_photo_path
			
			if (photoUrl) {
				setProfilePhotoPreview(photoUrl)
			} else if (photoPath) {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
				setProfilePhotoPreview(`${baseUrl}/storage/${photoPath}`)
			} else {
				setProfilePhotoPreview('')
			}

			const hasFullProfile = 
				profileUser.profile_type &&
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
			formData.append('profile_type', (profileType || '').trim())
			formData.append('address', (profileAddress || '').trim())
			formData.append('pin_code', (profilePin || '').trim().slice(0, 6))
			formData.append('pan_card', (profilePan || '').trim().toUpperCase().slice(0, 10))
			if (profilePhoto) {
				formData.append('passport_photo', profilePhoto)
			}
			
			const { data } = await api.post('/api/profile', formData)
			const profileUser = data.user || {}
			
			setProfileType(profileUser.profile_type || '')
			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')
			
			const photoUrl = profileUser.passport_photo_url
			const photoPath = profileUser.passport_photo_path || profileUser.user_passport_photo_path
			
			if (photoUrl) {
				setProfilePhotoPreview(photoUrl)
			} else if (photoPath) {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
				setProfilePhotoPreview(`${baseUrl}/storage/${photoPath}`)
			}
			
			setProfilePhoto(null)
			setSuccess('Profile saved successfully.')
			setProfileEditing(false)
		} catch (err) {
			const data = err?.response?.data
			const errors = data?.errors || {}
			const firstError =
				errors.profile_type?.[0] || errors.address?.[0] || errors.pin_code?.[0] ||
				errors.pan_card?.[0] || errors.passport_photo?.[0]
			setError(firstError || data?.message || 'Failed to save profile')
		} finally {
			setProfileLoading(false)
		}
	}

	const hasProfile =
		!!profileType &&
		!!profileAddress &&
		!!profilePin &&
		!!profilePan &&
		!!profilePhotoPreview

	if (profileLoading && !profileName) {
		return <div className="profile-loading">Loading profile…</div>
	}

	return (
		<div className="auth-card dashboard-card profile-page">
			<div className="profile-page-header">
				<h1>Profile</h1>
				<p className="muted">
					{hasProfile && !profileEditing
						? 'View and manage your account details.'
						: 'Complete or update your profile information.'}
				</p>
			</div>
			
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}
			
			{hasProfile && !profileEditing ? (
				<div className="profile-summary">
					<div className="profile-hero">
						<div className="profile-avatar-wrap">
							{profilePhotoPreview ? (
								<img
									src={profilePhotoPreview}
									alt=""
									className="profile-avatar-img"
								/>
							) : (
								<div className="profile-avatar-placeholder">
									<span className="profile-avatar-initial">
										{profileName ? profileName.trim().charAt(0).toUpperCase() : '?'}
									</span>
								</div>
							)}
						</div>
						<h2 className="profile-hero-name">{profileName}</h2>
						<p className="profile-hero-email">{profileEmail}</p>
					</div>
					
					<div className="profile-section">
						<h3 className="profile-section-title">Personal details</h3>
						<div className="profile-summary-grid">
							<div className="profile-summary-item">
								<span className="profile-summary-label">Name</span>
								<span className="profile-summary-value">{profileName}</span>
							</div>
							<div className="profile-summary-item">
								<span className="profile-summary-label">Email</span>
								<span className="profile-summary-value">{profileEmail}</span>
							</div>
							<div className="profile-summary-item">
								<span className="profile-summary-label">Phone</span>
								<span className="profile-summary-value">{profilePhone || '—'}</span>
							</div>
						</div>
					</div>
					
					<div className="profile-section">
						<h3 className="profile-section-title">Address</h3>
						<div className="profile-summary-grid">
							<div className="profile-summary-item profile-summary-address-full">
								<span className="profile-summary-label">Address</span>
								<span className="profile-summary-value">{profileAddress}</span>
							</div>
							<div className="profile-summary-item">
								<span className="profile-summary-label">District</span>
								<span className="profile-summary-value">{profileDistrict || '—'}</span>
							</div>
							<div className="profile-summary-item">
								<span className="profile-summary-label">State</span>
								<span className="profile-summary-value">{profileState || '—'}</span>
							</div>
							<div className="profile-summary-item">
								<span className="profile-summary-label">PIN Code</span>
								<span className="profile-summary-value">{profilePin}</span>
							</div>
						</div>
					</div>
					
					<div className="profile-section">
						<h3 className="profile-section-title">Identity</h3>
						<div className="profile-summary-grid">
							<div className="profile-summary-item">
								<span className="profile-summary-label">PAN Card</span>
								<span className="profile-summary-value">{profilePan}</span>
							</div>
						</div>
					</div>
					
					<div className="profile-actions">
						<button
							type="button"
							className="profile-edit-btn"
							onClick={() => {
								setProfileEditing(true)
								setSuccess('')
								setError('')
							}}
						>
							Edit Profile
						</button>
					</div>
				</div>
			) : (
				<form onSubmit={handleProfileSubmit} className="profile-form">
					<div className="profile-form-section profile-form-section-photo">
						<h3 className="profile-section-title">Profile photo</h3>
						<div className="profile-upload-wrap">
							<div className="profile-upload-preview">
								{profilePhotoPreview ? (
									<img src={profilePhotoPreview} alt="" className="profile-avatar-img" />
								) : (
									<div className="profile-avatar-placeholder">
										<span className="profile-avatar-initial">
											{profileName ? profileName.trim().charAt(0).toUpperCase() : '?'}
										</span>
									</div>
								)}
							</div>
							<label className="profile-upload-label">
								<input
									type="file"
									accept="image/png, image/jpeg"
									required={!profilePhotoPreview}
									onChange={(e) => {
										const file = e.target.files?.[0] || null
										setProfilePhoto(file)
										if (file) {
											const reader = new FileReader()
											reader.onload = () =>
												setProfilePhotoPreview(reader.result?.toString() || '')
											reader.readAsDataURL(file)
										} else {
											setProfilePhotoPreview('')
										}
									}}
									className="profile-upload-input"
								/>
								<span className="profile-upload-btn">
									{profilePhotoPreview ? 'Change photo' : 'Upload photo'}
								</span>
							</label>
							<p className="profile-upload-hint">Passport size. PNG or JPEG.</p>
						</div>
					</div>
					
					<div className="profile-form-section">
						<h3 className="profile-section-title">Personal details</h3>
						<label className="profile-field profile-field-name">
							Name
							<input type="text" value={profileName} readOnly required />
						</label>
						<label className="profile-field profile-field-email">
							Email
							<input type="email" value={profileEmail} readOnly required />
						</label>
						<label className="profile-field profile-field-phone">
							Phone
							<input type="text" value={profilePhone} readOnly required />
						</label>
						<label className="profile-field profile-field-state">
							State
							<input type="text" value={profileState} readOnly required />
						</label>
						<label className="profile-field profile-field-district">
							District
							<input type="text" value={profileDistrict} readOnly required />
						</label>
					</div>
					
					<div className="profile-form-section">
						<h3 className="profile-section-title">Address</h3>
						<label className="profile-field profile-field-address">
							Address
							<textarea
								rows="4"
								value={profileAddress}
								onChange={(e) => setProfileAddress(e.target.value)}
								maxLength={500}
								required
							/>
						</label>
						<label className="profile-field profile-field-pin">
							PIN Code
							<input
								type="text"
								inputMode="numeric"
								value={profilePin}
								onChange={(e) => {
									const nextValue = e.target.value
									if (/^\d*$/.test(nextValue)) {
										setProfilePin(nextValue)
									}
								}}
								pattern="^\d{6}$"
								title="Enter a 6 digit PIN code."
								maxLength={6}
								required
							/>
						</label>
					</div>
					
					<div className="profile-form-section">
						<h3 className="profile-section-title">Identity</h3>
						<label className="profile-field profile-field-pan">
							PAN Card
							<input
								type="text"
								value={profilePan}
								onChange={(e) => {
									const nextValue = e.target.value.toUpperCase()
									if (/^[A-Z0-9]*$/.test(nextValue)) {
										setProfilePan(nextValue)
									}
								}}
								pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
								title="Enter a valid PAN (e.g. ABCDE1234F)."
								maxLength={10}
								required
							/>
						</label>
					</div>
					
					<div className="profile-form-actions">
						<button type="submit" className="profile-save-btn" disabled={profileLoading}>
							{profileLoading ? 'Saving…' : 'Save Profile'}
						</button>
						{hasProfile && (
							<button
								type="button"
								className="secondary"
								onClick={() => {
									setProfileEditing(false)
									setSuccess('')
									setError('')
								}}
							>
								Cancel
							</button>
						)}
					</div>
				</form>
			)}
		</div>
	)
}

export default Profile
