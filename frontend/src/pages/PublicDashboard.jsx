import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import PublicDashboardSummary from '../components/public-dashboard/PublicDashboardSummary'
import {
	monthlyApplications,
	filingsByBody,
	topDistricts,
	certificateStatus,
	applicationPipeline,
	publicDashboardLinks,
} from '../data/publicDashboardData'
import { useLanguage } from '../i18n'

const monthKeys = {
	Dec: 'pd.month.dec',
	Jan: 'pd.month.jan',
	Feb: 'pd.month.feb',
	Mar: 'pd.month.mar',
	Apr: 'pd.month.apr',
	May: 'pd.month.may',
}

const filingLabelKeys = {
	authority: 'pd.filings.rentAuthority',
	court: 'pd.filings.rentCourt',
	tribunal: 'pd.filings.rentTribunal',
}

const statusLabelKeys = {
	Issued: 'pd.status.issued',
	'Under review': 'pd.status.underReview',
	'Returned / draft': 'pd.status.returned',
}

const pipelineLabelKeys = {
	'UIN / registration received': 'pd.pipeline.received',
	'Under departmental review': 'pd.pipeline.review',
	'Acknowledgement issued': 'pd.pipeline.issued',
	'Returned for correction': 'pd.pipeline.returned',
}

const linkLabelKeys = {
	'/services': 'pd.link.services',
	'/#portal-guide': 'pd.link.guide',
	'/login': 'pd.link.login',
}

function PublicDashboard() {
	const { t } = useLanguage()
	const maxMonthly = Math.max(...monthlyApplications.map((m) => m.value))

	const months = useMemo(
		() =>
			monthlyApplications.map((item) => ({
				...item,
				monthLabel: t(monthKeys[item.month] || item.month),
			})),
		[t],
	)

	const filings = useMemo(
		() =>
			filingsByBody.map((row) => ({
				...row,
				label: t(filingLabelKeys[row.id] || row.label),
			})),
		[t],
	)

	const statuses = useMemo(
		() =>
			certificateStatus.map((row) => ({
				...row,
				label: t(statusLabelKeys[row.label] || row.label),
			})),
		[t],
	)

	const pipeline = useMemo(
		() =>
			applicationPipeline.map((row) => ({
				...row,
				label: t(pipelineLabelKeys[row.label] || row.label),
			})),
		[t],
	)

	const links = useMemo(
		() =>
			publicDashboardLinks.map((link) => ({
				...link,
				label: t(linkLabelKeys[link.to] || link.label),
			})),
		[t],
	)

	return (
		<PublicPageLayout
			title={t('pd.title')}
			titleId="public-dashboard-heading"
			breadcrumbLabel={t('pd.title')}
			lead={t('pd.lead')}
		>
			<div className="public-dashboard-page gov-plain-page">
				<PublicDashboardSummary />

				<div className="public-dashboard-gov-charts">
					<section className="public-dashboard-gov-section public-dashboard-gov-section--wide">
						<h2>{t('pd.monthly.title')}</h2>
						<p className="public-dashboard-gov-section__note">{t('pd.monthly.note')}</p>
						<div
							className="public-dashboard-gov-bars"
							role="img"
							aria-label={t('pd.monthly.aria')}
						>
							<div className="public-dashboard-gov-bars__plot">
								{months.map((item, index) => (
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
										<span className="public-dashboard-gov-bar-label">{item.monthLabel}</span>
									</div>
								))}
							</div>
						</div>
					</section>

					<div className="public-dashboard-gov-charts__row">
						<section className="public-dashboard-gov-section">
							<h2>{t('pd.filings.title')}</h2>
							<p className="public-dashboard-gov-section__note">{t('pd.filings.note')}</p>
							<div className="public-dashboard-gov-table-wrap">
								<table className="public-dashboard-gov-data-table">
									<thead>
										<tr>
											<th scope="col">{t('pd.filings.authority')}</th>
											<th scope="col" className="public-dashboard-gov-data-table__num-col">
												{t('pd.filings.count')}
											</th>
											<th scope="col">{t('pd.filings.share')}</th>
										</tr>
									</thead>
									<tbody>
										{filings.map((row) => (
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
							<h2>{t('pd.status.title')}</h2>
							<p className="public-dashboard-gov-section__note">{t('pd.status.note')}</p>
							<div className="public-dashboard-gov-table-wrap">
								<table className="public-dashboard-gov-data-table">
									<thead>
										<tr>
											<th scope="col">{t('pd.status.col')}</th>
											<th scope="col" className="public-dashboard-gov-data-table__num-col">
												{t('pd.status.count')}
											</th>
											<th scope="col">{t('pd.status.share')}</th>
										</tr>
									</thead>
									<tbody>
										{statuses.map((row) => (
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
							<h2>{t('pd.pipeline.title')}</h2>
							<p className="public-dashboard-gov-section__note">{t('pd.pipeline.note')}</p>
							<div className="public-dashboard-gov-table-wrap">
								<table className="public-dashboard-gov-data-table">
									<thead>
										<tr>
											<th scope="col">{t('pd.pipeline.stage')}</th>
											<th scope="col" className="public-dashboard-gov-data-table__num-col">
												{t('pd.pipeline.count')}
											</th>
											<th scope="col">{t('pd.pipeline.share')}</th>
										</tr>
									</thead>
									<tbody>
										{pipeline.map((row) => (
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
							<h2>{t('pd.districts.title')}</h2>
							<p className="public-dashboard-gov-section__note">{t('pd.districts.note')}</p>
							<div className="public-dashboard-gov-table-wrap">
								<table className="public-dashboard-gov-table">
									<thead>
										<tr>
											<th scope="col">{t('pd.districts.rank')}</th>
											<th scope="col">{t('pd.districts.district')}</th>
											<th scope="col">{t('pd.districts.applications')}</th>
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

				<p className="gov-plain-page__meta">{t('pd.demoNote')}</p>

				<p className="gov-plain-page__links">
					{links.map((link, index) => (
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
