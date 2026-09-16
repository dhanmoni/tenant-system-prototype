/** Section head for UIN-loaded party fields. */
function UinPrefillNotice({
	title = 'Tenancy details — review',
	message = 'Verify details',
}) {
	return (
		<div className="sf-record-review-head" role="status">
			<p className="sf-record-review-label">{title}</p>
			{message ? (
				<span className="sf-record-review-hint">{message}</span>
			) : null}
		</div>
	)
}

export default UinPrefillNotice
