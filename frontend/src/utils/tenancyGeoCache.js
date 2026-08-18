import api from '../api'

let cachedDistricts = null
let cachedOffices = null
let districtsPromise = null
let officesPromise = null

export function getCachedTenancyDistricts() {
	return cachedDistricts
}

export function getCachedTenancyOffices() {
	return cachedOffices
}

export function fetchTenancyDistricts() {
	if (cachedDistricts) return Promise.resolve(cachedDistricts)
	if (!districtsPromise) {
		districtsPromise = api
			.get('/api/public/districts')
			.then(({ data }) => {
				cachedDistricts = Array.isArray(data) ? data : (data.districts || data.data || [])
				return cachedDistricts
			})
			.catch(() => {
				cachedDistricts = []
				return cachedDistricts
			})
			.finally(() => {
				districtsPromise = null
			})
	}
	return districtsPromise
}

export function fetchTenancyOffices() {
	if (cachedOffices) return Promise.resolve(cachedOffices)
	if (!officesPromise) {
		officesPromise = api
			.get('/api/public/offices')
			.then(({ data }) => {
				cachedOffices = Array.isArray(data) ? data : (data.data || data.offices || [])
				return cachedOffices
			})
			.catch(() => {
				cachedOffices = []
				return cachedOffices
			})
			.finally(() => {
				officesPromise = null
			})
	}
	return officesPromise
}

/** Warm district/office lists while the user is on the dashboard shell. */
export function prefetchTenancyGeoLists() {
	void Promise.all([fetchTenancyDistricts(), fetchTenancyOffices()])
}
