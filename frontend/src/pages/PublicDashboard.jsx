import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import {
	publicDashboardMeta,
	monthlyApplications,
	filingsByBody,
	topDistricts,
	certificateStatus,
} from '../data/publicDashboardData'

const maxMonthly = Math.max(...monthlyApplications.map((m) => m.value))

function PublicDashboard() {
	const chartsRef = useRef(null)
	const chartsInView = useInView(chartsRef, { once: true, margin: '-60px' })

	return (
		<PublicPageLayout
			eyebrow={publicDashboardMeta.eyebrow}
			title={publicDashboardMeta.title}
			titleId="public-dashboard-heading"
			breadcrumbLabel="Public dashboard"
			lead={publicDashboardMeta.lead}
		>
			<div className="public-dashboard-page">
				<div ref={chartsRef} className="public-dashboard-charts space-y-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={chartsInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.45 }}
						className="public-dashboard-panel"
					>
						<h2 className="public-dashboard-panel__title">Applications per month</h2>
						<p className="public-dashboard-panel__lead">Illustrative trend — last six months</p>
						<div className="public-dashboard-bars" role="img" aria-label="Bar chart of monthly applications">
							{monthlyApplications.map((item, index) => (
								<div key={item.month} className="public-dashboard-bar-col">
									<motion.div
										className="public-dashboard-bar"
										initial={{ height: 0 }}
										animate={
											chartsInView
												? { height: `${(item.value / maxMonthly) * 100}%` }
												: {}
										}
										transition={{ duration: 0.5, delay: index * 0.06 }}
									/>
									<span className="public-dashboard-bar-value">
										{item.value.toLocaleString('en-IN')}
									</span>
									<span className="public-dashboard-bar-label">{item.month}</span>
								</div>
							))}
						</div>
					</motion.div>

					<div className="grid gap-8 lg:grid-cols-2">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={chartsInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.45, delay: 0.1 }}
							className="public-dashboard-panel"
						>
							<h2 className="public-dashboard-panel__title">Filings by tenancy body</h2>
							<ul className="public-dashboard-progress-list">
								{filingsByBody.map((row) => (
									<li key={row.id}>
										<div className="public-dashboard-progress-head">
											<span>{row.label}</span>
											<span>{row.value.toLocaleString('en-IN')}</span>
										</div>
										<div className="public-dashboard-progress-track">
											<motion.div
												className={`public-dashboard-progress-fill public-dashboard-progress-fill--${row.id}`}
												initial={{ width: 0 }}
												animate={chartsInView ? { width: `${row.pct}%` } : {}}
												transition={{ duration: 0.55 }}
											/>
										</div>
									</li>
								))}
							</ul>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={chartsInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.45, delay: 0.15 }}
							className="public-dashboard-panel"
						>
							<h2 className="public-dashboard-panel__title">Certificate status</h2>
							<ul className="public-dashboard-progress-list">
								{certificateStatus.map((row) => (
									<li key={row.label}>
										<div className="public-dashboard-progress-head">
											<span>{row.label}</span>
											<span>{row.pct}%</span>
										</div>
										<div className="public-dashboard-progress-track">
											<motion.div
												className="public-dashboard-progress-fill public-dashboard-progress-fill--neutral"
												initial={{ width: 0 }}
												animate={chartsInView ? { width: `${row.pct}%` } : {}}
												transition={{ duration: 0.55 }}
											/>
										</div>
									</li>
								))}
							</ul>
						</motion.div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={chartsInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.45, delay: 0.2 }}
						className="public-dashboard-panel"
					>
						<h2 className="public-dashboard-panel__title">Top districts by applications</h2>
						<ol className="public-dashboard-rank-list">
							{topDistricts.map((district, index) => (
								<li key={district.name} className="public-dashboard-rank-item">
									<span className="public-dashboard-rank-num">{index + 1}</span>
									<span className="public-dashboard-rank-name">{district.name}</span>
									<span className="public-dashboard-rank-value">
										{district.applications.toLocaleString('en-IN')}
									</span>
								</li>
							))}
						</ol>
					</motion.div>
				</div>

				<p className="public-dashboard-note">{publicDashboardMeta.demoNote}</p>
			</div>
		</PublicPageLayout>
	)
}

export default PublicDashboard
