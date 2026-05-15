import { createContext, useContext } from 'react'

export const AuthPanelNavigationContext = createContext(null)

export function useAuthPanelNavigation() {
	return useContext(AuthPanelNavigationContext)
}
