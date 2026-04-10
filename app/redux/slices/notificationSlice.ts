import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AlertColor } from '@mui/material'

interface NotificationState {
  open: boolean
  message: string
  severity: AlertColor
  autoHideDuration?: number
}

const initialState: NotificationState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 4000
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<Omit<NotificationState, 'open'>>
    ) => {
      state.open = true
      state.message = action.payload.message
      state.severity = action.payload.severity
      state.autoHideDuration = action.payload.autoHideDuration ?? 4000
    },
    hideNotification: (state) => {
      state.open = false
    }
  }
})

export const { showNotification, hideNotification } = notificationSlice.actions
export const selectNotification = (state: { notification: NotificationState }) =>
  state.notification

export default notificationSlice.reducer
