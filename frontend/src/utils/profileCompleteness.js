export function resolvePassportPhotoUrl(profileUser = {}) {
	if (!profileUser) return null
	if (profileUser.passport_photo_url) return profileUser.passport_photo_url
	const photoPath =
		profileUser.passport_photo_path || profileUser.user_passport_photo_path
	if (!photoPath) return null
	const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
	return `${apiBaseUrl}/storage/${photoPath}`
}

export function isProfileComplete(profileUser = {}) {
	const photoUrl = profileUser.passport_photo_url
	const photoPath = profileUser.passport_photo_path || profileUser.user_passport_photo_path

	return !!(
		profileUser.address &&
		profileUser.pin_code &&
		profileUser.pan_card &&
		(photoUrl || photoPath)
	)
}

export const PROFILE_REMINDER_DISMISSED_KEY = 'profileReminderDismissed'
export const PROFILE_REMINDER_SUPPRESSED_KEY = 'profileReminderSuppressed'
export const PROFILE_REMINDER_NOTIF_ID = 'ws-profile-complete'
