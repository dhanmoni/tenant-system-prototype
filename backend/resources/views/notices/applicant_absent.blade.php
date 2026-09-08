@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'preTitle' => 'NEXT DATE NOTICE',
        'preSubtitle' => '(When Applicant absent)',
    ])
@endsection

@section('body')
    @include('notices._parties')

    <div class="bold" style="margin-bottom: 10px;">ORDER</div>
    <p class="para">The matter was fixed for hearing on {{ $previousHearingDate ?: $dateStr }} and was
        called on that date. The Opposite Party appeared before the {{ $officeName }}. However, the
        Applicant/Petitioner was absent, and no intimation or sufficient cause for the absence was
        placed on record.</p>
    <p class="para">In the interest of justice, and to give the Applicant/Petitioner a further
        opportunity to be heard, the matter is adjourned and re-fixed for hearing on:</p>

    <div class="indent" style="margin-bottom: 12px;">
        <div><span class="bold">Date:</span> {{ $hearingDate }}</div>
        <div><span class="bold">Time:</span> {{ $hearingTime }}</div>
        <div><span class="bold">Venue:</span> {{ $venue }}</div>
    </div>

    <p class="para">The Applicant/Petitioner shall appear on the next date of hearing, either
        personally or through an authorised representative, as permitted by law, and shall place on
        record the relevant documents and submissions.</p>
    <p class="para">If the Applicant/Petitioner does not appear on the next date without sufficient
        cause, the petition may be dealt with or disposed of in accordance with law on the basis of
        the materials available on record.</p>
@endsection
