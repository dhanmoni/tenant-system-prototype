import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import NavDashboardMenu from './NavDashboardMenu'
import tcpLogo from '../../assets/img/TCP logo.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { emitLandingA11y } from '../../utils/landingA11y'
import { useLanguage } from '../../i18n'

function LandingNav({ variant = 'overlay' }) {
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()
	const { language, t } = useLanguage()
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
										<Link to="/" onClick={closeMenu} className={drawerLinkClass('/')}>
											{t('nav.home')}
										</Link>
										<Link
											to="/services"
											onClick={closeMenu}
											className={drawerLinkClass('/services')}
										>
											{t('nav.services')}
										</Link>
										<NavDashboardMenu variant="drawer" onNavigate={closeMenu} />
										<Link to="/about" onClick={closeMenu} className={drawerLinkClass('/about')}>
											{t('nav.about')}
										</Link>
										<Link
											to="/contact"
											onClick={closeMenu}
											className={drawerLinkClass('/contact')}
										>
											{t('nav.contact')}
										</Link>
										<Link
											to="/policies"
											onClick={closeMenu}
											className={drawerLinkClass('/policies')}
										>
											{t('nav.policies')}
										</Link>
										<Link
											to="/resources"
											onClick={closeMenu}
											className={drawerLinkClass('/resources')}
										>
											{t('nav.resources')}
										</Link>
										<div className="landing-nav-drawer-ctas">
											<AuthNavLink
												mode="login"
												onClick={closeMenu}
												className="landing-nav-drawer-cta landing-nav-drawer-cta--primary"
											>
												{t('nav.login')}
											</AuthNavLink>
											<AuthNavLink
												mode="register"
												onClick={closeMenu}
												className="landing-nav-drawer-cta landing-nav-drawer-cta--outline"
											>
												{t('nav.register')}
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
				<div
					className="landing-nav-mobile-a11y"
					role="toolbar"
					aria-label={t('a11y.options')}
				>
					<div className="landing-nav-mobile-a11y-inner">
						<div className="landing-nav-mobile-a11y-links">
							<a href="#portal-content" className="landing-nav-mobile-skip">
								{t('a11y.skipToContent')}
							</a>
						</div>
						<div className="landing-nav-mobile-a11y-tools">
							<div className="landing-nav-mobile-a11y-fonts" role="group" aria-label={t('a11y.textSize')}>
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('decrease')}
									aria-label={t('a11y.decreaseText')}
								>
									A−
								</button>
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('reset')}
									aria-label={t('a11y.resetText')}
								>
									A
								</button>
								<button
									type="button"
									className="landing-nav-mobile-a11y-btn"
									onClick={() => emitLandingA11y('increase')}
									aria-label={t('a11y.increaseText')}
								>
									A+
								</button>
							</div>
							<span className="landing-nav-mobile-sep" aria-hidden>
								|
							</span>
							<button
								type="button"
								className="landing-nav-mobile-a11y-btn landing-nav-mobile-a11y-btn--text"
								onClick={() => emitLandingA11y('contrast')}
								aria-label={t('a11y.toggleContrast')}
							>
								{t('a11y.contrast')}
							</button>
							<span className="landing-nav-mobile-sep" aria-hidden>
								|
							</span>
							<div className="landing-nav-mobile-a11y-lang" role="group" aria-label={t('a11y.language')}>
								<button
									type="button"
									className={`landing-nav-mobile-a11y-btn${language === 'en' ? ' is-active' : ''}`}
									onClick={() => emitLandingA11y('lang-en')}
									aria-label={t('a11y.english')}
									aria-pressed={language === 'en'}
								>
									English
								</button>
								<span className="landing-nav-mobile-sep" aria-hidden>
									|
								</span>
								<button
									type="button"
									className={`landing-nav-mobile-a11y-btn${language === 'as' ? ' is-active' : ''}`}
									onClick={() => emitLandingA11y('lang-as')}
									aria-label={t('a11y.assamese')}
									aria-pressed={language === 'as'}
								>
									অসমীয়া
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="landing-nav-mobile-brand">
					<Link to="/" onClick={closeMenu} className="landing-nav-brand">
						<img src={tcpLogo} alt="" className="landing-nav-emblem" aria-hidden />
						<span className="landing-nav-brand-text">
							<span className="landing-nav-brand-line">{t('gov.brandLine')}</span>
							<span className="landing-nav-brand-line landing-nav-brand-line--strong">
								{t('gov.portalName')}
							</span>
						</span>
					</Link>
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
						<div className="landing-nav-shell-links">
							<Link to="/" className={shellLinkClass('/')}>
								{t('nav.home')}
							</Link>
							<Link to="/services" className={shellLinkClass('/services')}>
								{t('nav.services')}
							</Link>
							<NavDashboardMenu />
							<Link to="/about" className={shellLinkClass('/about')}>
								{t('nav.about')}
							</Link>
							<Link to="/contact" className={shellLinkClass('/contact')}>
								{t('nav.contact')}
							</Link>
							<Link to="/policies" className={shellLinkClass('/policies')}>
								<span className="landing-nav-shell-link-long">{t('nav.policies')}</span>
								<span className="landing-nav-shell-link-short">{t('nav.policiesShort')}</span>
							</Link>
							<Link to="/resources" className={shellLinkClass('/resources')}>
								{t('nav.resources')}
							</Link>
						</div>
						<div className="landing-nav-cta-group">
							<AuthNavLink
								mode="login"
								className="landing-nav-cta landing-nav-cta--primary"
							>
								{t('nav.login')}
							</AuthNavLink>
							<AuthNavLink
								mode="register"
								className="landing-nav-cta landing-nav-cta--outline"
							>
								{t('nav.register')}
							</AuthNavLink>
						</div>
					</div>
				</div>
			</div>
		</motion.nav>
	)
}

export default LandingNav
