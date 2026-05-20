import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import aboutImage from '../assets/img/img4.png'

function About() {
	return (
		<PublicPageLayout
			eyebrow="Department"
			title="About us"
			titleId="about-page-heading"
			breadcrumbLabel="About us"
			lead="The Assam Tenancy Registration & Management System is a unified digital portal for citizens, tenants, and property owners under the Government of Assam."
		>
			<div className="about-page-grid grid items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
				<div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/60">
					<img
						src={aboutImage}
						alt="Official explaining tenancy registration services"
						className="min-h-[280px] w-full object-cover object-center"
						loading="lazy"
					/>
				</div>
				<div className="space-y-6">
					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="landing-section-subtitle">Our mission</h2>
						<p className="mt-3 text-sm leading-relaxed text-slate-600">
							To make tenancy registration, certificate issuance, and dispute filing accessible
							online — reducing visits to offices while keeping records transparent and
							verifiable for tenants and owners across Assam.
						</p>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="landing-section-subtitle">Who operates the portal</h2>
						<p className="mt-3 text-sm leading-relaxed text-slate-600">
							The portal is operated under the{' '}
							<strong>Department of Housing And Urban Affairs, Government of Assam</strong>,
							through the{' '}
							<strong>Directorate of Town and Country Planning (TCP)</strong>, in line with the
							Assam Tenancy Act and related rules.
						</p>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="landing-section-subtitle">What you can do here</h2>
						<ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
							<li>Register as a citizen with mobile OTP verification</li>
							<li>Apply for tenancy certificates and track status online</li>
							<li>File forms before the Rent Authority, Rent Court, or Rent Tribunal</li>
							<li>Download digitally signed certificates when approved</li>
						</ul>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link
							to="/public-dashboard"
							className="inline-flex items-center justify-center rounded-lg bg-landing px-4 py-2.5 text-sm font-bold text-white no-underline transition hover:bg-landing-dark"
						>
							View public dashboard
						</Link>
						<Link
							to="/policies"
							className="inline-flex items-center justify-center rounded-lg border border-landing/35 bg-white px-4 py-2.5 text-sm font-bold text-landing no-underline transition hover:bg-landing/5"
						>
							Policies &amp; guidelines
						</Link>
					</div>
				</div>
			</div>
		</PublicPageLayout>
	)
}

export default About
