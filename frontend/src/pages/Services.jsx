import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import {
	getPortalFormsByGroup,
	portalServiceSections,
	serviceEscalationGuide,
	servicesPageIntro,
} from '../data/portalServices'

function ServiceArticle({ section }) {
	const forms = section.groupId ? getPortalFormsByGroup(section.groupId) : []

	return (
		<article
			id={section.id}
			className="gov-services-doc__article scroll-mt-28"
			aria-labelledby={`${section.id}-title`}
		>
			<h2 id={`${section.id}-title`} className="gov-services-doc__h2">
				{section.title}
			</h2>
			{section.subtitle ? (
				<p className="gov-services-doc__subtitle">{section.subtitle}</p>
			) : null}

			<h3 className="gov-services-doc__h3">When to use</h3>
			<p>{section.when}</p>

			<h3 className="gov-services-doc__h3">Why it matters</h3>
			<p>{section.why}</p>

			<h3 className="gov-services-doc__h3">How to apply</h3>
			<ol className="gov-services-doc__ol">
				{section.how.map((step) => (
					<li key={step}>{step}</li>
				))}
			</ol>

			{forms.length > 0 ? (
				<>
					<h3 className="gov-services-doc__h3" id={`${section.groupId}-forms`}>
						Forms available online
					</h3>
					<div className="gov-services-doc__table-wrap">
						<table className="gov-services-doc__table">
							<thead>
								<tr>
									<th scope="col">Form</th>
									<th scope="col">Matter</th>
									<th scope="col">Reference</th>
								</tr>
							</thead>
							<tbody>
								{forms.map((form) => (
									<tr key={form.formKey}>
										<td>{form.formName}</td>
										<td>{form.matter}</td>
										<td>{form.rule}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="gov-services-doc__note">
						After registration, sign in and open <strong>All services</strong> in your
						dashboard to file these forms.
					</p>
				</>
			) : null}

			{section.cta ? (
				<p className="gov-services-doc__cta-line">
					<Link
						to={
							section.cta.anchor
								? `#${section.cta.anchor}`
								: section.cta.hash || '/#login'
						}
						className="gov-services-doc__link"
					>
						{section.cta.label}
					</Link>
				</p>
			) : null}
		</article>
	)
}

function Services() {
	const toc = [
		{ id: 'which-authority', label: serviceEscalationGuide.title },
		...portalServiceSections.map((s) => ({ id: s.id, label: s.title })),
	]

	return (
		<PublicPageLayout
			eyebrow={servicesPageIntro.eyebrow}
			title={servicesPageIntro.title}
			titleId="services-page-heading"
			breadcrumbLabel="Services"
			lead={servicesPageIntro.lead}
		>
			<div className="gov-services-doc">
				<nav className="gov-services-doc__toc" aria-label="On this page">
					<h2 className="gov-services-doc__toc-title">On this page</h2>
					<ol className="gov-services-doc__toc-list">
						{toc.map((item) => (
							<li key={item.id}>
								<a href={`#${item.id}`} className="gov-services-doc__toc-link">
									{item.label}
								</a>
							</li>
						))}
					</ol>
				</nav>

				<div className="gov-services-doc__main">
				<section
					id="which-authority"
					className="gov-services-doc__article scroll-mt-28"
					aria-labelledby="which-authority-title"
				>
					<h2 id="which-authority-title" className="gov-services-doc__h2">
						{serviceEscalationGuide.title}
					</h2>
					<p>{serviceEscalationGuide.lead}</p>
					<ol className="gov-services-doc__ol gov-services-doc__ol--authorities">
						{serviceEscalationGuide.steps.map((item) => (
							<li key={item.step}>
								<strong>{item.title}</strong> — {item.text}
							</li>
						))}
					</ol>
				</section>

				{portalServiceSections.map((section) => (
					<ServiceArticle key={section.id} section={section} />
				))}

				<footer className="gov-services-doc__footer">
					<h2 className="gov-services-doc__h2">Apply online</h2>
					<p>
						Create an account or sign in to file applications. You can also return to the{' '}
						<Link to="/" className="gov-services-doc__link">
							home page
						</Link>{' '}
						for registration and status tracking.
					</p>
					<p className="gov-services-doc__footer-actions">
						<Link to="/#register" className="gov-services-doc__btn gov-services-doc__btn--primary">
							Create account
						</Link>
						<Link to="/#login" className="gov-services-doc__btn gov-services-doc__btn--outline">
							Sign in
						</Link>
					</p>
				</footer>
				</div>
			</div>
		</PublicPageLayout>
	)
}

export default Services
