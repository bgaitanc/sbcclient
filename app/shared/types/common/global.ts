export interface SuccessResponse<T> {
  data: T
  message: string | null
  statusCode: number
  success: boolean
}
