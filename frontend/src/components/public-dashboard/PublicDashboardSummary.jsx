import { publicDashboardKpis, publicDashboardMeta } from '../../data/publicDashboardData'

function PublicDashboardSummary() {
	return (
		<section className="public-dashboard-gov-kpis" aria-labelledby="public-dashboard-kpis-heading">
			<div className="public-dashboard-gov-kpis__head">
				<h2 id="public-dashboard-kpis-heading" className="public-dashboard-gov-kpis__title">
					Key indicators
				</h2>
				<p className="public-dashboard-gov-kpis__meta">
					Sample data · Last updated {publicDashboardMeta.lastUpdated}
				</p>
			</div>

			<div className="public-dashboard-gov-table-wrap">
				<table className="public-dashboard-gov-table">
					<caption className="public-dashboard-gov-table__caption">
						Portal activity summary for citizens and researchers
					</caption>
					<thead>
						<tr>
							<th scope="col">Indicator</th>
							<th scope="col" className="public-dashboard-gov-data-table__num-col">Count</th>
							<th scope="col">Remarks</th>
						</tr>
					</thead>
					<tbody>
						{publicDashboardKpis.map((kpi) => (
							<tr key={kpi.id}>
								<th scope="row">{kpi.label}</th>
								<td className="public-dashboard-gov-table__num public-dashboard-gov-data-table__num">
									{kpi.display}
								</td>
								<td>{kpi.hint}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	)
}

export default PublicDashboardSummary
