import {
	ROLES,
	ADMIN_ROLES,
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

	const items = [
		{ to: '/dashboard', labelKey: 'ws.nav.dashboard', icon: 'dashboard', end: true },
	]

	if (ADMIN_ROLES.includes(user.role)) {
		items.push({
			to: '/dashboard/admin/users',
			labelKey:
				user.role === ROLES.SUPER_ADMIN ? 'ws.nav.userManagement' : 'ws.nav.staffDirectory',
			icon: 'users',
		})
	}

	if (PRINCIPAL_ROLES.includes(user.role)) {
		items.push({
			to: '/dashboard/admin/users',
			labelKey: 'ws.nav.manageAssistants',
			icon: 'users',
		})
	}

	if ([...ASSISTANT_ROLES, ROLES.VALUER].includes(user.role)) {
		items.push({
			to: '/dashboard/admin/inbox',
			labelKey:
				user.role === ROLES.VALUER ? 'ws.nav.valuationInbox' : 'ws.nav.applicationInbox',
			icon: 'list',
		})
	}

	if ([...PRINCIPAL_ROLES, ROLES.DISTRICT_ADMIN].includes(user.role)) {
		items.push({
			to: '/dashboard/admin/applications',
			labelKey: 'ws.nav.serviceApplications',
			icon: 'services',
		})
	}

	if (ADMIN_ROLES.includes(user.role)) {
		items.push({
			to: '/dashboard/admin/tenancy',
			labelKey: 'ws.nav.tenancyApplications',
			icon: 'file',
		})
	}

	if (user.role === ROLES.SUPER_ADMIN) {
		items.push(
			{
				to: '/dashboard/admin/applications',
				labelKey: 'ws.nav.serviceApplications',
				icon: 'services',
			},
			{ to: '/dashboard/admin/districts', labelKey: 'ws.nav.districts', icon: 'map' }
		)
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
