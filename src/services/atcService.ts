import { Station } from "../settings/liveatc";


export function formatAirportPath(airportIcao: string, station: Station) {
  return `${airportIcao}/${station.path}`;
}
