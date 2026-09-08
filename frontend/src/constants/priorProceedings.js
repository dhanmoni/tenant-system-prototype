/**
 * Status of a proceeding disclosed under paragraph 5 of Forms II to VI. Mirrors
 * backend/app/Constants/PriorProceedingStatus.php.
 *
 * The printed form asks for two different things depending on status: "the details of the pendency
 * of such cases filed, or if disposed, the decisions of such cases to be enclosed".
 */
export const PRIOR_STATUS = {
	PENDING: 'PENDING',
	DISPOSED: 'DISPOSED',
}

export function emptyPriorProceeding() {
	return {
		case_number: '',
		forum: '',
		filing_date: '',
		status: PRIOR_STATUS.PENDING,
		pendency_details: '',
		decision: '',
	}
}
