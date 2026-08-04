/**
 * Turn Laravel / API error responses into a readable, localized message.
 * Pass `t` from useLanguage() so known English API strings map to Assamese (or EN).
 */

const EXACT_MESSAGE_KEYS = {
	'Invalid OTP': 'auth.api.invalidOtp',
	'Invalid credentials': 'auth.api.invalidCredentials',
	'Account is blocked': 'auth.api.accountBlocked',
	'Account pending approval': 'auth.api.pendingApproval',
	'The given data was invalid.': 'auth.api.invalidData',
}

const PATTERN_MESSAGE_KEYS = [
	{ re: /phone.*(?:already been taken|has already been taken)|(?:already been taken).*phone/i, key: 'auth.api.phoneTaken' },
	{ re: /email.*(?:already been taken|has already been taken)|(?:already been taken).*email/i, key: 'auth.api.emailTaken' },
	{ re: /(?:already been taken)/i, key: 'auth.api.emailTaken' },
	{ re: /phone.*(?:format is invalid|invalid)|The phone field/i, key: 'auth.api.phoneInvalid' },
	{ re: /email.*(?:must be a valid|format is invalid|invalid)/i, key: 'auth.api.emailInvalid' },
	{ re: /name.*(?:required|field is required)/i, key: 'auth.api.nameRequired' },
	{ re: /gender.*(?:required|field is required|selected is invalid)/i, key: 'auth.api.genderRequired' },
	{ re: /date_of_birth|date of birth/i, key: 'auth.api.dobRequired' },
	{ re: /district/i, key: 'auth.api.districtRequired' },
	{ re: /invalid otp/i, key: 'auth.api.invalidOtp' },
	{ re: /invalid credentials/i, key: 'auth.api.invalidCredentials' },
	{ re: /account is blocked/i, key: 'auth.api.accountBlocked' },
	{ re: /pending approval/i, key: 'auth.api.pendingApproval' },
]

function localizeMessage(message, t) {
	if (!message) return message
	if (typeof t !== 'function') return message

	const exactKey = EXACT_MESSAGE_KEYS[message]
	if (exactKey) return t(exactKey)

	for (const { re, key } of PATTERN_MESSAGE_KEYS) {
		if (re.test(message)) return t(key)
	}

	return message
}

export function formatApiErrors(err, fallback = 'Something went wrong. Please try again.', t) {
	const data = err?.response?.data
	const resolveFallback = () => {
		if (typeof t === 'function' && fallback === 'Something went wrong. Please try again.') {
			return t('auth.genericError')
		}
		return fallback
	}

	if (!data) return resolveFallback()

	if (data.errors && typeof data.errors === 'object') {
		const messages = Object.values(data.errors).flat().filter(Boolean)
		if (messages.length > 0) {
			return messages.map((msg) => localizeMessage(String(msg), t)).join(' ')
		}
	}

	const message = data.message
	if (message && message !== 'The given data was invalid.') {
		return localizeMessage(String(message), t)
	}

	if (message === 'The given data was invalid.') {
		return localizeMessage(message, t)
	}

	return resolveFallback()
}
