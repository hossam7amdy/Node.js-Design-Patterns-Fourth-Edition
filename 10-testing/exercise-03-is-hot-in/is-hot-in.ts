const threshold = {
  temp: 30,
  unit: 'C',
}

export interface CityTemperature {
  temp_c: number
  last_updated: string
}

export async function isHotIn(city: string): Promise<boolean> {
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?q=${city}`
  )

  if (!response.ok) {
    throw new Error(
      `Failed to get "${city}" weather data: ${response.statusText}`
    )
  }

  const data = (await response.json()) as CityTemperature

  return threshold.temp < data.temp_c
}
