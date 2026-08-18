import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import PublicDashboardSummary from '../components/public-dashboard/PublicDashboardSummary'
import { publicDashboardLinks } from '../data/publicDashboardData'
import { fetchPublicPortalStats } from '../services/portalStats'
import { useLanguage } from '../i18n'

const monthKeys = {
	Jan: 'pd.month.jan',
	Feb: 'pd.month.feb',
	Mar: 'pd.month.mar',
	Apr: 'pd.month.apr',
	May: 'pd.month.may',
	Jun: 'pd.month.jun',
	Jul: 'pd.month.jul',
	Aug: 'pd.month.aug',
	Sep: 'pd.month.sep',
	Oct: 'pd.month.oct',
	Nov: 'pd.month.nov',
	Dec: 'pd.month.dec',
}

const filingLabelKeys = {
	authority: 'pd.filings.rentAuthority',
	court: 'pd.filings.rentCourt',
	tribunal: 'pd.filings.rentTribunal',
}

const statusLabelKeys = {
	issued: 'pd.status.issued',
	under_review: 'pd.status.underReview',
	returned: 'pd.status.returned',
}

const pipelineLabelKeys = {
	received: 'pd.pipeline.received',
	review: 'pd.pipeline.review',
	issued: 'pd.pipeline.issued',
	returned: 'pd.pipeline.returned',
}

const linkLabelKeys = {
	'/services': 'pd.link.services',
	'/#portal-guide': 'pd.link.guide',
	'/login': 'pd.link.login',
}

function formatCount(value) {
	return Number(value || 0).toLocaleString('en-IN')
}

function PublicDashboard() {
	const { t } = useLanguage()
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let active = true
		setLoading(true)
		setError('')
		fetchPublicPortalStats()
			.then((data) => {
				if (active) setStats(data)
			})
			.catch(() => {
				if (active) {
					setStats(null)
					setError('load')
				}
			})
			.finally(() => {
				if (active) setLoading(false)
			})
		return () => {
			active = false
		}
	}, [reloadKey])

	const monthly = stats?.monthly || []
	const maxMonthly = Math.max(1, ...monthly.map((m) => Number(m.value) || 0))

	const months = useMemo(
		() =>
			monthly.map((item) => ({
				...item,
				monthLabel: t(monthKeys[item.month] || item.month),
			})),
		[t, monthly],
	)

	const filings = useMemo(
		() =>
			(stats?.filings || []).map((row) => ({
				...row,
				label: t(filingLabelKeys[row.id] || row.id),
			})),
		[t, stats],
	)

	const statuses = useMemo(
		() =>
			(stats?.certificate_status || []).map((row) => ({
				...row,
				label: t(statusLabelKeys[row.id] || row.id),
			})),
		[t, stats],
	)

	const pipeline = useMemo(
		() =>
			(stats?.pipeline || []).map((row) => ({
				...row,
				label: t(pipelineLabelKeys[row.id] || row.id),
			})),
		[t, stats],
	)

	const topDistricts = stats?.top_districts || []

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
				{loading ? (
					<div className="public-dashboard-loading" role="status" aria-live="polite">
						<span className="public-dashboard-loading__spinner" aria-hidden />
						<p className="public-dashboard-loading__label">{t('pd.loading')}</p>
					</div>
				) : null}

				{error ? (
					<p className="gov-resources__notice" role="alert">
						{t('pd.loadError')}{' '}
						<button
							type="button"
							className="public-dashboard-retry"
							onClick={() => setReloadKey((n) => n + 1)}
						>
							{t('pd.retry')}
						</button>
					</p>
				) : null}

				{!loading && !error && stats ? (
					<>
						<PublicDashboardSummary kpis={stats.kpis} generatedAt={stats.generated_at} />

						<div className="public-dashboard-gov-charts">
							<section className="public-dashboard-gov-section public-dashboard-gov-section--wide">
								<h2>{t('pd.monthly.title')}</h2>
								<p className="public-dashboard-gov-section__note">{t('pd.monthly.note')}</p>
								{months.length === 0 ? (
									<p className="gov-plain-page__meta">{t('pd.empty')}</p>
								) : (
									<div
										className="public-dashboard-gov-bars"
										role="img"
										aria-label={t('pd.monthly.aria')}
									>
										<div className="public-dashboard-gov-bars__plot">
											{months.map((item, index) => (
												<div key={item.key || item.month} className="public-dashboard-gov-bar-col">
													<span className="public-dashboard-gov-bar-value">
														{formatCount(item.value)}
													</span>
													<div className="public-dashboard-gov-bar-track">
														<div
															className={`public-dashboard-gov-bar public-dashboard-gov-bar--tone-${index % 6}`}
															style={{
																height: `${((Number(item.value) || 0) / maxMonthly) * 100}%`,
															}}
														/>
													</div>
													<span className="public-dashboard-gov-bar-label">{item.monthLabel}</span>
												</div>
											))}
										</div>
									</div>
								)}
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
															{formatCount(row.value)}
														</td>
														<td className="public-dashboard-gov-data-table__share">
															<div className="public-dashboard-gov-meter-cell">
																<div className="public-dashboard-gov-meter">
																	<div
																		className={`public-dashboard-gov-meter__fill public-dashboard-gov-meter__fill--${row.id}`}
																		style={{ width: `${row.pct || 0}%` }}
																	/>
																</div>
																<span className="public-dashboard-gov-meter__label">
																	{row.pct || 0}%
																</span>
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
													<tr key={row.id}>
														<th scope="row">{row.label}</th>
														<td className="public-dashboard-gov-data-table__num">
															{formatCount(row.value)}
														</td>
														<td className="public-dashboard-gov-data-table__share">
															<div className="public-dashboard-gov-meter-cell">
																<div className="public-dashboard-gov-meter">
																	<div
																		className="public-dashboard-gov-meter__fill public-dashboard-gov-meter__fill--neutral"
																		style={{ width: `${row.pct || 0}%` }}
																	/>
																</div>
																<span className="public-dashboard-gov-meter__label">
																	{row.pct || 0}%
																</span>
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
													<tr key={row.id}>
														<th scope="row">{row.label}</th>
														<td className="public-dashboard-gov-data-table__num">
															{formatCount(row.value)}
														</td>
														<td className="public-dashboard-gov-data-table__share">
															<div className="public-dashboard-gov-meter-cell">
																<div className="public-dashboard-gov-meter">
																	<div
																		className="public-dashboard-gov-meter__fill public-dashboard-gov-meter__fill--pipeline"
																		style={{ width: `${row.pct || 0}%` }}
																	/>
																</div>
																<span className="public-dashboard-gov-meter__label">
																	{row.pct || 0}%
																</span>
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
										{topDistricts.length === 0 ? (
											<p className="gov-plain-page__meta">{t('pd.empty')}</p>
										) : (
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
																{formatCount(district.applications)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										)}
									</div>
								</section>
							</div>
						</div>
					</>
				) : null}

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
