import { ROLES } from './roles'

export const ROLE_LABELS = {
	[ROLES.SUPER_ADMIN]: 'Super Administrator',
	[ROLES.DISTRICT_ADMIN]: 'District Administrator',
	[ROLES.RENT_AUTHORITY]: 'Rent Authority',
	[ROLES.RENT_COURT]: 'Rent Court',
	[ROLES.RENT_TRIBUNAL]: 'Rent Tribunal',
	[ROLES.RA_ASSISTANT]: 'Rent Authority Assistant',
	[ROLES.RC_ASSISTANT]: 'Rent Court Assistant',
	[ROLES.RT_ASSISTANT]: 'Rent Tribunal Assistant',
	[ROLES.VALUER]: 'Valuer',
	[ROLES.USER]: 'Citizen',
}

/** CSS modifier used by role badges in staff / user tables */
export const ROLE_BADGE_TONES = {
	[ROLES.SUPER_ADMIN]: 'super-admin',
	[ROLES.DISTRICT_ADMIN]: 'district-admin',
	[ROLES.RENT_AUTHORITY]: 'rent-authority',
	[ROLES.RENT_COURT]: 'rent-court',
	[ROLES.RENT_TRIBUNAL]: 'rent-tribunal',
	[ROLES.RA_ASSISTANT]: 'ra-assistant',
	[ROLES.RC_ASSISTANT]: 'rc-assistant',
	[ROLES.RT_ASSISTANT]: 'rt-assistant',
	[ROLES.VALUER]: 'valuer',
	[ROLES.USER]: 'citizen',
}

export function getRoleLabel(role, t) {
	if (typeof t === 'function') {
		const key = `role.${role}`
		const translated = t(key)
		if (translated && translated !== key) return translated
	}
	return ROLE_LABELS[role] || String(role || '').replace(/_/g, ' ')
}

export function getRoleBadgeClass(role) {
	const tone = ROLE_BADGE_TONES[role] || 'default'
	return `admin-user-role admin-user-role--${tone}`
}
