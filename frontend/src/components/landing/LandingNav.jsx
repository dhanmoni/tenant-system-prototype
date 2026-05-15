import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

function LandingNav() {
	const scrollTo = (id) => (e) => {
		e.preventDefault()
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
	}

	const navLinkClass =
		'rounded-full px-4 py-2 text-sm font-semibold text-white/95 transition-colors hover:bg-white/10 hover:text-white'

	return (
		<motion.nav
			initial={{ opacity: 0, y: -12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			id="landing-primary-nav"
			className="landing-nav-overlay pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8"
			aria-label="Main navigation"
		>
			<div className="pointer-events-auto flex w-full min-w-[min(100%,20rem)] max-w-5xl flex-wrap items-center justify-center gap-1 rounded-full border border-white/20 bg-black/40 px-4 py-2 shadow-xl backdrop-blur-md sm:min-w-[32rem] sm:flex-nowrap sm:justify-between sm:gap-2 sm:px-6 sm:py-2.5 lg:max-w-6xl lg:min-w-[42rem] lg:px-8">
				<div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
					<Link
						to="/"
						className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:text-white"
					>
						<Home className="h-4 w-4 shrink-0" aria-hidden />
						Home
					</Link>
					<a href="#how-to-apply" onClick={scrollTo('how-to-apply')} className={navLinkClass}>
						How to apply
					</a>
					<a
						href="#tenancy-authorities"
						onClick={scrollTo('tenancy-authorities')}
						className={navLinkClass}
					>
						Tenancy bodies
					</a>
					<a href="#about" onClick={scrollTo('about')} className={navLinkClass}>
						About
					</a>
					<Link to="/contact" className={navLinkClass}>
						Contact Us
					</Link>
					<Link to="/policies" className={navLinkClass}>
						Policies &amp; Guidelines
					</Link>
				</div>
				<a
					href="#auth-card-section"
					onClick={scrollTo('auth-card-section')}
					className="landing-nav-cta shrink-0 rounded-full bg-landing px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-landing-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:py-2.5"
				>
					Apply Now
				</a>
			</div>
		</motion.nav>
	)
}

export default LandingNav
