import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import type { SuccessResponse } from '@shared/types/common/global.ts'
import type { LoginReq, LoginRes } from '@shared/types/login/loginValues.ts'

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5164/api', // TODO: Replace with real base URL
    prepareHeaders: (headers, { getState }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Standard Redux Toolkit pattern
      const { auth } = getState() as RootState
      const { token } = auth
      if (token !== null && token !== '') {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation<SuccessResponse<LoginRes>, LoginReq>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLoginMutation } = apiSlice
