import {
	ROLES,
	ADMIN_ROLES,
	ASSISTANT_ROLES,
	PRINCIPAL_ROLES,
} from '../../constants/roles'

/** Sidebar navigation groups per role — workspace module only. */
export function getWorkspaceNavigation(user) {
	if (!user?.role) return []

	if (user.role === ROLES.USER) {
		return [
			{
				section: 'Workspace',
				items: [
					{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
					{ to: '/dashboard/tenancy-certificate', label: 'Apply for UIN', icon: 'documentPlus' },
					{ to: '/dashboard/status', label: 'UIN Status', icon: 'status' },
					{ to: '/dashboard/services', label: 'All services', icon: 'services' },
				],
			},
			{
				section: 'Account',
				items: [{ to: '/dashboard/profile', label: 'My profile', icon: 'user' }],
			},
		]
	}

	const items = [
		{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
	]

	if (ADMIN_ROLES.includes(user.role)) {
		items.push({
			to: '/dashboard/admin/users',
			label: user.role === ROLES.SUPER_ADMIN ? 'User management' : 'Staff directory',
			icon: 'users',
		})
	}

	if (PRINCIPAL_ROLES.includes(user.role)) {
		items.push({
			to: '/dashboard/admin/users',
			label: 'Manage assistants',
			icon: 'users',
		})
	}

	if (ASSISTANT_ROLES.includes(user.role)) {
		items.push({
			to: '/dashboard/admin/inbox',
			label: 'Application inbox',
			icon: 'list',
		})
	}

	if ([...PRINCIPAL_ROLES, ROLES.DISTRICT_ADMIN].includes(user.role)) {
		items.push({
			to: '/dashboard/admin/applications',
			label: 'View applications',
			icon: 'eye',
		})
	}

	if (ADMIN_ROLES.includes(user.role)) {
		items.push(
			{ to: '/dashboard/admin/tenancy', label: 'Tenancy records', icon: 'file' },
			{ to: '/dashboard/status', label: 'UIN status', icon: 'status' }
		)
	}

	if (user.role === ROLES.SUPER_ADMIN) {
		items.push(
			{ to: '/dashboard/admin/applications', label: 'All applications', icon: 'eye' },
			{ to: '/dashboard/admin/districts', label: 'Districts', icon: 'map' }
		)
	}

	return [
		{ section: 'Workspace', items },
		{
			section: 'Account',
			items: [{ to: '/dashboard/profile', label: 'My profile', icon: 'user' }],
		},
	]
}
