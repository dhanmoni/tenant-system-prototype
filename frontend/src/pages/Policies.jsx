import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'

const policySections = [
	{
		title: 'Terms of use',
		paragraphs: [
			'This portal is provided by the Directorate of Town and Country Planning, Assam, for online tenancy registration and related citizen services. By using this website, you agree to use it only for lawful purposes connected with tenancy certificate applications and authorised departmental processes.',
			'Unauthorized access, misuse of credentials, or submission of false information may lead to rejection of applications and action under applicable laws.',
		],
	},
	{
		title: 'Privacy and data protection',
		paragraphs: [
			'Personal information collected during registration and application submission is used solely for tenancy administration, verification, and service delivery. Data is handled in line with applicable government data protection guidelines and departmental policies.',
			'Do not share your OTP or login credentials with others. Log out after using shared or public devices.',
		],
	},
	{
		title: 'Disclaimer',
		paragraphs: [
			'This prototype may contain demonstration data, illustrative timelines, and sample documents. For legal validity, refer to official gazette notifications, circulars, and the Assam Tenancy Act provisions as notified by the competent authority.',
			'The department endeavours to keep information accurate but does not guarantee uninterrupted availability of the portal. Scheduled maintenance may temporarily affect access.',
		],
	},
	{
		title: 'Accessibility',
		paragraphs: [
			'The portal supports text resizing, high contrast mode, and keyboard navigation where implemented. If you face difficulty accessing any service, contact the helpdesk or visit the Contact Us page.',
		],
	},
]

function Policies() {
	return (
		<PublicPageLayout
			eyebrow="Legal & guidelines"
			title="Policies & Guidelines"
			titleId="policies-heading"
			breadcrumbLabel="Policies & Guidelines"
			lead="Read the terms, privacy practices, and disclaimers that apply when using the Assam Tenancy Registration Portal."
		>
			<div className="mb-8 flex flex-wrap gap-3">
				<Link
					to="/contact"
					className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-landing hover:text-landing"
				>
					Contact helpdesk
				</Link>
				<a
					href="https://tcp.assam.gov.in/"
					target="_blank"
					rel="noopener noreferrer"
					className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-landing hover:text-landing"
				>
					TCP Assam official site
				</a>
			</div>

			<div className="space-y-6">
				{policySections.map((section) => (
					<article
						key={section.title}
						className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
					>
						<h2 className="landing-section-subtitle text-landing">
							{section.title}
						</h2>
						{section.paragraphs.map((paragraph) => (
							<p key={paragraph.slice(0, 40)} className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
								{paragraph}
							</p>
						))}
					</article>
				))}
			</div>

			<p className="mt-8 text-sm text-slate-500">
				Last reviewed for demo: March 2026. Replace with department-approved policy text before production
				deployment.
			</p>
		</PublicPageLayout>
	)
}

export default Policies
