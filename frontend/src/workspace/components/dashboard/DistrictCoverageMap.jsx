import AssamDistrictMap from './AssamDistrictMap'

/**
 * District coverage — Assam outline map with district and sub-division boundaries.
 */
function DistrictCoverageMap({
	districts = [],
	hint,
	focusDistrictName = null,
	onDistrictSelect,
	lockToDistrict = false,
	fillContainer = false,
}) {
	return (
		<AssamDistrictMap
			districts={districts}
			hint={hint}
			focusDistrictName={focusDistrictName}
			onDistrictSelect={onDistrictSelect}
			lockToDistrict={lockToDistrict}
			fillContainer={fillContainer}
		/>
	)
}

export default DistrictCoverageMap
