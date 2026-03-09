import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/Dashboard.tsx'),
  route('login', 'routes/Login.tsx'),
  route('accounts', 'routes/Accounts.tsx'),
  route('journalEntries', 'routes/JournalEntries.tsx'),
  route('batch', 'routes/Batch.tsx'),
  route('reports', 'routes/Reports.tsx'),
  route('logs', 'routes/Logs.tsx')
] satisfies RouteConfig
