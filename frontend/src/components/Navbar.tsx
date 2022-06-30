import { AppBar, IconButton, SvgIcon, Toolbar, Typography } from '@mui/material'
import DriverIcon from '@mui/icons-material/DriveEta'

export function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <DriverIcon />
        </IconButton>
        <Typography variant="h6">Code Delivery</Typography>
      </Toolbar>
    </AppBar>
  )
}
