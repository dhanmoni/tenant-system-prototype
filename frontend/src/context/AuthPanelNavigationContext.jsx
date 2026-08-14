import { createContext, useContext, useEffect, useState } from 'react'

export const AuthPanelNavigationContext = createContext(null)

const AuthPanelNavigationSetContext = createContext(() => {})

export function AuthPanelNavigationProvider({ children }) {
	const [api, setApi] = useState(null)
	return (
		<AuthPanelNavigationSetContext.Provider value={setApi}>
			<AuthPanelNavigationContext.Provider value={api}>{children}</AuthPanelNavigationContext.Provider>
		</AuthPanelNavigationSetContext.Provider>
	)
}

export function useAuthPanelNavigation() {
	return useContext(AuthPanelNavigationContext)
}

export function useRegisterAuthPanelNavigation(api) {
	const setApi = useContext(AuthPanelNavigationSetContext)
	useEffect(() => {
		setApi(api)
		return () => setApi(null)
	}, [api, setApi])
}
