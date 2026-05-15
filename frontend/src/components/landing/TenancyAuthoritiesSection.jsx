import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Building2, Gavel, Landmark, Scale, Shield, Clock, FileCheck } from 'lucide-react'
import { tenantServiceGroups } from '../../data/tenantServices'
import authoritiesImage from '../../assets/img/img3.png'

const authorityMeta = {
	'rent-authority': {
		icon: Building2,
		step: '1',
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
		step: '2',
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
		step: '3',
		accent: 'tenancy-body-card--tribunal',
		tagline: 'Appellate level',
		role: 'Review appeals against Rent Court orders to ensure fair and consistent decisions across Assam.',
		matters: ['Appeal against Rent Court order (Form VI)'],
	},
}

const citizenBenefits = [
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

function AuthorityCard({ group, index }) {
	const meta = authorityMeta[group.id]
	const Icon = meta.icon

	return (
		<motion.article
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: index * 0.08 }}
			whileHover={{ y: -4 }}
			className={`tenancy-body-card ${meta.accent}`}
		>
			<div className="tenancy-body-card-step" aria-hidden>
				Step {meta.step}
			</div>
			<div className="tenancy-body-card-head">
				<span className="tenancy-body-card-icon">
					<Icon className="h-6 w-6" aria-hidden />
				</span>
				<div className="min-w-0">
					<p className="tenancy-body-card-tag">{meta.tagline}</p>
					<h3 className="tenancy-body-card-title">{group.title}</h3>
					<p className="tenancy-body-card-jurisdiction">{group.authority}</p>
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

function TenancyAuthoritiesSection() {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	})
	const imageY = useTransform(scrollYProgress, (progress) =>
		reduceMotion ? 0 : (progress - 0.5) * 80,
	)

	return (
		<section
			ref={sectionRef}
			id="tenancy-authorities"
			className="tenancy-bodies-section bg-landing-cream py-12 sm:py-16 lg:py-24"
			aria-labelledby="tenancy-authorities-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
					className="max-w-3xl"
				>
					<p className="landing-section-eyebrow">Assam Tenancy Act</p>
					<h2 id="tenancy-authorities-heading" className="landing-section-title">
						Rent Authority, Rent Court &amp; Rent Tribunal
					</h2>
					<p className="landing-section-lead">
						The Act sets up three bodies so you can register a tenancy, resolve disputes at the
						right level, and appeal when needed. Each card below explains one level in plain
						language.
					</p>
				</motion.div>

				<div className="tenancy-bodies-flow mt-8 hidden sm:flex" aria-hidden>
					{tenantServiceGroups.map((group, i) => (
						<div key={group.id} className="tenancy-bodies-flow-item">
							<span className="tenancy-bodies-flow-dot">{i + 1}</span>
							<span className="tenancy-bodies-flow-label">{group.title}</span>
							{i < tenantServiceGroups.length - 1 ? (
								<span className="tenancy-bodies-flow-line" />
							) : null}
						</div>
					))}
				</div>

				<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
					{tenantServiceGroups.map((group, index) => (
						<AuthorityCard key={group.id} group={group} index={index} />
					))}
				</div>

				<motion.aside
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45 }}
					className="tenancy-bodies-benefits mt-12 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:mt-16"
				>
					<div className="grid lg:grid-cols-[minmax(0,300px)_1fr]">
						<div className="relative min-h-[200px] overflow-hidden lg:min-h-full">
							<motion.img
								src={authoritiesImage}
								alt="Official presenting tenancy solutions for diverse housing types"
								className="absolute inset-0 h-[115%] w-full scale-105 object-cover object-center will-change-transform"
								style={{ y: imageY }}
								loading="lazy"
							/>
							<div
								className="absolute inset-0 bg-gradient-to-r from-[#0c1f3d]/25 to-transparent lg:bg-gradient-to-t lg:from-[#0c1f3d]/40 lg:to-transparent"
								aria-hidden
							/>
						</div>
						<div className="p-6 sm:p-8">
					<p className="landing-section-eyebrow">Why it matters</p>
					<h3 className="landing-section-subtitle mt-1">
						How this framework benefits citizens
					</h3>
					<p className="landing-card-text mt-3 max-w-2xl">
						The portal connects you to the correct authority under the Assam Tenancy Act — from
						certificate registration through appeals — with clear forms and traceable records.
					</p>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2">
						{citizenBenefits.map((benefit) => {
							const Icon = benefit.icon
							return (
								<li key={benefit.title} className="tenancy-bodies-benefit-item">
									<span className="tenancy-bodies-benefit-icon">
										<Icon className="h-5 w-5" aria-hidden />
									</span>
									<div>
										<p className="text-sm font-bold text-slate-800">{benefit.title}</p>
										<p className="mt-1 text-sm leading-relaxed text-slate-600">{benefit.text}</p>
									</div>
								</li>
							)
						})}
					</ul>
					<p className="mt-6 text-sm font-semibold text-landing">
						Sign in after registration to file forms before the Rent Authority, Rent Court, or
						Rent Tribunal from your dashboard.
					</p>
						</div>
					</div>
				</motion.aside>
			</div>
		</section>
	)
}

export default TenancyAuthoritiesSection
