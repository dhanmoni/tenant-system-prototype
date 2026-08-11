import {
	ROLES,
	ASSISTANT_ROLES,
	PRINCIPAL_ROLES,
} from '../../constants/roles'

/** Sidebar navigation groups per role — labels via i18n keys (`ws.nav.*`). */
export function getWorkspaceNavigation(user) {
	if (!user?.role) return []

	if (user.role === ROLES.USER) {
		return [
			{
				sectionKey: 'ws.nav.workspace',
				items: [
					{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
				],
			},
			{
				sectionKey: 'ws.nav.applications',
				items: [
					{
						to: '/dashboard/tenancy-certificate',
						labelKey: 'ws.nav.applyUin',
						icon: 'documentPlus',
					},
					{ to: '/dashboard/status', labelKey: 'ws.nav.uinStatus', icon: 'status' },
					{ to: '/dashboard/services', labelKey: 'ws.nav.allServices', icon: 'services' },
				],
			},
			{
				sectionKey: 'ws.nav.account',
				items: [{ to: '/dashboard/profile', labelKey: 'ws.nav.myProfile', icon: 'user' }],
			},
		]
	}

	/*
	 * Assistants — Applications group is role-specific:
	 * - UIN / tenancy certify → Tenancy Applications (/admin/tenancy) — RA only
	 * - Form I–VI service queue → Service Applications (/admin/inbox)
	 */
	if (ASSISTANT_ROLES.includes(user.role)) {
		const applicationItems = []

		if (user.role === ROLES.RA_ASSISTANT) {
			applicationItems.push({
				to: '/dashboard/admin/tenancy',
				labelKey: 'ws.nav.tenancyApplications',
				icon: 'file',
			})
		}

		applicationItems.push({
			to: '/dashboard/admin/inbox',
			labelKey: 'ws.nav.serviceApplications',
			icon: 'services',
		})

		return [
			{
				sectionKey: 'ws.nav.workspace',
				items: [
					{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
				],
			},
			{
				sectionKey: 'ws.nav.applications',
				items: applicationItems,
			},
			{
				sectionKey: 'ws.nav.account',
				items: [{ to: '/dashboard/profile', labelKey: 'ws.nav.myProfile', icon: 'user' }],
			},
		]
	}

	/* District Admin — Applications + Users groups */
	if (user.role === ROLES.DISTRICT_ADMIN) {
		return [
			{
				sectionKey: 'ws.nav.workspace',
				items: [
					{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
				],
			},
			{
				sectionKey: 'ws.nav.applications',
				items: [
					{
						to: '/dashboard/admin/tenancy',
						labelKey: 'ws.nav.tenancyApplications',
						icon: 'file',
					},
					{
						to: '/dashboard/admin/applications',
						labelKey: 'ws.nav.serviceApplications',
						icon: 'services',
					},
				],
			},
			{
				sectionKey: 'ws.nav.users',
				items: [
					{
						to: '/dashboard/admin/users',
						labelKey: 'ws.nav.staffDirectory',
						icon: 'users',
					},
				],
			},
			{
				sectionKey: 'ws.nav.account',
				items: [{ to: '/dashboard/profile', labelKey: 'ws.nav.myProfile', icon: 'user' }],
			},
		]
	}

	/* Super Admin — Applications + Users + Districts */
	if (user.role === ROLES.SUPER_ADMIN) {
		return [
			{
				sectionKey: 'ws.nav.workspace',
				items: [
					{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
				],
			},
			{
				sectionKey: 'ws.nav.applications',
				items: [
					{
						to: '/dashboard/admin/tenancy',
						labelKey: 'ws.nav.tenancyApplications',
						icon: 'file',
					},
					{
						to: '/dashboard/admin/applications',
						labelKey: 'ws.nav.serviceApplications',
						icon: 'services',
					},
				],
			},
			{
				sectionKey: 'ws.nav.users',
				items: [
					{
						to: '/dashboard/admin/users',
						labelKey: 'ws.nav.userManagement',
						icon: 'users',
					},
				],
			},
			{
				sectionKey: 'ws.nav.districtsGroup',
				items: [
					{
						to: '/dashboard/admin/districts',
						labelKey: 'ws.nav.districts',
						icon: 'map',
					},
				],
			},
			{
				sectionKey: 'ws.nav.account',
				items: [{ to: '/dashboard/profile', labelKey: 'ws.nav.myProfile', icon: 'user' }],
			},
		]
	}

	/* RA / RC / RT principals — Applications + Users groups */
	if (PRINCIPAL_ROLES.includes(user.role)) {
		const applicationItems = []

		if (user.role === ROLES.RENT_AUTHORITY) {
			applicationItems.push({
				to: '/dashboard/admin/tenancy',
				labelKey: 'ws.nav.tenancyApplications',
				icon: 'file',
			})
		}

		applicationItems.push({
			to: '/dashboard/admin/applications',
			labelKey: 'ws.nav.serviceApplications',
			icon: 'services',
		})

		return [
			{
				sectionKey: 'ws.nav.workspace',
				items: [
					{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
				],
			},
			{
				sectionKey: 'ws.nav.applications',
				items: applicationItems,
			},
			{
				sectionKey: 'ws.nav.users',
				items: [
					{
						to: '/dashboard/admin/users',
						labelKey: 'ws.nav.manageAssistants',
						icon: 'users',
					},
				],
			},
			{
				sectionKey: 'ws.nav.account',
				items: [{ to: '/dashboard/profile', labelKey: 'ws.nav.myProfile', icon: 'user' }],
			},
		]
	}

	const items = [
		{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
	]

	if (user.role === ROLES.VALUER) {
		items.push({
			to: '/dashboard/admin/inbox',
			labelKey: 'ws.nav.valuationInbox',
			icon: 'inbox',
		})
	}

	return [
		{ sectionKey: 'ws.nav.workspace', items },
		{
			sectionKey: 'ws.nav.account',
			items: [{ to: '/dashboard/profile', labelKey: 'ws.nav.myProfile', icon: 'user' }],
		},
	]
}

/** Citizen sidebar — helpdesk contact shown below main nav */
export const WORKSPACE_SUPPORT_CONTACT = {
	phoneDisplay: '1800-000-0000',
	phoneHref: 'tel:18000000000',
	email: 'helpdesk.tcms@nic.in',
}

export function showWorkspaceSupport(user) {
	return user?.role === ROLES.USER
}
