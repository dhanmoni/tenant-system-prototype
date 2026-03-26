import { Link } from 'react-router-dom'

function Sitemap() {
	return (
		<section className="sitemap-page" aria-labelledby="sitemap-heading">
			<div className="sitemap-page-inner">
				<nav className="sitemap-breadcrumb" aria-label="Breadcrumb">
					<Link to="/">Home</Link>
					<span className="sitemap-breadcrumb-sep" aria-hidden>
						/
					</span>
					<span className="sitemap-breadcrumb-current">Sitemap</span>
				</nav>

				<header className="sitemap-header">
					<p className="sitemap-eyebrow">Public navigation</p>
					<h1 id="sitemap-heading">Sitemap</h1>
					<p className="sitemap-lead">
						Quick links for the Tenancy Certificate Management System prototype.
					</p>
				</header>

				<div className="sitemap-grid">
					<div className="sitemap-group">
						<h3>Main</h3>
						<ul>
							<li><Link to="/">Home</Link></li>
							<li><Link to="/#login">Login</Link></li>
							<li><Link to="/#register">Registration</Link></li>
						</ul>
					</div>

					<div className="sitemap-group">
						<h3>Information</h3>
						<ul>
							<li><Link to="/policies">Policies</Link></li>
							<li><Link to="/contact">Contact Us</Link></li>
							<li><Link to="/sitemap">Sitemap</Link></li>
						</ul>
					</div>

					<div className="sitemap-group">
						<h3>External</h3>
						<ul>
							<li><a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer">National Portal</a></li>
							<li><a href="https://www.digitalindia.gov.in/" target="_blank" rel="noopener noreferrer">Digital India</a></li>
							<li><a href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">TCP Assam</a></li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Sitemap
