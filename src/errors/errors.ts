 export class NotFoundError extends Error {
  public status: number;
 constructor(message: string) {
    super(message);
    this.status = 404;
  }
}

export class AuthenticationError extends Error {
  public status: number;
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

export class ValidationError extends Error {
  public status: number;
  constructor(public errors: any[]) {
    super('Валидация не пройдена');
    this.status = 400;
    this.name = 'ValidationError';
  }
}

export class ForbiddenError extends Error {
  public status: number;
  constructor(message: string) {
    super(message);
    this.status = 403;
  }
}

