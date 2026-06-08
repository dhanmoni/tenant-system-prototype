import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import NavDashboardMenu from './NavDashboardMenu'
import tcpLogo from '../../assets/img/TCP logo.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { emitLandingA11y } from '../../utils/landingA11y'

function LandingNav({ variant = 'overlay' }) {
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()
	const isStatic = variant === 'static'

	const shellLinkClass = (path, exact = true) => {
		const active = exact
			? location.pathname === path
			: location.pathname.startsWith(path)
		return `landing-nav-shell-link${active ? ' is-active' : ''}`
	}

	const drawerLinkClass = (path, exact = true) => {
		const active = exact
			? location.pathname === path
			: location.pathname.startsWith(path)
		return `landing-nav-drawer-link${active ? ' is-active' : ''}`
	}

	const closeMenu = () => setMenuOpen(false)

	const scrollToPortal = () => {
		closeMenu()
		document.getElementById('portal-content')?.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<motion.nav
			initial={false}
			id="landing-primary-nav"
			className={`landing-nav-host${isStatic ? ' landing-nav-host--static' : ' landing-nav-host--overlay'}`}
			aria-label="Main navigation"
		>
			<div className="landing-nav-mobile">
				<div
					className="landing-nav-mobile-a11y"
					role="toolbar"
					aria-label="Accessibility options"
				>
					<div className="landing-nav-mobile-a11y-inner">
						<div className="landing-nav-mobile-a11y-row landing-nav-mobile-a11y-row--primary">
							<span className="landing-nav-mobile-flag" role="img" aria-label="India">
								🇮🇳
							</span>
							<div className="landing-nav-mobile-skip-group">
								<a href="#main-content" className="landing-nav-mobile-skip">
									Skip to main content
								</a>
								<a
									href="#portal-content"
									className="landing-nav-mobile-skip landing-nav-mobile-skip--apply"
								>
									Skip to apply
								</a>
							</div>
						</div>
						<div className="landing-nav-mobile-a11y-row landing-nav-mobile-a11y-row--tools">
							<div className="landing-nav-mobile-a11y-group" role="group" aria-label="Text size">
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('increase')}
									aria-label="Increase text size"
								>
									A+
								</button>
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('reset')}
									aria-label="Reset text size"
								>
									A
								</button>
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('decrease')}
									aria-label="Decrease text size"
								>
									A−
								</button>
							</div>
							<div className="landing-nav-mobile-a11y-group" role="group" aria-label="Language">
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('lang-en')}
									aria-label="English"
								>
									EN
								</button>
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('lang-as')}
									aria-label="Assamese"
								>
									অসমীয়া
								</button>
							</div>
							<button
								type="button"
								className="landing-nav-mobile-a11y-btn landing-nav-mobile-a11y-btn--solo"
								onClick={() => emitLandingA11y('contrast')}
							>
								<span className="landing-nav-a11y-label landing-nav-a11y-label--long">High contrast</span>
								<span className="landing-nav-a11y-label landing-nav-a11y-label--short">Contrast</span>
							</button>
						</div>
					</div>
				</div>

				<div className="landing-nav-mobile-brand">
					<Link to="/" onClick={closeMenu} className="landing-nav-brand">
						<img src={tcpLogo} alt="" className="landing-nav-emblem" aria-hidden />
						<span className="landing-nav-brand-text">
							<span className="landing-nav-brand-line">Government of Assam</span>
							<span className="landing-nav-brand-line landing-nav-brand-line--strong">
								Tenancy Registration Portal
							</span>
						</span>
					</Link>
					<button
						type="button"
						className="landing-nav-mobile-menu-btn"
						onClick={() => setMenuOpen((open) => !open)}
						aria-expanded={menuOpen}
						aria-controls="landing-nav-menu"
						aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					>
						{menuOpen ? (
							<X className="h-6 w-6" aria-hidden />
						) : (
							<Menu className="h-6 w-6" aria-hidden />
						)}
					</button>
				</div>

				<AnimatePresence>
					{menuOpen ? (
						<motion.div
							id="landing-nav-menu"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="landing-nav-drawer overflow-hidden"
						>
							<div className="landing-nav-drawer-inner">
								<button
									type="button"
									onClick={scrollToPortal}
									className="landing-nav-drawer-link"
								>
									Apply &amp; sign in
								</button>
								<Link to="/" onClick={closeMenu} className={drawerLinkClass('/')}>
									Home
								</Link>
								<Link to="/services" onClick={closeMenu} className={drawerLinkClass('/services')}>
									Services
								</Link>
								<NavDashboardMenu variant="drawer" onNavigate={closeMenu} />
								<Link to="/about" onClick={closeMenu} className={drawerLinkClass('/about')}>
									About us
								</Link>
								<Link to="/contact" onClick={closeMenu} className={drawerLinkClass('/contact')}>
									Contact
								</Link>
								<Link to="/policies" onClick={closeMenu} className={drawerLinkClass('/policies')}>
									Policies &amp; Guidelines
								</Link>
								<Link to="/resources" onClick={closeMenu} className={drawerLinkClass('/resources')}>
									Resources
								</Link>
								<div className="landing-nav-drawer-ctas">
									<AuthNavLink
										mode="login"
										onClick={closeMenu}
										className="landing-nav-drawer-cta landing-nav-drawer-cta--primary"
									>
										Login
									</AuthNavLink>
									<AuthNavLink
										mode="register"
										onClick={closeMenu}
										className="landing-nav-drawer-cta landing-nav-drawer-cta--outline"
									>
										Register
									</AuthNavLink>
								</div>
								<div className="landing-nav-drawer-footer">
									<img
										src={digitalIndiaLogo}
										alt="Digital India"
										className="landing-nav-drawer-di-logo"
									/>
								</div>
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>

			<div className="landing-nav-overlay">
				<div className="landing-nav-shell">
					<div className="landing-nav-shell-inner">
						<div className="landing-nav-shell-links">
							<Link to="/" className={shellLinkClass('/')}>
								Home
							</Link>
							<Link to="/services" className={shellLinkClass('/services')}>
								Services
							</Link>
							<NavDashboardMenu />
							<Link to="/about" className={shellLinkClass('/about')}>
								About us
							</Link>
							<Link to="/contact" className={shellLinkClass('/contact')}>
								Contact
							</Link>
							<Link to="/policies" className={shellLinkClass('/policies')}>
								<span className="landing-nav-shell-link-long">Policies &amp; Guidelines</span>
								<span className="landing-nav-shell-link-short">Policies</span>
							</Link>
							<Link to="/resources" className={shellLinkClass('/resources')}>
								Resources
							</Link>
						</div>
						<div className="landing-nav-cta-group">
							<AuthNavLink
								mode="login"
								className="landing-nav-cta landing-nav-cta--primary"
							>
								Login
							</AuthNavLink>
							<AuthNavLink
								mode="register"
								className="landing-nav-cta landing-nav-cta--outline"
							>
								Register
							</AuthNavLink>
						</div>
					</div>
				</div>
			</div>
		</motion.nav>
	)
}

export default LandingNav
