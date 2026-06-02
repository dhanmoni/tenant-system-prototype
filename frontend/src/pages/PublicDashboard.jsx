import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import PublicDashboardSummary from '../components/public-dashboard/PublicDashboardSummary'
import {
	publicDashboardMeta,
	monthlyApplications,
	filingsByBody,
	topDistricts,
	certificateStatus,
	applicationPipeline,
	publicDashboardLinks,
} from '../data/publicDashboardData'

const maxMonthly = Math.max(...monthlyApplications.map((m) => m.value))

const panelMotion = {
	hidden: { opacity: 0, y: 24 },
	visible: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 320, damping: 26, delay },
	}),
}

function PublicDashboard() {
	const chartsRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const chartsInView = useInView(chartsRef, { once: true, margin: '-60px' })
	const reveal = reduceMotion || chartsInView

	return (
		<PublicPageLayout
			eyebrow={publicDashboardMeta.eyebrow}
			title={publicDashboardMeta.title}
			titleId="public-dashboard-heading"
			breadcrumbLabel="Public dashboard"
			lead={publicDashboardMeta.lead}
		>
			<div className="public-dashboard-page">
				<PublicDashboardSummary />

				<div ref={chartsRef} className="public-dashboard-charts">
					<motion.article
						className="public-dashboard-panel public-dashboard-panel--wide"
						initial={reduceMotion ? false : panelMotion.hidden}
						animate={reveal ? panelMotion.visible(0) : panelMotion.hidden}
					>
						<h2 className="public-dashboard-panel__title">Applications per month</h2>
						<p className="public-dashboard-panel__lead">
							New applications received through the portal (last six months)
						</p>
						<div
							className="public-dashboard-bars"
							role="img"
							aria-label="Bar chart of monthly applications"
						>
							{monthlyApplications.map((item, index) => (
								<div key={item.month} className="public-dashboard-bar-col">
									<span className="public-dashboard-bar-value">
										{item.value.toLocaleString('en-IN')}
									</span>
									<div className="public-dashboard-bar-track">
										<motion.div
											className="public-dashboard-bar"
											initial={{ height: 0 }}
											animate={
												reveal
													? { height: `${(item.value / maxMonthly) * 100}%` }
													: { height: 0 }
											}
											transition={{ type: 'spring', stiffness: 280, damping: 24, delay: index * 0.06 }}
										/>
									</div>
									<span className="public-dashboard-bar-label">{item.month}</span>
								</div>
							))}
						</div>
					</motion.article>

					<div className="public-dashboard-charts__row">
						<motion.article
							className="public-dashboard-panel"
							initial={reduceMotion ? false : panelMotion.hidden}
							animate={reveal ? panelMotion.visible(0.08) : panelMotion.hidden}
						>
							<h2 className="public-dashboard-panel__title">Filings by tenancy body</h2>
							<p className="public-dashboard-panel__lead">
								Assam Tenancy Act matters filed online by receiving authority
							</p>
							<ul className="public-dashboard-progress-list">
								{filingsByBody.map((row, index) => (
									<li key={row.id}>
										<div className="public-dashboard-progress-head">
											<span>{row.label}</span>
											<span>{row.value.toLocaleString('en-IN')}</span>
										</div>
										<div className="public-dashboard-progress-track">
											<motion.div
												className={`public-dashboard-progress-fill public-dashboard-progress-fill--${row.id}`}
												initial={{ width: 0 }}
												animate={reveal ? { width: `${row.pct}%` } : { width: 0 }}
												transition={{
													type: 'spring',
													stiffness: 300,
													damping: 28,
													delay: 0.12 + index * 0.06,
												}}
											/>
										</div>
									</li>
								))}
							</ul>
						</motion.article>

						<motion.article
							className="public-dashboard-panel"
							initial={reduceMotion ? false : panelMotion.hidden}
							animate={reveal ? panelMotion.visible(0.12) : panelMotion.hidden}
						>
							<h2 className="public-dashboard-panel__title">UIN &amp; acknowledgement status</h2>
							<p className="public-dashboard-panel__lead">
								Share of registration applications by processing stage
							</p>
							<ul className="public-dashboard-progress-list">
								{certificateStatus.map((row, index) => (
									<li key={row.label}>
										<div className="public-dashboard-progress-head">
											<span>{row.label}</span>
											<span>
												{row.value.toLocaleString('en-IN')}{' '}
												<span className="public-dashboard-progress-pct">({row.pct}%)</span>
											</span>
										</div>
										<div className="public-dashboard-progress-track">
											<motion.div
												className="public-dashboard-progress-fill public-dashboard-progress-fill--neutral"
												initial={{ width: 0 }}
												animate={reveal ? { width: `${row.pct}%` } : { width: 0 }}
												transition={{
													type: 'spring',
													stiffness: 300,
													damping: 28,
													delay: 0.14 + index * 0.06,
												}}
											/>
										</div>
									</li>
								))}
							</ul>
						</motion.article>
					</div>

					<div className="public-dashboard-charts__row">
						<motion.article
							className="public-dashboard-panel"
							initial={reduceMotion ? false : panelMotion.hidden}
							animate={reveal ? panelMotion.visible(0.16) : panelMotion.hidden}
						>
							<h2 className="public-dashboard-panel__title">Application pipeline</h2>
							<p className="public-dashboard-panel__lead">
								From submission to acknowledgement (illustrative funnel)
							</p>
							<ul className="public-dashboard-progress-list">
								{applicationPipeline.map((row, index) => (
									<li key={row.label}>
										<div className="public-dashboard-progress-head">
											<span>{row.label}</span>
											<span>{row.value.toLocaleString('en-IN')}</span>
										</div>
										<div className="public-dashboard-progress-track">
											<motion.div
												className="public-dashboard-progress-fill"
												initial={{ width: 0 }}
												animate={reveal ? { width: `${row.pct}%` } : { width: 0 }}
												transition={{
													type: 'spring',
													stiffness: 300,
													damping: 28,
													delay: 0.18 + index * 0.05,
												}}
											/>
										</div>
									</li>
								))}
							</ul>
						</motion.article>

						<motion.article
							className="public-dashboard-panel"
							initial={reduceMotion ? false : panelMotion.hidden}
							animate={reveal ? panelMotion.visible(0.2) : panelMotion.hidden}
						>
							<h2 className="public-dashboard-panel__title">Top districts by volume</h2>
							<p className="public-dashboard-panel__lead">
								Highest application counts among Assam districts (sample)
							</p>
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
						</motion.article>
					</div>
				</div>

				<aside className="public-dashboard-callout" role="note">
					<p className="public-dashboard-callout__text">{publicDashboardMeta.demoNote}</p>
					<div className="public-dashboard-actions">
						{publicDashboardLinks.map((link) => (
							<Link key={link.to} to={link.to} className="public-dashboard-action-link">
								{link.label}
							</Link>
						))}
					</div>
				</aside>
			</div>
		</PublicPageLayout>
	)
}

export default PublicDashboard
