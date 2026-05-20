import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
	ArrowRight,
	Clock,
	FileText,
	LogIn,
	Mail,
	ShieldCheck,
	UserPlus,
} from 'lucide-react'
import AuthNavLink from './AuthNavLink'

const steps = [
	{
		num: '1',
		title: 'Create your account',
		text: 'Register with your name, mobile number, and district. Verify with OTP.',
	},
	{
		num: '2',
		title: 'Log in and apply',
		text: 'Sign in, complete your application, and upload required documents.',
	},
	{
		num: '3',
		title: 'Track and download',
		text: 'Monitor status in real time and download your certificate.',
	},
]

const highlights = [
	'Register and verify with mobile OTP',
	'Track applications in real time',
	'Download certificates online',
]

const services = [
	{
		title: 'New registration',
		description: 'Create your citizen account in a few minutes.',
		authMode: 'register',
		icon: UserPlus,
	},
	{
		title: 'Login',
		description: 'Open your dashboard and existing applications.',
		authMode: 'login',
		icon: LogIn,
	},
	{
		title: 'Apply for certificate',
		description: 'Submit a tenancy certificate application after sign-in.',
		authMode: 'login',
		icon: FileText,
		badge: 'Most used',
		featured: true,
	},
	{
		title: 'Contact & help',
		description: 'Helpdesk support, FAQs, and official enquiries.',
		to: '/contact',
		icon: Mail,
	},
]

function ServiceAction({ service, index }) {
	const Icon = service.icon
	const className = `citizen-services-action${service.featured ? ' citizen-services-action--featured' : ''}`

	const content = (
		<>
			<span className="citizen-services-action__icon" aria-hidden>
				<Icon className="h-5 w-5" strokeWidth={2.25} />
			</span>
			<span className="citizen-services-action__body">
				<span className="citizen-services-action__title-row">
					<span className="citizen-services-action__title">{service.title}</span>
					{service.badge ? (
						<span className="citizen-services-action__badge">{service.badge}</span>
					) : null}
				</span>
				<span className="citizen-services-action__desc">{service.description}</span>
			</span>
			<ArrowRight className="citizen-services-action__arrow" aria-hidden strokeWidth={2.25} />
		</>
	)

	return (
		<motion.li
			initial={{ opacity: 0, x: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.35, delay: index * 0.06 }}
		>
			{service.authMode ? (
				<AuthNavLink mode={service.authMode} className={className}>
					{content}
				</AuthNavLink>
			) : (
				<Link to={service.to} className={className}>
					{content}
				</Link>
			)}
		</motion.li>
	)
}

function PortalGuideSection() {
	return (
		<section
			id="portal-guide"
			className="portal-guide-section landing-wallpaper-bg landing-wallpaper-bg--white py-12 sm:py-16 lg:py-24"
			aria-labelledby="portal-guide-heading"
		>
			<div id="how-to-apply" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
					className="mx-auto max-w-2xl text-center"
				>
					<p className="landing-section-eyebrow">Quick start</p>
					<h2 id="portal-guide-heading" className="landing-section-title">
						How it works
					</h2>
					<p className="landing-section-lead">
						Register, apply, and manage tenancy services online — follow the steps below or open a
						service directly.
					</p>
				</motion.div>

				<ol className="portal-guide-steps">
					{steps.map((step, index) => (
						<motion.li
							key={step.num}
							initial={{ opacity: 0, y: 14 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{ duration: 0.35, delay: index * 0.07 }}
							className="portal-guide-step"
						>
							<span className="portal-guide-step__num" aria-hidden>
								{step.num}
							</span>
							<div>
								<h3 className="portal-guide-step__title">{step.title}</h3>
								<p className="portal-guide-step__text">{step.text}</p>
							</div>
						</motion.li>
					))}
				</ol>

				<div className="citizen-services-layout portal-guide-services">
					<motion.aside
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45 }}
						className="citizen-services-aside"
						aria-label="Portal overview"
					>
						<div className="citizen-services-aside__header">
							<ShieldCheck className="h-5 w-5 shrink-0" aria-hidden strokeWidth={2.25} />
							<p>Quick access</p>
						</div>
						<div className="citizen-services-aside__body">
							<h3 className="citizen-services-aside__title">
								Everything in one place
							</h3>
							<ul className="citizen-services-aside__list">
								{highlights.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<p className="citizen-services-aside__hours">
								<Clock className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.25} />
								<span>Online services available 24×7</span>
							</p>
							<div className="citizen-services-aside__actions">
								<AuthNavLink mode="register" className="citizen-services-aside__btn-primary">
									Create account
								</AuthNavLink>
								<a href="#services" className="citizen-services-aside__btn-secondary">
									View services
								</a>
							</div>
						</div>
					</motion.aside>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45, delay: 0.08 }}
						className="citizen-services-panel"
					>
						<div className="citizen-services-panel__header">
							<p className="citizen-services-panel__label">Choose a service</p>
							<p className="citizen-services-panel__hint">Tap an option to continue</p>
						</div>
						<ul className="citizen-services-panel__list">
							{services.map((service, index) => (
								<ServiceAction key={service.title} service={service} index={index} />
							))}
						</ul>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default PortalGuideSection
