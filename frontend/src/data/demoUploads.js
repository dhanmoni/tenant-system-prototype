/**
 * Prototype sample files in `frontend/public/DemoUploads/`.
 * Used by UIN / join upload steps.
 */
export const DEMO_UPLOADS = {
	agreement: {
		href: '/DemoUploads/Demo_Agreement.pdf',
		filename: 'Sample_Residential_Tenancy_Agreement.pdf',
		mime: 'application/pdf',
	},
	pan: {
		href: '/DemoUploads/PancardDemo.png',
		filename: 'PancardDemo.png',
		mime: 'image/png',
	},
	photos: {
		landlord: {
			href: '/DemoUploads/PhotoIMG1.png',
			filename: 'PhotoIMG1.png',
			mime: 'image/png',
		},
		tenant: {
			href: '/DemoUploads/PhotoIMG2.png',
			filename: 'PhotoIMG2.png',
			mime: 'image/png',
		},
		joinLandlord: {
			href: '/DemoUploads/PhotoIMG3.png',
			filename: 'PhotoIMG3.png',
			mime: 'image/png',
		},
		joinTenant: {
			href: '/DemoUploads/PhotoIMG4.png',
			filename: 'PhotoIMG4.png',
			mime: 'image/png',
		},
	},
	signatures: {
		landlord: {
			href: '/DemoUploads/PhotoSig1.png',
			filename: 'PhotoSig1.png',
			mime: 'image/png',
		},
		tenant: {
			href: '/DemoUploads/PhotoSig2.png',
			filename: 'PhotoSig2.png',
			mime: 'image/png',
		},
		joinLandlord: {
			href: '/DemoUploads/PhotoSig3.png',
			filename: 'PhotoSig3.png',
			mime: 'image/png',
		},
		joinTenant: {
			href: '/DemoUploads/PhotoSig4.png',
			filename: 'PhotoSig4.png',
			mime: 'image/png',
		},
		assameseLandlord: {
			href: '/DemoUploads/PhotoSigAssamese1.png',
			filename: 'PhotoSigAssamese1.png',
			mime: 'image/png',
		},
		assameseTenant: {
			href: '/DemoUploads/PhotoSigAssamese2.png',
			filename: 'PhotoSigAssamese2.png',
			mime: 'image/png',
		},
	},
}

export async function fetchDemoFile(asset) {
	const res = await fetch(asset.href)
	if (!res.ok) {
		throw new Error(`Failed to load ${asset.filename}`)
	}
	const blob = await res.blob()
	return new File([blob], asset.filename, { type: asset.mime || blob.type || 'application/octet-stream' })
}

function signatureFor(role, language) {
	const assamese = language === 'as'
	if (role === 'LANDLORD') {
		return assamese ? DEMO_UPLOADS.signatures.assameseLandlord : DEMO_UPLOADS.signatures.landlord
	}
	return assamese ? DEMO_UPLOADS.signatures.assameseTenant : DEMO_UPLOADS.signatures.tenant
}

export function getUinSampleManifest(initiatorRole = 'LANDLORD', language = 'en') {
	const isTenant = initiatorRole === 'TENANT'
	return {
		agreement: DEMO_UPLOADS.agreement,
		photo: isTenant ? DEMO_UPLOADS.photos.tenant : DEMO_UPLOADS.photos.landlord,
		signature: signatureFor(isTenant ? 'TENANT' : 'LANDLORD', language),
		pan: DEMO_UPLOADS.pan,
	}
}

export function getJoinSampleManifest(secondPartyRole = 'TENANT', language = 'en') {
	const isLandlord = secondPartyRole === 'LANDLORD'
	return {
		photo: isLandlord ? DEMO_UPLOADS.photos.joinLandlord : DEMO_UPLOADS.photos.joinTenant,
		signature: language === 'as'
			? (isLandlord
				? DEMO_UPLOADS.signatures.assameseLandlord
				: DEMO_UPLOADS.signatures.assameseTenant)
			: (isLandlord
				? DEMO_UPLOADS.signatures.joinLandlord
				: DEMO_UPLOADS.signatures.joinTenant),
		pan: DEMO_UPLOADS.pan,
	}
}
