import { STATUS, STATUS_LABELS } from '../constants/status'
import { APPLICATION_TYPES, APPLICATION_LABELS } from '../constants/application'
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES } from '../constants/roles'
import { ROLE_LABELS, getRoleLabel } from '../constants/roleLabels'

const RENT_AUTHORITY_FORM_TYPES = new Set([
	APPLICATION_TYPES.RENT_AUTHORITY_FILING,
	APPLICATION_TYPES.RENT_REVISION,
	APPLICATION_TYPES.OTHER_CHARGES_REVISION,
	APPLICATION_TYPES.VALUER_APPOINTMENT,
])

const RENT_COURT_FORM_TYPES = new Set([
	APPLICATION_TYPES.RENT_COURT_POSSESSION,
	APPLICATION_TYPES.RENT_COURT_FILING,
	APPLICATION_TYPES.RENT_COURT_APPEAL,
])

const RENT_TRIBUNAL_FORM_TYPES = new Set([APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL])

const WORKFLOW_ORDER = [
	STATUS.DRAFT,
	STATUS.PARTIAL,
	STATUS.SUBMITTED,
	STATUS.IN_REVIEW,
	STATUS.COMPLETED,
	STATUS.APPROVED,
	STATUS.REJECTED,
]

function normalizeStatus(status) {
	const raw = String(status || '').trim()
	const upper = raw.toUpperCase()
	if (upper === 'UNDER PROCESS' || upper === 'UNDER_PROCESS') return STATUS.SUBMITTED
	if (raw === 'Under process') return STATUS.SUBMITTED
	return upper
}

function formatTimestamp(value) {
	if (!value) return null
	try {
		return new Date(value).toLocaleString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	} catch {
		return null
	}
}

function statusRank(status) {
	const idx = WORKFLOW_ORDER.indexOf(status)
	return idx === -1 ? 0 : idx
}

function resolveState(stepStatus, currentStatus, isTerminal) {
	const stepRank = statusRank(stepStatus)
	const currentRank = statusRank(currentStatus)

	if (currentStatus === STATUS.REJECTED) {
		if (stepStatus === STATUS.REJECTED) return 'warning'
		if (stepRank < statusRank(STATUS.SUBMITTED)) return 'pending'
		return stepRank <= currentRank ? 'completed' : 'pending'
	}

	if (stepRank < currentRank) return 'completed'
	if (stepRank === currentRank && !isTerminal) return 'in_progress'
	if (stepRank === currentRank && isTerminal) return 'completed'
	return 'pending'
}

export function isTenancyApplication(application = {}) {
	const type = String(
		application.form_type || application.application_type || application.form_key || ''
	).toLowerCase()
	return (
		application.source_type === 'tenancy' ||
		type.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) ||
		type.includes('tenancy')
	)
}

function buildTenancyPartySubsteps(application) {
	const initiatorDone = Boolean(application.initiator_completed)
	const secondDone = Boolean(application.second_party_completed)
	const initiatorLabel =
		application.initiator_role === 'LANDLORD' ? 'Landlord details' : 'Tenant details'
	const secondLabel =
		application.initiator_role === 'LANDLORD' ? 'Tenant details' : 'Landlord details'

	return [
		{
			id: 'initiator',
			title: initiatorLabel,
			state: initiatorDone ? 'completed' : 'in_progress',
		},
		{
			id: 'second-party',
			title: secondLabel,
			state: secondDone ? 'completed' : initiatorDone ? 'in_progress' : 'pending',
		},
	]
}

function buildFromMovementHistory(application, currentStatus) {
	const history = application.movement_history || []
	const steps = history.map((entry, index) => {
		const entryStatus = normalizeStatus(entry.status)
		const isLast = index === history.length - 1
		const isTerminal = [STATUS.COMPLETED, STATUS.APPROVED, STATUS.REJECTED].includes(currentStatus)

		let state = 'completed'
		if (isLast) {
			if (currentStatus === STATUS.REJECTED) state = 'warning'
			else if (isTerminal) state = 'completed'
			else state = 'in_progress'
		}

		return {
			id: `movement-${index}`,
			title: entry.action || STATUS_LABELS[entryStatus] || entry.status || 'Status update',
			description: entry.current_with ? `Held with ${entry.current_with}` : undefined,
			timestamp: formatTimestamp(entry.moved_at),
			state,
			badge: state === 'in_progress' ? 'in-progress' : state === 'warning' ? 'rejected' : state,
		}
	})

	if (currentStatus === STATUS.REJECTED && !steps.some((s) => s.state === 'warning')) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message || 'See remarks from the reviewing officer.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
	}

	if (application.uid && currentStatus === STATUS.COMPLETED) {
		steps.push({
			id: 'uin',
			title: 'UIN issued',
			description: application.uid ? `Unique ID: ${application.uid}` : undefined,
			state: 'completed',
			badge: 'completed',
		})
	}

	return steps
}

function buildTenancySteps(application, currentStatus) {
	const steps = []

	if (currentStatus === STATUS.DRAFT || Number(application.wizard_step) > 0) {
		steps.push({
			id: 'draft',
			title: 'Application draft',
			description:
				Number(application.wizard_step) > 0
					? `Form progress: step ${application.wizard_step} of 4`
					: 'Saved but not yet submitted.',
			timestamp: formatTimestamp(application.updated_at),
			state: currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
			badge: currentStatus === STATUS.DRAFT ? 'in-progress' : 'completed',
		})
	}

	const partyStep = {
		id: 'parties',
		title: 'Landlord & tenant details',
		description: 'Both parties must complete their sections.',
		substeps: buildTenancyPartySubsteps(application),
		state: resolveState(
			STATUS.PARTIAL,
			currentStatus,
			[STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
		),
		badge:
			currentStatus === STATUS.PARTIAL
				? 'in-progress'
				: statusRank(currentStatus) > statusRank(STATUS.PARTIAL)
					? 'completed'
					: 'pending',
	}

	if (
		currentStatus === STATUS.PARTIAL ||
		currentStatus === STATUS.DRAFT ||
		!application.initiator_completed ||
		!application.second_party_completed
	) {
		steps.push(partyStep)
	}

	steps.push({
		id: 'submitted',
		title: 'Submitted to Rent Authority',
		description: application.current_with
			? `Currently with ${application.current_with}`
			: 'Queued for departmental processing.',
		timestamp: formatTimestamp(application.created_at),
		state: resolveState(
			STATUS.SUBMITTED,
			currentStatus,
			[STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
		),
		badge:
			currentStatus === STATUS.SUBMITTED || currentStatus === STATUS.UNDER_PROCESS
				? 'in-progress'
				: statusRank(currentStatus) > statusRank(STATUS.SUBMITTED)
					? 'completed'
					: 'pending',
	})

	if (currentStatus === STATUS.REJECTED) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message || 'Contact the helpdesk for clarification.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
		return steps
	}

	steps.push({
		id: 'completed',
		title: application.uid ? 'UIN issued' : 'Certificate completed',
		description: application.uid
			? `Your Unique Identification Number is ${application.uid}.`
			: 'Final approval and certificate issuance.',
		timestamp: formatTimestamp(application.approved_at || application.updated_at),
		state: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
			? 'completed'
			: 'pending',
		badge: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus) ? 'completed' : 'pending',
	})

	return steps
}

function getOfficeReviewLabel(application) {
	const assigned = application.assigned_to_role
	if (assigned) return getRoleLabel(assigned)

	const formType = String(application.form_type || application.application_type || '')
	if (RENT_TRIBUNAL_FORM_TYPES.has(formType)) return ROLE_LABELS[ROLES.RENT_TRIBUNAL]
	if (RENT_COURT_FORM_TYPES.has(formType)) return ROLE_LABELS[ROLES.RENT_COURT]
	if (RENT_AUTHORITY_FORM_TYPES.has(formType)) return ROLE_LABELS[ROLES.RENT_AUTHORITY]
	return 'Reviewing office'
}

function buildOfficeReviewDescription(application, currentStatus) {
	const office = getOfficeReviewLabel(application)
	const at = formatTimestamp(application.forwarded_at)

	if ([STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)) {
		const by = application.approved_by?.name
			? `Approved by ${application.approved_by.name} (${office}).`
			: `Final decision recorded by ${office}.`
		return application.approval_message
			? `${by} Message: ${application.approval_message}`
			: by
	}

	if (currentStatus === STATUS.IN_REVIEW) {
		return at
			? `Under review by ${office} since ${at}.`
			: `Awaiting final decision by ${office}.`
	}

	return `After assistant verification, the file is reviewed by ${office}.`
}

function buildServiceFormSteps(application, currentStatus) {
	const pastSubmitted = statusRank(currentStatus) > statusRank(STATUS.DRAFT)
	const assistantDone = statusRank(currentStatus) > statusRank(STATUS.SUBMITTED)
	const office = getOfficeReviewLabel(application)

	const steps = [
		{
			id: 'draft',
			title: 'Draft saved',
			description: 'Application saved on the portal.',
			timestamp: formatTimestamp(application.updated_at),
			state: currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
			badge: currentStatus === STATUS.DRAFT ? 'in-progress' : 'completed',
		},
		{
			id: 'submitted',
			title: 'Submitted by applicant',
			description: pastSubmitted
				? 'Received in the district queue.'
				: 'Waiting for the applicant to submit.',
			timestamp: formatTimestamp(application.created_at),
			state: pastSubmitted ? 'completed' : 'pending',
			badge: pastSubmitted ? 'completed' : 'pending',
		},
		{
			id: 'assistant',
			title: 'Assistant review',
			description: buildAssistantReviewDescription(application, null, currentStatus),
			timestamp: formatTimestamp(application.forwarded_at),
			state: currentStatus === STATUS.SUBMITTED
				? 'in_progress'
				: assistantDone
					? 'completed'
					: 'pending',
			badge: currentStatus === STATUS.SUBMITTED
				? 'in-progress'
				: assistantDone
					? 'completed'
					: 'pending',
		},
		{
			id: 'office-review',
			title: `${office} review`,
			description: buildOfficeReviewDescription(application, currentStatus),
			timestamp: formatTimestamp(application.approved_at || application.forwarded_at),
			state:
				currentStatus === STATUS.IN_REVIEW
					? 'in_progress'
					: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
						? 'completed'
						: 'pending',
			badge:
				currentStatus === STATUS.IN_REVIEW
					? 'in-progress'
					: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
						? 'completed'
						: 'pending',
		},
	]

	if (currentStatus === STATUS.REJECTED) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message
				? `Reason: ${application.rejection_message}`
				: 'Reason shared with the applicant.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
		return steps.filter((step) => step.id !== 'completed')
	}

	steps.push({
		id: 'completed',
		title: 'Completed',
		description: application.approval_message
			? `Approved. Message: ${application.approval_message}`
			: 'Application processed successfully.',
		timestamp: formatTimestamp(application.approved_at),
		state: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus) ? 'completed' : 'pending',
		badge: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus) ? 'completed' : 'pending',
	})

	if (currentStatus !== STATUS.DRAFT) {
		return steps.filter((step) => step.id !== 'draft')
	}

	return steps
}

function getForwardTargetLabel(application, viewerRole) {
	const assigned = application.assigned_to_role
	if (assigned) return getRoleLabel(assigned)
	if (viewerRole === ROLES.RA_ASSISTANT) return ROLE_LABELS[ROLES.RENT_AUTHORITY]
	if (viewerRole === ROLES.RC_ASSISTANT) return ROLE_LABELS[ROLES.RENT_COURT]
	if (viewerRole === ROLES.RT_ASSISTANT) return ROLE_LABELS[ROLES.RENT_TRIBUNAL]
	return getOfficeReviewLabel(application)
}

function isForwardedToOffice(application, currentStatus) {
	return (
		Boolean(application.forwarded_at) ||
		currentStatus === STATUS.IN_REVIEW ||
		[STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
	)
}

function buildAssistantReviewDescription(application, viewerRole, currentStatus) {
	const target = getForwardTargetLabel(application, viewerRole)
	const forwarded = isForwardedToOffice(application, currentStatus)
	const at = formatTimestamp(application.forwarded_at)

	if (forwarded && target) {
		const by = application.forwarded_by?.name
			? ` Forwarded by ${application.forwarded_by.name}.`
			: ''
		const remarks = application.forward_remarks
			? ` Remarks: ${application.forward_remarks}`
			: ''
		return at
			? `Forwarded to ${target} on ${at}.${by}${remarks}`
			: `Forwarded to ${target} for final review.${by}${remarks}`
	}

	if (target) {
		return `Not yet forwarded. After verification, send to ${target} or reject with a reason.`
	}

	return 'Verify the application, then forward or reject with a reason.'
}

function getPrincipalOfficeLabel(viewerRole) {
	return ROLE_LABELS[viewerRole] || getRoleLabel(viewerRole) || 'Office'
}

function adaptStepsForViewer(steps, viewerRole, application, currentStatus) {
	let result = [...steps]

	if (viewerRole && ASSISTANT_ROLES.includes(viewerRole)) {
		const showCompleted = [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
		const forwarded = isForwardedToOffice(application, currentStatus)

		result = result
			.filter((step) => {
				if (step.id === 'principal' || step.id === 'office-review') return false
				if (step.id === 'completed' && !showCompleted) return false
				const title = String(step.title || '').toLowerCase()
				if (title.includes('principal officer')) return false
				if (title === 'completed' && !showCompleted) return false
				return true
			})
			.map((step) => {
				if (step.id !== 'assistant') return step
				const target = getForwardTargetLabel(application, viewerRole)
				const forwarded = isForwardedToOffice(application, currentStatus)
				return {
					...step,
					title:
						forwarded && target ? `Forwarded to ${target}` : 'Assistant review',
					description: buildAssistantReviewDescription(
						application,
						viewerRole,
						currentStatus
					),
					state: forwarded
						? 'completed'
						: currentStatus === STATUS.SUBMITTED
							? 'in_progress'
							: step.state,
					badge: forwarded
						? 'completed'
						: currentStatus === STATUS.SUBMITTED
							? 'in-progress'
							: step.badge,
					timestamp: forwarded
						? formatTimestamp(application.forwarded_at) || step.timestamp
						: step.timestamp,
				}
			})
	}

	if (viewerRole && PRINCIPAL_ROLES.includes(viewerRole)) {
		const office = getPrincipalOfficeLabel(viewerRole)

		result = result
			.filter((step) => {
				const title = String(step.title || '').toLowerCase()
				return !title.includes('principal officer') && step.id !== 'principal'
			})
			.map((step) => {
				if (step.id !== 'office-review') return step

				return {
					...step,
					title: `${office} review`,
					description: application.approved_by?.name
						? `Decision recorded by ${application.approved_by.name}.`
						: currentStatus === STATUS.IN_REVIEW
							? `Awaiting your decision as ${office}.`
							: `Final scrutiny and approval by ${office}.`,
				}
			})
	}

	// Citizens, super admin, district admin: never show legacy principal-officer step
	result = result.filter((step) => {
		if (step.id === 'principal') return false
		const title = String(step.title || '').toLowerCase()
		return !title.includes('principal officer')
	})

	return result
}

/** Office an assistant forwards applications to (by assistant role). */
export function getAssistantForwardOfficeLabel(viewerRole) {
	if (viewerRole === ROLES.RA_ASSISTANT) return ROLE_LABELS[ROLES.RENT_AUTHORITY]
	if (viewerRole === ROLES.RC_ASSISTANT) return ROLE_LABELS[ROLES.RENT_COURT]
	if (viewerRole === ROLES.RT_ASSISTANT) return ROLE_LABELS[ROLES.RENT_TRIBUNAL]
	return 'the reviewing office'
}

/**
 * Build timeline steps for the status progress modal.
 * @param {object} application Row from list APIs
 * @param {{ viewerRole?: string }} options Viewer role for role-specific timelines
 * @returns {{ steps: object[], currentLabel: string, applicationNo: string }}
 */
export function buildApplicationStatusProgress(application = {}, options = {}) {
	const { viewerRole } = options
	const currentStatus = normalizeStatus(application.status)
	const isTenancy = isTenancyApplication(application)

	let steps = []
	if (Array.isArray(application.movement_history) && application.movement_history.length > 0) {
		steps = buildFromMovementHistory(application, currentStatus)
	} else if (isTenancy) {
		steps = buildTenancySteps(application, currentStatus)
	} else {
		steps = buildServiceFormSteps(application, currentStatus)
	}

	steps = adaptStepsForViewer(steps, viewerRole, application, currentStatus)

	return {
		steps,
		currentLabel: STATUS_LABELS[currentStatus] || application.status || 'Unknown',
		applicationNo: application.application_no || '—',
		formLabel:
			APPLICATION_LABELS[application.form_type] ||
			APPLICATION_LABELS[application.application_type] ||
			application.application_type ||
			application.form_type ||
			(isTenancy ? 'Tenancy certificate' : 'Application'),
	}
}
