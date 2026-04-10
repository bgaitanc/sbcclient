import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
  TablePagination
} from '@mui/material'
import {
  Edit as EditIcon,
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import type { UserDto } from '@shared/types/users/userTypes'

interface UserListProps {
  users: UserDto[] | undefined
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading: boolean
  onEdit: (user: UserDto) => void
  onChangePassword: (user: UserDto) => void
}

export const UserList = ({
  users,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  onEdit,
  onChangePassword
}: UserListProps) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (users === undefined || users.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No se encontraron usuarios.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 40 }} />
            <TableCell>Nombre de Usuario</TableCell>
            <TableCell>Nombre Completo</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <PersonIcon color="action" fontSize="small" />
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{user.userName}</TableCell>
              <TableCell>
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      variant="outlined"
                      color={role === 'Admin' ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar Usuario">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      onEdit(user)
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cambiar Contraseña">
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => {
                      onChangePassword(user)
                    }}
                  >
                    <LockIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(_, newPage) => {
          onPageChange(newPage)
        }}
        onRowsPerPageChange={(event) => {
          onPageSizeChange(parseInt(event.target.value, 10))
        }}
        labelRowsPerPage="Usuarios por página"
      />
    </TableContainer>
  )
}
