import React, { useState, useEffect, useMemo } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import { theme } from './theme'
import { findLocation, getMoment } from './utils/helpers'
import WeatherCard, { IWeatherElement } from './views/WeatherCard'
import WeatherSetting from './views/WeatherSetting'
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

function App() {
  const storageCity = localStorage.getItem('cityName') || '臺北市'
  const [currentCity, setCurrentCity] = useState(storageCity)
  const [currentTheme, setCurrentTheme] = useState<TThemeMode>('light')
  const [currentPage, setCurrentPage] = useState('WeatherCard')

  const currentLocation = useMemo(() => findLocation(currentCity), [
    currentCity,
  ])

  const { cityName, locationName, sunriseCityName } = currentLocation!

  const moment = useMemo(() => getMoment(sunriseCityName), [sunriseCityName])

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  })

  const handleCurrentCityChange = (currentCity: string) => {
    setCurrentCity(currentCity)
  }

  const handleCurrentPageChange = (
    currentPage: 'WeatherCard' | 'WeatherSetting'
  ) => {
    setCurrentPage(currentPage)
  }

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === 'WeatherCard' && (
          <WeatherCard
            weatherElement={weatherElement as IWeatherElement}
            moment={moment}
            fetchData={fetchData as Function}
            handleCurrentPageChange={handleCurrentPageChange}
            cityName={cityName}
          />
        )}
        {currentPage === 'WeatherSetting' && (
          <WeatherSetting
            cityName={cityName}
            handleCurrentPageChange={handleCurrentPageChange}
            handleCurrentCityChange={handleCurrentCityChange}
          />
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
