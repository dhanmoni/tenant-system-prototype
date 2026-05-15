import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, LogIn, FileText, Mail } from 'lucide-react'

const services = [
	{
		title: 'New registration',
		description: 'Create a citizen account with your mobile number.',
		to: '/#register',
		icon: UserPlus,
	},
	{
		title: 'Login',
		description: 'Access your dashboard and existing applications.',
		to: '/#login',
		icon: LogIn,
	},
	{
		title: 'Apply for certificate',
		description: 'Sign in to submit a tenancy certificate application.',
		to: '/#auth-card-section',
		icon: FileText,
	},
	{
		title: 'Contact & help',
		description: 'Reach the helpdesk for support and enquiries.',
		to: '/contact',
		icon: Mail,
	},
]

function CitizenServicesSection() {
	return (
		<section id="services" className="bg-landing-cream py-24" aria-labelledby="services-heading">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<p className="landing-section-eyebrow">Quick links</p>
				<h2 id="services-heading" className="landing-section-title">
					Citizen services
				</h2>
				<p className="landing-section-lead">
					Quick access to the most common actions on the Assam Tenancy Registration Portal.
				</p>
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{services.map((service, index) => {
						const Icon = service.icon
						const isHash = service.to.startsWith('/#')
						const className =
							'group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-landing/40 hover:shadow-md'

						const content = (
							<>
								<span className="flex h-12 w-12 items-center justify-center rounded-full bg-landing/10 text-landing transition group-hover:bg-landing group-hover:text-white">
									<Icon className="h-6 w-6" aria-hidden />
								</span>
								<h3 className="landing-card-title mt-4">{service.title}</h3>
								<p className="landing-card-text mt-2 flex-1">
									{service.description}
								</p>
							</>
						)

						return (
							<motion.div
								key={service.title}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: '-40px' }}
								transition={{ duration: 0.35, delay: index * 0.06 }}
							>
								{isHash ? (
									<a href={service.to} className={className}>
										{content}
									</a>
								) : (
									<Link to={service.to} className={className}>
										{content}
									</Link>
								)}
							</motion.div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

export default CitizenServicesSection
