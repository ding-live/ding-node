import {
    type Infer,
    StructError,
    assert,
    object,
    string,
} from 'superstruct'
import { baseUrl } from './config'
import { DingError, UnauthorizedError, Type, handleApiError } from './error'

export async function check(
    apiToken: string,
    customerUuid: string,
    authUuid: string,
    code: string
): Promise<Check> {
    const response = await fetch(`${baseUrl}/check`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': apiToken
        },
        body: JSON.stringify({
            authentication_uuid: authUuid,
            customer_uuid: customerUuid,
            check_code: code
        })
    })

    if (response.status === 403) {
        throw new UnauthorizedError()
    }

    if (!response.ok) {
        handleApiError(await response.json())
    }

    const body: Infer<typeof OkObject> = await response.json()

    try {
        assert(body, OkObject)
    } catch (err: unknown) {
        if (err instanceof StructError) {
            throw new DingError({ type: Type.ApiError, message: err.message })
        }

        throw err
    }

    return {
        authenticationUuid: body.authentication_uuid,
        status: apiStatusToStatus(body.status)
    };
}

export interface Check {
    authenticationUuid: string
    status: Status
}

export enum Status {
    Unknown = 'unknown',
    Valid = 'valid',
    Invalid = 'invalid',
    WithoutAttempt = 'without_attempt',
    RateLimited = 'rate_limited',
    AlreadyValidated = 'already_validated',
    ExpiredAuth = 'expired_auth',
}
// ----------------------------------------------------------------------------

const OkObject = object({
    authentication_uuid: string(),
    status: string(),
})

function apiStatusToStatus(status: string): Status {
    switch (status) {
        case 'valid':
            return Status.Valid
        case 'invalid':
            return Status.Invalid
        case 'without_attempt':
            return Status.WithoutAttempt
        case 'rate_limited':
            return Status.RateLimited
        case 'already_validated':
            return Status.AlreadyValidated
        case 'expired_auth':
            return Status.ExpiredAuth
        default:
            return Status.Unknown
    }
}
