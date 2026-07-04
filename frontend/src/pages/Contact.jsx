import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'

function Contact() {
	return (
		<PublicPageLayout
			title="Contact Us"
			titleId="contact-heading"
			breadcrumbLabel="Contact Us"
			lead="Directorate of Town and Country Planning, Assam — helpdesk and office contact details. Information below is for demonstration; replace with official published contacts for production."
		>
			<div className="gov-plain-page">
				<div className="gov-plain-page__columns">
					<div className="gov-plain-page__col">
						<section>
							<h2>Helpdesk</h2>
							<p>
								<strong>Toll-free:</strong>{' '}
								<a href="tel:18000000000">1800-000-0000</a>
							</p>
							<p>
								<strong>Email:</strong>{' '}
								<a href="mailto:helpdesk.tcms@nic.in">helpdesk.tcms@nic.in</a>
							</p>
							<p>
								<strong>Hours (demo):</strong> Monday–Friday, 10:00–17:00 IST
							</p>
						</section>

						<section>
							<h2>Phone</h2>
							<p>
								<a href="tel:+913612234567">+91 361 223 4567</a>
							</p>
						</section>
					</div>

					<div className="gov-plain-page__col">
						<section>
							<h2>Office address</h2>
							<p>
								Directorate of Town and Country Planning
								<br />
								Urban Affairs Complex, Sachivalaya Road, Dispur
								<br />
								Guwahati, Assam 781006
							</p>
						</section>

						<section>
							<h2>Email</h2>
							<p>
								<a href="mailto:support@assamtenancy.gov.in">
									support@assamtenancy.gov.in
								</a>
							</p>
						</section>
					</div>
				</div>

				<section className="gov-plain-page__map" aria-labelledby="contact-map-heading">
					<h2 id="contact-map-heading">Office location</h2>
					<p>
						Directorate of Town and Country Planning, Urban Affairs Complex, Sachivalaya
						Road, Dispur, Guwahati, Assam 781006
					</p>
					<div className="gov-plain-page__map-frame">
						<iframe
							title="Directorate of Town and Country Planning office location"
							className="gov-plain-page__map-embed"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							src="https://www.google.com/maps?q=Directorate%20of%20Town%20and%20Country%20Planning%2C%20Assam&output=embed"
						/>
					</div>
					<p className="gov-plain-page__map-note">
						<a
							href="https://www.google.com/maps/search/?api=1&query=Directorate+of+Town+and+Country+Planning+Assam+Dispur"
							target="_blank"
							rel="noopener noreferrer"
						>
							Open in Google Maps
						</a>
					</p>
				</section>

				<p className="gov-plain-page__meta">
					Map and contact details are for reference only. Verify the exact office location
					and published helpline numbers with the department before visiting.
				</p>

				<p className="gov-plain-page__links">
					<Link to="/#login">Sign in</Link>
					{' · '}
					<Link to="/#register">Register</Link>
					{' · '}
					<a href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">
						TCP Assam official site
					</a>
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default Contact
