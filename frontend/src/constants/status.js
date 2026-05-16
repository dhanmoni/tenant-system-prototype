/**
 * Application Status Constants
 * Matches backend statuses in ApplicationWorkflowController
 */
export const STATUS = {
	PENDING: 'PENDING', // Used for user registration/approval
	SUBMITTED: 'SUBMITTED', // Initial state after user submits
	IN_REVIEW: 'IN_REVIEW', // Forwarded from Assistant to Principal
	REJECTED: 'REJECTED', // Rejected by Assistant or Principal
	APPROVED: 'APPROVED', // Final approval by Principal (RA/RC/RT)
	COMPLETED: 'COMPLETED', // Often used interchangeably with APPROVED
	UNDER_PROCESS: 'UNDER_PROCESS', // Display state for SUBMITTED in some views
}

export const STATUS_LABELS = {
	[STATUS.PENDING]: 'Pending',
	[STATUS.SUBMITTED]: 'Submitted',
	[STATUS.IN_REVIEW]: 'In Review',
	[STATUS.REJECTED]: 'Rejected',
	[STATUS.APPROVED]: 'Approved',
	[STATUS.COMPLETED]: 'Completed',
	[STATUS.UNDER_PROCESS]: 'Under Process',
}

export const STATUS_COLORS = {
	[STATUS.PENDING]: 'warning',
	[STATUS.SUBMITTED]: 'info',
	[STATUS.IN_REVIEW]: 'primary',
	[STATUS.REJECTED]: 'danger',
	[STATUS.APPROVED]: 'success',
	[STATUS.COMPLETED]: 'success',
	[STATUS.UNDER_PROCESS]: 'info',
}
