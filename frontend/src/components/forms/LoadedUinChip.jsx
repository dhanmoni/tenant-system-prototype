import { IdCard } from 'lucide-react'

/** Loaded-UIN context for the form card header. */
function LoadedUinChip({ value, onChange, changeLabel = 'Change' }) {
	const uin = String(value ?? '').trim()
	if (!uin) return null

	return (
		<div className="sf-loaded-uin" role="status" aria-label={`Loaded tenancy UIN ${uin}`}>
			<span className="sf-loaded-uin__icon" aria-hidden>
				<IdCard size={16} strokeWidth={2.4} />
			</span>
			<span className="sf-loaded-uin__text">
				<span className="sf-loaded-uin__label">UIN</span>
				<span className="sf-loaded-uin__sep" aria-hidden>
					·
				</span>
				<strong className="sf-loaded-uin__value">{uin}</strong>
			</span>
			{typeof onChange === 'function' ? (
				<>
					<span className="sf-loaded-uin__divider" aria-hidden />
					<button type="button" className="sf-loaded-uin__change" onClick={onChange}>
						{changeLabel}
					</button>
				</>
			) : null}
		</div>
	)
}

export default LoadedUinChip
