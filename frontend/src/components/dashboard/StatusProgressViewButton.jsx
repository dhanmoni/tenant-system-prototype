import { useState } from 'react'
import { Icon } from './Icons'
import ApplicationStatusProgressModal from './ApplicationStatusProgressModal'

/**
 * Icon button that opens the shared application status progress modal.
 */
function StatusProgressViewButton({
	application,
	className = '',
	title = 'View status progress',
	variant = 'admin',
}) {
	const [open, setOpen] = useState(false)

	if (!application) return null

	const btnClass =
		variant === 'workspace'
			? `ws-status-action-btn ws-status-action-btn--progress ${className}`.trim()
			: `table-icon-btn table-icon-btn--progress ${className}`.trim()

	return (
		<>
			<button
				type="button"
				className={btnClass}
				title={title}
				aria-label={title}
				onClick={(e) => {
					e.stopPropagation()
					setOpen(true)
				}}
			>
				<Icon name="timeline" className="btn-icon-svg" />
				{variant === 'workspace' ? <span>Progress</span> : null}
			</button>
			<ApplicationStatusProgressModal
				open={open}
				onClose={() => setOpen(false)}
				application={application}
			/>
		</>
	)
}

export default StatusProgressViewButton
