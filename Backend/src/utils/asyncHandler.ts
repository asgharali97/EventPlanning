import { Request, Response, NextFunction, RequestHandler } from 'express'

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>
const asyncHandler = (
  handler: AsyncRequestHandler
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next)
  }
}

export default asyncHandler