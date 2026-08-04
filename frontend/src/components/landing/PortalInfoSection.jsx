import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import aboutImage from '../../assets/img/img4.png'

const notices = [
	{
		date: 'Notice',
		text: 'Official circulars and gazette notifications will be published here.',
	},
	{
		date: 'Notice',
		text: 'Use official circulars and gazette notifications for legal reference.',
	},
]

function PortalInfoSection() {
	return (
		<section
			id="about"
			className="portal-info-section landing-wallpaper-bg landing-wallpaper-bg--white py-12 sm:py-16 lg:py-24"
			aria-labelledby="about-heading"
		>
			<div id="notifications" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
					className="mx-auto max-w-2xl text-center"
				>
					<p className="landing-section-eyebrow">Department</p>
					<h2 id="about-heading" className="landing-section-title">
						About &amp; updates
					</h2>
					<p className="landing-section-lead">
						Learn about the portal and read official announcements in one place.
					</p>
				</motion.div>

				<div className="portal-info-layout">
					<motion.article
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45 }}
						className="portal-info-about"
					>
						<div className="portal-info-about__media">
							<img
								src={aboutImage}
								alt="Official explaining simplified home ownership and tenancy registration"
								className="h-full w-full object-cover object-center"
								loading="lazy"
							/>
						</div>
						<div className="portal-info-about__body">
							<h3 className="portal-info-about__title">About the portal</h3>
							<p className="portal-info-about__text">
								The Assam Tenancy Registration &amp; Management System is a unified portal for
								tenancy registration, certificate issuance, and property management — operated
								under the Department of Housing And Urban Affairs, Government of Assam, through
								the Directorate of Town and Country Planning.
							</p>
							<Link
								to="/policies"
								className="portal-info-about__link"
							>
								Read policies &amp; guidelines →
							</Link>
						</div>
					</motion.article>

					<motion.aside
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45, delay: 0.08 }}
						className="portal-info-notices"
						aria-labelledby="notifications-heading"
					>
						<div className="portal-info-notices__header">
							<p className="portal-info-notices__eyebrow">Updates</p>
							<h3 id="notifications-heading" className="portal-info-notices__title">
								Notifications
							</h3>
						</div>
						<ul className="landing-notice-list portal-info-notices__list">
							{notices.map((notice) => (
								<li key={notice.text}>
									<span className="landing-notice-date">{notice.date}</span>
									<span>{notice.text}</span>
								</li>
							))}
						</ul>
						<p className="portal-info-notices__note">
							Official circulars and announcements will be published here.
						</p>
					</motion.aside>
				</div>
			</div>
		</section>
	)
}

export default PortalInfoSection
