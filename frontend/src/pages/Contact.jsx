import { Link } from 'react-router-dom'

function Contact() {
	return (
		<section className="contact-page" aria-labelledby="contact-heading">
			<div className="contact-page-inner">
				<nav className="contact-breadcrumb" aria-label="Breadcrumb">
					<Link to="/">Home</Link>
					<span className="contact-breadcrumb-sep" aria-hidden>
						/
					</span>
					<span className="contact-breadcrumb-current">Contact Us</span>
				</nav>

				<header className="contact-header">
					<p className="contact-eyebrow">Help &amp; support</p>
					<h1 id="contact-heading">Contact Us</h1>
					<p className="contact-lead">
						Directorate of Town and Country Planning — NIC prototype portal for tenancy
						certificate services. Details below are illustrative; replace with official
						published contacts for production.
					</p>
				</header>

				<div className="contact-help-strip" role="region" aria-label="Helpdesk">
					<div className="contact-help-strip-row">
						<strong>Demo helpdesk</strong>
						<a className="contact-help-link" href="tel:18000000000">
							1800-000-0000
						</a>
						<span className="contact-help-dot" aria-hidden>
							·
						</span>
						<a className="contact-help-link" href="mailto:helpdesk.tcms@nic.in">
							helpdesk.tcms@nic.in
						</a>
					</div>
					<p className="contact-help-hours">
						Suggested hours (demo): Monday–Friday, 10:00–17:00 IST
					</p>
				</div>

				<div className="contact-layout">
					<div className="contact-details">
						<div className="contact-block contact-block--emphasis">
							<h3>Office address</h3>
							<p>
								Urban Affairs Complex
								<br />
								Sachivalaya Road, Dispur
								<br />
								Guwahati, Assam 781006
							</p>
							<a
								className="contact-inline-action"
								href="https://www.google.com/maps/search/?api=1&query=Directorate+of+Town+and+Country+Planning+Assam+Dispur"
								target="_blank"
								rel="noopener noreferrer"
							>
								Open in Google Maps
							</a>
						</div>
						<div className="contact-block">
							<h3>Phone</h3>
							<p>
								<a className="contact-tel" href="tel:+913612234567">
									+91 361 223 4567
								</a>
							</p>
						</div>
						<div className="contact-block">
							<h3>Email</h3>
							<p>
								<a className="contact-mail" href="mailto:support@assamtenancy.gov.in">
									support@assamtenancy.gov.in
								</a>
							</p>
						</div>
						<div className="contact-actions">
							<Link className="contact-btn contact-btn--primary" to="/#login">
								Back to login
							</Link>
							<Link className="contact-btn contact-btn--ghost" to="/#register">
								New registration
							</Link>
						</div>
					</div>
					<div className="contact-map-wrap">
						<div className="contact-map-card" aria-label="Map to the office address">
							<iframe
								title="Office location map"
								className="contact-map"
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								src="https://www.google.com/maps?q=Directorate%20of%20Town%20and%20Country%20Planning%2C%20Assam&output=embed"
							/>
						</div>
						<p className="contact-map-note">
							Map is for reference. Verify the exact location with the department before
							visiting.
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Contact
