import { createTheme } from '@mui/material'
import createPalette from '@mui/material/styles/createPalette'

const palette = createPalette({
  mode: 'dark',
  primary: {
    main: '#ffcd00',
    contrastText: '#242526',
  },
  background: {
    default: '#242526',
  },
})

const theme = createTheme({ palette })

export default theme
