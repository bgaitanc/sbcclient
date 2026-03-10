import {
  type RouteConfig,
  index,
  route,
  layout
} from '@react-router/dev/routes'

export default [
  layout('components/layout/AuthLayout.tsx', [
    layout('components/layout/MainLayout.tsx', [
      index('routes/Dashboard.tsx'),
      route('accounts', 'routes/Accounts.tsx'),
      route('journalEntries', 'routes/JournalEntries.tsx'),
      route('batch', 'routes/Batch.tsx'),
      route('reports', 'routes/Reports.tsx'),
      route('logs', 'routes/Logs.tsx')
    ])
  ]),
  route('login', 'routes/LoginPage.tsx')
] satisfies RouteConfig
