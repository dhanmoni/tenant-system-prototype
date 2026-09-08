{{-- The Government of Assam heading, identical on every notice. --}}
<div class="centre block">
    @if (!empty($preTitle))
        <div class="head-title">{{ $preTitle }}</div>
        @if (!empty($preSubtitle))
            <div class="italic">{{ $preSubtitle }}</div>
        @endif
        <div class="rule"></div>
    @endif
    <h3 class="head-org">GOVERNMENT OF ASSAM</h3>
    <h3 class="head-org">OFFICE OF THE {{ mb_strtoupper($officeName) }}</h3>
    @if ($districtName && empty($preTitle))
        <div>[{{ $districtName }}]</div>
    @endif
    <div class="rule"></div>
    @if (!empty($mainTitle))
        <div class="head-title">{{ $mainTitle }}</div>
    @endif
</div>
