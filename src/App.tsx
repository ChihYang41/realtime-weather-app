import React, { useState, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import { ThemeProvider } from '@emotion/react'
import dayjs from 'dayjs'
import { ReactComponent as DayCloudyIcon } from './images/day-cloudy.svg'
import { ReactComponent as AirFlowIcon } from './images/airFlow.svg'
import { ReactComponent as RainIcon } from './images/rain.svg'
import { ReactComponent as RefreshIcon } from './images/refresh.svg'
import { ReactComponent as LoadingIcon } from './images/loading.svg'
import { theme } from './theme'

// Theme Type
type TThemeMode = 'light' | 'dark'
type TTheme = typeof theme['light']
declare module '@emotion/react' {
  export interface Theme extends TTheme {}
}

// Current Weather Type
interface IWeatherElements {
  WDSD: string
  TEMP: string
}

interface IWeatherItem {
  elementName: string
  elementValue: string
}

// Forecast Type
interface IWeatherForecast {
  Wx: Object
  PoP: Object
  CI: Object
}

interface timeItem {
  parameter: object
  endTime: string
  startTime: string
}
interface IWeatherForecastItem {
  elementName: string
  time: timeItem[]
}

// Weather State Type
interface IWeatherElement {
  locationName: string | Date
  description: string
  windSpeed: number
  temperature: number
  rainPossibility: number
  observationTime: string
  comfortability: string
  weatherCode: number
  isLoading: boolean
}

// Styled Components Type
interface IRefreshProps {
  isLoading: boolean
}

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const WeatherCard = styled.div`
  position: relative;
  min-width: 360px;
  box-shadow: ${({ theme }) => theme.boxShadow};
  background-color: ${({ theme }) => theme.foregroundColor};
  box-sizing: border-box;
  padding: 30px 15px;
`

const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`

const Refresh = styled.div<IRefreshProps>`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
  }

  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`

const DayCloudy = styled(DayCloudyIcon)`
  flex-basis: 30%;
`

// CONSTANTS
const AUTHORIZATION_KEY = 'CWB-A2C09667-9B71-49CD-8FF3-82B2711C86B5'
const LOCATION_NAME = '臺北'
const LOCATION_NAME_FORECAST = '臺北市'

const getCurrentWeather = () => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0]
      const { weatherElement } = data.records.location[0]

      const weatherElements = weatherElement.reduce(
        (weatherElements: IWeatherElements, item: IWeatherItem) => {
          if (['WDSD', 'TEMP'].includes(item.elementName)) {
            weatherElements[item.elementName as keyof IWeatherElements] =
              item.elementValue
          }
          return weatherElements
        },
        {} as IWeatherElements
      )

      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
      }
    })
}

const getWeatherForecast = () => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${AUTHORIZATION_KEY}&locationName=${LOCATION_NAME_FORECAST}`
  )
    .then((response) => response.json())
    .then((data) => {
      const { weatherElement } = data.records.location[0]

      const weatherElements = weatherElement.reduce(
        (neededElement: IWeatherForecast, item: IWeatherForecastItem) => {
          if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
            neededElement[item.elementName as keyof IWeatherForecast] =
              item.time[0].parameter
          }
          return neededElement
        },
        {} as IWeatherElements
      )

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      }
    })
}

function App() {
  const [currentTheme, setCurrentTheme] = useState<TThemeMode>('light')

  const [weatherElement, setWeatherElement] = useState({
    locationName: '',
    description: '',
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    observationTime: '2020-06-23',
    comfortability: '',
    weatherCode: 0,
    isLoading: true,
  })

  const fetchData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    const [currentWeather, weatherForecast] = await Promise.all([
      getCurrentWeather(),
      getWeatherForecast(),
    ])

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    })
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const {
    locationName,
    description,
    comfortability,
    temperature,
    windSpeed,
    rainPossibility,
    isLoading,
    observationTime,
  } = weatherElement

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        <WeatherCard>
          <Location>{locationName}</Location>
          <Description>
            {description} {comfortability}
          </Description>
          <CurrentWeather>
            <Temperature>
              {Math.round(temperature)} <Celsius>°C</Celsius>
            </Temperature>
            <DayCloudy />
          </CurrentWeather>
          <AirFlow>
            <AirFlowIcon />
            {windSpeed} m/h
          </AirFlow>
          <Rain>
            <RainIcon />
            {rainPossibility}%
          </Rain>
          <Refresh
            onClick={() => {
              fetchData()
            }}
            isLoading={isLoading}
          >
            最後觀測時間：
            {dayjs().format(observationTime)}{' '}
            {isLoading ? <LoadingIcon /> : <RefreshIcon />}
          </Refresh>
        </WeatherCard>
      </Container>
    </ThemeProvider>
  )
}

export default App
