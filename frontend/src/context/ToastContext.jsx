import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([])
	const idRef = useRef(0)

	const dismiss = useCallback((id) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id))
	}, [])

	const showToast = useCallback(
		(message, variant = 'info') => {
			const text = String(message || '').trim()
			if (!text) return
			const id = ++idRef.current
			setToasts((prev) => [...prev.slice(-3), { id, message: text, variant }])
			window.setTimeout(() => dismiss(id), 4200)
		},
		[dismiss],
	)

	const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss])

	return (
		<ToastContext.Provider value={value}>
			{children}
			{typeof document !== 'undefined'
				? createPortal(
						<div className="app-toast-stack" aria-live="polite" aria-relevant="additions">
							{toasts.map((toast) => (
								<div
									key={toast.id}
									className={`app-toast app-toast--${toast.variant}`}
									role={toast.variant === 'error' ? 'alert' : 'status'}
								>
									{toast.message}
								</div>
							))}
						</div>,
						document.body,
					)
				: null}
		</ToastContext.Provider>
	)
}

export function useToast() {
	const ctx = useContext(ToastContext)
	if (!ctx) {
		return {
			showToast: (message) => {
				if (message) window.alert(String(message))
			},
			dismiss: () => {},
		}
	}
	return ctx
}
