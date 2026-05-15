import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import aboutImage from '../../assets/img/img4.png'

function AboutSection() {
	return (
		<section id="about" className="bg-white py-12 sm:py-16 lg:py-24" aria-labelledby="about-heading">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					<motion.div
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: '-80px' }}
						transition={{ duration: 0.5 }}
						className="overflow-hidden rounded-2xl shadow-xl"
					>
						<img
							src={aboutImage}
							alt="Official explaining simplified home ownership and tenancy registration"
							className="h-full min-h-[280px] w-full object-cover object-center"
							loading="lazy"
						/>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: '-80px' }}
						transition={{ duration: 0.5 }}
					>
						<p className="landing-section-eyebrow">Department</p>
						<h2 id="about-heading" className="landing-section-title">
							About the portal
						</h2>
						<p className="landing-section-lead mt-6">
							The Assam Tenancy Registration &amp; Management System is a unified portal for
							tenancy registration, certificate issuance, and property management — operated
							under the Department of Housing And Urban Affairs, Government of Assam, through
							the Directorate of Town and Country Planning.
						</p>
						<Link
							to="/policies"
							className="mt-6 inline-flex items-center font-semibold text-landing hover:text-landing-dark hover:underline"
						>
							Read policies &amp; guidelines →
						</Link>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default AboutSection
