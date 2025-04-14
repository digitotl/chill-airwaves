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
  }
]
