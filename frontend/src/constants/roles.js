export const ROLES = {
	SUPER_ADMIN: 'super_admin',
	DISTRICT_ADMIN: 'district_admin',
	RENT_AUTHORITY: 'rent_authority',
	RENT_COURT: 'rent_court',
	RENT_TRIBUNAL: 'rent_tribunal',
	RA_ASSISTANT: 'ra_assistant',
	RC_ASSISTANT: 'rc_assistant',
	RT_ASSISTANT: 'rt_assistant',
	VALUER: 'valuer',
	USER: 'user'
};

export const ASSISTANT_ROLES = [
	ROLES.RA_ASSISTANT,
	ROLES.RC_ASSISTANT,
	ROLES.RT_ASSISTANT
];

export const PRINCIPAL_ROLES = [
	ROLES.RENT_AUTHORITY,
	ROLES.RENT_COURT,
	ROLES.RENT_TRIBUNAL
];

export const ADMIN_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.DISTRICT_ADMIN
];

/** Staff who may open UIN / tenancy applications (matches sidebar). */
export const TENANCY_STAFF_ROLES = [
	ROLES.SUPER_ADMIN,
	ROLES.DISTRICT_ADMIN,
	ROLES.RENT_AUTHORITY,
	ROLES.RA_ASSISTANT,
];
