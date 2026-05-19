import { motion } from 'framer-motion'
import { Building2, Gavel, Landmark } from 'lucide-react'
import { tenantServiceGroups } from '../../data/tenantServices'

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

function AuthorityCard({ group, index }) {
	const meta = authorityMeta[group.id]
	const Icon = meta.icon

	return (
		<motion.article
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: index * 0.08 }}
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

function TenancyAuthoritiesSection() {
	return (
		<section
			id="tenancy-authorities"
			className="tenancy-bodies-section landing-wallpaper-bg landing-wallpaper-bg--white py-12 sm:py-16 lg:py-24"
			aria-labelledby="tenancy-authorities-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
					className="mx-auto max-w-3xl text-center"
				>
					<p className="landing-section-eyebrow">Assam Tenancy Act</p>
					<h2 id="tenancy-authorities-heading" className="landing-section-title">
						Rent Authority, Rent Court &amp; Rent Tribunal
					</h2>
					<p className="landing-section-lead">
						The Assam Tenancy Act sets up three bodies — register at the Authority, escalate to
						Court when needed, and appeal to the Tribunal. Each card explains one level.
					</p>
				</motion.div>

				<div className="tenancy-bodies-stage">
					<div className="tenancy-bodies-flow" aria-hidden>
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

					<div className="tenancy-bodies-cards">
						{tenantServiceGroups.map((group, index) => (
							<div key={group.id} className="tenancy-bodies-cards__cell">
								<AuthorityCard group={group} index={index} />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default TenancyAuthoritiesSection
