@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'preTitle' => 'NEXT DATE NOTICE',
        'preSubtitle' => '(When Opposite Party absent)',
    ])
@endsection

@section('body')
    @include('notices._parties')

    <div class="bold" style="margin-bottom: 10px;">ORDER RE-FIXING THE HEARING</div>
    <p class="para">The case was taken up for hearing on {{ $previousHearingDate ?: $dateStr }}.</p>
    <p class="para">The Applicant/Petitioner appeared physically/online. The Opposite
        Party/Respondent, however, remained absent despite service of notice through the Assam
        Tenancy Portal/e-mail/SMS, as recorded on the portal.</p>
    <p class="para">In the interest of justice, and subject to law, the Opposite Party/Respondent is
        given one further opportunity to appear and place its/his/her response on record.</p>
    <p class="para">Accordingly, the matter is re-fixed for hearing on:</p>

    <div class="indent" style="margin-bottom: 12px;">
        <div><span class="bold">Date:</span> {{ $hearingDate }}</div>
        <div><span class="bold">Time:</span> {{ $hearingTime }}</div>
        <div><span class="bold">Venue:</span> {{ $venue }}</div>
    </div>

    <p class="para">The Opposite Party/Respondent shall appear on the next date and place its/his/her
        response and supporting documents on record. If the party fails to do so, the matter may
        proceed ex-parte and may be disposed of on the basis of the available record.</p>
@endsection
