import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
	ASSAM_DISTRICTS_GEOJSON_URL,
	ASSAM_MAP_CENTER,
	ASSAM_MAP_ZOOM,
	buildDistrictLookup,
	findDistrictForGeoFeature,
	geoFeatureMatchesDistrictName,
} from '../../../utils/assamDistrictGeo'

function fillForVolume(total, max) {
	if (!max || !total) return '#eef2f7'
	const ratio = total / max
	if (ratio >= 0.75) return '#1d4ed8'
	if (ratio >= 0.4) return '#3b82f6'
	if (ratio > 0) return '#bfdbfe'
	return '#eef2f7'
}

function MapViewController({ geojson, zoomTargetName, viewMode, fillPadding, singleDistrict }) {
	const map = useMap()
	const lastTarget = useRef(null)

	useEffect(() => {
		if (!geojson?.features?.length) return

		// District-only view: always fit the single boundary tightly.
		if (singleDistrict) {
			const layer = L.geoJSON(geojson)
			const bounds = layer.getBounds()
			if (bounds.isValid()) {
				map.fitBounds(bounds, {
					padding: fillPadding || [28, 28],
					maxZoom: 11,
				})
			}
			lastTarget.current = zoomTargetName || 'single'
			return
		}

		if (viewMode === 'state' || !zoomTargetName) {
			const layer = L.geoJSON(geojson)
			const bounds = layer.getBounds()
			if (bounds.isValid()) {
				map.fitBounds(bounds, {
					padding: fillPadding || [4, 4],
					maxZoom: 9.6,
				})
			}
			lastTarget.current = null
			return
		}

		if (lastTarget.current === zoomTargetName && viewMode === 'district') return

		const focus = String(zoomTargetName).toLowerCase()
		const match = geojson.features.find((f) => {
			const name = String(f.properties?.district || '').toLowerCase()
			return (
				name === focus ||
				name.includes(focus) ||
				focus.includes(name) ||
				(focus.includes('kamrup rural') && name === 'kamrup') ||
				(focus.includes('south salmara') && name.includes('salmara'))
			)
		})

		if (match) {
			const bounds = L.geoJSON(match).getBounds()
			if (bounds.isValid()) {
				map.fitBounds(bounds, { padding: [32, 32], maxZoom: 10.2 })
				lastTarget.current = zoomTargetName
			}
		}
	}, [map, geojson, zoomTargetName, viewMode, fillPadding, singleDistrict])

	return null
}

/**
 * @param {object} props
 * @param {boolean} [props.lockToDistrict] — district admin: stay on own district, no other-district nav
 * @param {boolean} [props.fillContainer] — super admin: large map that fills the block
 */
function AssamDistrictMap({
	districts = [],
	hint,
	focusDistrictName = null,
	onDistrictSelect,
	lockToDistrict = false,
	fillContainer = false,
}) {
	const [geojson, setGeojson] = useState(null)
	const [loadError, setLoadError] = useState('')
	const [selected, setSelected] = useState(null)
	const [viewMode, setViewMode] = useState(
		lockToDistrict || focusDistrictName ? 'district' : 'state'
	)
	const [zoomTarget, setZoomTarget] = useState(focusDistrictName || null)

	useEffect(() => {
		let cancelled = false
		fetch(ASSAM_DISTRICTS_GEOJSON_URL)
			.then((res) => {
				if (!res.ok) throw new Error('Could not load Assam map')
				return res.json()
			})
			.then((data) => {
				if (!cancelled) setGeojson(data)
			})
			.catch((err) => {
				if (!cancelled) {
					setGeojson(null)
					setLoadError(err.message || 'Failed to load Assam map')
				}
			})
		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		if (!focusDistrictName || !districts.length) return
		const match = districts.find(
			(d) => normalizeLoose(d.name) === normalizeLoose(focusDistrictName)
		)
		if (match) {
			setSelected(match)
			setZoomTarget(match.name)
			setViewMode('district')
		}
	}, [focusDistrictName, districts])

	const lookup = useMemo(() => buildDistrictLookup(districts), [districts])
	const maxTotal = useMemo(
		() => Math.max(0, ...districts.map((d) => d.total_applications ?? 0)),
		[districts]
	)

	const lockedName = lockToDistrict ? focusDistrictName : null

	const isLockedDistrict = useCallback(
		(label) => {
			if (!lockedName) return false
			return normalizeLoose(label) === normalizeLoose(lockedName)
		},
		[lockedName]
	)

	/** District admin: only this district’s polygon — no other Assam boundaries. */
	const displayGeojson = useMemo(() => {
		if (!geojson?.features) return geojson
		if (!lockToDistrict || !focusDistrictName) return geojson
		const features = geojson.features.filter((f) =>
			geoFeatureMatchesDistrictName(f, focusDistrictName)
		)
		if (!features.length) return geojson
		return { type: 'FeatureCollection', features }
	}, [geojson, lockToDistrict, focusDistrictName])

	const districtOptions = useMemo(() => {
		const fromStats = [...districts].sort((a, b) =>
			String(a.name).localeCompare(String(b.name))
		)
		if (lockToDistrict && focusDistrictName) {
			const own =
				fromStats.find((d) => normalizeLoose(d.name) === normalizeLoose(focusDistrictName)) ||
				{ name: focusDistrictName }
			return [own]
		}
		if (fromStats.length) return fromStats
		if (!geojson?.features) return []
		return geojson.features
			.map((f) => ({
				id: f.properties?.dt_code || f.properties?.district,
				name: f.properties?.district,
			}))
			.filter((d) => d.name)
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [districts, geojson, lockToDistrict, focusDistrictName])

	const selectDistrict = useCallback(
		(district, geoLabel) => {
			const label = district?.name || geoLabel
			if (lockedName && !isLockedDistrict(label)) return
			setSelected(district || { name: label })
			setZoomTarget(label)
			setViewMode('district')
			if (district) onDistrictSelect?.(district)
		},
		[onDistrictSelect, lockedName, isLockedDistrict]
	)

	const showAllAssam = () => {
		if (lockToDistrict) return
		setViewMode('state')
		setZoomTarget(null)
		setSelected(null)
	}

	const styleFeature = (feature) => {
		const district = findDistrictForGeoFeature(feature, lookup)
		const geoName = feature.properties?.district || ''
		const label = district?.name || geoName
		const total = district?.total_applications ?? 0
		const isActive =
			lockToDistrict ||
			(selected && normalizeLoose(selected.name || selected) === normalizeLoose(label))

		return {
			fillColor: isActive
				? lockToDistrict
					? '#166534'
					: '#1e3a8a'
				: fillForVolume(total, maxTotal),
			weight: isActive ? 2.25 : 1.1,
			color: isActive ? (lockToDistrict ? '#14532d' : '#0f172a') : '#475569',
			fillOpacity: isActive ? 0.88 : 0.85,
			opacity: 1,
		}
	}

	const onEachFeature = (feature, layer) => {
		const district = findDistrictForGeoFeature(feature, lookup)
		const geoName = feature.properties?.district || 'District'
		const label = district?.name || geoName
		const total = district?.total_applications ?? 0
		const uin = district?.tenancy_applications ?? 0
		const forms = district?.service_applications ?? 0
		const users = district?.users_count ?? 0

		layer.bindTooltip(
			`<div class="ws-assam-tip">
				<strong>${label}</strong>
				<span>${total} apps · ${uin} UIN · ${forms} forms · ${users} users</span>
			</div>`,
			{ sticky: true, className: 'ws-assam-map-tooltip', direction: 'top' }
		)

		if (lockToDistrict) return

		layer.on({
			mouseover: (e) => {
				e.target.setStyle({ weight: 2.5, color: '#0f172a' })
				e.target.bringToFront()
			},
			mouseout: (e) => {
				e.target.setStyle(styleFeature(feature))
			},
			click: () => {
				selectDistrict(district, label)
			},
		})
	}

	if (loadError) {
		return (
			<div className="ws-map-panel">
				<p className="ws-chart-empty ws-activity-empty--error">{loadError}</p>
			</div>
		)
	}

	if (!geojson) {
		return (
			<div className="ws-map-panel">
				<p className="ws-chart-empty">Loading Assam map…</p>
			</div>
		)
	}

	const selectedLabel = selected?.name || (lockToDistrict ? focusDistrictName : null)
	const panelClass = [
		'ws-map-panel',
		'ws-assam-map-panel',
		fillContainer ? 'ws-assam-map-panel--fill' : '',
		lockToDistrict ? 'ws-assam-map-panel--locked' : '',
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div className={panelClass}>
			{hint ? <p className="ws-dashboard-hint ws-map-hint">{hint}</p> : null}

			{!lockToDistrict ? (
				<div className="ws-assam-map-toolbar">
					<label className="ws-assam-map-jump">
						<span>Jump to district</span>
						<select
							className="ws-assam-map-select"
							value={viewMode === 'district' ? selectedLabel || '' : ''}
							onChange={(e) => {
								const name = e.target.value
								if (!name) {
									showAllAssam()
									return
								}
								const d = districtOptions.find(
									(item) => normalizeLoose(item.name) === normalizeLoose(name)
								)
								selectDistrict(d || { name }, name)
							}}
						>
							<option value="">All Assam</option>
							{districtOptions.map((d) => (
								<option key={d.id || d.name} value={d.name}>
									{d.name}
								</option>
							))}
						</select>
					</label>
					<div className="ws-assam-map-toolbar-actions">
						{viewMode === 'district' ? (
							<button
								type="button"
								className="ws-btn ws-btn--sm ws-btn--outline"
								onClick={showAllAssam}
							>
								Show all Assam
							</button>
						) : (
							<span className="ws-assam-map-toolbar-hint">
								Select a district to zoom in — statewide view is the widest level
							</span>
						)}
					</div>
				</div>
			) : (
				<div className="ws-assam-map-toolbar ws-assam-map-toolbar--locked">
					<p className="ws-assam-map-locked-badge">
						District boundary · <strong>{focusDistrictName || 'your district'}</strong>
					</p>
					<span className="ws-assam-map-toolbar-hint">
						Only your district outline is shown
					</span>
				</div>
			)}

			<div className="ws-assam-map-layout">
				<div className="ws-assam-map-frame">
					<MapContainer
						center={ASSAM_MAP_CENTER}
						zoom={ASSAM_MAP_ZOOM}
						scrollWheelZoom={false}
						dragging={false}
						doubleClickZoom={false}
						boxZoom={false}
						keyboard={false}
						touchZoom={false}
						zoomControl={false}
						attributionControl={false}
						className="ws-assam-map"
					>
						<GeoJSON
							key={`assam-${selectedLabel || 'state'}-${lockToDistrict ? 'district-only' : 'open'}-${maxTotal}`}
							data={displayGeojson}
							style={styleFeature}
							onEachFeature={onEachFeature}
						/>
						<MapViewController
							geojson={displayGeojson}
							zoomTargetName={zoomTarget}
							viewMode={viewMode}
							fillPadding={
								lockToDistrict ? [36, 36] : fillContainer ? [2, 2] : [6, 6]
							}
							singleDistrict={lockToDistrict}
						/>
					</MapContainer>
				</div>

				<aside className="ws-assam-map-info" aria-live="polite">
					{selected || (lockToDistrict && focusDistrictName) ? (
						<>
							<p className="ws-assam-map-info-kicker">
								{lockToDistrict ? 'Your district' : 'Selected district'}
							</p>
							<h3 className="ws-assam-map-info-title">
								{selected?.name || focusDistrictName}
							</h3>
							{selected?.state_name ? (
								<p className="ws-assam-map-info-meta">{selected.state_name}</p>
							) : (
								<p className="ws-assam-map-info-meta">Assam</p>
							)}
							<dl className="ws-assam-map-info-stats">
								<div>
									<dt>Total applications</dt>
									<dd>{(selected?.total_applications ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								<div>
									<dt>UIN / Tenancy</dt>
									<dd>{(selected?.tenancy_applications ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								<div>
									<dt>Service forms</dt>
									<dd>{(selected?.service_applications ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								<div>
									<dt>Users</dt>
									<dd>{(selected?.users_count ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								{selected?.offices_count != null ? (
									<div>
										<dt>Offices</dt>
										<dd>{selected.offices_count.toLocaleString('en-IN')}</dd>
									</div>
								) : null}
								{selected?.code ? (
									<div>
										<dt>District code</dt>
										<dd>{selected.code}</dd>
									</div>
								) : null}
							</dl>
							{!lockToDistrict && viewMode === 'district' ? (
								<button
									type="button"
									className="ws-btn ws-btn--sm ws-btn--outline"
									onClick={showAllAssam}
								>
									Back to Assam
								</button>
							) : null}
						</>
					) : (
						<>
							<p className="ws-assam-map-info-kicker">Statewide view</p>
							<h3 className="ws-assam-map-info-title">Assam</h3>
							<p className="ws-assam-map-info-meta">
								Pick a district to zoom in and see its stats. You can return here with
								“Show all Assam” — there is no further zoom-out.
							</p>
							<div className="ws-assam-map-legend" aria-hidden>
								<span className="ws-assam-map-legend-label">Application volume</span>
								<span className="ws-assam-map-legend-scale">
									<span className="is-none" />
									<span className="is-low" />
									<span className="is-mid" />
									<span className="is-high" />
								</span>
								<span className="ws-assam-map-legend-ends">
									<span>None</span>
									<span>High</span>
								</span>
							</div>
						</>
					)}
				</aside>
			</div>
		</div>
	)
}

function normalizeLoose(name) {
	return String(name || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
}

export default AssamDistrictMap
