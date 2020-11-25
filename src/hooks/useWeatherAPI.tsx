import { useCallback, useState, useEffect } from 'react'

interface IProps {
  locationName: string
  cityName: string
  authorizationKey: string
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

const getCurrentWeather = ({
  locationName,
  authorizationKey,
}: {
  locationName: string
  authorizationKey: string
}) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`
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

const getWeatherForecast = ({
  cityName,
  authorizationKey,
}: {
  cityName: string
  authorizationKey: string
}) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`
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
        weatherCode: Number(weatherElements.Wx.parameterValue),
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      }
    })
}

export default function useWeatherAPI({
  locationName,
  cityName,
  authorizationKey,
}: IProps) {
  const [weatherElement, setWeatherElement] = useState({
    locationName: '',
    description: '',
    windSpeed: 0,
    temperature: 0,
    rainPossibility: 0,
    observationTime: '2020-06-23',
    comfortability: '',
    weatherCode: 1,
    isLoading: true,
  })

  const fetchData = useCallback(async () => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    const [currentWeather, weatherForecast] = await Promise.all([
      getCurrentWeather({ locationName, authorizationKey }),
      getWeatherForecast({ cityName, authorizationKey }),
    ])

    setWeatherElement({
      ...currentWeather,
      ...weatherForecast,
      isLoading: false,
    })
  }, [authorizationKey, locationName, cityName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return [weatherElement, fetchData]
}
