import { motion } from 'framer-motion'
import { Scale, Shield, Clock, FileCheck, Gavel, Building2, Landmark } from 'lucide-react'
import { tenantServiceGroups } from '../../data/tenantServices'

const authorityMeta = {
	'rent-authority': {
		icon: Building2,
		accent: 'tenancy-authority--rent-authority',
		tagline: 'First level — registration and day-to-day tenancy matters',
		role:
			'The Rent Authority is your primary contact under the Assam Tenancy Act for registering tenancies, issuing certificates, and hearing disputes on rent, deposits, repairs, and related matters.',
		matters: [
			'Revision or fixation of rent (Form I)',
			'Revision of other charges (Form I-A)',
			'Rent, deposit, repair, and withholding disputes (Form IV)',
		],
	},
	'rent-court': {
		icon: Gavel,
		accent: 'tenancy-authority--rent-court',
		tagline: 'Second level — possession, eviction, and appeals',
		role:
			'The Rent Court hears applications for recovery of possession, eviction, and appeals against orders passed by the Rent Authority — giving citizens a dedicated judicial forum for these matters.',
		matters: [
			'Recovery of possession (Form II)',
			'Eviction and recovery of possession (Form III)',
			'Appeal against Rent Authority order (Form V)',
		],
	},
	'rent-tribunal': {
		icon: Landmark,
		accent: 'tenancy-authority--rent-tribunal',
		tagline: 'Appellate level — review of Rent Court orders',
		role:
			'The Rent Tribunal provides a higher forum for appeals against Rent Court orders, helping ensure fair review and consistency in tenancy decisions across the state.',
		matters: ['Appeal against Rent Court order (Form VI)'],
	},
}

const citizenBenefits = [
	{
		icon: Scale,
		title: 'Clear path for every dispute',
		text: 'Each type of tenancy issue has a defined body and prescribed form — so you know where to apply and what to file.',
	},
	{
		icon: Shield,
		title: 'Rights for tenants and owners',
		text: 'Registered tenancies and formal orders protect lawful occupation, fair rent, and due process for both parties.',
	},
	{
		icon: Clock,
		title: 'Less time away from work',
		text: 'Online registration and digital filings reduce repeated visits to offices and help you track status from home.',
	},
	{
		icon: FileCheck,
		title: 'Transparent, traceable records',
		text: 'Applications, certificates, and orders stay on record — supporting accountability and easier reference in future proceedings.',
	},
]

function AuthorityCard({ group, index }) {
	const meta = authorityMeta[group.id]
	const Icon = meta.icon

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: index * 0.08 }}
			className={`tenancy-authority-card ${meta.accent} flex flex-col rounded-2xl border bg-white p-6 shadow-sm`}
		>
			<div className="tenancy-authority-card-head mb-4 flex items-start gap-4">
				<span className="tenancy-authority-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
					<Icon className="h-6 w-6" aria-hidden />
				</span>
				<div>
					<h3 className="tenancy-authority-title text-lg font-bold">{group.title}</h3>
					<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
						{meta.tagline}
					</p>
					<p className="tenancy-authority-jurisdiction mt-2 text-xs font-medium">{group.authority}</p>
				</div>
			</div>

			<p className="landing-card-text flex-1 text-sm leading-relaxed">{meta.role}</p>

			<div className="mt-5 border-t border-slate-100 pt-4">
				<p className="text-xs font-bold uppercase tracking-wide text-slate-500">Typical matters</p>
				<ul className="mt-2 space-y-1.5 text-sm text-slate-600">
					{meta.matters.map((item) => (
						<li key={item} className="flex items-start gap-2">
							<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" aria-hidden />
							{item}
						</li>
					))}
				</ul>
			</div>
		</motion.article>
	)
}

function TenancyAuthoritiesSection() {
	return (
		<section
			id="tenancy-authorities"
			className="bg-white py-24"
			aria-labelledby="tenancy-authorities-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
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
						The Act establishes three dedicated bodies so citizens can register tenancies, resolve
						disputes at the right level, and appeal when needed — with prescribed forms for each
						step.
					</p>
				</motion.div>

				<div className="mt-12 grid gap-8 lg:grid-cols-3">
					{tenantServiceGroups.map((group, index) => (
						<AuthorityCard key={group.id} group={group} index={index} />
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-60px' }}
					transition={{ duration: 0.45 }}
					className="tenancy-authorities-benefits mt-16 rounded-2xl border border-landing/20 bg-landing-cream p-8 sm:p-10"
				>
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
						<div>
							<p className="landing-section-eyebrow">Why it matters</p>
							<h3 className="landing-section-subtitle mt-2">
								How this framework benefits citizens
							</h3>
							<p className="landing-card-text mt-4 text-sm leading-relaxed">
								Instead of unclear or informal arrangements, the portal connects you to the
								correct authority under the Assam Tenancy Act — from certificate registration
								through appeals — so disputes are heard fairly, records are maintained, and
								both tenants and property owners know their rights and remedies.
							</p>
							<p className="mt-4 text-sm font-semibold text-landing">
								Sign in after registration to file forms before the Rent Authority, Rent Court,
								or Rent Tribunal from your dashboard.
							</p>
						</div>

						<ul className="grid gap-5 sm:grid-cols-2">
							{citizenBenefits.map((benefit) => {
								const Icon = benefit.icon
								return (
									<li
										key={benefit.title}
										className="flex gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
									>
										<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-landing/10 text-landing">
											<Icon className="h-5 w-5" aria-hidden />
										</span>
										<div>
											<p className="text-sm font-bold text-slate-800">{benefit.title}</p>
											<p className="mt-1 text-sm leading-relaxed text-slate-600">
												{benefit.text}
											</p>
										</div>
									</li>
								)
							})}
						</ul>
					</div>
				</motion.div>
			</div>
		</section>
	)
}

export default TenancyAuthoritiesSection
