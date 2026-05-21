import { Link } from 'react-router-dom'
import { Building2, FileCheck, Gavel, Landmark, Shield } from 'lucide-react'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import {
	getPortalFormsByGroup,
	portalServiceSections,
	portalServicesIntro,
	serviceEscalationGuide,
} from '../data/portalServices'
import { getTenancyAuthoritiesByHierarchy } from '../data/tenantServices'

const sectionIcons = {
	'uin-registration': FileCheck,
	'rent-authority': Building2,
	'rent-court': Gavel,
	'rent-tribunal': Landmark,
}

function HowSteps({ steps }) {
	return (
		<ol className="services-page-steps">
			{steps.map((step) => (
				<li key={step} className="services-page-steps__item">
					{step}
				</li>
			))}
		</ol>
	)
}

function FormsTable({ groupId }) {
	const forms = getPortalFormsByGroup(groupId)
	if (!forms.length) return null

	return (
		<div className="services-page-forms" id={`${groupId}-forms`}>
			<h3 className="services-page-forms__title">Forms available online</h3>
			<ul className="services-page-forms__list">
				{forms.map((form) => (
					<li key={form.formKey} className="services-page-forms__row">
						<span className="services-page-forms__name">{form.formName}</span>
						<span className="services-page-forms__matter">{form.matter}</span>
						<span className="services-page-forms__rule">{form.rule}</span>
					</li>
				))}
			</ul>
			<p className="services-page-forms__note">
				Sign in to your dashboard → <strong>All services</strong> to file these forms after
				registration.
			</p>
		</div>
	)
}

function Services() {
	return (
		<PublicPageLayout
			eyebrow={portalServicesIntro.eyebrow}
			title={portalServicesIntro.title}
			titleId="services-page-heading"
			breadcrumbLabel="Services"
			lead={portalServicesIntro.lead}
		>
			<div className="services-page">
			<section className="services-page-escalation" aria-labelledby="escalation-heading">
				<div className="services-page-escalation__icon" aria-hidden>
					<Shield className="h-6 w-6" strokeWidth={2} />
				</div>
				<div>
					<h2 id="escalation-heading" className="landing-section-subtitle">
						{serviceEscalationGuide.title}
					</h2>
					<p className="services-page-escalation__lead">{serviceEscalationGuide.lead}</p>
					<ol className="services-page-escalation__steps">
						{serviceEscalationGuide.steps.map((item) => (
							<li key={item.step} className="services-page-escalation__step">
								<span className="services-page-escalation__num">{item.step}</span>
								<div>
									<p className="services-page-escalation__step-title">{item.title}</p>
									<p className="services-page-escalation__step-text">{item.text}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</section>

			<div className="services-page-sections">
				{portalServiceSections.map((section) => {
					const Icon = sectionIcons[section.id] || FileCheck
					return (
						<article
							key={section.id}
							id={section.id}
							className="services-page-section scroll-mt-28"
							aria-labelledby={`${section.id}-title`}
						>
							<div className="services-page-section__head">
								<span className="services-page-section__icon" aria-hidden>
									<Icon className="h-6 w-6" strokeWidth={2} />
								</span>
								<div>
									<h2 id={`${section.id}-title`} className="services-page-section__title">
										{section.title}
									</h2>
									{section.subtitle ? (
										<p className="services-page-section__subtitle">{section.subtitle}</p>
									) : null}
								</div>
							</div>

							<div className="services-page-section__grid">
								<div className="services-page-panel services-page-panel--when">
									<h3 className="services-page-panel__label">When to use</h3>
									<p>{section.when}</p>
								</div>
								<div className="services-page-panel services-page-panel--why">
									<h3 className="services-page-panel__label">Why it matters</h3>
									<p>{section.why}</p>
								</div>
								<div className="services-page-panel services-page-panel--how">
									<h3 className="services-page-panel__label">How to apply</h3>
									<HowSteps steps={section.how} />
								</div>
							</div>

							{section.groupId ? <FormsTable groupId={section.groupId} /> : null}

							{section.cta ? (
								<Link
									to={
										section.cta.anchor
											? `#${section.cta.anchor}`
											: section.cta.hash || '/#login'
									}
									className="services-page-section__cta"
								>
									{section.cta.label}
								</Link>
							) : null}
						</article>
					)
				})}
			</div>

			<section className="services-page-summary" aria-labelledby="summary-heading">
				<h2 id="summary-heading" className="landing-section-subtitle">
					All authorities at a glance
				</h2>
				<ul className="services-page-summary__list">
					{getTenancyAuthoritiesByHierarchy().map((group) => (
						<li key={group.id} className="services-page-summary__item">
							<strong>{group.title}</strong>
							<span className="services-page-summary__meta">{group.authority}</span>
							<p>{group.description}</p>
							<Link to={`/services#${group.id}`} className="services-page-summary__link">
								Read when, why &amp; how →
							</Link>
						</li>
					))}
				</ul>
				<div className="services-page-summary__actions">
					<Link to="/#login" className="services-page-btn services-page-btn--primary">
						Sign in to apply
					</Link>
					<Link to="/#register" className="services-page-btn services-page-btn--outline">
						Create account
					</Link>
					<Link to="/" className="services-page-btn services-page-btn--ghost">
						Back to home
					</Link>
				</div>
			</section>
			</div>
		</PublicPageLayout>
	)
}

export default Services
