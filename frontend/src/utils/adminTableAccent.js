import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../constants/roles'

/** DataTable accent stripe — matches authority colours on workspace tables. */
export function getAdminTableAccent(user) {
	if (!user?.role) return 'default'

	if (
		user.role === ROLES.RA_ASSISTANT ||
		user.role === ROLES.RENT_AUTHORITY
	) {
		return 'rent-authority'
	}

	if (
		user.role === ROLES.RC_ASSISTANT ||
		user.role === ROLES.RENT_COURT
	) {
		return 'rent-court'
	}

	if (
		user.role === ROLES.RT_ASSISTANT ||
		user.role === ROLES.RENT_TRIBUNAL
	) {
		return 'rent-tribunal'
	}

	if (ASSISTANT_ROLES.includes(user.role) || PRINCIPAL_ROLES.includes(user.role)) {
		return 'default'
	}

	return 'default'
}
