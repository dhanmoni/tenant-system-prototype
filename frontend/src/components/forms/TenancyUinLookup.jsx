import { useId, useState } from 'react'
import { IdCard, Search } from 'lucide-react'
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
	const inputId = useId()
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

	if (modern && centered) {
		return (
			<div className="form-i-uin-lookup form-i-uin-lookup--center sf-uin-search">
				<label className="sf-uin-search__label" htmlFor={inputId}>
					<span>{label}</span>
					{required ? (
						<span className="sf-uin-search__required" aria-hidden>
							*
						</span>
					) : null}
				</label>

				<div className="sf-uin-search__bar">
					<span className="sf-uin-search__icon" aria-hidden>
						<IdCard size={20} strokeWidth={2} />
					</span>
					<input
						id={inputId}
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
						className="sf-uin-search__input"
					/>
					<button
						type="button"
						onClick={handleLookup}
						disabled={loading}
						className="sf-uin-search__submit"
					>
						<Search size={16} strokeWidth={2.25} aria-hidden />
						<span>{loading ? loadingLabel : actionLabel}</span>
					</button>
				</div>

				{status ? (
					<p
						className={`sf-uin-search__status sf-uin-search__status--${status.type}`}
						role="status"
					>
						{status.message}
					</p>
				) : (
					<p className="sf-uin-search__hint">
						{hint ||
							'Enter the Tenancy UIN issued for your tenancy and load details. Only a party to that tenancy may load the record.'}
					</p>
				)}
			</div>
		)
	}

	if (modern) {
		return (
			<div className="form-i-uin-lookup flex flex-col gap-3">
				<div className="flex flex-row flex-wrap items-center gap-x-1.5 gap-y-0 text-[15px] font-semibold text-[#151717]">
					<span>{label}</span>
					{required ? <span className="text-red-500">*</span> : null}
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
					<div className="form-i-field form-i-uin-field flex h-[52px] min-w-0 w-full flex-1 items-stretch overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white transition-[border-color] duration-200 ease-in-out focus-within:border-[#0d47a1]">
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
						className="inline-flex h-[52px] w-full shrink-0 items-center justify-center rounded-[10px] border-0 bg-[#0d47a1] px-5 text-[15px] font-medium text-white transition hover:bg-[#0a3a82] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[12rem]"
					>
						{loading ? loadingLabel : actionLabel}
					</button>
				</div>
				{status ? (
					<p
						className={`m-0 text-sm leading-relaxed ${
							status.type === 'success' ? 'text-emerald-700' : 'text-red-600'
						}`}
						role="status"
					>
						{status.message}
					</p>
				) : (
					<p className="m-0 text-sm leading-relaxed text-slate-500">
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
