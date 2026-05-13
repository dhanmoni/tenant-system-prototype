/**
 * Act / authority, matter, rule and form name — shown on each tenancy service form.
 */
export default function FormPageLegalContext({ serviceMeta }) {
	if (!serviceMeta) return null
	return (
		<div
			className="form-page-legal-context"
			role="region"
			aria-label="Authority, matter and rule"
		>
			<p className="form-page-legal-context__authority">{serviceMeta.authority}</p>
			<p className="form-page-legal-context__matter">{serviceMeta.matter}</p>
			<div className="form-page-legal-context__row">
				<span className="form-page-legal-context__rule">{serviceMeta.rule}</span>
				<span className="form-page-legal-context__form-name">{serviceMeta.formName}</span>
			</div>
		</div>
	)
}
