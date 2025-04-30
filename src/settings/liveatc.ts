export interface Airport {
  name: string;
  iata: string;
  icao: string;
  restricted: boolean;
  location: {
    city: string;
    country: string;
    state?: string;
    UTC: number;
  },
  stations: Station[];
}

export interface Station {
  name: string;
  path: string;
}

export const airports: Airport[] = [
  {
    name: 'San Francisco Intl Airport',
    location: {
      city: 'San Francisco',
      country: 'USA',
      UTC: -8
    },
    iata: 'sfo',
    icao: 'ksfo',
    restricted: false,
    stations: [
      {
        name: 'KSFO-Gnd2',
        path: 'KSFO-Gnd2'
      }
    ]
  },
  {
    name: 'Newark Liberty Intl Airport',
    iata: 'ewr',
    icao: 'kewr',
    restricted: false,
    location: {
      city: 'Newark',
      country: 'USA',
      UTC: -4
    },
    stations: [
      {
        name: 'KEWR-Gnd',
        path: 'KEWR-Gnd'
      }
    ]
  },
  {
    name: 'Londrina Airport',
    iata: 'LDB',
    icao: 'sblo',
    restricted: false,
    location: {
      city: 'Londrina',
      country: 'Brazil',
      UTC: -3
    },
    stations: [
      {
        name: 'SBLO-Twr-App-Center',
        path: 'SBLO-Twr-App-Center'
      }
    ]
  },
  {
    icao: 'rjtt',
    iata: 'hnd',
    name: 'Tokyo Haneda Airport',
    location: {
      city: 'Tokyo',
      country: 'Japan',
      state: 'Tokyo',
      UTC: 9
    },
    restricted: false,
    stations: [
      {
        name: 'RJTT-Gnd',
        path: 'RJTT-Gnd'
      }
    ]
  },
  {
    icao: 'eidw',
    iata: 'DUB',
    name: 'Dublin Airport',
    location: {
      city: 'Dublin',
      country: 'Ireland',
      state: 'Leinster',
      UTC: 0
    },
    restricted: false,
    stations: [
      {
        name: 'EIDW8-Gnd-Twr-App-Ctr',
        path: 'EIDW8-Gnd-Twr-App-Ctr'
      }
    ]
  },
  {
    icao: 'sbpa',
    iata: 'POA',
    name: 'Salgado Filho International Airport',
    location: {
      city: 'Porto Alegre',
      country: 'Brazil',
      state: 'Rio Grande do Sul',
      UTC: -3
    },
    restricted: false,
    stations: [
      {
        name: 'SBPA2',
        path: 'SBPA2'
      }
    ]
  }
]
