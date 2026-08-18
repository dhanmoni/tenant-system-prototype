import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import NavDashboardMenu from './NavDashboardMenu'
import PortalNavMark from './PortalNavMark'
import tcpLogo from '../../assets/img/TCP logo.png'
import nicLogo from '../../assets/img/NIC.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { useAuthSession } from '../../context/AuthSessionContext'
import { useLanguage } from '../../i18n'

function LandingNav({ variant = 'static' }) {
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const { t } = useLanguage()
	const { user, onLogout } = useAuthSession()
	const isStatic = variant === 'static'

	const isCurrentPath = (path, exact = true) =>
		exact ? location.pathname === path : location.pathname.startsWith(path)

	const shellLinkClass = (path, exact = true) =>
		`landing-nav-shell-link${isCurrentPath(path, exact) ? ' is-active' : ''}`

	const drawerLinkClass = (path, exact = true) =>
		`landing-nav-drawer-link${isCurrentPath(path, exact) ? ' is-active' : ''}`

	const closeMenu = () => setMenuOpen(false)

	/** Already on this page: don't re-navigate (remounts landing + replays animations). */
	const onNavClick = (path, exact = true) => (e) => {
		closeMenu()
		if (!isCurrentPath(path, exact)) return
		e.preventDefault()
		if (location.hash) {
			navigate(
				{ pathname: location.pathname, search: location.search, hash: '' },
				{ replace: true },
			)
		}
		window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
	}

	const scrollToPortal = () => {
		closeMenu()
		document.getElementById('portal-content')?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		closeMenu()
	}, [location.pathname, location.search])

	useEffect(() => {
		if (!menuOpen) return undefined
		const onKey = (e) => {
			if (e.key === 'Escape') closeMenu()
		}
		document.addEventListener('keydown', onKey)
		document.documentElement.classList.add('landing-nav-menu-open')
		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.documentElement.classList.remove('landing-nav-menu-open')
			document.body.style.overflow = prevOverflow
		}
	}, [menuOpen])

	const menuPortal =
		typeof document !== 'undefined'
			? createPortal(
					<AnimatePresence>
						{menuOpen ? (
							<>
								<motion.button
									type="button"
									key="landing-nav-backdrop"
									className="landing-nav-backdrop"
									aria-label={t('nav.closeMenu')}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.2 }}
									onClick={closeMenu}
								/>
								<motion.aside
									id="landing-nav-menu"
									key="landing-nav-panel"
									className="landing-nav-panel"
									role="dialog"
									aria-modal="true"
									aria-label={t('nav.main')}
									initial={{ x: '100%' }}
									animate={{ x: 0 }}
									exit={{ x: '100%' }}
									transition={{ type: 'spring', stiffness: 380, damping: 34 }}
								>
									<div className="landing-nav-panel__head">
										<p className="landing-nav-panel__title">{t('nav.main')}</p>
										<button
											type="button"
											className="landing-nav-panel__close"
											onClick={closeMenu}
											aria-label={t('nav.closeMenu')}
										>
											<X className="h-5 w-5" aria-hidden />
										</button>
									</div>
									<div className="landing-nav-drawer-inner">
										<button
											type="button"
											onClick={scrollToPortal}
											className="landing-nav-drawer-link"
										>
											{t('nav.applySignIn')}
										</button>
										<Link
											to="/"
											onClick={onNavClick('/')}
											className={drawerLinkClass('/')}
											aria-current={isCurrentPath('/') ? 'page' : undefined}
										>
											{t('nav.home')}
										</Link>
										<Link
											to="/about"
											onClick={onNavClick('/about')}
											className={drawerLinkClass('/about')}
											aria-current={isCurrentPath('/about') ? 'page' : undefined}
										>
											{t('nav.about')}
										</Link>
										<Link
											to="/services"
											onClick={onNavClick('/services')}
											className={drawerLinkClass('/services')}
											aria-current={isCurrentPath('/services') ? 'page' : undefined}
										>
											{t('nav.services')}
										</Link>
										<Link
											to="/resources"
											onClick={onNavClick('/resources')}
											className={drawerLinkClass('/resources')}
											aria-current={isCurrentPath('/resources') ? 'page' : undefined}
										>
											{t('nav.resources')}
										</Link>
										<NavDashboardMenu variant="drawer" onNavigate={closeMenu} />
										<Link
											to="/contact"
											onClick={onNavClick('/contact')}
											className={drawerLinkClass('/contact')}
											aria-current={isCurrentPath('/contact') ? 'page' : undefined}
										>
											{t('nav.contact')}
										</Link>
										<div className="landing-nav-drawer-ctas">
											{user ? (
												<>
													<Link
														to="/dashboard"
														onClick={closeMenu}
														className="landing-nav-drawer-cta landing-nav-drawer-cta--primary"
													>
														{t('nav.dashboard')}
													</Link>
													{onLogout ? (
														<button
															type="button"
															onClick={() => {
																closeMenu()
																onLogout()
															}}
															className="landing-nav-drawer-cta landing-nav-drawer-cta--outline"
														>
															{t('nav.logout')}
														</button>
													) : null}
												</>
											) : (
												<AuthNavLink
													mode="login"
													onClick={closeMenu}
													className="landing-nav-drawer-cta landing-nav-drawer-cta--primary"
												>
													{t('nav.loginRegister')}
												</AuthNavLink>
											)}
										</div>
										<div className="landing-nav-drawer-footer">
											<img
												src={nicLogo}
												alt="NIC"
												className="landing-nav-drawer-partner-logo landing-nav-drawer-partner-logo--nic"
											/>
											<img
												src={digitalIndiaLogo}
												alt="Digital India"
												className="landing-nav-drawer-partner-logo landing-nav-drawer-partner-logo--di"
											/>
										</div>
									</div>
								</motion.aside>
							</>
						) : null}
					</AnimatePresence>,
					document.body,
				)
			: null

	return (
		<motion.nav
			initial={false}
			id="landing-primary-nav"
			className={`landing-nav-host${isStatic ? ' landing-nav-host--static' : ' landing-nav-host--overlay'}${menuOpen ? ' is-menu-open' : ''}`}
			aria-label={t('nav.main')}
		>
			<div className="landing-nav-mobile">
				<div className="landing-nav-mobile-brand">
					<Link to="/" onClick={onNavClick('/')} className="landing-nav-brand">
						<img src={tcpLogo} alt="" className="landing-nav-emblem" aria-hidden />
						<span className="landing-nav-brand-text">
							<span className="landing-nav-brand-line landing-nav-brand-line--strong">
								{t('gov.portalName')}
							</span>
							<span className="landing-nav-brand-line">
								{t('gov.brandLine')}
							</span>
						</span>
					</Link>
					<div className="landing-nav-mobile-logos">
						<img
							src={nicLogo}
							alt="NIC"
							className="landing-nav-partner-logo landing-nav-partner-logo--nic"
						/>
						<img
							src={digitalIndiaLogo}
							alt="Digital India"
							className="landing-nav-partner-logo landing-nav-partner-logo--di"
						/>
					</div>
					<button
						type="button"
						className="landing-nav-mobile-menu-btn"
						onClick={() => setMenuOpen((open) => !open)}
						aria-expanded={menuOpen}
						aria-controls="landing-nav-menu"
						aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
					>
						{menuOpen ? (
							<X className="h-6 w-6" aria-hidden />
						) : (
							<Menu className="h-6 w-6" aria-hidden />
						)}
					</button>
				</div>

				{menuPortal}
			</div>

			<div className="landing-nav-overlay">
				<div className="landing-nav-shell">
					<div className="landing-nav-shell-inner">
						<Link to="/" onClick={onNavClick('/')} className="landing-nav-shell-brand">
							<img
								src={tcpLogo}
								alt=""
								className="landing-nav-shell-emblem"
								aria-hidden
							/>
							<span
								className="landing-nav-shell-portal-mark"
								title={t('gov.portalName')}
								aria-hidden
							>
								<PortalNavMark />
							</span>
							<span className="landing-nav-shell-brand-text">
								<span className="landing-nav-shell-brand-title">
									{t('gov.portalName')}
								</span>
								<span className="landing-nav-shell-brand-sub">
									{t('gov.brandLine')}
								</span>
							</span>
						</Link>
						<div className="landing-nav-shell-end">
							<div className="landing-nav-shell-links">
								<Link
									to="/"
									className={shellLinkClass('/')}
									aria-current={isCurrentPath('/') ? 'page' : undefined}
									onClick={onNavClick('/')}
								>
									{t('nav.home')}
								</Link>
								<Link
									to="/about"
									className={shellLinkClass('/about')}
									aria-current={isCurrentPath('/about') ? 'page' : undefined}
									onClick={onNavClick('/about')}
								>
									{t('nav.about')}
								</Link>
								<Link
									to="/services"
									className={shellLinkClass('/services')}
									aria-current={isCurrentPath('/services') ? 'page' : undefined}
									onClick={onNavClick('/services')}
								>
									{t('nav.services')}
								</Link>
								<Link
									to="/resources"
									className={shellLinkClass('/resources')}
									aria-current={isCurrentPath('/resources') ? 'page' : undefined}
									onClick={onNavClick('/resources')}
								>
									{t('nav.resources')}
								</Link>
								<NavDashboardMenu />
								<Link
									to="/contact"
									className={shellLinkClass('/contact')}
									aria-current={isCurrentPath('/contact') ? 'page' : undefined}
									onClick={onNavClick('/contact')}
								>
									{t('nav.contact')}
								</Link>
							</div>
							<div className="landing-nav-cta-group">
								{user ? (
									<>
										<Link
											to="/dashboard"
											className="landing-nav-cta landing-nav-cta--primary"
										>
											{t('nav.dashboard')}
										</Link>
										{onLogout ? (
											<button
												type="button"
												onClick={onLogout}
												className="landing-nav-cta landing-nav-cta--outline"
											>
												{t('nav.logout')}
											</button>
										) : null}
									</>
								) : (
									<AuthNavLink
										mode="login"
										className="landing-nav-cta landing-nav-cta--primary"
									>
										{t('nav.loginRegister')}
									</AuthNavLink>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.nav>
	)
}

export default LandingNav
