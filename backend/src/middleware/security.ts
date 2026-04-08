import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const message = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    
    if (res.statusCode >= 400) {
      logger.warn(message)
    } else {
      logger.info(message)
    }
  })
  
  next()
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error(`Erro não tratado: ${err.message}\n${err.stack}`)
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
  
  return res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message,
    stack: err.stack,
  })
}
