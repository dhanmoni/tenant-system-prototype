import { NavLink } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { useLanguage } from '../../i18n'
import {
	getWorkspaceNavigation,
	showWorkspaceSupport,
	WORKSPACE_SUPPORT_CONTACT,
} from '../config/navigation'

function SidebarNavGroup({ group, collapsed, linkClass, onNavClick, t }) {
	const sectionLabel = t(group.sectionKey)
	const showSectionLabel = group.sectionKey !== 'ws.nav.workspace'

	return (
		<div className="ws-nav-section">
			{showSectionLabel ? (
				<div className="ws-nav-section-label">{sectionLabel}</div>
			) : null}
			{group.items.map((item) => {
				const label = t(item.labelKey)
				return (
					<NavLink
						key={`${item.to}-${item.labelKey}`}
						to={item.to}
						end={item.end}
						className={linkClass}
						title={collapsed ? label : undefined}
						onClick={onNavClick}
					>
						<Icon
							name={item.icon}
							className={`ws-nav-link-icon ws-nav-link-icon--${item.icon}`}
						/>
						<span className="ws-nav-link-label">{label}</span>
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
}) {
	const { t } = useLanguage()
	const navGroups = getWorkspaceNavigation(user)
	const linkClass = ({ isActive }) => `ws-nav-link${isActive ? ' active' : ''}`

	const handleNavClick = () => {
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
						aria-label={
							collapsed ? t('ws.nav.expandSidebar') : t('ws.nav.collapseSidebar')
						}
						aria-expanded={!collapsed}
						title={collapsed ? t('ws.nav.expandSidebar') : t('ws.nav.collapseSidebar')}
						onClick={onToggleCollapse}
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
					/>
				))}
			</nav>

			{showWorkspaceSupport(user) ? (
				<div className="ws-sidebar-support" aria-label={t('ws.nav.support')}>
					<div className="ws-nav-section-label">{t('ws.nav.support')}</div>
					<div className="ws-sidebar-support-list">
						<div
							className="ws-sidebar-support-item"
							title={collapsed ? WORKSPACE_SUPPORT_CONTACT.phoneDisplay : undefined}
						>
							<Icon name="bell" className="ws-sidebar-support-icon ws-sidebar-support-icon--phone" />
							<div className="ws-sidebar-support-copy">
								<span className="ws-sidebar-support-label">{t('ws.support.phone')}</span>
								<span className="ws-sidebar-support-value">
									{WORKSPACE_SUPPORT_CONTACT.phoneDisplay}
								</span>
							</div>
						</div>
						<div
							className="ws-sidebar-support-item"
							title={collapsed ? WORKSPACE_SUPPORT_CONTACT.email : undefined}
						>
							<Icon name="mail" className="ws-sidebar-support-icon ws-sidebar-support-icon--mail" />
							<div className="ws-sidebar-support-copy">
								<span className="ws-sidebar-support-label">{t('ws.support.email')}</span>
								<span className="ws-sidebar-support-value ws-sidebar-support-value--email">
									{WORKSPACE_SUPPORT_CONTACT.email}
								</span>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</aside>
	)
}

export default WorkspaceSidebar
