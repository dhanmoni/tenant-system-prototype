import { NavLink } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { useLanguage } from '../../i18n'
import { getWorkspaceNavigation } from '../config/navigation'

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
				{navGroups.map((group) => {
					const sectionLabel = t(group.sectionKey)
					return (
						<div key={group.sectionKey} className="ws-nav-section">
							{group.sectionKey !== 'ws.nav.workspace' ? (
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
										onClick={handleNavClick}
									>
										<Icon name={item.icon} className="ws-nav-link-icon" />
										<span className="ws-nav-link-label">{label}</span>
									</NavLink>
								)
							})}
						</div>
					)
				})}
			</nav>
		</aside>
	)
}

export default WorkspaceSidebar
