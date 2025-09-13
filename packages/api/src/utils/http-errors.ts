export class HttpError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message)
        this.name = 'HttpError'
    }
}

export class AuthenticationError extends HttpError {
    constructor(message: string = 'Unauthenticated') {
        super(message, 401)
        this.name = 'AuthenticationError'
    }
}

export class AuthorizationError extends HttpError {
    constructor(message: string = 'Unauthorized') {
        super(message, 403)
        this.name = 'AuthorizationError'
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Not Found') {
        super(message, 404)
        this.name = 'NotFoundError'
    }
}
