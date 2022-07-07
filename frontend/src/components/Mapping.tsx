import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Button, Grid, MenuItem, Select } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { Loader } from 'google-maps'
import { sample, shuffle } from 'lodash'
import { useSnackbar } from 'notistack'
import { io, Socket } from 'socket.io-client'
import { getCurrentPosistion } from '../util/geolocation'
import { makeCarIcon, makeMarkerIcon, Map } from '../util/map'
import { Route } from '../util/models'
import { RouteExistsError } from '../errors/route-exists.error'
import { Navbar } from './Navbar'

const API_URL = import.meta.env.VITE_API_URL
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const googleMapsLoader = new Loader(GOOGLE_API_KEY)

const colors = [
  '#b71c1c',
  '#4a148c',
  '#2e7d32',
  '#e65100',
  '#2962ff',
  '#c2185b',
  '#FFCD00',
  '#3e2723',
  '#03a9f4',
  '#827717',
]

const useStyles = makeStyles()({
  container: {
    width: '100%',
    height: '100%',
  },
  form: {
    margin: '16px',
  },
  btnWrapper: {
    textAlign: 'center',
    marginTop: '8px',
  },
  map: {
    width: '100%',
    height: '100%',
  },
})

function Mapping() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const mapRef = useRef<Map>()
  const socketRef = useRef<Socket>()
  const { enqueueSnackbar } = useSnackbar()
  const { classes } = useStyles()

  const finishRoute = useCallback(
    (route: Route) => {
      enqueueSnackbar(`${route.title} finalizou!`, { variant: 'success' })
      mapRef.current?.removeRoute(route._id)
    },
    [enqueueSnackbar]
  )

  useEffect(() => {
    if (!socketRef.current?.connected) {
      socketRef.current = io(API_URL).connect()
      socketRef.current.on('connect', () => console.log('conectou'))
    }

    const handler = (data: {
      routeId: string
      position: [number, number]
      finished: boolean
    }) => {
      mapRef.current?.moveCurrentMarker(data.routeId, {
        lat: data.position[0],
        lng: data.position[1],
      })
      const route = routes.find((route) => route._id === data.routeId) as Route
      if (data.finished) {
        finishRoute(route)
      }
    }

    socketRef.current?.on('new-position', handler)
    return () => {
      socketRef.current?.off('new-position', handler)
    }
  }, [finishRoute, routes])

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then((data) => data.json())
      .then((data) => setRoutes(data))
  }, [])

  useEffect(() => {
    ;(async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPosistion({ enableHighAccuracy: true }),
      ])
      const mapElement = document.getElementById('map') as HTMLElement
      mapRef.current = new Map(mapElement, {
        zoom: 15,
        center: position,
      })
    })()
  }, [])

  const startRoute = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const route = routes.find((route) => route._id === selectedRoute)
      const color = sample(shuffle(colors)) as string
      try {
        mapRef.current?.addRoute(selectedRoute, {
          currentMarkerOptions: {
            position: route?.startPosition,
            icon: makeCarIcon(color),
          },
          endMarkerOptions: {
            position: route?.endPosition,
            icon: makeMarkerIcon(color),
          },
        })
        socketRef.current?.emit('new-direction', { routeId: selectedRoute })
      } catch (error) {
        if (error instanceof RouteExistsError) {
          enqueueSnackbar(`${route?.title} já adicionado, espere finalizar.`, {
            variant: 'error',
          })
          return
        }
        throw error
      }
    },
    [selectedRoute, routes, enqueueSnackbar]
  )

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} sm={3}>
        <Navbar />
        <form className={classes.form} onSubmit={startRoute}>
          <Select
            fullWidth
            displayEmpty
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <MenuItem value="">
              <em>Selecione uma corrida</em>
            </MenuItem>
            {routes.map((route, key) => (
              <MenuItem key={key} value={route._id}>
                {route.title}
              </MenuItem>
            ))}
          </Select>
          <div className={classes.btnWrapper}>
            <Button type="submit" color="primary" variant="contained">
              Iniciar uma corrida
            </Button>
          </div>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" className={classes.map}></div>
      </Grid>
    </Grid>
  )
}

export default Mapping
