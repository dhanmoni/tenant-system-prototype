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
