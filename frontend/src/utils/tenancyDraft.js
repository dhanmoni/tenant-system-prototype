const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function storageUrl(path) {
	if (!path) return ''
	if (path.startsWith('http')) return path
	return `${API_BASE}/storage/${path}`
}

/** Build multipart FormData for draft save / final submit */
export function buildTenancyFormData(
	state,
	{ wizardStep, includeThroughStep, includeAll = false } = {}
) {
	const {
		tenancyRegistrationDate,
		tenancyOfficeId,
		tenancyVillageWardId,
		initiatorRole,
		applyType,
		landlordName,
		landlordAddress,
		landlordEmail,
		landlordPhone,
		landlordPan,
		landlordAadhar,
		managerName,
		managerAddress,
		managerEmail,
		managerPhone,
		managerPan,
		managerAadhar,
		tenantName,
		tenantAddress,
		tenantEmail,
		tenantPhone,
		tenantPan,
		tenantAadhar,
		tenantPreviousTenancy,
		propertyPossessionDate,
		propertyRentPayable,
		propertyPremisesDescription,
		propertyFurnitureDescription,
		propertyChargeElectricity,
		propertyChargeWater,
		propertyChargeFurnishing,
		propertyChargeOtherServices,
		propertyTenancyDuration,
		agreementFile,
		landlordPhotoFile,
		landlordSignatureFile,
		tenantPhotoFile,
		tenantSignatureFile,
		landlordPanFile,
		tenantPanFile,
		managerPanFile,
	} = state

	const formData = new FormData()
	const through = includeAll
		? 4
		: Math.max(includeThroughStep ?? 0, wizardStep ?? 0, 1)

	if (wizardStep != null) formData.append('wizard_step', String(wizardStep))

	const appendStep1 = through >= 1
	const appendStep2 = through >= 2
	const appendStep3 = through >= 3

	if (appendStep1) {
		formData.append('initiator_role', initiatorRole || '')
		formData.append('registration_date', tenancyRegistrationDate || '')
		formData.append('office_id', tenancyOfficeId || '')
		formData.append('village_ward_id', tenancyVillageWardId || '')
		formData.append('apply_type', applyType || 'Individual')
	}

	if (appendStep2) {
		formData.append('landlord_name', landlordName || '')
		formData.append('landlord_address', landlordAddress || '')
		formData.append('landlord_email', landlordEmail || '')
		formData.append('landlord_phone', landlordPhone || '')
		formData.append('landlord_pan', landlordPan || '')
		if (landlordAadhar) formData.append('landlord_aadhar', landlordAadhar)
		formData.append('manager_name', managerName || '')
		formData.append('manager_address', managerAddress || '')
		formData.append('manager_email', managerEmail || '')
		formData.append('manager_phone', managerPhone || '')
		formData.append('manager_pan', managerPan || '')
		if (managerAadhar) formData.append('manager_aadhar', managerAadhar)
		formData.append('tenant_name', tenantName || '')
		formData.append('tenant_address', tenantAddress || '')
		formData.append('tenant_email', tenantEmail || '')
		formData.append('tenant_phone', tenantPhone || '')
		formData.append('tenant_pan', tenantPan || '')
		if (tenantAadhar) formData.append('tenant_aadhar', tenantAadhar)
		formData.append('tenant_previous_tenancy', tenantPreviousTenancy || '')
		if (propertyPossessionDate) formData.append('property_possession_date', propertyPossessionDate)
		formData.append('property_rent_payable', String(Number(propertyRentPayable) || 0))
		formData.append('property_premises_description', propertyPremisesDescription || '')
		formData.append('property_furniture_description', propertyFurnitureDescription || '')
		formData.append('property_charge_electricity', propertyChargeElectricity || '')
		formData.append('property_charge_water', propertyChargeWater || '')
		formData.append('property_charge_furnishing', propertyChargeFurnishing || '')
		formData.append('property_charge_other_services', propertyChargeOtherServices || '')
		formData.append('property_tenancy_duration', propertyTenancyDuration || '')
	}

	if (appendStep3) {
		if (agreementFile) formData.append('agreement_pdf', agreementFile)
		if (landlordPhotoFile) formData.append('landlord_photo', landlordPhotoFile)
		if (landlordSignatureFile) formData.append('landlord_signature', landlordSignatureFile)
		if (tenantPhotoFile) formData.append('tenant_photo', tenantPhotoFile)
		if (tenantSignatureFile) formData.append('tenant_signature', tenantSignatureFile)
		if (landlordPanFile) formData.append('landlord_pan_file', landlordPanFile)
		if (tenantPanFile) formData.append('tenant_pan_file', tenantPanFile)
		if (managerPanFile) formData.append('manager_pan_file', managerPanFile)
	}

	return formData
}

export function applyDraftToForm(draft, setters, { loadVillageWards } = {}) {
	if (!draft) return

	const {
		setDraftApplicationNo,
		setSavedWizardStep,
		setTenancyStep,
		setInitiatorRole,
		setTenancyRegistrationDate,
		setTenancyOfficeId,
		setTenancyDistrictId,
		setTenancyVillageWardId,
		setLandlordName,
		setLandlordAddress,
		setLandlordEmail,
		setLandlordPhone,
		setLandlordPan,
		setLandlordAadhar,
		setManagerName,
		setManagerAddress,
		setManagerEmail,
		setManagerPhone,
		setManagerPan,
		setManagerAadhar,
		setTenantName,
		setTenantAddress,
		setTenantEmail,
		setTenantPhone,
		setTenantPan,
		setTenantAadhar,
		setTenantPreviousTenancy,
		setPropertyPossessionDate,
		setPropertyRentPayable,
		setPropertyPremisesDescription,
		setPropertyFurnitureDescription,
		setPropertyChargeElectricity,
		setPropertyChargeWater,
		setPropertyChargeFurnishing,
		setPropertyChargeOtherServices,
		setPropertyTenancyDuration,
		setAgreementPreviewUrl,
		setLandlordPhotoPreview,
		setLandlordSignaturePreview,
		setTenantPhotoPreview,
		setTenantSignaturePreview,
	} = setters

	setDraftApplicationNo?.(draft.application_no)
	const step = Math.max(1, Math.min(4, Number(draft.wizard_step) || 1))
	setSavedWizardStep?.(step)
	setTenancyStep?.(step)

	if (draft.initiator_role) setInitiatorRole(draft.initiator_role)
	if (draft.registration_date) setTenancyRegistrationDate(String(draft.registration_date).slice(0, 10))
	if (draft.office_id) setTenancyOfficeId(String(draft.office_id))
	if (draft.village_ward_id) {
		setTenancyVillageWardId(String(draft.village_ward_id))
		const districtId = draft.office?.district_id || draft.village_ward?.district_id
		if (districtId) {
			setTenancyDistrictId(String(districtId))
			loadVillageWards?.(String(districtId))
		}
	}

	setLandlordName(draft.landlord_name || '')
	setLandlordAddress(draft.landlord_address || '')
	setLandlordEmail(draft.landlord_email || '')
	setLandlordPhone(draft.landlord_phone || '')
	setLandlordPan(draft.landlord_pan || '')
	setLandlordAadhar(draft.landlord_aadhar || '')
	setManagerName(draft.manager_name || '')
	setManagerAddress(draft.manager_address || '')
	setManagerEmail(draft.manager_email || '')
	setManagerPhone(draft.manager_phone || '')
	setManagerPan(draft.manager_pan || '')
	setManagerAadhar(draft.manager_aadhar || '')
	setTenantName(draft.tenant_name || '')
	setTenantAddress(draft.tenant_address || '')
	setTenantEmail(draft.tenant_email || '')
	setTenantPhone(draft.tenant_phone || '')
	setTenantPan(draft.tenant_pan || '')
	setTenantAadhar(draft.tenant_aadhar || '')
	setTenantPreviousTenancy(draft.tenant_previous_tenancy || '')
	if (draft.property_possession_date) {
		setPropertyPossessionDate(String(draft.property_possession_date).slice(0, 10))
	}
	setPropertyRentPayable(
		draft.property_rent_payable != null ? String(draft.property_rent_payable) : ''
	)
	setPropertyPremisesDescription(draft.property_premises_description || '')
	setPropertyFurnitureDescription(draft.property_furniture_description || '')
	setPropertyChargeElectricity(draft.property_charge_electricity || '')
	setPropertyChargeWater(draft.property_charge_water || '')
	setPropertyChargeFurnishing(draft.property_charge_furnishing || '')
	setPropertyChargeOtherServices(draft.property_charge_other_services || '')
	setPropertyTenancyDuration(draft.property_tenancy_duration || '')

	if (draft.agreement_pdf_url) setAgreementPreviewUrl(draft.agreement_pdf_url)
	if (draft.landlord_photo_url) setLandlordPhotoPreview(draft.landlord_photo_url)
	if (draft.landlord_signature_url) setLandlordSignaturePreview(draft.landlord_signature_url)
	if (draft.tenant_photo_url) setTenantPhotoPreview(draft.tenant_photo_url)
	if (draft.tenant_signature_url) setTenantSignaturePreview(draft.tenant_signature_url)
}
