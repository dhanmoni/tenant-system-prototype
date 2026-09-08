@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'preTitle' => 'ADJOURNMENT ORDER',
        'preSubtitle' => '(For further document submission / settlement discussion)',
    ])
@endsection

@section('body')
    @include('notices._parties')

    <div class="bold" style="margin-bottom: 10px;">ADJOURNMENT ORDER</div>
    <p class="para">During the hearing held on {{ $previousHearingDate ?: $dateStr }}, both parties
        requested additional time to place further documents on record and/or to continue their
        settlement discussions.</p>
    <p class="para">Having considered the submissions of both parties, and to allow them a reasonable
        opportunity to place the relevant material on record and, if possible, resolve the dispute,
        the matter is adjourned and re-fixed on:</p>

    <div class="indent" style="margin-bottom: 12px;">
        <div><span class="bold">Date:</span> {{ $hearingDate }}</div>
        <div><span class="bold">Time:</span> {{ $hearingTime }}</div>
    </div>

    <p class="para">Both parties shall place all relevant records and documents on record before the
        next date of hearing.</p>
    <p class="para">No further adjournment will ordinarily be granted unless sufficient cause is
        shown and the request is found justified in the circumstances of the case.</p>
@endsection
