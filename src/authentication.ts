import { parseJSON } from 'date-fns'
import { type Infer, StructError, assert, literal, object, string, union, optional } from 'superstruct'
import { baseUrl } from './config'
import { DingError, UnauthorizedError, Type, handleApiError } from './error'

export enum DeviceType {
    Ios = 'IOS',
    Android = 'ANDROID',
    Web = 'WEB',
}

export interface Options {
    ip?: string
    deviceId?: string
    deviceType?: DeviceType
    appVersion?: string,
    callbackUrl?: string
}

export async function authenticate(apiToken: string, customerUuid: string, phoneNumber: string, options?: Options): Promise<Authentication> {
    const response = await fetch(`${baseUrl}/authentication`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': apiToken
        },
        body: JSON.stringify({ phone_number: phoneNumber, customer_uuid: customerUuid, ...(options ? optionToRequest(options) : {}) })
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
        uuid: body.authentication_uuid,
        status: apiStatusToStatus(body.status),
        createdAt: parseJSON(body.created_at),
        expiresAt: body.expires_at ? parseJSON(body.expires_at) : undefined
    }
}

function optionToRequest(options: Options) {
    return {
        ip: options.ip,
        device_id: options.deviceId,
        device_type: options.deviceType,
        app_version: options.appVersion,
        callback_url: options.callbackUrl
    }
}

export enum Status {
    Unknown = 'unknown',
    Pending = 'pending',
    RateLimited = 'rate_limited',
    SpamDetected = 'spam_detected',
}

export interface Authentication {
    uuid: string
    status: Status
    createdAt: Date
    expiresAt?: Date
}

// ----------------------------------------------------------------------------

const OkObject = object({
    authentication_uuid: string(),
    status: union([
        literal('pending'),
        literal('rate_limited'),
        literal('spam_detected'),
    ]),
    created_at: string(),
    expires_at: optional(string()),
})

function apiStatusToStatus(status: string): Status {
    switch (status) {
        case 'pending':
            return Status.Pending
        case 'rate_limited':
            return Status.RateLimited
        case 'spam_detected':
            return Status.SpamDetected
        default:
            return Status.Unknown
    }
}
