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
	[ROLES.USER]: 'Citizen',
}

export function getRoleLabel(role) {
	return ROLE_LABELS[role] || String(role || '').replace(/_/g, ' ')
}
