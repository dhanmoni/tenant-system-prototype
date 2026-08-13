import { useLanguage } from '../../i18n'

const kpiKeys = {
	applications_submitted: { label: 'pd.kpi.applications', hint: 'pd.kpi.applicationsHint' },
	uins_issued: { label: 'pd.kpi.uins', hint: 'pd.kpi.uinsHint' },
	service_filings: { label: 'pd.kpi.filings', hint: 'pd.kpi.filingsHint' },
	disputes_resolved: { label: 'pd.kpi.matters', hint: 'pd.kpi.mattersHint' },
}

function formatCount(value) {
	return Number(value || 0).toLocaleString('en-IN')
}

function PublicDashboardSummary({ kpis = [], generatedAt }) {
	const { t } = useLanguage()
	const updated = generatedAt
		? new Date(generatedAt).toLocaleDateString('en-IN', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			})
		: t('pd.lastUpdated')

	return (
		<section className="public-dashboard-gov-kpis" aria-labelledby="public-dashboard-kpis-heading">
			<div className="public-dashboard-gov-kpis__head">
				<h2 id="public-dashboard-kpis-heading" className="public-dashboard-gov-kpis__title">
					{t('pd.kpis.title')}
				</h2>
				<p className="public-dashboard-gov-kpis__meta">{t('pd.kpis.meta', { date: updated })}</p>
			</div>

			<div className="public-dashboard-gov-table-wrap">
				<table className="public-dashboard-gov-table">
					<caption className="public-dashboard-gov-table__caption">{t('pd.kpis.caption')}</caption>
					<thead>
						<tr>
							<th scope="col">{t('pd.kpis.indicator')}</th>
							<th scope="col" className="public-dashboard-gov-data-table__num-col">
								{t('pd.kpis.count')}
							</th>
							<th scope="col">{t('pd.kpis.remarks')}</th>
						</tr>
					</thead>
					<tbody>
						{kpis.map((kpi) => {
							const keys = kpiKeys[kpi.id]
							return (
								<tr key={kpi.id}>
									<th scope="row">{keys ? t(keys.label) : kpi.id}</th>
									<td className="public-dashboard-gov-table__num public-dashboard-gov-data-table__num">
										{formatCount(kpi.value)}
									</td>
									<td>{keys ? t(keys.hint) : ''}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</section>
	)
}

export default PublicDashboardSummary
