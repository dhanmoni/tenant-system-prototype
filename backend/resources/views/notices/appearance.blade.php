@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'mainTitle' => 'NOTICE FOR APPEARANCE, JOINT DISCUSSION AND HEARING',
    ])
@endsection

@section('body')
    <p class="para">In the matter of a tenancy dispute arising from a tenancy agreement registered
        through the Assam Tenancy Portal and governed by the Assam Tenancy Act, 2021 and the Rules
        made thereunder.</p>

    @include('notices._parties')

    <p class="para"><span class="bold">Subject:</span></p>
    <p class="para">Notice for joint discussion/hearing in connection with tenancy dispute relating
        to premises situated at:</p>
    <p class="para"><span class="bold">Property Address:</span><br />{{ $propertyAddress }}</p>

    <p class="para">Whereas an application/petition has been received through the Assam Tenancy
        Portal in relation to a tenancy dispute between the above-named parties under the Assam
        Tenancy Act, 2021 and the Rules made thereunder;</p>
    <p class="para">And whereas, having regard to the nature of the dispute, the undersigned
        {{ $officeName }} considers it appropriate to give both parties a fair and reasonable
        opportunity to be heard and, where possible, to facilitate a mutually acceptable
        settlement;</p>
    <p class="para">Accordingly, both parties are required to appear before the {{ $officeName }} on
        the date, at the time and at the venue specified below:</p>

    <ul class="indent" style="margin-bottom: 12px;">
        <li><span class="bold">Date:</span> {{ $hearingDate }}</li>
        <li><span class="bold">Time:</span> {{ $hearingTime }}</li>
        <li><span class="bold">Venue:</span> {{ $venue }}</li>
    </ul>

    <p class="para">Both parties are requested to bring all relevant records and documents in their
        possession or control, including the following:</p>

    <ol class="indent" style="margin-bottom: 12px;">
        <li>Registered Tenancy Agreement</li>
        <li>Rent payment proof</li>
        <li>Identity proof</li>
        <li>Supporting documents relating to dispute</li>
    </ol>

    <p class="para">If either party fails to appear on the date fixed without sufficient cause, the
        {{ $officeName }} may proceed with the matter in accordance with law, including by taking up
        the matter ex-parte, and may decide the case on the basis of the records and materials
        available.</p>
@endsection
