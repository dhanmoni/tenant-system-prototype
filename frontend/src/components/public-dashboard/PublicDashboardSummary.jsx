import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { FileCheck, FileText, Gavel, Scale } from 'lucide-react'
import { publicDashboardKpis, publicDashboardMeta } from '../../data/publicDashboardData'

const iconById = {
	applications_submitted: FileText,
	uins_issued: FileCheck,
	service_filings: Gavel,
	disputes_resolved: Scale,
}

const cardVariants = {
	hidden: { opacity: 0, y: 20, scale: 0.96 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 360,
			damping: 24,
			delay: i * 0.07,
		},
	}),
}

function PublicDashboardSummary() {
	const ref = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(ref, { once: true, margin: '-40px' })
	const reveal = reduceMotion || inView

	return (
		<section className="public-dashboard-summary landing-stats-section" aria-labelledby="public-dashboard-kpis-heading">
			<div className="landing-stats-header">
				<div>
					<h2 id="public-dashboard-kpis-heading" className="public-dashboard-summary__title">
						At a glance
					</h2>
					<p className="public-dashboard-summary__lead">
						Key portal indicators for citizens and researchers
					</p>
				</div>
				<div className="landing-stats-live" title="Sample data for prototype">
					<span className="landing-stats-live-dot" aria-hidden />
					<span className="landing-stats-live-text">
						Sample data · Updated {publicDashboardMeta.lastUpdated}
					</span>
				</div>
			</div>

			<motion.ul
				ref={ref}
				className="landing-stats-grid public-dashboard-kpi-grid"
				initial={reduceMotion ? false : 'hidden'}
				animate={reveal ? 'visible' : 'hidden'}
				variants={{
					hidden: {},
					visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
				}}
			>
				{publicDashboardKpis.map((kpi, index) => {
					const Icon = iconById[kpi.id] || FileText
					return (
						<motion.li
							key={kpi.id}
							className="landing-stat-card public-dashboard-kpi-card"
							custom={index}
							variants={reduceMotion ? undefined : cardVariants}
						>
							<div className="landing-stat-card-top">
								<span className="landing-stat-icon" aria-hidden>
									<Icon className="h-5 w-5" strokeWidth={2} />
								</span>
							</div>
							<p className="landing-stat-value">{kpi.display}</p>
							<p className="landing-stat-label">{kpi.label}</p>
							<p className="landing-stat-hint">{kpi.hint}</p>
						</motion.li>
					)
				})}
			</motion.ul>
		</section>
	)
}

export default PublicDashboardSummary
