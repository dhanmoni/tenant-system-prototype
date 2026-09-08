@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'mainTitle' => 'EX-PARTE ORDER',
    ])
@endsection

@section('body')
    <div class="centre italic" style="margin-top: -10px; margin-bottom: 18px;">
        (If one party does not appear)
    </div>

    @include('notices._parties')

    <p class="para">Despite service of notice through the Assam Tenancy Portal and other available
        electronic means, the Opposite Party did not appear before the {{ $officeName }} on the dates
        fixed for hearing.</p>
    <p class="para">After recording the absence of the Opposite Party, the matter was taken up
        ex-parte on the basis of the available records and the submissions and documents placed on
        record by the Applicant.</p>
    <p class="para">Having considered the records, documents and submissions available, the
        {{ $officeName }} is satisfied, to the extent necessary for disposal of the proceeding,
        that:</p>

    <div class="verbatim">{{ $remarks }}</div>

    <p class="para">Accordingly, and for the reasons recorded hereinabove, the following order is
        hereby passed:</p>

    <div class="verbatim">{{ $additionalRemarks }}</div>

    <p class="para">The case accordingly stands disposed of ex-parte, subject to any remedy available
        to the affected party under applicable law.</p>
@endsection
