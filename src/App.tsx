import React, { useState, useEffect, useMemo } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import { theme } from './theme'
import { getMoment } from './utils/helpers'
import WeatherCard, { IWeatherElement } from './views/WeatherCard'
import useWeatherAPI from './hooks/useWeatherAPI'

// Theme Type
type TThemeMode = 'light' | 'dark'
type TTheme = typeof theme['light']
declare module '@emotion/react' {
  export interface Theme extends TTheme {}
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

// CONSTANTS
const AUTHORIZATION_KEY = 'CWB-A2C09667-9B71-49CD-8FF3-82B2711C86B5'
const LOCATION_NAME = '臺北'
const LOCATION_NAME_FORECAST = '臺北市'

function App() {
  const [currentTheme, setCurrentTheme] = useState<TThemeMode>('light')

  const moment = useMemo(() => getMoment(LOCATION_NAME_FORECAST), [])
  const [weatherElement, fetchData] = useWeatherAPI({
    locationName: LOCATION_NAME,
    cityName: LOCATION_NAME_FORECAST,
    authorizationKey: AUTHORIZATION_KEY,
  })

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        <WeatherCard
          weatherElement={weatherElement as IWeatherElement}
          moment={moment}
          fetchData={fetchData as Function}
        />
      </Container>
    </ThemeProvider>
  )
}

export default App
