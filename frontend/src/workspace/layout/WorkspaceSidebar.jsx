import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { useLanguage } from '../../i18n'
import { APPLICATION_TYPES } from '../../constants/application'
import { tenantServiceGroups } from '../../data/tenantServices'
import { getWorkspaceNavigation, showWorkspaceSupport } from '../config/navigation'

const PREFETCH_BY_PATH = {
	'/dashboard/services': () =>
		import('../../pages/dashboard/FormPortal').then((m) => m.prefetchServiceFormPanels?.()),
	'/dashboard/admin/applications': () => import('../../pages/dashboard/admin/ApplicationList'),
	'/dashboard/admin/inbox': () => import('../../pages/dashboard/admin/ApplicationList'),
	'/dashboard/admin/tenancy': () => import('../../pages/dashboard/admin/TenancyRecords'),
	'/dashboard/status': () => import('../pages/WorkspaceUinStatus'),
}

const AUTHORITY_TITLE_KEYS = {
	'rent-authority': 'ws.citizen.authority.rentAuthority',
	'rent-court': 'ws.citizen.authority.rentCourt',
	'rent-tribunal': 'ws.citizen.authority.rentTribunal',
}

const FORM_I18N_KEYS = {
	[APPLICATION_TYPES.RENT_REVISION]: {
		name: 'ws.services.form.i.name',
		label: 'ws.services.form.i.label',
	},
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: {
		name: 'ws.services.form.ia.name',
		label: 'ws.services.form.ia.label',
	},
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: {
		name: 'ws.services.form.ib.name',
		label: 'ws.services.form.ib.label',
	},
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: {
		name: 'ws.services.form.iv.name',
		label: 'ws.services.form.iv.label',
	},
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: {
		name: 'ws.services.form.ii.name',
		label: 'ws.services.form.ii.label',
	},
	[APPLICATION_TYPES.RENT_COURT_FILING]: {
		name: 'ws.services.form.iii.name',
		label: 'ws.services.form.iii.label',
	},
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: {
		name: 'ws.services.form.v.name',
		label: 'ws.services.form.v.label',
	},
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: {
		name: 'ws.services.form.vi.name',
		label: 'ws.services.form.vi.label',
	},
}

function formNavCopy(form, t) {
	const keys = FORM_I18N_KEYS[form.formKey]
	if (!keys) {
		return { name: form.formName, label: form.label }
	}
	return { name: t(keys.name), label: t(keys.label) }
}

function prefetchForPath(to) {
	const run = PREFETCH_BY_PATH[to]
	if (run) void run()
}

function SidebarHoverTip({ tip }) {
	if (!tip || typeof document === 'undefined') return null
	return createPortal(
		<div
			className="ws-nav-hover-tip"
			aria-hidden="true"
			style={{ top: `${tip.top}px`, left: `${tip.left}px` }}
		>
			{tip.text}
		</div>,
		document.body,
	)
}

function useNavHoverTip() {
	const [tip, setTip] = useState(null)
	const timerRef = useRef(null)
	const targetRef = useRef(null)

	const clearTimer = () => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}

	const hideTip = () => {
		clearTimer()
		targetRef.current = null
		setTip(null)
	}

	const placeTip = (el, text) => {
		if (!el || !text) return
		const rect = el.getBoundingClientRect()
		const top = Math.min(Math.max(rect.top + rect.height / 2, 20), window.innerHeight - 20)
		setTip({
			text,
			top,
			left: Math.round(rect.right + 10),
		})
	}

	const showTip = (event, text) => {
		const el = event.currentTarget
		if (!el || !text) {
			hideTip()
			return
		}
		clearTimer()
		targetRef.current = el
		timerRef.current = window.setTimeout(() => {
			placeTip(el, text)
		}, 90)
	}

	useEffect(() => {
		const onViewportChange = () => hideTip()
		window.addEventListener('scroll', onViewportChange, true)
		window.addEventListener('resize', onViewportChange)
		return () => {
			clearTimer()
			window.removeEventListener('scroll', onViewportChange, true)
			window.removeEventListener('resize', onViewportChange)
		}
	}, [])

	return { tip, showTip, hideTip }
}

function ServicesNavMenu({ item, collapsed, onNavClick, t, showTip, hideTip }) {
	const location = useLocation()
	const panelId = useId()
	const label = t(item.labelKey)
	const onServicesRoute =
		location.pathname === '/dashboard/services' ||
		location.pathname.startsWith('/dashboard/forms/')
	const [open, setOpen] = useState(onServicesRoute)

	useEffect(() => {
		if (onServicesRoute) setOpen(true)
	}, [onServicesRoute])

	if (collapsed) {
		return (
			<NavLink
				to={item.to}
				className={({ isActive }) => `ws-nav-link${isActive || onServicesRoute ? ' active' : ''}`}
				onClick={() => {
					hideTip()
					onNavClick?.()
				}}
				onMouseEnter={(e) => {
					prefetchForPath(item.to)
					showTip(e, label)
				}}
				onFocus={(e) => {
					prefetchForPath(item.to)
					showTip(e, label)
				}}
				onMouseLeave={hideTip}
				onBlur={hideTip}
			>
				<Icon name={item.icon} className={`ws-nav-link-icon ws-nav-link-icon--${item.icon}`} />
				<span className="ws-nav-link-label">{label}</span>
			</NavLink>
		)
	}

	return (
		<div className={`ws-nav-disclosure${open ? ' is-open' : ''}${onServicesRoute ? ' is-active' : ''}`}>
			<button
				type="button"
				className={`ws-nav-link ws-nav-disclosure__trigger${onServicesRoute ? ' active' : ''}`}
				aria-expanded={open}
				aria-controls={panelId}
				onClick={() => {
					hideTip()
					setOpen((prev) => !prev)
				}}
			>
				<Icon name={item.icon} className={`ws-nav-link-icon ws-nav-link-icon--${item.icon}`} />
				<span className="ws-nav-link-label">{label}</span>
				<Icon
					name="chevron"
					className={`ws-nav-disclosure__chevron${open ? ' is-open' : ''}`}
				/>
			</button>
			{open ? (
				<div id={panelId} className="ws-nav-disclosure__panel" role="group" aria-label={label}>
					{tenantServiceGroups.map((group) => (
						<div
							key={group.id}
							className={`ws-nav-disclosure__group ws-nav-disclosure__group--${group.id}`}
						>
							<div className="ws-nav-disclosure__group-label">
								{t(AUTHORITY_TITLE_KEYS[group.id] || group.title)}
							</div>
							<ul className="ws-nav-disclosure__list">
								{group.forms.map((form) => {
									const copy = formNavCopy(form, t)
									return (
										<li key={form.formKey}>
											<NavLink
												to={form.to}
												className={({ isActive }) =>
													`ws-nav-disclosure__link${isActive ? ' active' : ''}`
												}
												onClick={() => {
													hideTip()
													onNavClick?.()
												}}
												onMouseEnter={(e) => {
													prefetchForPath('/dashboard/services')
													showTip(e, copy.label || copy.name)
												}}
												onFocus={(e) => showTip(e, copy.label || copy.name)}
												onMouseLeave={hideTip}
												onBlur={hideTip}
											>
												{copy.name}
											</NavLink>
										</li>
									)
								})}
							</ul>
						</div>
					))}
					<NavLink
						to={item.to}
						end
						className={({ isActive }) =>
							`ws-nav-disclosure__catalog${isActive ? ' is-active' : ''}`
						}
						onClick={() => {
							hideTip()
							onNavClick?.()
						}}
						onMouseEnter={() => prefetchForPath(item.to)}
					>
						{t('ws.nav.browseAllServices')}
					</NavLink>
				</div>
			) : null}
		</div>
	)
}

function SidebarNavGroup({
	group,
	collapsed,
	linkClass,
	onNavClick,
	t,
	showTip,
	hideTip,
	profileIncomplete = false,
}) {
	const sectionLabel = t(group.sectionKey)
	const showSectionLabel = group.sectionKey !== 'ws.nav.workspace'

	return (
		<div className="ws-nav-section">
			{showSectionLabel ? (
				<div className="ws-nav-section-label">{sectionLabel}</div>
			) : null}
			{group.items.map((item) => {
				if (item.servicesMenu) {
					return (
						<ServicesNavMenu
							key={`${item.to}-${item.labelKey}`}
							item={item}
							collapsed={collapsed}
							onNavClick={onNavClick}
							t={t}
							showTip={showTip}
							hideTip={hideTip}
						/>
					)
				}

				const label = t(item.labelKey)
				const isProfileItem = item.to === '/dashboard/profile'
				const showProfileCue = isProfileItem && profileIncomplete
				const tipLabel = showProfileCue ? t('ws.nav.completeProfile') : label

				return (
					<NavLink
						key={`${item.to}-${item.labelKey}`}
						to={item.to}
						end={item.end}
						className={(state) =>
							`${linkClass(state)}${showProfileCue ? ' ws-nav-link--profile-cue' : ''}`
						}
						aria-label={showProfileCue ? `${label}. ${t('ws.nav.completeProfile')}` : undefined}
						onClick={() => {
							hideTip()
							onNavClick?.()
						}}
						onMouseEnter={(e) => {
							prefetchForPath(item.to)
							if (collapsed) showTip(e, tipLabel)
						}}
						onFocus={(e) => {
							prefetchForPath(item.to)
							if (collapsed) showTip(e, tipLabel)
						}}
						onMouseLeave={hideTip}
						onBlur={hideTip}
					>
						<span className="ws-nav-link-icon-wrap">
							<Icon
								name={item.icon}
								className={`ws-nav-link-icon ws-nav-link-icon--${item.icon}`}
							/>
							{showProfileCue ? <span className="ws-nav-profile-dot" aria-hidden /> : null}
						</span>
						<span className="ws-nav-link-copy">
							<span className="ws-nav-link-label">{label}</span>
							{showProfileCue ? (
								<span className="ws-nav-profile-cue">{t('ws.nav.completeProfile')}</span>
							) : null}
						</span>
					</NavLink>
				)
			})}
		</div>
	)
}

function WorkspaceSidebar({
	open = false,
	onClose,
	collapsed = false,
	onToggleCollapse,
	user,
	profileIncomplete = false,
}) {
	const { t } = useLanguage()
	const navGroups = getWorkspaceNavigation(user)
	const linkClass = ({ isActive }) => `ws-nav-link${isActive ? ' active' : ''}`
	const { tip, showTip, hideTip } = useNavHoverTip()
	const collapseLabel = collapsed ? t('ws.nav.expandSidebar') : t('ws.nav.collapseSidebar')

	const handleNavClick = () => {
		hideTip()
		onClose?.()
	}

	return (
		<aside
			className={`ws-sidebar${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}
			aria-label={t('ws.nav.workspace')}
		>
			<div className="ws-sidebar-brand">
				<div className="ws-sidebar-brand-text">
					<div className="ws-sidebar-title">{t('ws.brand.title')}</div>
					<div className="ws-sidebar-subtitle">{t('ws.brand.subtitle')}</div>
				</div>
				{onToggleCollapse ? (
					<button
						type="button"
						className="ws-sidebar-collapse-btn"
						aria-label={collapseLabel}
						aria-expanded={!collapsed}
						onClick={() => {
							hideTip()
							onToggleCollapse()
						}}
						onMouseEnter={(e) => showTip(e, collapseLabel)}
						onFocus={(e) => showTip(e, collapseLabel)}
						onMouseLeave={hideTip}
						onBlur={hideTip}
					>
						<Icon name={collapsed ? 'panelOpen' : 'panelClose'} className="ws-sidebar-collapse-icon" />
					</button>
				) : null}
				{onClose ? (
					<button
						type="button"
						className="ws-sidebar-close"
						aria-label={t('ws.nav.closeMenu')}
						onClick={onClose}
					>
						×
					</button>
				) : null}
			</div>

			<nav id="workspace-primary-nav" className="ws-sidebar-nav" aria-label={t('ws.nav.primary')}>
				{navGroups.map((group) => (
					<SidebarNavGroup
						key={group.sectionKey}
						group={group}
						collapsed={collapsed}
						linkClass={linkClass}
						onNavClick={handleNavClick}
						t={t}
						showTip={showTip}
						hideTip={hideTip}
						profileIncomplete={profileIncomplete}
					/>
				))}
			</nav>

			{showWorkspaceSupport(user) ? (
				<div className="ws-sidebar-support" aria-label={t('ws.nav.support')}>
					<div className="ws-nav-section-label">{t('ws.nav.support')}</div>
					<div className="ws-sidebar-support-list">
						<NavLink
							to="/contact"
							className="ws-sidebar-support-item"
							onClick={handleNavClick}
							onMouseEnter={(e) => {
								if (collapsed) showTip(e, t('ws.support.contactUs'))
							}}
							onFocus={(e) => {
								if (collapsed) showTip(e, t('ws.support.contactUs'))
							}}
							onMouseLeave={hideTip}
							onBlur={hideTip}
						>
							<Icon name="mail" className="ws-sidebar-support-icon ws-sidebar-support-icon--mail" />
							<div className="ws-sidebar-support-copy">
								<span className="ws-sidebar-support-label">{t('ws.support.helpdesk')}</span>
								<span className="ws-sidebar-support-value">{t('ws.support.contactUs')}</span>
							</div>
						</NavLink>
					</div>
				</div>
			) : null}

			<SidebarHoverTip tip={tip} />
		</aside>
	)
}

export default WorkspaceSidebar
