{{--
  The sign area: a blank box the DSC agent signs into, and beneath it the authority the notice
  issues under.

  The box must stay directly above the name and keep the class signature-stamp.
  NoticeDocument::render() finds it by that class, and its top-left corner is where the agent is
  told to put the signature.
--}}
<div class="signature-stamp"></div>
<div class="signature-lines">
    <div class="authority">{{ $officeName }}</div>
    @if ($districtName)
        <div>{{ $districtName }}</div>
    @endif
    <div>Government of Assam</div>
</div>
