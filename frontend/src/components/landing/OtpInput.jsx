import { useCallback, useEffect, useRef } from 'react'

const OTP_LENGTH = 6

function toDigitArray(value) {
	const clean = String(value || '').replace(/\D/g, '').slice(0, OTP_LENGTH)
	const chars = clean.split('')
	while (chars.length < OTP_LENGTH) chars.push('')
	return chars
}

function OtpInput({ value = '', onChange, autoFocus = false, id = 'otp' }) {
	const inputsRef = useRef([])

	const focusIndex = useCallback((index) => {
		const el = inputsRef.current[index]
		if (el) {
			el.focus()
			el.select()
		}
	}, [])

	const setOtp = useCallback(
		(next) => {
			const sanitized = String(next).replace(/\D/g, '').slice(0, OTP_LENGTH)
			onChange(sanitized)
		},
		[onChange]
	)

	useEffect(() => {
		if (autoFocus) focusIndex(0)
	}, [autoFocus, focusIndex])

	const handleChange = (index, event) => {
		const raw = event.target.value.replace(/\D/g, '')

		if (raw.length > 1) {
			setOtp(raw)
			focusIndex(Math.min(raw.length, OTP_LENGTH) - 1)
			return
		}

		const digits = toDigitArray(value)
		digits[index] = raw.slice(-1)
		setOtp(digits.join(''))

		if (raw && index < OTP_LENGTH - 1) {
			focusIndex(index + 1)
		}
	}

	const handleKeyDown = (index, event) => {
		const digits = toDigitArray(value)

		if (event.key === 'Backspace') {
			event.preventDefault()
			if (digits[index]) {
				digits[index] = ''
				setOtp(digits.join(''))
				return
			}
			if (index > 0) {
				digits[index - 1] = ''
				setOtp(digits.join(''))
				focusIndex(index - 1)
			}
			return
		}

		if (event.key === 'ArrowLeft' && index > 0) {
			event.preventDefault()
			focusIndex(index - 1)
			return
		}

		if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
			event.preventDefault()
			focusIndex(index + 1)
		}
	}

	const handlePaste = (event) => {
		event.preventDefault()
		const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
		if (!pasted) return
		setOtp(pasted)
		focusIndex(Math.min(pasted.length, OTP_LENGTH) - 1)
	}

	const digits = toDigitArray(value)

	return (
		<div className="otp-input" role="group" aria-label="6-digit verification code">
			{digits.map((digit, index) => (
				<input
					key={index}
					ref={(el) => {
						inputsRef.current[index] = el
					}}
					id={index === 0 ? id : undefined}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={index === 0 ? 'one-time-code' : 'off'}
					maxLength={index === 0 ? OTP_LENGTH : 1}
					className="otp-input-box"
					value={digit}
					aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
					onChange={(event) => handleChange(index, event)}
					onKeyDown={(event) => handleKeyDown(index, event)}
					onPaste={handlePaste}
					onFocus={(event) => event.target.select()}
				/>
			))}
		</div>
	)
}

export default OtpInput
