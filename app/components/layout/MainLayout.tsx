import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Stack
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AccountTree as AccountTreeIcon,
  MenuBook as MenuBookIcon,
  CloudUpload as CloudUploadIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { useAppDispatch, useAppSelector } from '@redux/hooks.ts'
import { logout, selectCurrentUser } from '@redux/slices/authSlice.ts'

const drawerWidth = 280

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Catálogo de Cuentas', icon: <AccountTreeIcon />, path: '/accounts' },
  {
    text: 'Asientos Contables',
    icon: <MenuBookIcon />,
    path: '/journalEntries'
  },
  { text: 'Carga Masiva', icon: <CloudUploadIcon />, path: '/batch' },
  { text: 'Estados Financieros', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Logs del Sistema', icon: <HistoryIcon />, path: '/logs' }
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const handleLogout = () => {
    dispatch(logout())
    void navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MenuBookIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 'bold', color: '#1a237e' }}
            >
              Sistema básico de contabilidad
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {user?.userName?.charAt(0) ?? 'U'}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                {user?.userName ?? 'Usuario (identity)'}
              </Typography>
            </Stack>
            <IconButton onClick={handleLogout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1e293b',
            color: 'white',
            borderRight: 'none'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      void navigate(item.path)
                    }}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isActive ? '#2563eb' : 'transparent',
                      '&:hover': {
                        bgcolor: isActive
                          ? '#2563eb'
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          fontSize: '0.9rem',
                          fontWeight: isActive ? 'bold' : 'medium'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: '#e5e7eb',
            borderRadius: 2,
            p: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 128px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
