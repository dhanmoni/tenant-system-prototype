import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api, { csrf } from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../utils/formatters'
import { useLanguage } from '../../i18n'

function WorkspaceProfile() {
	const { user, onUserUpdate } = useOutletContext()
	const { t } = useLanguage()
	const [error, setError] = useState('')
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileEditing, setProfileEditing] = useState(false)
	const [saveToast, setSaveToast] = useState('')
	const saveToastTimerRef = useRef(null)

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
	const roleLabel = user?.role ? t(`role.${user.role}`) : '—'

	const showSaveToast = useCallback(
		(message) => {
			if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
			setSaveToast(message || t('ws.profile.saved'))
			saveToastTimerRef.current = setTimeout(() => {
				setSaveToast('')
				saveToastTimerRef.current = null
			}, 2800)
		},
		[t]
	)

	useEffect(() => {
		loadProfile()
		return () => {
			if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
		}
	}, [])

	const loadProfile = async () => {
		setError('')
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
			setError(err?.response?.data?.message || t('ws.profile.loadError'))
		} finally {
			setProfileLoading(false)
		}
	}

	const handlePhotoChange = (e) => {
		const file = e.target.files?.[0] || null
		setProfilePhoto(file)
		setError('')
		if (file) {
			const reader = new FileReader()
			reader.onload = () => setProfilePhotoPreview(reader.result?.toString() || '')
			reader.readAsDataURL(file)
		}
	}

	const startEditing = () => {
		setProfileEditing(true)
		setError('')
	}

	const cancelEditing = () => {
		setProfileEditing(false)
		setError('')
		setProfilePhoto(null)
		loadProfile()
	}

	const handleProfileSubmit = async (e) => {
		e.preventDefault()
		setError('')
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
			setProfileEditing(false)
			showSaveToast(t('ws.profile.saved'))
		} catch (err) {
			const data = err?.response?.data
			const errors = data?.errors || {}
			const firstError =
				errors.address?.[0] ||
				errors.pin_code?.[0] ||
				errors.pan_card?.[0] ||
				errors.passport_photo?.[0]
			setError(firstError || data?.message || t('ws.profile.saveError'))
		} finally {
			setProfileLoading(false)
		}
	}

	const hasProfile =
		!!profileAddress && !!profilePin && !!profilePan && !!profilePhotoPreview

	if (profileLoading && !profileName) {
		return (
			<div className="ws-page ws-profile-page">
				<div className="ws-empty">{t('ws.profile.loading')}</div>
			</div>
		)
	}

	return (
		<div className="ws-page ws-profile-page">
			{saveToast ? (
				<div className="ws-uin-save-toast" role="status" aria-live="polite">
					{saveToast}
				</div>
			) : null}

			{!profileEditing ? (
				<section className="ws-profile-minimal">
					<header className="ws-profile-minimal-head">
						<div className="ws-profile-minimal-photo">
							{profilePhotoPreview ? (
								<img src={profilePhotoPreview} alt="" />
							) : (
								<span className="ws-profile-minimal-photo-fallback" aria-hidden>
									<Icon name="user" />
								</span>
							)}
						</div>
						<div className="ws-profile-minimal-identity">
							<h1>{displayName}</h1>
							<p>{displayEmail}</p>
							<div className="ws-profile-minimal-meta">
								<span>{roleLabel}</span>
								{profileDistrict ? <span>{profileDistrict}</span> : null}
							</div>
						</div>
						<button
							type="button"
							className="ws-btn ws-btn--primary ws-profile-minimal-edit"
							onClick={startEditing}
						>
							{t('ws.profile.edit')}
						</button>
					</header>

					{error ? (
						<div className="ws-profile-alert ws-profile-alert--error" role="alert">
							{error}
						</div>
					) : null}

					<div className="ws-profile-minimal-grid ws-profile-minimal-grid--view">
						<div className="ws-profile-view-item">
							<span className="ws-profile-field-label">{t('ws.profile.field.name')}</span>
							<strong>{profileName || '—'}</strong>
						</div>
						<div className="ws-profile-view-item">
							<span className="ws-profile-field-label">{t('ws.profile.field.phone')}</span>
							<strong>{profilePhone || '—'}</strong>
						</div>
						<div className="ws-profile-view-item">
							<span className="ws-profile-field-label">{t('ws.profile.field.email')}</span>
							<strong>{profileEmail || '—'}</strong>
						</div>
						<div className="ws-profile-view-item">
							<span className="ws-profile-field-label">{t('ws.profile.field.district')}</span>
							<strong>{profileDistrict || '—'}</strong>
						</div>
						<div className="ws-profile-view-item ws-profile-view-item--full">
							<span className="ws-profile-field-label">{t('ws.profile.field.address')}</span>
							<strong>{profileAddress || '—'}</strong>
						</div>
						<div className="ws-profile-view-item">
							<span className="ws-profile-field-label">{t('ws.profile.field.pin')}</span>
							<strong>{profilePin || '—'}</strong>
						</div>
						<div className="ws-profile-view-item">
							<span className="ws-profile-field-label">{t('ws.profile.field.pan')}</span>
							<strong>{profilePan || '—'}</strong>
						</div>
					</div>
				</section>
			) : (
				<form className="ws-profile-minimal" onSubmit={handleProfileSubmit} noValidate>
					<header className="ws-profile-minimal-head">
						<div className="ws-profile-minimal-photo">
							{profilePhotoPreview ? (
								<img src={profilePhotoPreview} alt="" />
							) : (
								<span className="ws-profile-minimal-photo-fallback" aria-hidden>
									<Icon name="user" />
								</span>
							)}
							<label className="ws-profile-minimal-photo-btn">
								<input
									type="file"
									accept="image/png,image/jpeg"
									required={!profilePhotoPreview}
									onChange={handlePhotoChange}
								/>
								{profilePhotoPreview ? t('ws.profile.change') : t('ws.profile.upload')}
							</label>
						</div>
						<div className="ws-profile-minimal-identity">
							<h1>{displayName}</h1>
							<p>{displayEmail}</p>
							<div className="ws-profile-minimal-meta">
								<span>{roleLabel}</span>
								{profileDistrict ? <span>{profileDistrict}</span> : null}
							</div>
						</div>
					</header>

					{error ? (
						<div className="ws-profile-alert ws-profile-alert--error" role="alert">
							{error}
						</div>
					) : null}

					<div className="ws-profile-minimal-grid">
						<label className="ws-profile-field">
							<span className="ws-profile-field-label">{t('ws.profile.field.name')}</span>
							<input type="text" value={profileName} readOnly />
						</label>
						<label className="ws-profile-field">
							<span className="ws-profile-field-label">{t('ws.profile.field.phone')}</span>
							<input type="text" value={profilePhone} readOnly />
						</label>
						<label className="ws-profile-field">
							<span className="ws-profile-field-label">{t('ws.profile.field.email')}</span>
							<input type="email" value={profileEmail} readOnly />
						</label>
						<label className="ws-profile-field">
							<span className="ws-profile-field-label">{t('ws.profile.field.district')}</span>
							<input type="text" value={profileDistrict} readOnly />
						</label>
						<label className="ws-profile-field ws-profile-field--full">
							<span className="ws-profile-field-label">{t('ws.profile.field.address')}</span>
							<textarea
								rows={3}
								value={profileAddress}
								onChange={(e) => setProfileAddress(e.target.value)}
								maxLength={500}
								required
							/>
						</label>
						<label className="ws-profile-field">
							<span className="ws-profile-field-label">{t('ws.profile.field.pin')}</span>
							<input
								type="text"
								inputMode="numeric"
								value={profilePin}
								onChange={(e) => {
									if (/^\d*$/.test(e.target.value)) setProfilePin(e.target.value)
								}}
								pattern="^\d{6}$"
								title={t('ws.profile.pinTitle')}
								maxLength={6}
								required
							/>
						</label>
						<label className="ws-profile-field">
							<span className="ws-profile-field-label">{t('ws.profile.field.pan')}</span>
							<input
								type="text"
								value={profilePan}
								onChange={(e) => {
									const next = e.target.value.toUpperCase()
									if (/^[A-Z0-9]*$/.test(next)) setProfilePan(next)
								}}
								pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
								title={t('ws.profile.panTitle')}
								maxLength={10}
								required
							/>
						</label>
					</div>

					<div className="ws-profile-minimal-actions">
						{hasProfile ? (
							<button
								type="button"
								className="ws-btn ws-btn--outline"
								disabled={profileLoading}
								onClick={cancelEditing}
							>
								{t('ws.profile.cancel')}
							</button>
						) : null}
						<button
							type="submit"
							className="ws-btn ws-btn--primary"
							disabled={profileLoading}
						>
							{profileLoading ? t('ws.profile.saving') : t('ws.profile.save')}
						</button>
					</div>
				</form>
			)}
		</div>
	)
}

export default WorkspaceProfile
