export interface Config {
  port: number
  host: string
  turnEnabled: boolean
  logLevel: string
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true' || value === '1'
}

function loadConfig(): Config {
  return {
    port: Number(process.env.PORT ?? 8080),
    host: process.env.HOST ?? '0.0.0.0',
    turnEnabled: parseBool(process.env.TURN_ENABLED, false),
    logLevel: process.env.LOG_LEVEL ?? 'info',
  }
}

export const config: Config = loadConfig()
