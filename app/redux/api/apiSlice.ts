import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // TODO: Replace with real base URL
  endpoints: (builder) => ({
    getExampleData: builder.query<unknown, undefined>({
      query: () => '/data'
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetExampleDataQuery } = apiSlice
