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
import {
	describeMatter,
	describeRepairItem,
	describeService,
	ESSENTIAL_SERVICES,
	RA_MATTER,
	RA_MATTER_OPTIONS,
	REPAIR_PARTS,
	SERVICE_OTHER,
} from '../constants/rentAuthorityMatters'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function Form6RentAuthorityFilingPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [tenancyUIN, setTenancyUIN] = useState('')

	// The account already holds these. Seeded at mount, not fixed: every one stays editable,
	// and the filer is the one asserting them.
	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)

	const [oppositePartyName, setOppositePartyName] = useState('')
	const [oppositePartyResidentialAddress, setOppositePartyResidentialAddress] = useState('')

	// Rule 11(1) routes Act ss. 10, 14, 15 and 20 through this one form.
	const [statutoryMatter, setStatutoryMatter] = useState(RA_MATTER.SECTION_10)
	const [repairItems, setRepairItems] = useState([])
	const [essentialServices, setEssentialServices] = useState([])
	const [essentialServiceOther, setEssentialServiceOther] = useState('')

	const [particularsOfViolation, setParticularsOfViolation] = useState('')
	// Paragraph 2 is a declaration the filer accepts, not text they write.
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
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
		setVerification((current) => (current.nameEdited ? current : { ...current, name: applicantName }))
	}, [applicantName])

	useEffect(() => {
		setVerification((current) =>
			current.addressEdited ? current : { ...current, address: applicantResidentialAddress }
		)
	}, [applicantResidentialAddress])

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/rent-authority-filing-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form IV submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form IV')
			setError(msg)
		}
	})

	const isRepairs = statutoryMatter === RA_MATTER.SECTION_15
	const isServices = statutoryMatter === RA_MATTER.SECTION_20
	const otherServiceChosen = isServices && essentialServices.includes(SERVICE_OTHER)

	const toggleRepairItem = useCallback((code) => {
		setRepairItems((current) =>
			current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
		)
	}, [])

	const toggleService = useCallback((code) => {
		setEssentialServices((current) =>
			current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
		)
	}, [])

	const submit = useCallback(async () => {
		setError('')

		if (!jurisdictionAccepted) {
			setError('Accept the declaration at paragraph 2 before filing.')
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

		if (isRepairs && repairItems.length === 0) {
			setError('Select the Second Schedule item or items in dispute.')
			return false
		}
		if (isServices && essentialServices.length === 0) {
			setError('Select the essential supply or service that has been withheld.')
			return false
		}
		if (otherServiceChosen && !essentialServiceOther.trim()) {
			setError('Describe the other essential service that has been withheld.')
			return false
		}

		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('tenancy_uin', tenancyUIN.trim())

			formData.append('applicant_name', applicantName.trim())
			formData.append(
				'applicant_residential_address',
				applicantResidentialAddress.trim()
			)

			formData.append('opposite_party_name', oppositePartyName.trim())
			formData.append(
				'opposite_party_residential_address',
				oppositePartyResidentialAddress.trim()
			)

			formData.append('statutory_matter', statutoryMatter)
			if (isRepairs) {
				repairItems.forEach((code) => formData.append('repair_items[]', code))
			}
			if (isServices) {
				essentialServices.forEach((code) => formData.append('essential_services[]', code))
				if (otherServiceChosen) {
					formData.append('essential_service_other', essentialServiceOther.trim())
				}
			}

			if (particularsOfViolation.trim()) {
				formData.append('particulars_of_violation', particularsOfViolation.trim())
			}
			formData.append('jurisdiction_declaration_accepted', '1')
			if (factsOfCase.trim()) formData.append('facts_of_case', factsOfCase.trim())
			if (groundsForRelief.trim()) formData.append('grounds_for_relief', groundsForRelief.trim())
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
		applicantName,
		applicantResidentialAddress,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionAccepted,
		listOfEnclosures,
		hasPriorProceedings,
		priorProceedings,
		oppositePartyName,
		oppositePartyResidentialAddress,
		particularsOfViolation,
		reliefSought,
		signatureImage,
		signatureName,
		verification,
		tenancyUIN,
		statutoryMatter,
		repairItems,
		essentialServices,
		essentialServiceOther,
		isRepairs,
		isServices,
		otherServiceChosen,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [previewItem('Tenancy UIN', tenancyUIN)]),
				previewSection('Parties', [
					previewItem('Applicant name', applicantName),
					previewItem('Applicant address', applicantResidentialAddress),
					previewItem('Opposite party name', oppositePartyName),
					previewItem('Opposite party address', oppositePartyResidentialAddress),
				]),
				previewSection('Matter applied under', [
					previewItem('Provision', describeMatter(statutoryMatter)),
					previewItem(
						'Second Schedule items in dispute',
						isRepairs ? repairItems.map(describeRepairItem).join('\n') : ''
					),
					previewItem(
						'Essential services withheld',
						isServices ? essentialServices.map(describeService).join('\n') : ''
					),
					previewItem('Other essential service', otherServiceChosen ? essentialServiceOther : ''),
				]),
				previewSection('Case details', [
					previewItem('Particulars of violation', particularsOfViolation),
					previewItem(
						'Jurisdiction declared',
						jurisdictionAccepted ? declarationText(DECLARATION.FORM_IV_JURISDICTION) : ''
					),
					previewItem('Facts of the case', factsOfCase),
					previewItem('Grounds for relief', groundsForRelief),
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
								: declarationText(DECLARATION.FORM_IV_PRIOR_PROCEEDINGS)
					),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', listOfEnclosures),
				]),
				previewSection('Verification', [
					previewItem('Verification', composeVerification(VERIFICATION.FORM_IV, verification)),
					previewItem('Place', verification.place),
					previewItem('Date', 'Stamped on submission'),
					previewItem('Name against the signature', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			applicantName,
			applicantResidentialAddress,
			factsOfCase,
			groundsForRelief,
			interimOrderSought,
			jurisdictionAccepted,
			listOfEnclosures,
			hasPriorProceedings,
		priorProceedings,
			oppositePartyName,
			oppositePartyResidentialAddress,
			particularsOfViolation,
			reliefSought,
			signatureImage,
			signatureName,
		verification,
			tenancyUIN,
			statutoryMatter,
			repairItems,
			essentialServices,
			essentialServiceOther,
			isRepairs,
			isServices,
			otherServiceChosen,
												]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.RENT_AUTHORITY_FILING, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentialAddress,
			setOppositePartyName,
			setOppositePartyResidentialAddress,
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

				<fieldset className="tenancy-fieldset">
					<legend>A. Name of the Applicant</legend>
					<label>
						<span className="label-text required">Name of the Applicant</span>
						<span className="field-note">Add description and the residential address on which the service of notices is to be effected on the Applicant</span>
						<input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Residential address of the Applicant</span>
						<textarea
							value={applicantResidentialAddress}
							onChange={(e) => setApplicantResidentialAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>B. Name of the Opposite Party</legend>
					<label>
						<span className="label-text required">Name of the Opposite Party</span>
						<span className="field-note">Add description and the residential address on which the service of notices is to be effected on the Opposite Party</span>
						<input type="text" value={oppositePartyName} onChange={(e) => setOppositePartyName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Residential address of the Opposite Party</span>
						<textarea
							value={oppositePartyResidentialAddress}
							onChange={(e) => setOppositePartyResidentialAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>Matter applied under</legend>
					<p className="field-note tenancy-field-full">
						Rule 11(1) provides that an application to the Rent Authority under sections 10, 14, 15
						and 20 of the Act shall be made in Form IV. Select the provision this application is
						made under, so that the Rent Authority takes up the right inquiry.
					</p>

					<div className="tenancy-field-full ground-choice-group" role="radiogroup" aria-label="Provision applied under">
						{RA_MATTER_OPTIONS.map((option) => (
							<label key={option.value} className="ground-choice">
								<input
									type="radio"
									name="statutory_matter"
									value={option.value}
									checked={statutoryMatter === option.value}
									onChange={() => setStatutoryMatter(option.value)}
								/>
								<span className="ground-choice__body">
									<span className="ground-choice__cite">{option.citation}</span>
									<span className="ground-choice__label">{option.heading}</span>
									<span className="ground-choice__text">{option.note}</span>
								</span>
							</label>
						))}
					</div>

					{isRepairs ? (
						<div className="tenancy-field-full">
							<p className="label-text required">Second Schedule items in dispute</p>
							<p className="field-note">
								Unless otherwise agreed in the tenancy agreement, the landlord is responsible for
								Part A and the tenant for Part B. Select every item this application concerns.
							</p>
							{REPAIR_PARTS.map((part) => (
								<div key={part.part} className="schedule-part">
									<p className="schedule-part__title">{part.title}</p>
									<div className="ground-choice-group">
										{part.items.map((item) => (
											<label key={item.code} className="ground-choice ground-choice--compact">
												<input
													type="checkbox"
													value={item.code}
													checked={repairItems.includes(item.code)}
													onChange={() => toggleRepairItem(item.code)}
												/>
												<span className="ground-choice__body">
													<span className="ground-choice__text">{item.text}</span>
												</span>
											</label>
										))}
									</div>
								</div>
							))}
						</div>
					) : null}

					{isServices ? (
						<div className="tenancy-field-full">
							<p className="label-text required">Essential supply or service withheld</p>
							<p className="field-note">
								The Explanation to section 20 states that essential services includes supply of
								water, electricity, piped cooking gas supply, lights in passages, lifts and on
								staircase, conservancy, parking, communication links, sanitary services and security
								fixtures and features. Because it says includes, the list is not exhaustive.
							</p>
							<div className="ground-choice-group">
								{ESSENTIAL_SERVICES.map((service) => (
									<label key={service.code} className="ground-choice ground-choice--compact">
										<input
											type="checkbox"
											value={service.code}
											checked={essentialServices.includes(service.code)}
											onChange={() => toggleService(service.code)}
										/>
										<span className="ground-choice__body">
											<span className="ground-choice__text">{service.label}</span>
										</span>
									</label>
								))}
							</div>

							{otherServiceChosen ? (
								<label className="schedule-other">
									<span className="label-text required">Describe the other essential service</span>
									<input
							required
										type="text"
										value={essentialServiceOther}
										onChange={(e) => setEssentialServiceOther(e.target.value)}
										maxLength={255}
									/>
								</label>
							) : null}
						</div>
					) : null}
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>Details of application</legend>
					<label className="tenancy-field-full">
						<span className="label-text required">1. Particulars of violation against which the present application is made</span>
						<textarea
							required value={particularsOfViolation} onChange={(e) => setParticularsOfViolation(e.target.value)} rows={3} />
					</label>
					<DeclarationCheckbox
						fieldId={DECLARATION.FORM_IV_JURISDICTION}
						label="2. Jurisdiction of the Rent Authority"
						checked={jurisdictionAccepted}
						onChange={setJurisdictionAccepted}
					/>
					<label className="tenancy-field-full">
						<span className="label-text required">3. Facts of the case</span>
						<span className="field-note">Give here a concise statement of facts in a chronological order, each paragraph containing as nearly as possible a separate issue or fact.</span>
						<textarea
							required value={factsOfCase} onChange={(e) => setFactsOfCase(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">4. Grounds for relief</span>
						<textarea
							required value={groundsForRelief} onChange={(e) => setGroundsForRelief(e.target.value)} rows={3} />
					</label>
					<PriorProceedingsField
						fieldId={DECLARATION.FORM_IV_PRIOR_PROCEEDINGS}
						label="5. Matters not previously filed or pending with any other court"
						hasPrior={hasPriorProceedings}
						onHasPriorChange={setHasPriorProceedings}
						entries={priorProceedings}
						onEntriesChange={setPriorProceedings}
					/>
					<label className="tenancy-field-full">
						<span className="label-text required">6. Relief sought</span>
						<span className="field-note">In view of the grounds mentioned in para 4 above, the applicant prays for the following relief(s). Specify below the relief(s) sought explaining the grounds for such relief(s) and the legal provisions, if any, relied upon.</span>
						<textarea
							required value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">7. Interim order, if any prayed for</span>
						<span className="field-note">Pending final decision on the application, the applicant seeks the following interim relief. Give here the nature of the interim relief prayed for.</span>
						<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">8. List of enclosures</span>
						<span className="field-note">Rule 11(1) allows the application to be accompanied by affidavits and documents, if any. Attachments are optional.</span>
						<textarea value={listOfEnclosures} onChange={(e) => setListOfEnclosures(e.target.value)} rows={3} />
					</label>
				</fieldset>

				<VerificationClause
					prefilled={hasProfileDefaults(profile)}
					fieldId={VERIFICATION.FORM_IV}
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
				title="Review Form IV"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form IV"
			/>
		</div>
	)
}



