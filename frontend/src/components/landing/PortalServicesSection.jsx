import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Building2, Clock, FileCheck, Gavel, Landmark, Scale, Shield } from 'lucide-react'
import { tenantServiceGroups } from '../../data/tenantServices'
import servicesImage from '../../assets/img/img3.png'

const easeOut = [0.22, 1, 0.36, 1]

const sectionVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.45,
			ease: easeOut,
			staggerChildren: 0.12,
			delayChildren: 0.06,
		},
	},
}

const sectionRevealVariants = {
	hidden: { opacity: 0, y: 36 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.65, ease: easeOut },
	},
}

const accentLineVariants = {
	hidden: { scaleX: 0, opacity: 0 },
	visible: {
		scaleX: 1,
		opacity: 1,
		transition: { duration: 0.7, ease: easeOut },
	},
}

const headerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: easeOut, staggerChildren: 0.1, delayChildren: 0.05 },
	},
}

const headerItemVariants = {
	hidden: { opacity: 0, y: 14 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
}

const flowContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.15, delayChildren: 0.1 },
	},
}

const flowItemVariants = {
	hidden: { opacity: 0, y: 10, scale: 0.92 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.4, ease: easeOut },
	},
}

const cardsContainerVariants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const cardVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.5, ease: easeOut },
	},
}

const benefitsMediaVariants = {
	hidden: { opacity: 0, x: -24 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: easeOut } },
}

const benefitsPanelVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: easeOut, staggerChildren: 0.08, delayChildren: 0.12 },
	},
}

const benefitItemVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
}

const benefitsGridVariants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const authorityMeta = {
	'rent-authority': {
		icon: Building2,
		accent: 'tenancy-body-card--authority',
		tagline: 'First level',
		role: 'Register tenancies, obtain certificates, and resolve day-to-day disputes on rent, deposits, repairs, and related matters.',
		matters: [
			'Revision or fixation of rent (Form I)',
			'Revision of other charges (Form I-A)',
			'Rent, deposit, repair & withholding disputes (Form IV)',
		],
	},
	'rent-court': {
		icon: Gavel,
		accent: 'tenancy-body-card--court',
		tagline: 'Second level',
		role: 'Hear applications for possession, eviction, and appeals against orders passed by the Rent Authority.',
		matters: [
			'Recovery of possession (Form II)',
			'Eviction and recovery of possession (Form III)',
			'Appeal against Rent Authority order (Form V)',
		],
	},
	'rent-tribunal': {
		icon: Landmark,
		accent: 'tenancy-body-card--tribunal',
		tagline: 'Appellate level',
		role: 'Review appeals against Rent Court orders to ensure fair and consistent decisions across Assam.',
		matters: ['Appeal against Rent Court order (Form VI)'],
	},
}

const portalBenefits = [
	{
		icon: Scale,
		title: 'Clear path for every dispute',
		text: 'Each issue has a defined body and prescribed form — you know where to apply.',
	},
	{
		icon: Shield,
		title: 'Rights for tenants and owners',
		text: 'Registered tenancies and formal orders protect both parties.',
	},
	{
		icon: Clock,
		title: 'Less time at the office',
		text: 'Register and track applications online, anytime.',
	},
	{
		icon: FileCheck,
		title: 'Transparent records',
		text: 'Certificates and orders stay on record for future reference.',
	},
]

function AuthorityCard({ group, reduceMotion }) {
	const meta = authorityMeta[group.id]
	const Icon = meta.icon

	return (
		<motion.article
			variants={reduceMotion ? undefined : cardVariants}
			whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
			className={`tenancy-body-card h-full ${meta.accent}`}
		>
			<div className="tenancy-body-card-head">
				<span className="tenancy-body-card-icon">
					<Icon className="h-6 w-6" aria-hidden />
				</span>
				<div className="tenancy-body-card-head-text">
					<p className="tenancy-body-card-tag">{meta.tagline}</p>
					<h3 className="tenancy-body-card-title">{group.title}</h3>
				</div>
			</div>
			<p className="tenancy-body-card-role">{meta.role}</p>
			<div className="tenancy-body-card-matters">
				<p className="tenancy-body-card-matters-label">Typical matters</p>
				<ul>
					{meta.matters.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			</div>
		</motion.article>
	)
}

function PortalServicesSection() {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const sectionInView = useInView(sectionRef, { once: true, margin: '-12% 0px -8% 0px' })
	const animateSection = reduceMotion || sectionInView

	return (
		<section
			ref={sectionRef}
			id="services"
			className="portal-services-section landing-wallpaper-bg landing-wallpaper-bg--white py-12 sm:py-16 lg:py-24"
			aria-labelledby="services-heading"
		>
			<div id="tenancy-authorities" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<motion.div
				className="portal-services-section__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
				variants={reduceMotion ? undefined : sectionVariants}
				initial={reduceMotion ? false : 'hidden'}
				animate={animateSection ? 'visible' : 'hidden'}
			>
				<motion.div
					variants={reduceMotion ? undefined : accentLineVariants}
					className="portal-services-section-accent"
					aria-hidden
				/>

				<motion.div
					variants={reduceMotion ? undefined : sectionRevealVariants}
					className="mx-auto max-w-3xl text-center"
				>
					<motion.div
						variants={reduceMotion ? undefined : headerVariants}
						className="portal-services-header"
					>
					<motion.p
						variants={reduceMotion ? undefined : headerItemVariants}
						className="landing-section-eyebrow"
					>
						Assam Tenancy Act
					</motion.p>
					<motion.h2
						variants={reduceMotion ? undefined : headerItemVariants}
						id="services-heading"
						className="landing-section-title"
					>
						Services
					</motion.h2>
					<motion.p
						variants={reduceMotion ? undefined : headerItemVariants}
						className="landing-section-lead"
					>
						Understand the three tenancy bodies under the Act and how this portal helps you
						register, apply, and stay protected online.
					</motion.p>
					</motion.div>
				</motion.div>

				<motion.div
					variants={reduceMotion ? undefined : sectionRevealVariants}
					className="portal-services-block"
				>
					<div className="tenancy-bodies-stage">
						<motion.div
							className="tenancy-bodies-flow"
							variants={reduceMotion ? undefined : flowContainerVariants}
							aria-hidden
						>
							{tenantServiceGroups.map((group, i) => (
								<motion.div
									key={group.id}
									variants={reduceMotion ? undefined : flowItemVariants}
									className="tenancy-bodies-flow-item"
								>
									<span className="tenancy-bodies-flow-dot">{i + 1}</span>
									<span className="tenancy-bodies-flow-label">{group.title}</span>
									{i < tenantServiceGroups.length - 1 ? (
										<motion.span
											className="tenancy-bodies-flow-line"
											variants={{
												hidden: { scaleX: 0, opacity: 0 },
												visible: {
													scaleX: 1,
													opacity: 1,
													transition: {
														duration: 0.45,
														ease: easeOut,
														delay: 0.15 + i * 0.12,
													},
												},
											}}
											style={{ transformOrigin: 'left center' }}
										/>
									) : null}
								</motion.div>
							))}
						</motion.div>

						<motion.div
							className="tenancy-bodies-cards"
							variants={reduceMotion ? undefined : cardsContainerVariants}
						>
							{tenantServiceGroups.map((group) => (
								<div key={group.id} className="tenancy-bodies-cards__cell">
									<AuthorityCard group={group} reduceMotion={reduceMotion} />
								</div>
							))}
						</motion.div>
					</div>
				</motion.div>

				<motion.div
					variants={reduceMotion ? undefined : sectionRevealVariants}
					className="portal-services-benefits"
					aria-labelledby="portal-benefits-heading"
				>
					<motion.div
						variants={reduceMotion ? undefined : benefitsPanelVariants}
						className="portal-services-benefits-with-media"
					>
						<motion.div
							variants={reduceMotion ? undefined : benefitsMediaVariants}
							className="portal-services-benefits-figure"
						>
							<div className="portal-services-benefits-figure__frame">
								<img
									src={servicesImage}
									alt="Official presenting tenancy registration services for citizens across Assam"
									className="portal-services-benefits-figure__img"
									loading="lazy"
									decoding="async"
								/>
							</div>
						</motion.div>

						<motion.div
							variants={reduceMotion ? undefined : benefitsPanelVariants}
							className="portal-services-benefits__content"
						>
							<motion.div
								variants={reduceMotion ? undefined : benefitItemVariants}
								className="portal-services-block__intro"
							>
								<h3 id="portal-benefits-heading" className="portal-services-block__title">
									Benefits of using this portal
								</h3>
								<p className="portal-services-block__lead">
									One place to connect with the right authority, file forms, and keep your
									records secure.
								</p>
							</motion.div>
							<motion.ul
								variants={reduceMotion ? undefined : benefitsGridVariants}
								className="portal-services-benefits__grid"
							>
								{portalBenefits.map((benefit) => {
									const Icon = benefit.icon
									return (
										<motion.li
											key={benefit.title}
											variants={reduceMotion ? undefined : benefitItemVariants}
											whileHover={
												reduceMotion
													? undefined
													: { y: -2, transition: { duration: 0.2 } }
											}
											className="portal-services-benefit"
										>
											<span className="portal-services-benefit__icon" aria-hidden>
												<Icon className="h-5 w-5" strokeWidth={2.25} />
											</span>
											<div>
												<p className="portal-services-benefit__title">{benefit.title}</p>
												<p className="portal-services-benefit__text">{benefit.text}</p>
											</div>
										</motion.li>
									)
								})}
							</motion.ul>
							<motion.p
								variants={reduceMotion ? undefined : benefitItemVariants}
								className="portal-services-benefits__footer portal-services-benefits__footer--align-start"
							>
								Sign in after registration to file forms before the Rent Authority, Rent Court,
								or Rent Tribunal from your dashboard.
							</motion.p>
						</motion.div>
					</motion.div>
				</motion.div>
			</motion.div>
		</section>
	)
}

export default PortalServicesSection
