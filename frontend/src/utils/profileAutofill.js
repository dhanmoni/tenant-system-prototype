/**
 * What a signed-in citizen's profile can fill in on a service form.
 *
 * The account already holds the filer's name, address and date of birth. Asking them to type all
 * three again is not only tedious - it is how a filing ends up naming a slightly different person
 * from the one who registered, and how a verification ends up contradicting the body of the form.
 *
 * Everything here is a starting value, never a fixed one. The filer can change any of it, and for
 * the sworn clauses that matters: they are asserting these facts, so they have to be able to
 * correct anything the account has wrong or out of date.
 *
 * Seed state with these at mount (a lazy `useState` initialiser), rather than in an effect, so a
 * value the filer has typed is never overwritten later.
 */

function text(value) {
	return value === null || value === undefined ? '' : String(value).trim()
}

/**
 * Age in completed years, which is what "aged ......" on the verification asks for.
 *
 * Returns '' rather than a guess when the date is missing or unusable - an age is part of a sworn
 * sentence, so a wrong one is worse than a blank the filer has to fill.
 */
export function ageOn(dateOfBirth, on = new Date()) {
	if (!dateOfBirth) return ''

	const born = new Date(dateOfBirth)
	if (Number.isNaN(born.getTime())) return ''

	let age = on.getFullYear() - born.getFullYear()
	const monthDelta = on.getMonth() - born.getMonth()
	// Not yet had this year's birthday.
	if (monthDelta < 0 || (monthDelta === 0 && on.getDate() < born.getDate())) {
		age -= 1
	}

	return age > 0 && age < 120 ? String(age) : ''
}

export function profileDefaults(user) {
	const profile = user || {}

	// Same shape the tenancy forms already use for an address line.
	const address = [profile.address, profile.pin_code].filter(Boolean).join(', ')

	return {
		name: text(profile.name),
		address: text(address),
		age: ageOn(profile.date_of_birth),
		district: text(profile.district?.name),
		phone: text(profile.phone),
		pan: text(profile.pan_card),
		// Which side of the tenancy this account files as, for the forms that ask for both.
		side: String(profile.profile_type || '').toUpperCase() === 'TENANT' ? 'TENANT' : 'LANDLORD',
	}
}

/** Whether anything was actually available, so the form only says so when it is true. */
export function hasProfileDefaults(defaults) {
	return Boolean(defaults.name || defaults.address || defaults.age)
}
