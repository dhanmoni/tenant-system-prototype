<?php

namespace App\Constants;

/**
 * Status of a proceeding disclosed under paragraph 5 of Forms II to VI.
 *
 * The printed form asks for two different things depending on the status: "the details of the
 * pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed". So a
 * pending case needs its pendency described, and a disposed case needs its decision.
 */
class PriorProceedingStatus
{
    public const PENDING = 'PENDING';
    public const DISPOSED = 'DISPOSED';

    public static function all(): array
    {
        return [self::PENDING, self::DISPOSED];
    }
}
