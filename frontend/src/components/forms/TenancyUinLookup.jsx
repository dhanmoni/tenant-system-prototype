import { useState } from 'react'
import { IdCard } from 'lucide-react'
import api from '../../api'

function TenancyUinLookup({
	value,
	onChange,
	onLoaded,
	label = 'Tenancy UIN',
	hint,
	required = true,
	actionLabel = 'Fetch details',
	loadingLabel = 'Looking up…',
	successMessage,
	errorFallback = 'Could not load tenancy details for this UIN.',
	variant = 'default',
	/** Center the UIN field as the focal action (Form I gate). */
	align = 'start',
}) {
	const [loading, setLoading] = useState(false)
	const [status, setStatus] = useState(null)
	const modern = variant === 'modern'
	const centered = align === 'center'

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
			const defaultSuccess =
				filledCount > 0
					? `UIN verified. ${filledCount} field(s) auto-filled from the tenancy record.`
					: 'UIN verified. No matching fields were available to auto-fill.'
			setStatus({
				type: 'success',
				message:
					typeof successMessage === 'function'
						? successMessage(filledCount)
						: successMessage || defaultSuccess,
			})
		} catch (err) {
			// The server answers "no such UIN" and "not your UIN" identically, on purpose - see
			// Rule 4(4) and App\Support\TenancyAccess on the backend. Do not try to tell them
			// apart here, or to soften the wording into something that hints at which one it was.
			const fallback =
				err?.response?.status === 429
					? 'Too many lookups. Wait a minute and try again.'
					: errorFallback
			setStatus({
				type: 'error',
				message: err?.response?.data?.message || fallback,
			})
		} finally {
			setLoading(false)
		}
	}

	if (modern) {
		return (
			<div
				className={`form-i-uin-lookup flex flex-col gap-3 ${
					centered ? 'form-i-uin-lookup--center mx-auto w-full max-w-3xl py-4 sm:py-6' : ''
				}`}
			>
				<div
					className={`flex flex-row flex-wrap items-center gap-x-1.5 gap-y-0 text-[15px] font-semibold text-[#151717] ${
						centered ? 'justify-center text-center' : ''
					}`}
				>
					<span>{label}</span>
					{required ? <span className="text-red-500">*</span> : null}
				</div>
				<div
					className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
						centered ? 'sm:gap-3' : 'sm:gap-2.5'
					}`}
				>
					<div className="form-i-field form-i-uin-field flex h-[52px] min-w-0 w-full flex-1 items-stretch overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white transition-[border-color] duration-200 ease-in-out focus-within:border-[#6d28d9]">
						<span className="form-i-icon-gutter" aria-hidden>
							<IdCard size={18} strokeWidth={2} />
						</span>
						<input
							type="text"
							value={value}
							onChange={(e) => {
								onChange(e.target.value)
								if (status) setStatus(null)
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									if (!loading) handleLookup()
								}
							}}
							required={required}
							placeholder="e.g. ATRMS-01012026-0303"
							spellCheck={false}
							autoCapitalize="characters"
							aria-label={label}
							className="form-i-control form-i-uin-input h-full w-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-left outline-none"
						/>
					</div>
					<button
						type="button"
						onClick={handleLookup}
						disabled={loading}
						className="inline-flex h-[52px] w-full shrink-0 items-center justify-center rounded-[10px] border-0 bg-[#6d28d9] px-5 text-[15px] font-medium text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[12rem]"
					>
						{loading ? loadingLabel : actionLabel}
					</button>
				</div>
				{status ? (
					<p
						className={`m-0 text-sm leading-relaxed ${
							status.type === 'success' ? 'text-emerald-700' : 'text-red-600'
						} ${centered ? 'text-center' : ''}`}
						role="status"
					>
						{status.message}
					</p>
				) : (
					<p
						className={`m-0 text-sm leading-relaxed text-slate-500 ${
							centered ? 'text-center' : ''
						}`}
					>
						{hint ||
							'Enter the Tenancy UIN issued for your tenancy and load details. Only a party to that tenancy may load the record.'}
					</p>
				)}
			</div>
		)
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
						{loading ? loadingLabel : actionLabel}
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
					{hint ||
						'Enter the Tenancy UIN issued for your tenancy and fetch details to auto-fill matching fields below. Tenancy details can only be fetched by a party to that tenancy.'}
				</p>
			)}
		</div>
	)
}

export default TenancyUinLookup
