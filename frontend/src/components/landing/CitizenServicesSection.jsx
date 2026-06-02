import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, FileText, LogIn, Mail, ShieldCheck, UserPlus } from 'lucide-react'
import AuthNavLink from './AuthNavLink'

const highlights = [
	'Register and verify with mobile OTP',
	'Track applications in real time',
	'Download signed certificates online',
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

function CitizenServicesSection() {
	return (
		<section
			id="services"
			className="citizen-services-section landing-wallpaper-bg landing-wallpaper-bg--cream py-12 sm:py-16 lg:py-24"
			aria-labelledby="services-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
					className="mx-auto max-w-2xl text-center"
				>
					<p className="landing-section-eyebrow">Quick links</p>
					<h2 id="services-heading" className="landing-section-title">
						Citizen services
					</h2>
					<p className="landing-section-lead">
						Everything you need to register, apply, and stay updated — in one place on the Assam
						Tenancy Registration Portal.
					</p>
				</motion.div>

				<div className="citizen-services-layout">
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
							<p>One portal for citizens</p>
						</div>
						<div className="citizen-services-aside__body">
							<h3 className="citizen-services-aside__title">
								Register once, manage everything online
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
								<a href="#how-to-apply" className="citizen-services-aside__btn-secondary">
									How to apply
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

export default CitizenServicesSection
