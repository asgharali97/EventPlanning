class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  message: string;
  errors: any[];
  statck?: string;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: any[] = [],
    stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null
    this.success = false
    this.message = message
    this.errors = errors;

    if(stack){
      this.statck = stack
    }else{
      Error.captureStackTrace(this, this.constructor)
    }

  }
}

export { ApiError };