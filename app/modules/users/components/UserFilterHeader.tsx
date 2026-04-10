import { Paper, Stack, TextField } from '@mui/material'

interface UserFilterHeaderProps {
  userName: string
  onUserNameChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
}

export const UserFilterHeader = ({
  userName,
  onUserNameChange,
  email,
  onEmailChange
}: UserFilterHeaderProps) => (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        label="Usuario"
        size="small"
        value={userName}
        onChange={(e) => {
          onUserNameChange(e.target.value)
        }}
        sx={{ minWidth: 200 }}
      />
      <TextField
        label="Email"
        size="small"
        value={email}
        onChange={(e) => {
          onEmailChange(e.target.value)
        }}
        sx={{ minWidth: 200 }}
      />
    </Stack>
  </Paper>
)
