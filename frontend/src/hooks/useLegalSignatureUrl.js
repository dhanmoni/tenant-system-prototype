import { useEffect, useState } from 'react'

/**
 * Resolve a signature for the Gazette sheets: a File during apply-preview,
 * or the signed URL the API already minted on a filed application.
 */
export function useLegalSignatureUrl(signatureImage) {
	const [signatureUrl, setSignatureUrl] = useState('')

	useEffect(() => {
		if (typeof signatureImage === 'string' && signatureImage.trim()) {
			setSignatureUrl(signatureImage.trim())
			return undefined
		}
		if (!(signatureImage instanceof File) || !signatureImage.type?.startsWith('image/')) {
			setSignatureUrl('')
			return undefined
		}
		const url = URL.createObjectURL(signatureImage)
		setSignatureUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [signatureImage])

	return signatureUrl
}
