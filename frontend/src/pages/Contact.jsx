import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import PublicPageLayout from '../components/landing/PublicPageLayout'

function Contact() {
	return (
		<PublicPageLayout
			eyebrow="Help & support"
			title="Contact Us"
			titleId="contact-heading"
			breadcrumbLabel="Contact Us"
			lead="Directorate of Town and Country Planning — reach the helpdesk or visit the office. Details below are for demonstration; replace with official published contacts for production."
		>
			<div
				className="mb-10 rounded-xl border border-landing/20 bg-landing px-6 py-5 text-white shadow-md sm:px-8"
				role="region"
				aria-label="Helpdesk"
			>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<strong className="text-sm uppercase tracking-wide">Demo helpdesk</strong>
					<a className="font-semibold underline underline-offset-2 hover:text-white/90" href="tel:18000000000">
						1800-000-0000
					</a>
					<span className="hidden text-white/50 sm:inline" aria-hidden>
						|
					</span>
					<a
						className="font-semibold underline underline-offset-2 hover:text-white/90"
						href="mailto:helpdesk.tcms@nic.in"
					>
						helpdesk.tcms@nic.in
					</a>
				</div>
				<p className="mt-2 text-sm text-white/85">Suggested hours (demo): Monday–Friday, 10:00–17:00 IST</p>
			</div>

			<div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
				<div className="space-y-4">
					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-3 flex items-center gap-2 text-landing">
							<MapPin className="h-5 w-5" aria-hidden />
							<h2 className="landing-section-subtitle">Office address</h2>
						</div>
						<p className="text-sm leading-relaxed text-slate-600">
							Urban Affairs Complex
							<br />
							Sachivalaya Road, Dispur
							<br />
							Guwahati, Assam 781006
						</p>
						<a
							className="mt-4 inline-flex text-sm font-semibold text-landing hover:text-landing-dark hover:underline"
							href="https://www.google.com/maps/search/?api=1&query=Directorate+of+Town+and+Country+Planning+Assam+Dispur"
							target="_blank"
							rel="noopener noreferrer"
						>
							Open in Google Maps →
						</a>
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-3 flex items-center gap-2 text-landing">
							<Phone className="h-5 w-5" aria-hidden />
							<h2 className="landing-section-subtitle">Phone</h2>
						</div>
						<a className="text-sm font-semibold text-slate-700 hover:text-landing" href="tel:+913612234567">
							+91 361 223 4567
						</a>
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-3 flex items-center gap-2 text-landing">
							<Mail className="h-5 w-5" aria-hidden />
							<h2 className="landing-section-subtitle">Email</h2>
						</div>
						<a
							className="text-sm font-semibold text-slate-700 hover:text-landing"
							href="mailto:support@assamtenancy.gov.in"
						>
							support@assamtenancy.gov.in
						</a>
					</div>

					<div className="flex flex-wrap gap-3 pt-2">
						<Link
							to="/#login"
							className="rounded-full bg-landing px-6 py-2.5 text-sm font-bold text-white transition hover:bg-landing-dark"
						>
							Back to login
						</Link>
						<Link
							to="/#register"
							className="rounded-full border-2 border-landing px-6 py-2.5 text-sm font-bold text-landing transition hover:bg-landing/5"
						>
							New registration
						</Link>
					</div>
				</div>

				<div>
					<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
						<iframe
							title="Office location map"
							className="h-[320px] w-full border-0 sm:h-[400px]"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							src="https://www.google.com/maps?q=Directorate%20of%20Town%20and%20Country%20Planning%2C%20Assam&output=embed"
						/>
					</div>
					<p className="mt-3 text-xs leading-relaxed text-slate-500">
						Map is for reference only. Verify the exact location with the department before visiting.
					</p>
				</div>
			</div>
		</PublicPageLayout>
	)
}

export default Contact
