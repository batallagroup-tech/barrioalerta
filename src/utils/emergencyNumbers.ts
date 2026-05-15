import { Location } from "../types";
import { calculateDistance } from "./geo";

// ── Tipos ────────────────────────────────────────────────────────────────────
export interface EmergencyContact {
  name: string;
  police: string;
  ambulance: string;
  fire?: string;
  lat: number;
  lng: number;
  distance?: number;
}

// ── Base de datos: estados y principales municipios de México ────────────────
// Coordenadas = centro aproximado de cada municipio/alcaldía
const EMERGENCY_DB: EmergencyContact[] = [
  // ── CDMX - Alcaldías ──────────────────────────────────────────────────────
  { name: "Iztapalapa",        lat: 19.3553, lng: -99.0622, police: "55 5445 1111", ambulance: "55 5445 1111", fire: "55 5445 1111" },
  { name: "Gustavo A. Madero", lat: 19.4944, lng: -99.1144, police: "55 5781 3822", ambulance: "55 5781 3822", fire: "55 5781 3822" },
  { name: "Álvaro Obregón",    lat: 19.3587, lng: -99.2017, police: "55 5814 2020", ambulance: "55 5814 2020", fire: "55 5814 2020" },
  { name: "Tlalpan",           lat: 19.2948, lng: -99.1697, police: "55 5573 8510", ambulance: "55 5573 8510", fire: "55 5573 8510" },
  { name: "Coyoacán",          lat: 19.3467, lng: -99.1617, police: "55 5659 0268", ambulance: "55 5659 0268", fire: "55 5659 0268" },
  { name: "Xochimilco",        lat: 19.2571, lng: -99.1043, police: "55 5676 0810", ambulance: "55 5676 0810", fire: "55 5676 0810" },
  { name: "Benito Juárez",     lat: 19.3984, lng: -99.1584, police: "55 5605 7579", ambulance: "55 5605 7579", fire: "55 5605 7579" },
  { name: "Cuauhtémoc",        lat: 19.4333, lng: -99.1467, police: "55 5709 3011", ambulance: "55 5709 3011", fire: "55 5709 3011" },
  { name: "Miguel Hidalgo",    lat: 19.4270, lng: -99.1941, police: "55 5271 5105", ambulance: "55 5271 5105", fire: "55 5271 5105" },
  { name: "Azcapotzalco",      lat: 19.4867, lng: -99.1847, police: "55 5354 5058", ambulance: "55 5354 5058", fire: "55 5354 5058" },
  { name: "Tláhuac",           lat: 19.2913, lng: -99.0044, police: "55 5842 0433", ambulance: "55 5842 0433", fire: "55 5842 0433" },
  { name: "Magdalena Contreras",lat: 19.3247,lng: -99.2258, police: "55 5652 5700", ambulance: "55 5652 5700", fire: "55 5652 5700" },
  { name: "Venustiano Carranza",lat: 19.4333,lng: -99.1167, police: "55 5552 5742", ambulance: "55 5552 5742", fire: "55 5552 5742" },
  { name: "Cuajimalpa",        lat: 19.3597, lng: -99.2989, police: "55 5812 0044", ambulance: "55 5812 0044", fire: "55 5812 0044" },
  { name: "Milpa Alta",        lat: 19.1928, lng: -99.0228, police: "55 5844 0051", ambulance: "55 5844 0051", fire: "55 5844 0051" },
  { name: "Iztacalco",         lat: 19.3951, lng: -99.0973, police: "55 5650 3633", ambulance: "55 5650 3633", fire: "55 5650 3633" },

  // ── Estado de México ──────────────────────────────────────────────────────
  { name: "Ecatepec",          lat: 19.6017, lng: -99.0450, police: "55 5116 7428", ambulance: "55 5116 7428", fire: "800 696 9696" },
  { name: "Nezahualcóyotl",    lat: 19.4007, lng: -98.9800, police: "55 5743 4343", ambulance: "55 5743 4343", fire: "55 5743 4343" },
  { name: "Chimalhuacán",      lat: 19.4300, lng: -98.9500, police: "55 5853 6128", ambulance: "55 5853 6128", fire: "55 5853 6128" },
  { name: "Naucalpan",         lat: 19.4800, lng: -99.2400, police: "55 5373 0202", ambulance: "55 5373 0202", fire: "55 5373 5151" },
  { name: "Tlalnepantla",      lat: 19.5400, lng: -99.2000, police: "55 5390 3526", ambulance: "55 5390 3526", fire: "55 5390 3526" },
  { name: "Toluca",            lat: 19.2826, lng: -99.6557, police: "722 213 4444", ambulance: "722 213 1515", fire: "722 213 2323" },
  { name: "Atizapán",          lat: 19.5700, lng: -99.2600, police: "55 5824 0600", ambulance: "55 5824 0600", fire: "55 5824 0600" },
  { name: "Ixtapaluca",        lat: 19.3167, lng: -98.8833, police: "55 5970 7080", ambulance: "55 5970 7080", fire: "55 5970 7080" },
  { name: "Cuautitlán Izcalli", lat: 19.6500, lng: -99.2167, police: "55 5872 0911", ambulance: "55 5872 0911", fire: "55 5872 0911" },
  { name: "Texcoco",           lat: 19.5144, lng: -98.8817, police: "595 954 4800", ambulance: "595 954 4800", fire: "595 954 4800" },

  // ── Jalisco ───────────────────────────────────────────────────────────────
  { name: "Guadalajara",       lat: 20.6597, lng: -103.3496, police: "33 3668 0800", ambulance: "33 3614 5151", fire: "33 3619 5241" },
  { name: "Zapopan",           lat: 20.7214, lng: -103.3914, police: "33 3818 2200", ambulance: "33 3818 2200", fire: "33 3818 2200" },
  { name: "Tlaquepaque",       lat: 20.6417, lng: -103.3117, police: "33 3837 0600", ambulance: "33 3837 0600", fire: "33 3837 0600" },
  { name: "Tonalá",            lat: 20.6231, lng: -103.2344, police: "33 3284 3200", ambulance: "33 3284 3200", fire: "33 3284 3200" },

  // ── Nuevo León ────────────────────────────────────────────────────────────
  { name: "Monterrey",         lat: 25.6866, lng: -100.3161, police: "81 8342 5100", ambulance: "81 8374 4000", fire: "81 8342 5100" },
  { name: "San Nicolás",       lat: 25.7456, lng: -100.2731, police: "81 8352 5000", ambulance: "81 8352 5000", fire: "81 8352 5000" },
  { name: "Guadalupe NL",      lat: 25.6753, lng: -100.2597, police: "81 8337 5300", ambulance: "81 8337 5300", fire: "81 8337 5300" },
  { name: "Apodaca",           lat: 25.7814, lng: -100.1883, police: "81 8386 6200", ambulance: "81 8386 6200", fire: "81 8386 6200" },

  // ── Puebla ────────────────────────────────────────────────────────────────
  { name: "Puebla",            lat: 19.0414, lng: -98.2063, police: "222 309 4500", ambulance: "222 246 1919", fire: "222 232 1300" },
  { name: "San Andrés Cholula", lat: 19.0628, lng: -98.3072, police: "222 106 1600", ambulance: "222 106 1600", fire: "222 106 1600" },

  // ── Veracruz ──────────────────────────────────────────────────────────────
  { name: "Veracruz",          lat: 19.1738, lng: -96.1342, police: "229 932 0020", ambulance: "229 931 1313", fire: "229 931 2626" },
  { name: "Xalapa",            lat: 19.5438, lng: -96.9102, police: "228 841 8000", ambulance: "228 817 1313", fire: "228 817 3030" },

  // ── Guanajuato ────────────────────────────────────────────────────────────
  { name: "León",              lat: 21.1221, lng: -101.6827, police: "477 710 4000", ambulance: "477 710 4000", fire: "477 710 4000" },
  { name: "Irapuato",          lat: 20.6736, lng: -101.3552, police: "462 626 0300", ambulance: "462 626 0300", fire: "462 626 0300" },

  // ── Chihuahua ─────────────────────────────────────────────────────────────
  { name: "Ciudad Juárez",     lat: 31.6904, lng: -106.4245, police: "656 415 0000", ambulance: "656 415 0000", fire: "656 615 1400" },
  { name: "Chihuahua",         lat: 28.6320, lng: -106.0691, police: "614 429 3300", ambulance: "614 411 1313", fire: "614 415 2424" },

  // ── Sonora ────────────────────────────────────────────────────────────────
  { name: "Hermosillo",        lat: 29.0729, lng: -110.9559, police: "662 289 6500", ambulance: "662 213 2525", fire: "662 217 2727" },

  // ── Coahuila ──────────────────────────────────────────────────────────────
  { name: "Saltillo",          lat: 25.4232, lng: -100.9932, police: "844 430 3000", ambulance: "844 415 1313", fire: "844 415 2626" },
  { name: "Torreón",           lat: 25.5428, lng: -103.4068, police: "871 729 0000", ambulance: "871 713 1313", fire: "871 718 3030" },

  // ── Tamaulipas ────────────────────────────────────────────────────────────
  { name: "Reynosa",           lat: 26.0922, lng: -98.2775, police: "899 923 1212", ambulance: "899 921 1313", fire: "899 922 1111" },
  { name: "Matamoros",         lat: 25.8694, lng: -97.5027, police: "868 813 0000", ambulance: "868 813 1313", fire: "868 813 2626" },

  // ── Sinaloa ───────────────────────────────────────────────────────────────
  { name: "Culiacán",          lat: 24.8091, lng: -107.3940, police: "667 712 0000", ambulance: "667 715 5656", fire: "667 713 1818" },
  { name: "Mazatlán",          lat: 23.2494, lng: -106.4111, police: "669 981 2828", ambulance: "669 981 2525", fire: "669 985 1212" },

  // ── Baja California ───────────────────────────────────────────────────────
  { name: "Tijuana",           lat: 32.5027, lng: -117.0039, police: "664 973 7000", ambulance: "664 684 0404", fire: "664 688 0666" },
  { name: "Mexicali",          lat: 32.6278, lng: -115.4545, police: "686 558 3200", ambulance: "686 558 3200", fire: "686 558 3200" },

  // ── Yucatán ───────────────────────────────────────────────────────────────
  { name: "Mérida",            lat: 20.9674, lng: -89.5926, police: "999 942 0060", ambulance: "999 924 9111", fire: "999 928 1116" },

  // ── Quintana Roo ──────────────────────────────────────────────────────────
  { name: "Cancún",            lat: 21.1619, lng: -86.8515, police: "998 884 1107", ambulance: "998 884 1616", fire: "998 884 1202" },
  { name: "Playa del Carmen",  lat: 20.6296, lng: -87.0739, police: "984 877 3340", ambulance: "984 873 3030", fire: "984 873 3030" },

  // ── Guerrero ──────────────────────────────────────────────────────────────
  { name: "Acapulco",          lat: 16.8531, lng: -99.8237, police: "744 484 4470", ambulance: "744 485 7005", fire: "744 484 4470" },

  // ── Oaxaca ────────────────────────────────────────────────────────────────
  { name: "Oaxaca",            lat: 17.0732, lng: -96.7266, police: "951 516 0422", ambulance: "951 515 1515", fire: "951 516 3535" },

  // ── Chiapas ───────────────────────────────────────────────────────────────
  { name: "Tuxtla Gutiérrez",  lat: 16.7516, lng: -93.1152, police: "961 602 4300", ambulance: "961 602 4300", fire: "961 602 4300" },

  // ── San Luis Potosí ───────────────────────────────────────────────────────
  { name: "San Luis Potosí",   lat: 22.1565, lng: -100.9855, police: "444 812 3300", ambulance: "444 811 5656", fire: "444 814 1818" },

  // ── Aguascalientes ────────────────────────────────────────────────────────
  { name: "Aguascalientes",    lat: 21.8853, lng: -102.2916, police: "449 910 5700", ambulance: "449 910 5700", fire: "449 910 5700" },

  // ── Querétaro ─────────────────────────────────────────────────────────────
  { name: "Querétaro",         lat: 20.5888, lng: -100.3899, police: "442 238 8500", ambulance: "442 211 0707", fire: "442 214 0600" },

  // ── Hidalgo ───────────────────────────────────────────────────────────────
  { name: "Pachuca",           lat: 20.1011, lng: -98.7591, police: "771 716 0011", ambulance: "771 714 2424", fire: "771 715 1616" },

  // ── Morelos ───────────────────────────────────────────────────────────────
  { name: "Cuernavaca",        lat: 18.9242, lng: -99.2216, police: "777 318 6800", ambulance: "777 318 1313", fire: "777 312 2626" },

  // ── Michoacán ─────────────────────────────────────────────────────────────
  { name: "Morelia",           lat: 19.7060, lng: -101.1950, police: "443 113 0600", ambulance: "443 317 0626", fire: "443 324 7171" },

  // ── Durango ───────────────────────────────────────────────────────────────
  { name: "Durango",           lat: 24.0277, lng: -104.6532, police: "618 137 7600", ambulance: "618 811 2525", fire: "618 811 1818" },

  // ── Zacatecas ─────────────────────────────────────────────────────────────
  { name: "Zacatecas",         lat: 22.7709, lng: -102.5832, police: "492 922 3181", ambulance: "492 922 3030", fire: "492 922 1212" },

  // ── Tabasco ───────────────────────────────────────────────────────────────
  { name: "Villahermosa",      lat: 17.9892, lng: -92.9475, police: "993 310 2700", ambulance: "993 315 1313", fire: "993 315 3535" },

  // ── Campeche ──────────────────────────────────────────────────────────────
  { name: "Campeche",          lat: 19.8301, lng: -90.5349, police: "981 811 9030", ambulance: "981 811 9000", fire: "981 811 9000" },

  // ── Tlaxcala ──────────────────────────────────────────────────────────────
  { name: "Tlaxcala",          lat: 19.3182, lng: -98.2375, police: "246 466 0100", ambulance: "246 466 0100", fire: "246 466 0100" },

  // ── Colima ────────────────────────────────────────────────────────────────
  { name: "Colima",            lat: 19.2452, lng: -103.7241, police: "312 316 6060", ambulance: "312 313 3333", fire: "312 312 1818" },

  // ── Nayarit ───────────────────────────────────────────────────────────────
  { name: "Tepic",             lat: 21.5042, lng: -104.8946, police: "311 215 6868", ambulance: "311 215 1313", fire: "311 215 3030" },

  // ── Baja California Sur ───────────────────────────────────────────────────
  { name: "La Paz",            lat: 24.1426, lng: -110.3128, police: "612 122 0477", ambulance: "612 122 0477", fire: "612 122 0477" },

  // ── Sonora norte ──────────────────────────────────────────────────────────
  { name: "Nogales Sonora",    lat: 31.3000, lng: -110.9333, police: "631 313 1818", ambulance: "631 312 1515", fire: "631 312 3030" },
];

// ── Función principal ────────────────────────────────────────────────────────
// Devuelve los 4 municipios más cercanos a la ubicación del usuario
export const getLocalEmergencyNumbers = (userLocation: Location, limit = 4): (EmergencyContact & { distance: number })[] => {
  return EMERGENCY_DB
    .map(contact => ({
      ...contact,
      distance: calculateDistance(userLocation, { lat: contact.lat, lng: contact.lng }),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};
