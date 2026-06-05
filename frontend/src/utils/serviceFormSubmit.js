export function getServiceFormSuccessMessage(data, fallback) {
	return data?.message || fallback
}

export function getTenancySubmitSuccessMessage(data, applyType) {
	const appNo = data?.application_no

	if (data?.message) {
		return appNo ? `${data.message} Application No: ${appNo}.` : data.message
	}

	const fallbackNo = appNo || 'your application'
	const isJoint = String(applyType || '').toLowerCase() === 'joint'

	if (isJoint) {
		return `Application ${fallbackNo} submitted. The other party must complete their details — share the join link from UIN Status.`
	}

	return `Application ${fallbackNo} submitted successfully.`
}

export function completeServiceFormSubmit(navigate, message) {
	navigate('/dashboard', {
		replace: true,
		state: { successMessage: message },
	})
}
