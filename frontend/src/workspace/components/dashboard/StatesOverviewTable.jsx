function StatesOverviewTable({ states = [] }) {
	if (!states.length) {
		return <p className="ws-chart-empty">No state data available.</p>
	}

	return (
		<div className="ws-table-wrap">
			<table className="ws-table ws-states-table">
				<thead>
					<tr>
						<th scope="col">State / UT</th>
						<th scope="col">Districts</th>
						<th scope="col">Users</th>
						<th scope="col">UIN apps</th>
						<th scope="col">Form apps</th>
						<th scope="col">Total</th>
					</tr>
				</thead>
				<tbody>
					{states.map((state) => (
						<tr key={state.id}>
							<td className="ws-states-table-name">{state.name}</td>
							<td>{state.districts_count ?? 0}</td>
							<td>{state.users_count ?? 0}</td>
							<td>{state.tenancy_applications ?? 0}</td>
							<td>{state.service_applications ?? 0}</td>
							<td>
								<strong>{state.total_applications ?? 0}</strong>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default StatesOverviewTable
