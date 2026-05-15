import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import emblem from '../../assets/img/emblem-dark.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { emitLandingA11y } from '../../utils/landingA11y'

const scrollLinks = [
	{ id: 'how-to-apply', label: 'How to apply' },
	{ id: 'tenancy-authorities', label: 'Tenancy bodies' },
	{ id: 'about', label: 'About' },
]

function LandingNav() {
	const [menuOpen, setMenuOpen] = useState(false)

	const scrollTo = (id) => (e) => {
		e.preventDefault()
		setMenuOpen(false)
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	}

	const closeMenu = () => setMenuOpen(false)

	const scrollToPortal = () => {
		closeMenu()
		document.getElementById('portal-content')?.scrollIntoView({ behavior: 'smooth' })
	}

	const ctaClass =
		'landing-nav-cta inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:py-2.5 sm:text-sm'

	const drawerLinkClass =
		'block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-landing-cream hover:text-landing'

	return (
		<motion.nav
			initial={{ opacity: 0, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			id="landing-primary-nav"
			className="landing-nav-host absolute inset-x-0 top-0 z-40"
			aria-label="Main navigation"
		>
			<div className="landing-nav-mobile md:hidden">
				<div className="landing-nav-utility">
					<span className="landing-nav-flag" role="img" aria-label="India">
						🇮🇳
					</span>
					<div className="landing-nav-utility-actions">
						<div className="landing-nav-font-tools" role="group" aria-label="Text size">
							<button
								type="button"
								className="landing-nav-font-btn"
								onClick={() => emitLandingA11y('increase')}
								aria-label="Increase text size"
							>
								A+
							</button>
							<button
								type="button"
								className="landing-nav-font-btn"
								onClick={() => emitLandingA11y('reset')}
								aria-label="Reset text size"
							>
								A
							</button>
							<button
								type="button"
								className="landing-nav-font-btn"
								onClick={() => emitLandingA11y('decrease')}
								aria-label="Decrease text size"
							>
								A−
							</button>
						</div>
						<div className="landing-nav-lang-tools" role="group" aria-label="Language">
							<button
								type="button"
								className="landing-nav-font-btn"
								onClick={() => emitLandingA11y('lang-en')}
								aria-label="English"
							>
								EN
							</button>
							<button
								type="button"
								className="landing-nav-font-btn"
								onClick={() => emitLandingA11y('lang-as')}
								aria-label="Assamese"
							>
								অসমীয়া
							</button>
						</div>
						<button
							type="button"
							className="landing-nav-contrast-btn"
							onClick={() => emitLandingA11y('contrast')}
						>
							Contrast
						</button>
					</div>
				</div>

				<div className="landing-nav-mainbar">
					<Link to="/" onClick={closeMenu} className="landing-nav-brand">
						<img src={emblem} alt="" className="landing-nav-emblem" aria-hidden />
						<span className="landing-nav-brand-text">
							<span className="landing-nav-brand-line">Government of Assam</span>
							<span className="landing-nav-brand-line landing-nav-brand-line--strong">
								Tenancy Registration Portal
							</span>
						</span>
					</Link>
					<img
						src={digitalIndiaLogo}
						alt="Digital India"
						className="landing-nav-di-logo"
					/>
					<div className="landing-nav-mainbar-tools">
						<button
							type="button"
							className="landing-nav-icon-btn"
							onClick={scrollToPortal}
							aria-label="Jump to apply and login"
						>
							<Search className="h-5 w-5" aria-hidden />
						</button>
						<button
							type="button"
							className="landing-nav-icon-btn"
							onClick={() => setMenuOpen((open) => !open)}
							aria-expanded={menuOpen}
							aria-controls="landing-nav-menu"
							aria-label={menuOpen ? 'Close menu' : 'Open menu'}
						>
							{menuOpen ? (
								<X className="h-5 w-5" aria-hidden />
							) : (
								<Menu className="h-5 w-5" aria-hidden />
							)}
						</button>
					</div>
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
								{scrollLinks.map((link) => (
									<a
										key={link.id}
										href={`#${link.id}`}
										onClick={scrollTo(link.id)}
										className={drawerLinkClass}
									>
										{link.label}
									</a>
								))}
								<Link to="/contact" onClick={closeMenu} className={drawerLinkClass}>
									Contact Us
								</Link>
								<Link to="/policies" onClick={closeMenu} className={drawerLinkClass}>
									Policies &amp; Guidelines
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
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>

			<div className="landing-nav-overlay pointer-events-none hidden justify-center px-3 pt-3 sm:px-6 sm:pt-5 md:flex lg:px-8">
				<div className="landing-nav-shell pointer-events-auto w-full max-w-6xl rounded-full border border-white/20 bg-black/45 px-4 py-2 shadow-xl backdrop-blur-md">
					<div className="flex w-full flex-wrap items-center justify-between gap-2">
						<div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-0.5 lg:gap-1">
							<Link
								to="/"
								className="rounded-full px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 lg:px-4"
							>
								Home
							</Link>
							{scrollLinks.map((link) => (
								<a
									key={link.id}
									href={`#${link.id}`}
									onClick={scrollTo(link.id)}
									className="rounded-full px-3 py-2 text-sm font-semibold text-white/95 transition-colors hover:bg-white/10 hover:text-white lg:px-4"
								>
									{link.label}
								</a>
							))}
							<Link
								to="/contact"
								className="rounded-full px-3 py-2 text-sm font-semibold text-white/95 transition-colors hover:bg-white/10 hover:text-white lg:px-4"
							>
								Contact Us
							</Link>
							<Link
								to="/policies"
								className="rounded-full px-3 py-2 text-sm font-semibold text-white/95 transition-colors hover:bg-white/10 hover:text-white lg:px-4"
							>
								Policies &amp; Guidelines
							</Link>
						</div>
						<div className="landing-nav-cta-group flex shrink-0 items-center gap-2">
							<AuthNavLink
								mode="login"
								className={`${ctaClass} bg-landing text-white hover:bg-landing-dark`}
							>
								Login
							</AuthNavLink>
							<AuthNavLink
								mode="register"
								className={`${ctaClass} landing-nav-cta--outline border-2 border-white/90 bg-transparent text-white hover:bg-white/15`}
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
