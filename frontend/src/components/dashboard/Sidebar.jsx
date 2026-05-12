import { useState, useRef, useEffect, useCallback } from 'react'

import { createPortal } from 'react-dom'

import { NavLink, useLocation } from 'react-router-dom'

import { Icon } from './Icons'

import { tenantServiceGroups } from '../../data/tenantServices'



function Sidebar({ user, onLogout }) {

	const location = useLocation()

	const [officeMenuOpen, setOfficeMenuOpen] = useState(false)

	const [userMenuOpen, setUserMenuOpen] = useState(false)



	const servicesWrapRef = useRef(null)

	const flyoutRef = useRef(null)

	const servicesLeaveTimerRef = useRef(null)

	const [servicesFlyoutOpen, setServicesFlyoutOpen] = useState(false)

	const [servicesFlyoutPos, setServicesFlyoutPos] = useState({ top: 0, left: 0 })

	const [servicesHoveredGroupId, setServicesHoveredGroupId] = useState(null)

	const servicesGroupHoverTimerRef = useRef(null)

	const [userDropdownOpen, setUserDropdownOpen] = useState(false)

	const userDropdownRef = useRef(null)

	const userDropdownLeaveTimerRef = useRef(null)

	const profilePathActive = location.pathname.startsWith('/dashboard/profile')

	const servicesNavActive =

		location.pathname === '/dashboard/services' ||

		location.pathname.startsWith('/dashboard/form-')

	const clearServicesGroupHoverTimer = useCallback(() => {

		if (servicesGroupHoverTimerRef.current) {

			clearTimeout(servicesGroupHoverTimerRef.current)

			servicesGroupHoverTimerRef.current = null

		}

	}, [])



	const scheduleClearServicesGroupHover = useCallback(() => {

		clearServicesGroupHoverTimer()

		servicesGroupHoverTimerRef.current = setTimeout(() => {

			setServicesHoveredGroupId(null)

			servicesGroupHoverTimerRef.current = null

		}, 200)

	}, [clearServicesGroupHoverTimer])

	const clearUserDropdownLeaveTimer = useCallback(() => {
		if (userDropdownLeaveTimerRef.current) {
			clearTimeout(userDropdownLeaveTimerRef.current)
			userDropdownLeaveTimerRef.current = null
		}
	}, [])

	const openUserDropdown = useCallback(() => {
		clearUserDropdownLeaveTimer()
		setUserDropdownOpen(true)
	}, [clearUserDropdownLeaveTimer])

	const scheduleCloseUserDropdown = useCallback(() => {
		clearUserDropdownLeaveTimer()
		userDropdownLeaveTimerRef.current = setTimeout(() => {
			setUserDropdownOpen(false)
			userDropdownLeaveTimerRef.current = null
		}, 220)
	}, [clearUserDropdownLeaveTimer])

	const toggleUserDropdown = useCallback(() => {
		clearUserDropdownLeaveTimer()
		setUserDropdownOpen((open) => !open)
	}, [clearUserDropdownLeaveTimer])

	const clearServicesLeaveTimer = useCallback(() => {

		if (servicesLeaveTimerRef.current) {

			clearTimeout(servicesLeaveTimerRef.current)

			servicesLeaveTimerRef.current = null

		}

	}, [])



	const updateServicesFlyoutPosition = useCallback(() => {

		const el = servicesWrapRef.current

		if (!el) return

		const r = el.getBoundingClientRect()

		const panelW = 400

		const gap = 8

		let left = r.right + gap

		if (left + panelW > window.innerWidth - 12) {

			left = Math.max(12, r.left - panelW - gap)

		}

		const maxTop = window.innerHeight - 120

		const top = Math.max(8, Math.min(r.top, maxTop))

		setServicesFlyoutPos({ top, left })

	}, [])



	const openServicesFlyout = useCallback(() => {

		clearServicesLeaveTimer()

		updateServicesFlyoutPosition()

		setServicesFlyoutOpen(true)

	}, [clearServicesLeaveTimer, updateServicesFlyoutPosition])



	const scheduleCloseServicesFlyout = useCallback(() => {

		clearServicesLeaveTimer()

		servicesLeaveTimerRef.current = setTimeout(() => {

			setServicesFlyoutOpen(false)

			servicesLeaveTimerRef.current = null

		}, 220)

	}, [clearServicesLeaveTimer])



	useEffect(() => {

		if (!servicesFlyoutOpen) {

			setServicesHoveredGroupId(null)

			clearServicesGroupHoverTimer()

		}

	}, [servicesFlyoutOpen, clearServicesGroupHoverTimer])



	useEffect(() => {

		if (!servicesFlyoutOpen) return undefined

		const onReposition = () => updateServicesFlyoutPosition()

		const onKeyDown = (e) => {

			if (e.key === 'Escape') setServicesFlyoutOpen(false)

		}

		window.addEventListener('scroll', onReposition, true)

		window.addEventListener('resize', onReposition)

		window.addEventListener('keydown', onKeyDown)

		return () => {

			window.removeEventListener('scroll', onReposition, true)

			window.removeEventListener('resize', onReposition)

			window.removeEventListener('keydown', onKeyDown)

		}

	}, [servicesFlyoutOpen, updateServicesFlyoutPosition])



	useEffect(() => {

		return () => {

			clearServicesLeaveTimer()

			clearServicesGroupHoverTimer()

		}

	}, [clearServicesLeaveTimer, clearServicesGroupHoverTimer])

	useEffect(() => {
		setUserDropdownOpen(false)
	}, [location.pathname])

	useEffect(() => {
		if (!userDropdownOpen) return undefined
		const onDocMouseDown = (e) => {
			if (!userDropdownRef.current?.contains(e.target)) {
				setUserDropdownOpen(false)
			}
		}
		const onKeyDown = (e) => {
			if (e.key === 'Escape') setUserDropdownOpen(false)
		}
		document.addEventListener('mousedown', onDocMouseDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('mousedown', onDocMouseDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [userDropdownOpen])

	useEffect(() => {
		return () => clearUserDropdownLeaveTimer()
	}, [clearUserDropdownLeaveTimer])

	const sidebarDummyAvatarUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`

<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">

  <defs>

    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">

      <stop stop-color="#1f2937" offset="0"/>

      <stop stop-color="#111827" offset="1"/>

    </linearGradient>

  </defs>

  <rect width="80" height="80" rx="40" fill="url(#g)"/>

  <circle cx="40" cy="32" r="14" fill="#7eb8ff" opacity="0.9"/>

  <path d="M14 78c3.5-16 14.5-26 26-26s22.5 10 26 26" fill="#7eb8ff" opacity="0.25"/>

</svg>

`)}`;



	const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

	const photoUrl = user?.passport_photo_url

	const photoPath = user?.passport_photo_path || user?.user_passport_photo_path

	const sidebarPhotoUrl = photoUrl

		? photoUrl

		: photoPath

			? `${apiBaseUrl}/storage/${photoPath}`

			: sidebarDummyAvatarUrl



	return (

		<aside className="dashboard-menu">

			<div className="dashboard-menu-header">

				<div

					ref={userDropdownRef}

					className={`dashboard-user-dropdown${userDropdownOpen ? ' is-open' : ''}${profilePathActive ? ' is-profile-route' : ''}`}

					onMouseEnter={openUserDropdown}

					onMouseLeave={scheduleCloseUserDropdown}

				>

					<button

						type="button"

						className="dashboard-user-dropdown-trigger"

						onClick={toggleUserDropdown}

						aria-expanded={userDropdownOpen}

						aria-haspopup="menu"

						aria-controls="dashboard-user-dropdown-menu"

						id="dashboard-user-dropdown-button"

					>

						<img className="dashboard-menu-user-photo" src={sidebarPhotoUrl} alt="" />

						<div className="dashboard-menu-user-text">

							<div className="dashboard-menu-user-name">{user?.name || 'User'}</div>

							{user?.email ? (

								<div className="dashboard-user-dropdown-hint" title={user.email}>

									{user.email}

								</div>

							) : (

								<div className="dashboard-user-dropdown-hint">Account</div>

							)}

						</div>

						<Icon

							name="chevron"

							className={`dashboard-user-dropdown-chevron ${userDropdownOpen ? 'open' : ''}`}

						/>

					</button>

					{userDropdownOpen ? (

						<div

							id="dashboard-user-dropdown-menu"

							className="dashboard-user-dropdown-panel"

							role="menu"

							aria-labelledby="dashboard-user-dropdown-button"

							onMouseEnter={clearUserDropdownLeaveTimer}

						>

							<NavLink

								to="/dashboard/profile"

								role="menuitem"

								className={({ isActive }) =>

									`dashboard-user-dropdown-item${isActive ? ' active' : ''}`

								}

								onClick={() => setUserDropdownOpen(false)}

							>

								<Icon name="user" className="dashboard-user-dropdown-item-icon" />

								<span>Profile</span>

							</NavLink>

							<button

								type="button"

								role="menuitem"

								className="dashboard-user-dropdown-item dashboard-user-dropdown-item--logout"

								onClick={() => {

									setUserDropdownOpen(false)

									onLogout()

								}}

							>

								<Icon name="logout" className="dashboard-user-dropdown-item-icon" />

								<span>Logout</span>

							</button>

						</div>

					) : null}

				</div>

			</div>

			<nav className="dashboard-links">

				<NavLink

					to="/dashboard"

					end

					className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

					title="Dashboard"

				>

					<Icon name="dashboard" className="dashboard-link-icon" />

					<span className="dashboard-link-text">Dashboard</span>

				</NavLink>



				{user?.role === 'user' ? (

					<>

						<NavLink

							to="/dashboard/tenancy-certificate"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="Apply for UIN"

						>

							<Icon name="documentPlus" className="dashboard-link-icon" />

							<span className="dashboard-link-text">Apply for UIN</span>

						</NavLink>

						<NavLink

							to="/dashboard/status"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="UIN Status"

						>

							<Icon name="status" className="dashboard-link-icon" />

							<span className="dashboard-link-text">UIN Status</span>

						</NavLink>

						<div

							ref={servicesWrapRef}

							className={`dashboard-services-nav-wrap${servicesFlyoutOpen ? ' is-flyout-open' : ''}`}

							onMouseEnter={openServicesFlyout}

							onMouseLeave={scheduleCloseServicesFlyout}

						>

							<NavLink

								to="/dashboard/services"

								className={`dashboard-link ${servicesNavActive ? 'active' : ''}`}

								title="Services — click to open the services page; hover for quick links"

								onFocus={openServicesFlyout}

								onBlur={(e) => {

									const next = e.relatedTarget

									if (next && flyoutRef.current?.contains(next)) return

									scheduleCloseServicesFlyout()

								}}

							>

								<Icon name="services" className="dashboard-link-icon" />

								<span className="dashboard-link-text">Services</span>

							</NavLink>

							{servicesFlyoutOpen &&

								typeof document !== 'undefined' &&

								createPortal(

									<div

										ref={flyoutRef}

										className="dashboard-services-flyout dashboard-services-flyout--minimal"

										style={{

											position: 'fixed',

											top: servicesFlyoutPos.top,

											left: servicesFlyoutPos.left,

											zIndex: 10050,

										}}

										role="navigation"

										aria-label="Services"

										onMouseEnter={clearServicesLeaveTimer}

										onMouseLeave={scheduleCloseServicesFlyout}

									>

										<div className="dashboard-services-flyout-inner">

											<div

												className="dashboard-services-flyout-row"

												onMouseLeave={scheduleClearServicesGroupHover}

											>

												<ul className="dashboard-services-flyout-cats" role="list">

													{tenantServiceGroups.map((group) => (

														<li key={group.id}>

															<button

																type="button"

																className={`dashboard-services-flyout-cat${servicesHoveredGroupId === group.id ? ' is-active' : ''}`}

																onMouseEnter={() => {

																	clearServicesGroupHoverTimer()

																	setServicesHoveredGroupId(group.id)

																}}

															>

																<span className="dashboard-services-flyout-cat-text">

																	{group.title}

																</span>

																<span className="dashboard-services-flyout-cat-more" aria-hidden>

																	›

																</span>

															</button>

														</li>

													))}

												</ul>

												{servicesHoveredGroupId ? (

													<div

														className="dashboard-services-flyout-forms-col"

														onMouseEnter={clearServicesGroupHoverTimer}

													>

														<ul className="dashboard-services-flyout-form-list">

															{tenantServiceGroups

																.find((g) => g.id === servicesHoveredGroupId)

																?.forms?.map((f) => (

																	<li key={f.to}>

																		<NavLink

																			to={f.to}

																			className={({ isActive }) =>

																				`dashboard-services-flyout-link${isActive ? ' active' : ''}`

																			}

																			onClick={() => setServicesFlyoutOpen(false)}

																		>

																			{f.label}

																		</NavLink>

																	</li>

																))}

														</ul>

													</div>

												) : null}

											</div>

											<NavLink

												to="/dashboard/services"

												className="dashboard-services-flyout-all"

												onClick={() => setServicesFlyoutOpen(false)}

											>

												Services page

											</NavLink>

										</div>

									</div>,

									document.body

								)}

						</div>

					</>

				) : null}



				{user?.role !== 'user' && user?.role !== 'system_admin' ? (

					<>

						<NavLink

							to="/dashboard/status"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="Application Status"

						>

							<Icon name="status" className="dashboard-link-icon" />

							<span className="dashboard-link-text">Application Status</span>

						</NavLink>



						<NavLink

							to="/dashboard/admin/district"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="District Management"

						>

							<Icon name="building" className="dashboard-link-icon" />

							<span className="dashboard-link-text">District Management</span>

						</NavLink>

						<a

							className={`dashboard-link dashboard-link-expandable ${userMenuOpen ? 'menu-open' : ''}`}

							href="#staff-user-menu"

							onClick={(e) => {

								e.preventDefault()

								setUserMenuOpen((prev) => !prev)

							}}

							title="User Management"

						>

							<div className="dashboard-link-main">

								<Icon name="user" className="dashboard-link-icon" />

								<span className="dashboard-link-text">User Management</span>

							</div>

							<Icon name="chevron" className={`dashboard-link-chevron ${userMenuOpen ? 'open' : ''}`} />

						</a>

						{userMenuOpen ? (

							<div className="dashboard-submenu">

								<NavLink

									to="/dashboard/admin/users?mode=office"

									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

								>

									Office user

								</NavLink>

								<NavLink

									to="/dashboard/admin/users?mode=tenant"

									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

								>

									User

								</NavLink>

							</div>

						) : null}

					</>

				) : null}



				{user?.role === 'system_admin' ? (

					<>



						<NavLink

							to="/dashboard/admin/district"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="District Management"

						>

							<Icon name="building" className="dashboard-link-icon" />

							<span className="dashboard-link-text">District Management</span>

						</NavLink>

						<a

							className={`dashboard-link dashboard-link-expandable ${officeMenuOpen ? 'menu-open' : ''}`}

							href="#office-menu"

							onClick={(e) => {

								e.preventDefault()

								setOfficeMenuOpen((prev) => !prev)

							}}

							title="Office Management"

						>

							<div className="dashboard-link-main">

								<Icon name="building" className="dashboard-link-icon" />

								<span className="dashboard-link-text">Office Management</span>

							</div>

							<Icon name="chevron" className={`dashboard-link-chevron ${officeMenuOpen ? 'open' : ''}`} />

						</a>

						{officeMenuOpen ? (

							<div className="dashboard-submenu">

								<NavLink

									to="/dashboard/admin/office"

									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

								>

									Office

								</NavLink>

								<NavLink

									to="/dashboard/admin/designation"

									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

								>

									Designation

								</NavLink>

							</div>

						) : null}

						<NavLink

							to="/dashboard/admin/role"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="Role Management"

						>

							<Icon name="settings" className="dashboard-link-icon" />

							<span className="dashboard-link-text">Role Management</span>

						</NavLink>

						<a

							className={`dashboard-link dashboard-link-expandable ${userMenuOpen ? 'menu-open' : ''}`}

							href="#user-menu"

							onClick={(e) => {

								e.preventDefault()

								setUserMenuOpen((prev) => !prev)

							}}

							title="User Management"

						>

							<div className="dashboard-link-main">

								<Icon name="user" className="dashboard-link-icon" />

								<span className="dashboard-link-text">User Management</span>

							</div>

							<Icon name="chevron" className={`dashboard-link-chevron ${userMenuOpen ? 'open' : ''}`} />

						</a>

						{userMenuOpen ? (

							<div className="dashboard-submenu">

								<NavLink

									to="/dashboard/admin/users?mode=office"

									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

								>

									Office user

								</NavLink>

								<NavLink

									to="/dashboard/admin/users?mode=tenant"

									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

								>

									User

								</NavLink>

							</div>

						) : null}

						<NavLink

							to="/dashboard/admin/activity-log"

							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}

							title="User Activity Log"

						>

							<Icon name="activity" className="dashboard-link-icon" />

							<span className="dashboard-link-text">User Activity Log</span>

						</NavLink>

					</>

				) : null}

			</nav>

		</aside>

	)

}



export default Sidebar

