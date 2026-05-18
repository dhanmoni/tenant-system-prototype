function FormTypeTable({ forms = [] }) {
	if (!forms.length) {
		return <p className="ws-chart-empty">No form submissions in your scope yet.</p>
	}

	return (
		<div className="ws-table-wrap">
			<table className="ws-table">
				<thead>
					<tr>
						<th scope="col">Form</th>
						<th scope="col" className="ws-th-num">
							Applications
						</th>
					</tr>
				</thead>
				<tbody>
					{forms.map((row) => (
						<tr key={row.form_key || row.label}>
							<td>{row.label}</td>
							<td className="ws-td-num">
								<strong>{row.count}</strong>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default FormTypeTable
