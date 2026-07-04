import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'

function About() {
	return (
		<PublicPageLayout
			title="About us"
			titleId="about-page-heading"
			breadcrumbLabel="About us"
			lead="The Assam Tenancy Registration & Management System is a unified digital portal for citizens, tenants, and property owners under the Government of Assam."
		>
			<div className="gov-plain-page">
				<section>
					<h2>Our mission</h2>
					<p>
						To make tenancy registration, management and dispute filing accessible
						online — reducing visits to offices while keeping records trackable and
						verifiable for tenants and owners across Assam.
					</p>
				</section>

				<section>
					<h2>Who operates the portal</h2>
					<p>
						The portal is operated under the Department of Housing And Urban Affairs,
						Government of Assam, through the Directorate of Town and Country Planning
						(TCP), in line with the Assam Tenancy Act and related rules.
					</p>
				</section>

				{/* <section>
					<h2>What you can do here</h2>
					<ul>
						<li>Register as a citizen with mobile OTP verification</li>
						<li>Apply for tenancy and track status online</li>
						<li>File forms before the Rent Authority, Rent Court, or Rent Tribunal</li>
					</ul>
				</section> */}
{/* 
				<p className="gov-plain-page__links">
					<Link to="/public-dashboard">Public dashboard</Link>
					{' · '}
					<Link to="/policies">Policies &amp; guidelines</Link>
				</p> */}
			</div>
		</PublicPageLayout>
	)
}

export default About
