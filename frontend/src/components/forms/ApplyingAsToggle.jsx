/** Shared landlord/tenant role picker — segmented navy toggle (matches UIN apply UX). */
function ApplyingAsToggle({
	value,
	onChange,
	name = 'applying_as',
	label = 'Applying as',
	hint = 'This decides who is the applicant on this form.',
	landlordLabel = 'Landlord',
	tenantLabel = 'Tenant',
	required = true,
}) {
	const isTenant = value === 'tenant'

	return (
		<div className="sf-applying-as">
			<div className="sf-applying-as__label-row">
				<span className="sf-applying-as__label">{label}</span>
				{required ? (
					<span className="sf-applying-as__required" aria-hidden>
						*
					</span>
				) : null}
			</div>
			{hint ? <p className="sf-applying-as__hint">{hint}</p> : null}
			<div
				className={`sf-applying-as__toggle${isTenant ? ' is-tenant' : ' is-landlord'}`}
				role="radiogroup"
				aria-label={label}
			>
				<span className="sf-applying-as__indicator" aria-hidden />
				<label
					className={`sf-applying-as__btn${value === 'landlord' ? ' is-active' : ''}`}
				>
					<input
						type="radio"
						name={name}
						value="landlord"
						checked={value === 'landlord'}
						onChange={() => onChange('landlord')}
						className="sr-only"
					/>
					<span>{landlordLabel}</span>
				</label>
				<label className={`sf-applying-as__btn${value === 'tenant' ? ' is-active' : ''}`}>
					<input
						type="radio"
						name={name}
						value="tenant"
						checked={value === 'tenant'}
						onChange={() => onChange('tenant')}
						className="sr-only"
					/>
					<span>{tenantLabel}</span>
				</label>
			</div>
		</div>
	)
}

export default ApplyingAsToggle
