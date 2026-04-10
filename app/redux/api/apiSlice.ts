import {
  createApi,
  fetchBaseQuery,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { logout, updateToken } from '../slices/authSlice'
import type {
  SuccessResponse,
  PagedResult
} from '@shared/types/common/global.ts'
import type { LoginReq, LoginRes } from '@shared/types/login/loginValues.ts'
import type {
  Account,
  CreateAccountReq,
  UpdateAccountReq
} from '@shared/types/accounts/accountTypes.ts'
import type {
  JournalEntry,
  CreateJournalEntryReq,
  UpdateJournalEntryReq,
  JournalEntryFilter
} from '@shared/types/journalEntries/journalEntryTypes.ts'
import type {
  BalanceSheet,
  IncomeStatement
} from '@shared/types/reports/reportTypes.ts'
import type {
  AccountingPeriod,
  CreateAccountingPeriodReq,
  ClosePeriodReq
} from '@shared/types/accountingPeriods/accountingPeriodTypes.ts'
import type {
  BulkImportHistory,
  BulkImportFilter
} from '@shared/types/bulkImports/bulkImportTypes.ts'
import type { DashboardSummary } from '@shared/types/dashboard/dashboardTypes.ts'
import type {
  TransactionLog,
  TransactionLogFilter
} from '@shared/types/logs/logTypes.ts'
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  UserFilter
} from '@shared/types/users/userTypes.ts'

const baseQuery = fetchBaseQuery({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- .env
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Standard Redux Toolkit pattern
    const { auth } = getState() as RootState
    const { token } = auth
    if (token !== null && token !== '') {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  }
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    // Intentar refrescar el token
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Standard Redux Toolkit pattern
    const { auth } = api.getState() as RootState
    const { token, refreshToken } = auth

    if (token !== null && refreshToken !== null) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { token, refreshToken }
        },
        api,
        extraOptions
      )

      if (refreshResult.data !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The response structure is known
        const refreshData = refreshResult.data as SuccessResponse<LoginRes>
        if (refreshData.success) {
          // Guardar los nuevos tokens
          api.dispatch(
            updateToken({
              token: refreshData.data.token,
              refreshToken: refreshData.data.refreshToken
            })
          )

          // Reintentar la petición original
          result = await baseQuery(args, api, extraOptions)
        } else {
          api.dispatch(logout())
        }
      } else {
        api.dispatch(logout())
      }
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes: [
    'Accounts',
    'JournalEntries',
    'Reports',
    'AccountingPeriods',
    'BulkImports',
    'Dashboard',
    'Logs',
    'Users'
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<SuccessResponse<LoginRes>, LoginReq>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    getAccountsTree: builder.query<SuccessResponse<Account[]>, void>({
      query: () => '/accounts/tree',
      providesTags: ['Accounts']
    }),
    createAccount: builder.mutation<SuccessResponse<Account>, CreateAccountReq>(
      {
        query: (newAccount) => ({
          url: '/accounts',
          method: 'POST',
          body: newAccount
        }),
        invalidatesTags: ['Accounts']
      }
    ),
    updateAccount: builder.mutation<SuccessResponse<Account>, UpdateAccountReq>(
      {
        query: (updatedAccount) => ({
          url: '/accounts',
          method: 'PUT',
          body: updatedAccount
        }),
        invalidatesTags: ['Accounts']
      }
    ),
    deleteAccount: builder.mutation<SuccessResponse<void>, string>({
      query: (accountId) => ({
        url: `/accounts/${accountId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Accounts']
    }),
    getJournalEntries: builder.query<
      SuccessResponse<PagedResult<JournalEntry>>,
      JournalEntryFilter | undefined
    >({
      query: (filter) => ({
        url: '/journalEntries',
        params: filter
      }),
      providesTags: ['JournalEntries']
    }),
    getJournalEntry: builder.query<SuccessResponse<JournalEntry>, string>({
      query: (id) => `/journalEntries/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'JournalEntries', id }]
    }),
    createJournalEntry: builder.mutation<
      SuccessResponse<JournalEntry>,
      CreateJournalEntryReq
    >({
      query: (newEntry) => ({
        url: '/journalEntries',
        method: 'POST',
        body: newEntry
      }),
      invalidatesTags: ['JournalEntries', 'Dashboard']
    }),
    updateJournalEntry: builder.mutation<
      SuccessResponse<JournalEntry>,
      UpdateJournalEntryReq
    >({
      query: (updatedEntry) => ({
        url: `/journalEntries/${updatedEntry.id}`,
        method: 'PUT',
        body: updatedEntry
      }),
      invalidatesTags: [
        'JournalEntries',
        { type: 'JournalEntries' },
        'Dashboard'
      ]
    }),
    deleteJournalEntry: builder.mutation<SuccessResponse<void>, string>({
      query: (id) => ({
        url: `/journalEntries/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['JournalEntries', 'Dashboard']
    }),
    getBalanceSheet: builder.query<
      SuccessResponse<BalanceSheet>,
      { date: string; includeUnposted?: boolean }
    >({
      query: ({ date, includeUnposted = false }) =>
        `/reports/balance-sheet?date=${date}&includeUnposted=${includeUnposted}`,
      providesTags: ['Reports']
    }),
    getIncomeStatement: builder.query<
      SuccessResponse<IncomeStatement>,
      { startDate: string; endDate: string; includeUnposted?: boolean }
    >({
      query: ({ startDate, endDate, includeUnposted = false }) =>
        `/reports/income-statement?startDate=${startDate}&endDate=${endDate}&includeUnposted=${includeUnposted}`,
      providesTags: ['Reports']
    }),
    getIncomeStatementExcel: builder.query<
      Blob,
      { startDate: string; endDate: string; includeUnposted?: boolean }
    >({
      query: ({ startDate, endDate, includeUnposted = false }) => ({
        url: `/financialReports/income-statement/excel?startDate=${startDate}&endDate=${endDate}&includeUnposted=${includeUnposted}`,
        responseHandler: async (response) => await response.blob()
      })
    }),
    getIncomeStatementPdf: builder.query<
      Blob,
      { startDate: string; endDate: string; includeUnposted?: boolean }
    >({
      query: ({ startDate, endDate, includeUnposted = false }) => ({
        url: `/financialReports/income-statement/pdf?startDate=${startDate}&endDate=${endDate}&includeUnposted=${includeUnposted}`,
        responseHandler: async (response) => await response.blob()
      })
    }),
    getBalanceSheetExcel: builder.query<
      Blob,
      { date: string; includeUnposted?: boolean }
    >({
      query: ({ date, includeUnposted = false }) => ({
        url: `/financialReports/balance-sheet/excel?date=${date}&includeUnposted=${includeUnposted}`,
        responseHandler: async (response) => await response.blob()
      })
    }),
    getBalanceSheetPdf: builder.query<
      Blob,
      { date: string; includeUnposted?: boolean }
    >({
      query: ({ date, includeUnposted = false }) => ({
        url: `/financialReports/balance-sheet/pdf?date=${date}&includeUnposted=${includeUnposted}`,
        responseHandler: async (response) => await response.blob()
      })
    }),
    getAccountingPeriods: builder.query<
      SuccessResponse<AccountingPeriod[]>,
      void
    >({
      query: () => '/accountingPeriods',
      providesTags: ['AccountingPeriods']
    }),
    getAccountingPeriod: builder.query<
      SuccessResponse<AccountingPeriod>,
      { year: number; month: number }
    >({
      query: ({ year, month }) => `/accountingPeriods/${year}/${month}`,
      providesTags: (_result, _error, { year, month }) => [
        { type: 'AccountingPeriods', id: `${year}-${month}` }
      ]
    }),
    createAccountingPeriod: builder.mutation<
      SuccessResponse<AccountingPeriod>,
      CreateAccountingPeriodReq
    >({
      query: (newPeriod) => ({
        url: '/accountingPeriods',
        method: 'POST',
        body: newPeriod
      }),
      invalidatesTags: ['AccountingPeriods']
    }),
    closeAccountingPeriod: builder.mutation<
      SuccessResponse<AccountingPeriod>,
      ClosePeriodReq
    >({
      query: (closeData) => ({
        url: '/accountingPeriods/close',
        method: 'POST',
        body: closeData
      }),
      invalidatesTags: ['AccountingPeriods', 'JournalEntries']
    }),
    getBulkImportHistory: builder.query<
      SuccessResponse<PagedResult<BulkImportHistory>>,
      BulkImportFilter | undefined
    >({
      query: (filter) => ({
        url: '/bulkImports',
        params: filter
      }),
      providesTags: ['BulkImports']
    }),
    uploadBulkImport: builder.mutation<SuccessResponse<void>, FormData>({
      query: (formData) => ({
        url: '/bulkImports',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['BulkImports', 'JournalEntries', 'Dashboard']
    }),
    getBulkImportTemplate: builder.query<Blob, void>({
      query: () => ({
        url: '/bulkImports/template',
        responseHandler: async (response) => await response.blob()
      })
    }),
    getDashboardSummary: builder.query<SuccessResponse<DashboardSummary>, void>(
      {
        query: () => '/dashboard/summary',
        providesTags: ['Dashboard']
      }
    ),
    getLogs: builder.query<
      SuccessResponse<PagedResult<TransactionLog>>,
      TransactionLogFilter
    >({
      query: (filter) => ({
        url: '/transactionLogs',
        params: filter
      }),
      providesTags: ['Logs']
    }),
    getUsers: builder.query<
      SuccessResponse<PagedResult<UserDto>>,
      UserFilter | undefined
    >({
      query: (filter) => ({
        url: '/users',
        params: filter
      }),
      providesTags: ['Users']
    }),
    getUserById: builder.query<SuccessResponse<UserDto>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }]
    }),
    createUser: builder.mutation<SuccessResponse<string>, CreateUserDto>({
      query: (newUser) => ({
        url: '/users',
        method: 'POST',
        body: newUser
      }),
      invalidatesTags: ['Users']
    }),
    updateUser: builder.mutation<
      SuccessResponse<void>,
      { id: string; user: UpdateUserDto }
    >({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: user
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Users',
        { type: 'Users', id }
      ]
    }),
    updateUserPassword: builder.mutation<
      SuccessResponse<void>,
      { id: string; passwordData: UpdatePasswordDto }
    >({
      query: ({ id, passwordData }) => ({
        url: `/users/${id}/password`,
        method: 'PUT',
        body: passwordData
      })
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginMutation,
  useGetAccountsTreeQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetJournalEntriesQuery,
  useGetJournalEntryQuery,
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation,
  useGetBalanceSheetQuery,
  useGetIncomeStatementQuery,
  useGetIncomeStatementExcelQuery,
  useLazyGetIncomeStatementExcelQuery,
  useGetIncomeStatementPdfQuery,
  useLazyGetIncomeStatementPdfQuery,
  useGetBalanceSheetExcelQuery,
  useLazyGetBalanceSheetExcelQuery,
  useGetBalanceSheetPdfQuery,
  useLazyGetBalanceSheetPdfQuery,
  useGetAccountingPeriodsQuery,
  useGetAccountingPeriodQuery,
  useCreateAccountingPeriodMutation,
  useCloseAccountingPeriodMutation,
  useGetBulkImportHistoryQuery,
  useUploadBulkImportMutation,
  useGetBulkImportTemplateQuery,
  useLazyGetBulkImportTemplateQuery,
  useGetDashboardSummaryQuery,
  useGetLogsQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserPasswordMutation
} = apiSlice
