export interface UserDto {
  id: string
  userName: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface CreateUserDto {
  userName: string
  email: string
  password: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface UpdateUserDto {
  userName: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface UpdatePasswordDto {
  currentPassword: string
  newPassword: string
}
export interface UserFilter {
  userName?: string
  email?: string
  firstName?: string
  lastName?: string
  pageNumber?: number
  pageSize?: number
}
