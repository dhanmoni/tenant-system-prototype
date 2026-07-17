import { useState } from 'react'
import api from '../../api'

function TenancyUinLookup({
	value,
	onChange,
	onLoaded,
	label = 'Tenancy UIN',
	required = true,
}) {
	const [loading, setLoading] = useState(false)
	const [status, setStatus] = useState(null)

	const handleLookup = async () => {
		const uid = value.trim()
		if (!uid) {
			setStatus({ type: 'error', message: 'Enter a Tenancy UIN first.' })
			return
		}

		setLoading(true)
		setStatus(null)
		try {
			const { data } = await api.get('/api/tenancy-applications/lookup-by-uin', {
				params: { uid },
			})
			const filledCount = onLoaded?.(data?.tenancy) ?? 0
			setStatus({
				type: 'success',
				message:
					filledCount > 0
						? `UIN verified. ${filledCount} field(s) auto-filled from the tenancy record.`
						: 'UIN verified. No matching fields were available to auto-fill.',
			})
		} catch (err) {
			setStatus({
				type: 'error',
				message: err?.response?.data?.message || 'Could not find a tenancy record for this UIN.',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="tenancy-uin-lookup">
			<label>
				<span className={`label-text${required ? ' required' : ''}`}>{label}</span>
				<div className="tenancy-uin-lookup__row">
					<input
						type="text"
						value={value}
						onChange={(e) => {
							onChange(e.target.value)
							if (status) setStatus(null)
						}}
						required={required}
						placeholder="e.g. ATRMS-01012026-0303"
					/>
					<button
						type="button"
						className="tenancy-uin-lookup__btn"
						onClick={handleLookup}
						disabled={loading}
					>
						{loading ? 'Looking up…' : 'Fetch details'}
					</button>
				</div>
			</label>
			{status ? (
				<p
					className={`tenancy-uin-lookup__status tenancy-uin-lookup__status--${status.type}`}
					role="status"
				>
					{status.type === 'success' ? (
						<span className="tenancy-uin-lookup__status-icon" aria-hidden>
							✓
						</span>
					) : null}
					<span>{status.message}</span>
				</p>
			) : (
				<p className="tenancy-uin-lookup__hint">
					Enter a valid Tenancy UIN and fetch details to auto-fill matching fields below.
				</p>
			)}
		</div>
	)
}

export default TenancyUinLookup
