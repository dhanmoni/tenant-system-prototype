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
		title: 'Log in and apply for UIN',
		text: 'Sign in, complete your UIN application, and upload the required documents.',
	},
	{
		num: '3',
		title: 'Follow your application',
		text: 'Check status on your dashboard and get your UIN when approved.',
	},
]

const highlights = [
	'Register and verify with mobile OTP',
	'Apply for UIN and file tenancy services',
	'Track applications and status updates',
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
		title: 'Apply for UIN',
		description: 'Submit a UIN application and upload documents after sign-in.',
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

function GuideServiceAction({ service, index }) {
	const Icon = service.icon
	const className = `portal-guide-access-action${
		service.featured ? ' portal-guide-access-action--featured' : ''
	}`

	const content = (
		<>
			<span className="portal-guide-access-action__icon" aria-hidden>
				<Icon className="h-5 w-5" strokeWidth={2.25} />
			</span>
			<span className="portal-guide-access-action__body">
				<span className="portal-guide-access-action__title-row">
					<span className="portal-guide-access-action__title">{service.title}</span>
					{service.badge ? (
						<span className="portal-guide-access-action__badge">{service.badge}</span>
					) : null}
				</span>
				<span className="portal-guide-access-action__desc">{service.description}</span>
			</span>
			<ArrowRight className="portal-guide-access-action__arrow" aria-hidden strokeWidth={2.25} />
		</>
	)

	return (
		<motion.li
			initial={{ opacity: 0, x: 12 }}
			whileInView={{ opacity: 1, x: 0 }}
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
					<h2 id="portal-guide-heading" className="landing-section-title">
						How it works
					</h2>
					<p className="landing-section-lead">
						Register, apply for UIN, track your application, and use tenancy services online —
						follow the steps below or open a service directly.
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

				<div className="portal-guide-access-layout">
					<motion.aside
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45 }}
						className="portal-guide-access-aside"
						aria-label="Portal overview"
					>
						<div className="portal-guide-access-aside__header">
							<ShieldCheck className="h-5 w-5 shrink-0" aria-hidden strokeWidth={2.25} />
							<p>Quick access</p>
						</div>
						<div className="portal-guide-access-aside__body">
							<h3 className="portal-guide-access-aside__title">
								Everything in one place
							</h3>
							<ul className="portal-guide-access-aside__list">
								{highlights.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<p className="portal-guide-access-aside__hours">
								<Clock className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.25} />
								<span>Online services available 24×7</span>
							</p>
							<div className="portal-guide-access-aside__actions">
								<AuthNavLink
									mode="register"
									className="portal-guide-access-aside__btn-primary"
								>
									Create account
								</AuthNavLink>
								<a href="#services" className="portal-guide-access-aside__btn-secondary">
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
						className="portal-guide-access-panel"
					>
						<div className="portal-guide-access-panel__header">
							<p className="portal-guide-access-panel__label">Choose a service</p>
							<p className="portal-guide-access-panel__hint">Tap an option to continue</p>
						</div>
						<ul className="portal-guide-access-panel__list">
							{services.map((service, index) => (
								<GuideServiceAction key={service.title} service={service} index={index} />
							))}
						</ul>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default PortalGuideSection
