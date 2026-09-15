import { Info } from 'lucide-react'

/** Quiet helper under UIN-loaded applicant details — not an alert banner. */
function UinPrefillNotice({
	message = 'Filled from UIN / profile — please confirm.',
}) {
	return (
		<p className="sf-uin-prefill-note" role="status">
			<Info size={14} strokeWidth={2.25} className="sf-uin-prefill-note__icon" aria-hidden />
			<span>{message}</span>
		</p>
	)
}

export default UinPrefillNotice
