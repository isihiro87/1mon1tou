export class StorageError extends Error {
  key: string;

  constructor(message: string, key: string) {
    super(message);
    this.name = 'StorageError';
    this.key = key;
  }
}

export class ContentLoadError extends Error {
  contentType: string;

  constructor(message: string, contentType: string) {
    super(message);
    this.name = 'ContentLoadError';
    this.contentType = contentType;
  }
}

export class AuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
