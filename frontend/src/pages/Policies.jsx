import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'

function Policies() {
	return (
		<PublicPageLayout
			title="Policies & Guidelines"
			titleId="policies-heading"
			breadcrumbLabel="Policies & Guidelines"
			lead="Terms, privacy practices, and accessibility information for users of the Assam Tenancy Registration Portal."
		>
			<div className="gov-plain-page">
				<section>
					<h2>Terms of use</h2>
					<p>
						This portal is provided by the Directorate of Town and Country Planning,
						Assam, for online tenancy registration and related citizen services. By
						using this website, you agree to use it only for lawful purposes connected
						with tenancy applications and authorised departmental processes.
					</p>
					<p>
						Unauthorized access, misuse of credentials, or submission of false
						information may lead to rejection of applications and action under
						applicable laws.
					</p>
				</section>

				<section>
					<h2>Privacy and data protection</h2>
					<p>
						Personal information collected during registration and application
						submission is used solely for tenancy administration, verification, and
						services. Data is handled in line with applicable government data
						protection guidelines and departmental policies.
					</p>
					{/* <p>
						Do not share your OTP or login credentials with others. Log out after
						using shared or public devices.
					</p> */}
				</section>

				{/* <section>
					<h2>Accessibility</h2>
					<p>
						The portal supports text resizing, high contrast mode, and keyboard
						navigation where implemented. If you face difficulty accessing any service,
						contact the helpdesk or visit the{' '}
						<Link to="/contact">Contact Us</Link> page.
					</p>
				</section> */}
{/* 
				<p className="gov-plain-page__meta">
					Last reviewed for demo: March 2026. Replace with department-approved policy
					text before production deployment.
				</p>

				<p className="gov-plain-page__links">
					<Link to="/contact">Contact helpdesk</Link>
					{' · '}
					<a href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">
						TCP Assam official site
					</a>
				</p> */}
			</div>
		</PublicPageLayout>
	)
}

export default Policies
