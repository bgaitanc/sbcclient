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
import type { SuccessResponse } from '@shared/types/common/global.ts'
import type { LoginReq, LoginRes } from '@shared/types/login/loginValues.ts'
import type {
  Account,
  CreateAccountReq,
  UpdateAccountReq
} from '@shared/types/accounts/accountTypes.ts'
import type {
  JournalEntry,
  CreateJournalEntryReq,
  UpdateJournalEntryReq
} from '@shared/types/journalEntries/journalEntryTypes.ts'

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
  tagTypes: ['Accounts', 'JournalEntries'],
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
    getJournalEntries: builder.query<SuccessResponse<JournalEntry[]>, void>({
      query: () => '/journalEntries',
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
      invalidatesTags: ['JournalEntries']
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
      invalidatesTags: ['JournalEntries', { type: 'JournalEntries' }]
    }),
    deleteJournalEntry: builder.mutation<SuccessResponse<void>, string>({
      query: (id) => ({
        url: `/journalEntries/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['JournalEntries']
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
  useDeleteJournalEntryMutation
} = apiSlice
