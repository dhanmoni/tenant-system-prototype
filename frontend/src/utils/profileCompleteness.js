// The API sends `passport_photo_url` already signed and expiring. It used to fall back to
// `{apiBaseUrl}/storage/{path}` when the URL was absent; that address no longer resolves, and a
// passport photograph should never have had a permanent public one.
export function resolvePassportPhotoUrl(profileUser = {}) {
	return profileUser?.passport_photo_url || null
}

export function isProfileComplete(profileUser = {}) {
	// A path with no URL still means a photograph was uploaded, so completeness keeps looking at
	// both. Only the rendering had to change.
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
