import { useState } from 'react'
import { Box, Typography, Button, Paper, Container } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useGetUsersQuery } from '@/redux/api/apiSlice'
import { UserList } from '@/modules/users/components/UserList'
import { UserForm } from '@/modules/users/components/UserForm'
import { ChangePasswordForm } from '@/modules/users/components/ChangePasswordForm'
import { UserFilterHeader } from '@/modules/users/components/UserFilterHeader'
import type { UserDto } from '@shared/types/users/userTypes'
import type { SuccessResponse, PagedResult } from '@shared/types/common/global'

type ViewMode = 'LIST' | 'CREATE' | 'EDIT' | 'PASSWORD'

interface UsersPageHeaderProps {
  viewMode: ViewMode
  onCreate: () => void
}

const UsersPageHeader = ({ viewMode, onCreate }: UsersPageHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 4
    }}
  >
    <Typography variant="h4" component="h1">
      Gestión de Usuarios
    </Typography>
    {viewMode === 'LIST' && (
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onCreate}
      >
        Nuevo Usuario
      </Button>
    )}
  </Box>
)

interface UsersContentProps {
  viewMode: ViewMode
  selectedUser: UserDto | null
  usersResponse: SuccessResponse<PagedResult<UserDto>> | undefined
  isLoading: boolean
  page: number
  pageSize: number
  userName: string
  email: string
  onUserNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onEdit: (user: UserDto) => void
  onChangePassword: (user: UserDto) => void
  onSuccess: () => void
  onCancel: () => void
}

const UsersContent = ({
  viewMode,
  selectedUser,
  usersResponse,
  isLoading,
  page,
  pageSize,
  userName,
  email,
  onUserNameChange,
  onEmailChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onChangePassword,
  onSuccess,
  onCancel
}: UsersContentProps) => {
  if (viewMode === 'LIST') {
    return (
      <>
        <UserFilterHeader
          userName={userName}
          onUserNameChange={onUserNameChange}
          email={email}
          onEmailChange={onEmailChange}
        />

        <UserList
          users={usersResponse?.data.items}
          totalCount={usersResponse?.data.totalCount ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          onEdit={onEdit}
          onChangePassword={onChangePassword}
        />
      </>
    )
  }

  if (viewMode === 'PASSWORD' && selectedUser !== null) {
    return (
      <Paper sx={{ p: 4 }}>
        <ChangePasswordForm
          userId={selectedUser.id}
          userName={selectedUser.userName}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 4 }}>
      <UserForm
        initialData={selectedUser}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Paper>
  )
}

export default function Users() {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST')
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  // Filtering and pagination state
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')

  const {
    data: usersResponse,
    isLoading,
    refetch
  } = useGetUsersQuery({
    pageNumber: page + 1,
    pageSize,
    userName: userName !== '' ? userName : undefined,
    email: email !== '' ? email : undefined
  })

  const handleEdit = (user: UserDto) => {
    setSelectedUser(user)
    setViewMode('EDIT')
  }

  const handleChangePassword = (user: UserDto) => {
    setSelectedUser(user)
    setViewMode('PASSWORD')
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setViewMode('CREATE')
  }

  const handleSuccess = () => {
    setViewMode('LIST')
    void refetch()
  }

  const handleCancel = () => {
    setViewMode('LIST')
  }

  const handleUserNameChange = (value: string) => {
    setUserName(value)
    setPage(0)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setPage(0)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <UsersPageHeader viewMode={viewMode} onCreate={handleCreate} />

      <UsersContent
        viewMode={viewMode}
        selectedUser={selectedUser}
        usersResponse={usersResponse}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        userName={userName}
        email={email}
        onUserNameChange={handleUserNameChange}
        onEmailChange={handleEmailChange}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={handleEdit}
        onChangePassword={handleChangePassword}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Container>
  )
}
