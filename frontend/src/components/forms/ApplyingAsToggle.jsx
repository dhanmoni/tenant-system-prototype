import { Building2, UserRound } from 'lucide-react'

/** Shared landlord/tenant role picker — same pill language as Relation. */
function ApplyingAsToggle({
	value,
	onChange,
	name = 'applying_as',
	label = 'Applying as',
	hint = '',
	landlordLabel = 'Landlord',
	tenantLabel = 'Tenant',
	required = true,
}) {
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
			<div className="sf-applying-as__options" role="radiogroup" aria-label={label}>
				<label className={`sf-applying-as__pill${value === 'landlord' ? ' is-active' : ''}`}>
					<input
						type="radio"
						name={name}
						value="landlord"
						checked={value === 'landlord'}
						onChange={() => onChange('landlord')}
						className="sr-only"
					/>
					<Building2 size={17} strokeWidth={2.25} aria-hidden />
					<span>{landlordLabel}</span>
				</label>
				<label className={`sf-applying-as__pill${value === 'tenant' ? ' is-active' : ''}`}>
					<input
						type="radio"
						name={name}
						value="tenant"
						checked={value === 'tenant'}
						onChange={() => onChange('tenant')}
						className="sr-only"
					/>
					<UserRound size={17} strokeWidth={2.25} aria-hidden />
					<span>{tenantLabel}</span>
				</label>
			</div>
		</div>
	)
}

export default ApplyingAsToggle
