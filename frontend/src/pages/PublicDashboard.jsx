import { Link } from 'react-router-dom'
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

function PublicDashboard() {
	return (
		<PublicPageLayout
			title={publicDashboardMeta.title}
			titleId="public-dashboard-heading"
			breadcrumbLabel="Public dashboard"
			lead={publicDashboardMeta.lead}
		>
			<div className="public-dashboard-page gov-plain-page">
				<PublicDashboardSummary />

				<div className="public-dashboard-gov-charts">
					<section className="public-dashboard-gov-section public-dashboard-gov-section--wide">
						<h2>Applications per month</h2>
						<p className="public-dashboard-gov-section__note">
							New applications received through the portal (last six months)
						</p>
						<div
							className="public-dashboard-gov-bars"
							role="img"
							aria-label="Bar chart of monthly applications"
						>
							<div className="public-dashboard-gov-bars__plot">
								{monthlyApplications.map((item, index) => (
									<div key={item.month} className="public-dashboard-gov-bar-col">
										<span className="public-dashboard-gov-bar-value">
											{item.value.toLocaleString('en-IN')}
										</span>
										<div className="public-dashboard-gov-bar-track">
											<div
												className={`public-dashboard-gov-bar public-dashboard-gov-bar--tone-${index % 6}`}
												style={{ height: `${(item.value / maxMonthly) * 100}%` }}
											/>
										</div>
										<span className="public-dashboard-gov-bar-label">{item.month}</span>
									</div>
								))}
							</div>
						</div>
					</section>

					<div className="public-dashboard-gov-charts__row">
						<section className="public-dashboard-gov-section">
							<h2>Filings by tenancy body</h2>
							<p className="public-dashboard-gov-section__note">
								Assam Tenancy Act matters filed online by receiving authority
							</p>
							<div className="public-dashboard-gov-table-wrap">
							<table className="public-dashboard-gov-data-table">
								<thead>
									<tr>
										<th scope="col">Authority</th>
										<th scope="col" className="public-dashboard-gov-data-table__num-col">Filings</th>
										<th scope="col">Share</th>
									</tr>
								</thead>
								<tbody>
									{filingsByBody.map((row) => (
										<tr key={row.id}>
											<th scope="row">{row.label}</th>
											<td className="public-dashboard-gov-data-table__num">
												{row.value.toLocaleString('en-IN')}
											</td>
											<td className="public-dashboard-gov-data-table__share">
												<div className="public-dashboard-gov-meter-cell">
													<div className="public-dashboard-gov-meter">
														<div
															className={`public-dashboard-gov-meter__fill public-dashboard-gov-meter__fill--${row.id}`}
															style={{ width: `${row.pct}%` }}
														/>
													</div>
													<span className="public-dashboard-gov-meter__label">{row.pct}%</span>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							</div>
						</section>

						<section className="public-dashboard-gov-section">
							<h2>UIN &amp; acknowledgement status</h2>
							<p className="public-dashboard-gov-section__note">
								Share of registration applications by processing stage
							</p>
							<div className="public-dashboard-gov-table-wrap">
							<table className="public-dashboard-gov-data-table">
								<thead>
									<tr>
										<th scope="col">Status</th>
										<th scope="col" className="public-dashboard-gov-data-table__num-col">Count</th>
										<th scope="col">Share</th>
									</tr>
								</thead>
								<tbody>
									{certificateStatus.map((row) => (
										<tr key={row.label}>
											<th scope="row">{row.label}</th>
											<td className="public-dashboard-gov-data-table__num">
												{row.value.toLocaleString('en-IN')}
											</td>
											<td className="public-dashboard-gov-data-table__share">
												<div className="public-dashboard-gov-meter-cell">
													<div className="public-dashboard-gov-meter">
														<div
															className="public-dashboard-gov-meter__fill public-dashboard-gov-meter__fill--neutral"
															style={{ width: `${row.pct}%` }}
														/>
													</div>
													<span className="public-dashboard-gov-meter__label">{row.pct}%</span>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							</div>
						</section>
					</div>

					<div className="public-dashboard-gov-charts__row">
						<section className="public-dashboard-gov-section">
							<h2>Application pipeline</h2>
							<p className="public-dashboard-gov-section__note">
								From submission to acknowledgement (illustrative)
							</p>
							<div className="public-dashboard-gov-table-wrap">
							<table className="public-dashboard-gov-data-table">
								<thead>
									<tr>
										<th scope="col">Stage</th>
										<th scope="col" className="public-dashboard-gov-data-table__num-col">Count</th>
										<th scope="col">Share</th>
									</tr>
								</thead>
								<tbody>
									{applicationPipeline.map((row) => (
										<tr key={row.label}>
											<th scope="row">{row.label}</th>
											<td className="public-dashboard-gov-data-table__num">
												{row.value.toLocaleString('en-IN')}
											</td>
											<td className="public-dashboard-gov-data-table__share">
												<div className="public-dashboard-gov-meter-cell">
													<div className="public-dashboard-gov-meter">
														<div
															className="public-dashboard-gov-meter__fill public-dashboard-gov-meter__fill--pipeline"
															style={{ width: `${row.pct}%` }}
														/>
													</div>
													<span className="public-dashboard-gov-meter__label">{row.pct}%</span>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							</div>
						</section>

						<section className="public-dashboard-gov-section">
							<h2>Top districts by volume</h2>
							<p className="public-dashboard-gov-section__note">
								Highest application counts among Assam districts (sample)
							</p>
							<div className="public-dashboard-gov-table-wrap">
								<table className="public-dashboard-gov-table">
									<thead>
										<tr>
											<th scope="col">Rank</th>
											<th scope="col">District</th>
											<th scope="col">Applications</th>
										</tr>
									</thead>
									<tbody>
										{topDistricts.map((district, index) => (
											<tr key={district.name}>
												<td className="public-dashboard-gov-table__rank">{index + 1}</td>
												<th scope="row">{district.name}</th>
												<td className="public-dashboard-gov-table__num">
													{district.applications.toLocaleString('en-IN')}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					</div>
				</div>

				<p className="gov-plain-page__meta">{publicDashboardMeta.demoNote}</p>

				<p className="gov-plain-page__links">
					{publicDashboardLinks.map((link, index) => (
						<span key={link.to}>
							{index > 0 ? ' · ' : null}
							<Link to={link.to}>{link.label}</Link>
						</span>
					))}
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default PublicDashboard
