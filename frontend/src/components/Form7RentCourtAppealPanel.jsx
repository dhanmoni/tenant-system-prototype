import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import DeclarationCheckbox from './forms/DeclarationCheckbox'
import PriorProceedingsField from './forms/PriorProceedingsField'
import { PRIOR_STATUS } from '../constants/priorProceedings'
import {
	DECLARATION,
	VERIFICATION,
	composeVerification,
	declarationText,
} from '../constants/declarations'
import VerificationClause from './forms/VerificationClause'
import { hasProfileDefaults, profileDefaults } from '../utils/profileAutofill'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function Form7RentCourtAppealPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [rentCourtAt, setRentCourtAt] = useState('')
	const [tenancyUIN, setTenancyUIN] = useState('')

	// The account already holds these. Seeded at mount, not fixed: every one stays editable,
	// and the filer is the one asserting them.
	const profile = useMemo(() => profileDefaults(user), [user])

	const [appellantName, setAppellantName] = useState(profile.name)
	const [appellantResidentialAddress, setAppellantResidentialAddress] = useState(profile.address)

	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')

	const [orderParticularsAgainstWhichAppealMade, setOrderParticularsAgainstWhichAppealMade] =
		useState('')
	// Paragraph 2 is a declaration the filer accepts, not text they write.
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	// Paragraph 3 is a declaration, not a question: the appellant accepts the printed
	// wording rather than describing the limitation position. Must be accepted to file.
	const [limitationAccepted, setLimitationAccepted] = useState(false)
	const [memorandumOfAppeal, setMemorandumOfAppeal] = useState('')
	// Paragraph 5 is a negative declaration with an affirmative branch, so it is a yes/no
	// answer plus, where the answer is yes, the particulars the form requires.
	const [hasPriorProceedings, setHasPriorProceedings] = useState(null)
	const [priorProceedings, setPriorProceedings] = useState([])
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [listOfEnclosures, setListOfEnclosures] = useState('')

	const [signatureName, setSignatureName] = useState(profile.name)
	const [signatureImage, setSignatureImage] = useState(null)
	// The VERIFICATION clause is one sworn sentence, not ten fields, so it is held as one
	// object and rendered as the sentence the Gazette prints. See forms/VerificationClause.
	const [verification, setVerification] = useState({
		name: profile.name,
		relation: 'S/o.',
		relativeName: '',
		age: profile.age,
		address: profile.address,
		place: '',
		paragraphs: {},
	})

	const setVerificationField = useCallback((field, value) => {
		setVerification((current) => ({
			...current,
			[field]: value,
			...(field === 'name' ? { nameEdited: true } : {}),
			...(field === 'address' ? { addressEdited: true } : {}),
		}))
	}, [])

	const setParagraphAnswer = useCallback((number, answer) => {
		setVerification((current) => ({
			...current,
			paragraphs: { ...current.paragraphs, [number]: answer },
		}))
	}, [])

	// Paragraph 1 already names the filer and their address, and the verification opens with the
	// same two facts. They are mirrored across until the filer edits them: a verification naming a
	// different person from the body of the form is a defective filing, and asking for the same
	// thing twice in two places is how that happens.
	useEffect(() => {
		setVerification((current) => (current.nameEdited ? current : { ...current, name: appellantName }))
	}, [appellantName])

	useEffect(() => {
		setVerification((current) =>
			current.addressEdited ? current : { ...current, address: appellantResidentialAddress }
		)
	}, [appellantResidentialAddress])

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/rent-court-appeal-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form V submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form V')
			setError(msg)
		}
	})

	const submit = useCallback(async () => {
		setError('')

		if (!jurisdictionAccepted) {
			setError('Accept the declaration at paragraph 2 before filing.')
			return false
		}

		if (!limitationAccepted) {
			setError('Accept the declaration at paragraph 3 before filing.')
			return false
		}

		if (hasPriorProceedings === null) {
			setError('Answer paragraph 5 before filing.')
			return false
		}

		if (hasPriorProceedings) {
			const incomplete = priorProceedings.some(
				(entry) =>
					!entry.case_number.trim() ||
					!entry.forum.trim() ||
					(entry.status === PRIOR_STATUS.PENDING
						? !entry.pendency_details.trim()
						: !entry.decision.trim())
			)
			if (priorProceedings.length === 0 || incomplete) {
				setError(
					'Give the case number, the court or authority, and the pendency or decision for every case disclosed at paragraph 5.'
				)
				return false
			}
		}
		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('rent_court_at', rentCourtAt.trim())
			formData.append('tenancy_uin', tenancyUIN.trim())

			formData.append('appellant_name', appellantName.trim())
			formData.append('appellant_residential_address', appellantResidentialAddress.trim())

			formData.append('respondent_name', respondentName.trim())
			formData.append('respondent_residential_address', respondentResidentialAddress.trim())

			if (orderParticularsAgainstWhichAppealMade.trim()) {
				formData.append(
					'order_particulars_against_which_appeal_made',
					orderParticularsAgainstWhichAppealMade.trim()
				)
			}
			formData.append('jurisdiction_declaration_accepted', '1')
			formData.append('limitation_declaration_accepted', '1')
			if (memorandumOfAppeal.trim()) formData.append('memorandum_of_appeal', memorandumOfAppeal.trim())
			formData.append('has_prior_proceedings', hasPriorProceedings ? '1' : '0')
			if (hasPriorProceedings) {
				priorProceedings.forEach((entry, i) => {
					formData.append(`prior_proceedings[${i}][case_number]`, entry.case_number.trim())
					formData.append(`prior_proceedings[${i}][forum]`, entry.forum.trim())
					if (entry.filing_date) {
						formData.append(`prior_proceedings[${i}][filing_date]`, entry.filing_date)
					}
					formData.append(`prior_proceedings[${i}][status]`, entry.status)
					if (entry.status === PRIOR_STATUS.PENDING) {
						formData.append(
							`prior_proceedings[${i}][pendency_details]`,
							entry.pendency_details.trim()
						)
					} else {
						formData.append(`prior_proceedings[${i}][decision]`, entry.decision.trim())
					}
				})
			}
			if (reliefSought.trim()) formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) formData.append('interim_order_sought', interimOrderSought.trim())
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

			formData.append('verification_name', verification.name.trim())
			formData.append('verification_relation', verification.relation)
			formData.append('verification_relative_name', verification.relativeName.trim())
			formData.append('verification_age', String(verification.age))
			formData.append('verification_address', verification.address.trim())
			formData.append('verification_place', verification.place.trim())
			// Sent as an object keyed by paragraph number; the server splits it into the two sets the
			// sentence names. The date is not sent - the server stamps it.
			Object.entries(verification.paragraphs).forEach(([number, answer]) => {
				formData.append(`verification_paragraphs[${number}]`, answer)
			})

			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch (err) {
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		appellantName,
		appellantResidentialAddress,
		interimOrderSought,
		jurisdictionAccepted,
		limitationAccepted,
		listOfEnclosures,
		hasPriorProceedings,
		priorProceedings,
		memorandumOfAppeal,
		orderParticularsAgainstWhichAppealMade,
		reliefSought,
		rentCourtAt,
		respondentName,
		respondentResidentialAddress,
		signatureImage,
		signatureName,
		verification,
		tenancyUIN,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [
					previewItem('Rent Court at', rentCourtAt),
					previewItem('Tenancy UIN', tenancyUIN),
				]),
				previewSection('Parties', [
					previewItem('Appellant name', appellantName),
					previewItem('Appellant address', appellantResidentialAddress),
					previewItem('Respondent name', respondentName),
					previewItem('Respondent address', respondentResidentialAddress),
				]),
				previewSection('Case details', [
					previewItem('Order particulars', orderParticularsAgainstWhichAppealMade),
					previewItem(
						'Jurisdiction declared',
						jurisdictionAccepted ? declarationText(DECLARATION.FORM_V_JURISDICTION) : ''
					),
					previewItem(
						'3. Limitation',
						limitationAccepted ? declarationText(DECLARATION.FORM_V_LIMITATION) : ''
					),
					previewItem('Memorandum of appeal', memorandumOfAppeal),
					previewItem(
						'Matters not previously filed',
						hasPriorProceedings === null
							? ''
							: hasPriorProceedings
								? priorProceedings
										.map(
											(entry, i) =>
												`${i + 1}. ${entry.case_number} before ${entry.forum} - ${
													entry.status === PRIOR_STATUS.PENDING
														? `pending: ${entry.pendency_details}`
														: `disposed: ${entry.decision}`
												}`
										)
										.join('\n')
								: declarationText(DECLARATION.FORM_V_PRIOR_PROCEEDINGS)
					),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', listOfEnclosures),
				]),
				previewSection('Verification', [
					previewItem('Verification', composeVerification(VERIFICATION.FORM_V, verification)),
					previewItem('Place', verification.place),
					previewItem('Date', 'Stamped on submission'),
					previewItem('Name against the signature', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			appellantName,
			appellantResidentialAddress,
			interimOrderSought,
			jurisdictionAccepted,
			limitationAccepted,
			listOfEnclosures,
			hasPriorProceedings,
		priorProceedings,
			memorandumOfAppeal,
			orderParticularsAgainstWhichAppealMade,
			reliefSought,
			rentCourtAt,
			respondentName,
			respondentResidentialAddress,
			signatureImage,
			signatureName,
		verification,
			tenancyUIN,
												]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_APPEAL, tenancy, user, {
			setTenancyUIN,
			setRentCourtAt,
			setAppellantName,
			setAppellantResidentialAddress,
			setRespondentName,
			setRespondentResidentialAddress,
		})

	return (
		<div className="dashboard-card service-form-panel">
			{error ? <div className="error" role="alert">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<TenancyUinLookup
					value={tenancyUIN}
					onChange={setTenancyUIN}
					onLoaded={handleTenancyLoaded}
					label="In the matter of Tenancy of Unique Identification Number"
				/>

				<label>
					<span className="label-text required">In the Rent Court at</span>
					<input type="text" value={rentCourtAt} onChange={(e) => setRentCourtAt(e.target.value)} required />
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>A. Name of the Appellant</legend>
					<label>
						<span className="label-text required">Name of the Appellant</span>
						<span className="field-note">Add description and the residential address on which the service of notices is to be effected on the Appellant</span>
						<input type="text" value={appellantName} onChange={(e) => setAppellantName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Residential address of the Appellant</span>
						<textarea value={appellantResidentialAddress} onChange={(e) => setAppellantResidentialAddress(e.target.value)} required rows={3} />
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>B. Name of the Respondent</legend>
					<label>
						<span className="label-text required">Name of the Respondent</span>
						<span className="field-note">Add description and the residential address on which the service of notices is to be effected on the Respondent</span>
						<input type="text" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Residential address of the Respondent</span>
						<textarea value={respondentResidentialAddress} onChange={(e) => setRespondentResidentialAddress(e.target.value)} required rows={3} />
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>Details of appeal</legend>
					<label className="tenancy-field-full">
						<span className="label-text required">1. Particulars of the order of the Rent Authority as against which the appeal is made</span>
						<textarea
							required
							value={orderParticularsAgainstWhichAppealMade}
							onChange={(e) => setOrderParticularsAgainstWhichAppealMade(e.target.value)}
							rows={3}
						/>
					</label>
					<DeclarationCheckbox
						fieldId={DECLARATION.FORM_V_JURISDICTION}
						label="2. Jurisdiction of the Rent Court"
						checked={jurisdictionAccepted}
						onChange={setJurisdictionAccepted}
					/>
					<DeclarationCheckbox
						fieldId={DECLARATION.FORM_V_LIMITATION}
						label="3. Limitation"
						checked={limitationAccepted}
						onChange={setLimitationAccepted}
					/>
					<label className="tenancy-field-full">
						<span className="label-text required">4. Memorandum of Appeal</span>
						<span className="field-note">Grounds for appeal with legal provisions</span>
						<textarea
							required value={memorandumOfAppeal} onChange={(e) => setMemorandumOfAppeal(e.target.value)} rows={3} />
					</label>
					<PriorProceedingsField
						fieldId={DECLARATION.FORM_V_PRIOR_PROCEEDINGS}
						label="5. Matters not previously filed or pending with any other court"
						hasPrior={hasPriorProceedings}
						onHasPriorChange={setHasPriorProceedings}
						entries={priorProceedings}
						onEntriesChange={setPriorProceedings}
					/>
					<label className="tenancy-field-full">
						<span className="label-text required">6. Relief sought</span>
						<span className="field-note">In view of the Memorandum provided in para 4 above, the appellant prays for the following relief(s).</span>
						<textarea
							required value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">7. Interim order, if any prayed for</span>
						<span className="field-note">Pending final decision on the appeal, the appellant seeks the following interim relief. Give here the nature of the interim relief prayed for.</span>
						<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">8. List of enclosures</span>
						<textarea value={listOfEnclosures} onChange={(e) => setListOfEnclosures(e.target.value)} rows={3} />
					</label>
				</fieldset>

				<VerificationClause
					prefilled={hasProfileDefaults(profile)}
					fieldId={VERIFICATION.FORM_V}
					values={verification}
					onChange={setVerificationField}
					onParagraphChange={setParagraphAnswer}
				/>

				<fieldset className="tenancy-fieldset">
					{/* The Gazette prints "Signature of the Applicant" on all five forms, including the
					  * two appeal forms. Reproduced as printed. */}
					<legend>Signature of the Applicant</legend>
					<label>
						<span className="label-text required">Name against the signature</span>
						<input
							type="text"
							value={signatureName}
							onChange={(e) => setSignatureName(e.target.value)}
							required
						/>
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Signature image (optional)</span>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setSignatureImage(e.target.files?.[0] || null)}
						/>
					</label>
				</fieldset>

				<div className="form-actions">
					<button type="button" className="ws-btn ws-btn--outline" onClick={onBack} disabled={submitting}>
						Back
					</button>
					<button type="submit" className="ws-btn ws-btn--primary" disabled={submitting}>
						{submitting ? 'Submitting…' : 'Review & submit'}
					</button>
				</div>
			</form>

			<ServiceFormPreviewModal
				open={previewOpen}
				title="Review Form V"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form V"
			/>
		</div>
	)
}



