/**
 * REGISTRO DE LLEGADA A SUCURSAL - Trafico CD 093
 * Apps Script vinculado al Google Sheet donde quedan los marcados.
 *
 * Primera vez:
 *   1) Ejecutar la funcion setup()  (crea las hojas y carga las sucursales)
 *   2) Implementar > Nueva implementacion > Aplicacion web
 *        Ejecutar como: Yo   |   Quien tiene acceso: Cualquier usuario
 *   3) Copiar la URL que termina en /exec y pegarla en index.html (SCRIPT_URL)
 */

const APP_KEY = 'TRAFICO-CD093-LLEGADAS';      // debe ser igual a la de index.html
const TZ = 'America/Argentina/Buenos_Aires';
const RADIO_DEFAULT = 300;                      // metros, si la sucursal no tiene radio propio

const HOJA_SUC = 'Sucursales';
const HOJA_MARC = 'Marcados';
const HOJA_CHOF = 'Choferes';

const COLS_SUC = ['Sucursal', 'Direcci\u00f3n', 'Latitud', 'Longitud', 'Radio (m)', 'Distancia', 'Horario Refri', 'Horario SN'];
const COLS_MARC = ['ID', 'Fecha', 'Hora llegada', 'Legajo', 'Chofer', 'Empresa', 'HDR', 'Sucursal',
  'Direcci\u00f3n', 'Modo', 'Distancia a la sucursal (m)', 'Dentro del radio', 'Suc. m\u00e1s cercana',
  'Dist. a la m\u00e1s cercana (m)', 'Latitud', 'Longitud', 'Precisi\u00f3n GPS (m)', 'Enviado con demora (min)',
  'Desfase reloj celular (min)', 'Hora recibido', 'Dispositivo', 'Horario Refri', 'Horario SN'];
const COLS_CHOF = ['Fecha alta', 'Legajo', 'Chofer', 'Empresa', 'Dispositivo'];

const SUCURSALES_INICIALES = [
  ["2", "SAN MARTIN 2095 - PATERNAL", -34.604423, -58.457357, "", "Corta Distancia"],
  ["6", "LA PLATA 2392 - POMPEYA", -34.642305, -58.42271, "", "Corta Distancia"],
  ["7", "JUAN DE GARAY - PARQUE PATRICIOS", -34.628806, -58.402221, "", "Corta Distancia"],
  ["13", "RUTA 3 KM 44.400 - GONZALEZ CATAN", -34.875964, -58.681749, "", "Corta Distancia"],
  ["18", "H.YRIGOYEN 3702 - ONCE", -34.614338, -58.418872, "", "Corta Distancia"],
  ["19", "LIMA 1553 - CONSTITUCION", -34.62633, -58.382572, "", "Corta Distancia"],
  ["20", "ELCANO 3693 - BELGRANO", -34.578958, -58.46066, "", "Corta Distancia"],
  ["22", "EL CANO 3002 - BELGRANO", -34.57025, -58.458523, "", "Corta Distancia"],
  ["24", "SCALABRINI ORTIZ 1688 - PALERMO", -34.589986, -58.424395, "", "Corta Distancia"],
  ["25", "PERU 1496 - SAN TELMO", -34.62477, -58.373658, "", "Corta Distancia"],
  ["26", "CERVINIO 3515 - PALERMO", -34.58015, -58.408796, "", "Corta Distancia"],
  ["35", "LOPEZ DE VEGA 2503 - VILLA DEVOTO", -34.617718, -58.519397, "", "Corta Distancia"],
  ["37", "PIEDRA BUENA 4902 - LUGANO", -34.686707, -58.475107, "", "Corta Distancia"],
  ["38", "SAN MARTIN 3029 - FLORIDA", -34.532106, -58.502498, "", "Corta Distancia"],
  ["39", "EMILIO CASTRO 7661 - LINIERS", -34.655923, -58.524952, "", "Corta Distancia"],
  ["40", "EVA PERON 2202 - FLORES SUR", -34.637893, -58.452696, "", "Corta Distancia"],
  ["41", "DIAZ VELEZ 4531 - ALMAGRO", -34.607886, -58.43112, "", "Corta Distancia"],
  ["42", "PARAGUAY 2672/94 - BARRIO NORTE", -34.596922, -58.406385, "", "Corta Distancia"],
  ["43", "BOEDO 777 - BOEDO", -34.621275, -58.416839, "", "Corta Distancia"],
  ["44", "MONROE 3284/98 - BELGRANO", -34.563609, -58.468434, "", "Corta Distancia"],
  ["45", "CABILDO 545 - BELGRANO", -34.570142, -58.4423, "", "Corta Distancia"],
  ["46", "RIVADAVIA 2846 - ONCE", null, null, "", "Corta Distancia"],
  ["47", "AMENABAR 2134/52 - BELGRANO", -34.562681, -58.458982, "", "Corta Distancia"],
  ["48", "DIRECTORIO 2647/57 - FLORES", -34.633871, -58.46448, "", "Corta Distancia"],
  ["49", "SAN MARTIN 251/75 - MAR DE AJO", -36.72112, -56.676932, "", "Larga Distancia"],
  ["50", "ESPINOSA 1960 - PATERNAL", -34.604022, -58.457625, "", "Corta Distancia"],
  ["51", "RIVADAVIA 13810 - RAMOS MEJIA", -34.639773, -58.561952, "", "Corta Distancia"],
  ["52", "SANABRIA 3320 - DEVOTO", -34.60549, -58.511013, "", "Corta Distancia"],
  ["53", "LA PLATA 3635 - SANTOS LUGARES", -34.599982, -58.544547, "", "Corta Distancia"],
  ["55", "AVELLANEDA 3758 - FLORESTA", -34.629156, -58.481606, "", "Corta Distancia"],
  ["56", "HONDURAS 3862 - PALERMO", -34.594198, -58.417572, "", "Corta Distancia"],
  ["57", "Av. San Mart\u00edn 1866 - ZONA OESTE", -34.579216, -58.536169, "", "Corta Distancia"],
  ["58", "VIAMONTE 1571 - TRIBUNALES", -34.600463, -58.389204, "", "Corta Distancia"],
  ["59", "MONROE 5055/87 - VILLA URQUIZA", -34.573657, -58.485956, "", "Corta Distancia"],
  ["60", "JUAN B.ALBERDI 1737/49 - FLORES", -34.627905, -58.453477, "", "Corta Distancia"],
  ["61", "ALSINA - ONCE", -34.612417, -58.399571, "", "Corta Distancia"],
  ["63", "CNEL ROCA 1345 - POMPEYA", -34.654961, -58.418041, "", "Corta Distancia"],
  ["64", "MITRE 3300 - SARANDI", -34.682217, -58.341783, "", "Corta Distancia"],
  ["65", "H.YRIGOYEN 380 - QUILMES", -34.71879, -58.262353, "", "Corta Distancia"],
  ["66", "MAURE 1730 - BELGRANO", -34.566108, -58.436375, "", "Corta Distancia"],
  ["67", "ALBARELLOS 854 - ACASSUSO", -34.479914, -58.505349, "", "Corta Distancia"],
  ["68", "JORGE NEWBERY 555 - LAS LOMAS", -34.480304, -58.537523, "", "Corta Distancia"],
  ["69", "LIBERTADOR 18243 - PUNTA CHICA", -34.452183, -58.52727, "", "Corta Distancia"],
  ["70", "JUAN B. DE LA SALLE 653 - SAN ISIDRO", -34.466039, -58.507594, "", "Corta Distancia"],
  ["74", "GALLO 250 - ALMAGRO", -34.605357, -58.413724, "", "Corta Distancia"],
  ["75", "BERNARDINO RIVADAVIA 2602 - LANUS", -34.690607, -58.419915, "", "Corta Distancia"],
  ["78", "MEXICO 2236 Y PICHINCHA - SAN CRISTOBAL", -34.61572, -58.398735, "", "Corta Distancia"],
  ["80", "FRENCH 2417 - CAP. FED.", -34.5902, -58.399691, "", "Corta Distancia"],
  ["82", "MALABIA 103/43 - VILLA CRESPO", -34.601062, -58.442099, "", "Corta Distancia"],
  ["83", "RIVADAVIA 9840 / 54 - VILLA LURO", -34.637601, -58.502737, "", "Corta Distancia"],
  ["84", "CASTRO BARROS 24 - ALMAGRO", -34.611745, -58.420685, "", "Corta Distancia"],
  ["85", "EVA PERON 4730/32 - MATADEROS", -34.655971, -58.476766, "", "Corta Distancia"],
  ["90", "SEGUROLA 1701 - DEVOTO", -34.61932, -58.49935, "", "Corta Distancia"],
  ["91", "AGUERO 670 - ABASTO", -34.602375, -58.411747, "", "Corta Distancia"],
  ["92", "MAIPU 1758/60/62 - VTE LOPEZ", -34.521557, -58.485138, "", "Corta Distancia"],
  ["93", "Centro de Distribucion", -34.772574, -58.482354, "", "Corta Distancia"],
  ["94", "BOULOGNE SUR MER Y AV COOPERACION - TAPIALES", -34.701806, -58.499704, "", "Corta Distancia"],
  ["95", "MENDOZA 3905 - ROSARIO", -32.944619, -60.678067, "", "Larga Distancia"],
  ["96", "VENEZUELA 114 BIS - FISHERTON", -32.928844, -60.724543, "", "Larga Distancia"],
  ["97", "URQUIZA 1644/62/64/66 - ROSARIO", -32.941315, -60.644857, "", "Larga Distancia"],
  ["99", "3 DE FEBRERO - ROSARIO", -32.932897, -60.654819, "", "Larga Distancia"],
  ["101", "ITALIA 62 - AVELLANEDA", -34.665133, -58.362221, "", "Corta Distancia"],
  ["103", "GAONA 1902/50 - CAPITAL FEDERAL", -34.612088, -58.455026, "", "Corta Distancia"],
  ["104", "12 DE OCTUBRE 3054 - QUILMES", -34.742239, -58.289604, "", "Corta Distancia"],
  ["105", "BOULEVARD BS. AS. 710. ESQ. ALVEAR - MONTE GRANDE", -34.815406, -58.457274, "", "Corta Distancia"],
  ["107", "HIPOLITO IRIGOYEN 10699 - LOMAS DE ZAMORA", -34.781437, -58.406376, "", "Corta Distancia"],
  ["108", "CABILDO 4125/65 - CAP. FED", -34.545544, -58.470506, "", "Corta Distancia"],
  ["109", "CNEL JUAN PIRAN 801 - PARANA", -31.738083, -60.535716, "", "Larga Distancia"],
  ["110", "SOLDADO DE LA FRONTERA 5258/70 -    VILLA LUGANO", -34.685638, -58.463257, "", "Corta Distancia"],
  ["111", "RUTA 8 KM - SAN MARTIN", -34.580958, -58.542024, "", "Corta Distancia"],
  ["116", "MARTIN DE GAINZA 90 - CABALLITO", -34.620257, -58.44583, "", "Corta Distancia"],
  ["117", "J.M. ESTRADA 878/80 - CAMPANA", -34.165859, -58.96143, "", "Corta Distancia"],
  ["118", "RIVADAVIA 3396 - CIUDAD DE SANTA FE", -31.636559, -60.701124, "", "Larga Distancia"],
  ["121", "LARRAZABAL 3443/55 -", -34.671212, -58.479019, "", "Corta Distancia"],
  ["123", "O HIGGINS 1280 - BELLA VISTA", -34.570432, -58.68355, "", "Corta Distancia"],
  ["124", "SAN JUAN 2168 - CAP. FED.", -34.623047, -58.3958, "", "Corta Distancia"],
  ["125", "LOPE DE VEGA 1742 - CDAD. DE BS.AS", -34.624026, -58.511978, "", "Corta Distancia"],
  ["129", "COMESA\u00f1A S/N Y ACC OES - CIUDADELA", -34.6298, -58.547344, "", "Corta Distancia"],
  ["130", "DARDO ROCHA 251/259 - BERNAL", -34.718469, -58.291527, "", "Corta Distancia"],
  ["131", "H. IRIGOYEN 1826 - JOSE C PAZ", -34.518413, -58.755395, "", "Corta Distancia"],
  ["136", "PEDRO GOYENA 565/71 - CAP.FED", -34.625632, -58.435473, "", "Corta Distancia"],
  ["142", "Av. Juan B. Justo 5784 - CAP. FED.", -34.619137, -58.476081, "", "Corta Distancia"],
  ["149", "CALLE 43 NRO 782 - LA PLATA", -34.913145, -57.959928, "", "Corta Distancia"],
  ["151", "ASAMBLEA 1176 - PARUQUE CHACABUCO", -34.635905, -58.441542, "", "Corta Distancia"],
  ["153", "ALVAREZ JONTE 2502 - CAPITAL FEDERAL", -34.607498, -58.477744, "", "Corta Distancia"],
  ["154", "TAPIA DE CRUZ 420 - ESCOBAR", -34.345661, -58.792809, "", "Corta Distancia"],
  ["155", "HIGHLAND PARK E/LOS JAZMINES-PILAR", -34.420014, -58.795221, "", "Corta Distancia"],
  ["158", "CHARCAS 2980 - CAP.FED", -34.594551, -58.408535, "", "Corta Distancia"],
  ["159", "BARTOLOME MITRE 1558 - CAP.FED", -34.607695, -58.388774, "", "Corta Distancia"],
  ["160", "ANTARTIDA ARGENTINA 1160 - CABA", -34.58458, -58.373442, "", "Corta Distancia"],
  ["162", "PANAMERICANA KMT 37.5 - PILAR", -34.45308, -58.729085, "", "Corta Distancia"],
  ["163", "JUNIN 1073 - CAPITAL FEDERAL", -34.596002, -58.396932, "", "Corta Distancia"],
  ["164", "JOS\u00e9 HERN\u00e1NDEZ 2965 - VILLA BALLESTER", -34.552616, -58.555275, "", "Corta Distancia"],
  ["165", "AVDA. JUNIN Y THEDY - ROSARIO", -32.927198, -60.670194, "", "Larga Distancia"],
  ["167", "NAZCA 1244 - CAP.FED", -34.618663, -58.476252, "", "Corta Distancia"],
  ["168", "CORRIENTES 5748 - CAP.FED", -34.595206, -58.444136, "", "Corta Distancia"],
  ["170", "LIBERTADOR 6840 - CAPITAL FEDERAL", -34.549269, -58.454981, "", "Corta Distancia"],
  ["171", "SARMIENTO 524 (RUTA 205) - EZEIZA", -34.893217, -58.571713, "", "Corta Distancia"],
  ["174", "CULLEN 5085 - CAP. FEDERAL", -34.57253, -58.488104, "", "Corta Distancia"],
  ["175", "PTE. PERON 2070 - CAP. FEDERAL", -34.607131, -58.395909, "", "Corta Distancia"],
  ["176", "TEODORO GARCIA 2419 - CAP. FEDERAL", -34.569678, -58.446221, "", "Corta Distancia"],
  ["178", "RUTA 11 KM 404 - GRAL MADARIAGA", -37.184301, -56.952822, "", "Larga Distancia"],
  ["179", "27 DE FEB 2320 - CUIDAD SANTA FE", -31.649968, -60.704345, "", "Larga Distancia"],
  ["180", "SAN PEDRITO 72 - CAPITAL", -34.631393, -58.468841, "", "Corta Distancia"],
  ["181", "RICARDO BALBIN - SAAVEDRA", -34.554213, -58.487139, "", "Corta Distancia"],
  ["182", "Av. Santa Maria de las Conchas 5420 Nordelta", -34.405072, -58.631547, "", "Corta Distancia"],
  ["183", "H. IRIGOYEN 8028 - BANFIELD", -34.748912, -58.399679, "", "Corta Distancia"],
  ["184", "COLEC. PILAR NORTE 4002 - RUTA 9 MALVINAS ARG", -34.453445, -58.729934, "", "Corta Distancia"],
  ["185", "RUTA PROVINCIAL N\u00ba 7 Y DR. RAMON - NEUQUEN", -38.941641, -68.063248, "", "Larga Distancia"],
  ["186", "HIPOLITO YRIGOYEN 6174 - LANUS", -34.726458, -58.395329, "", "Corta Distancia"],
  ["188", "BARTOLOME MITRE 2951 - VICENTE LOPEZ", -34.523724, -58.520235, "", "Corta Distancia"],
  ["189", "205 E/RP 52 Y CABRAL Y SALVADORES - EZEIZA", -34.841778, -58.507659, "", "Corta Distancia"],
  ["192", "URUGUAY 4691 - SAN ISIDRO", -34.474796, -58.574731, "", "Corta Distancia"],
  ["197", "AV GRAL MANUEL BELGRANO 950 - GARIN", -34.417902, -58.725382, "", "Corta Distancia"],
  ["199", "AV. SANTA ROSA 1753 - CASTELAR", -34.64011, -58.655728, "", "Corta Distancia"],
  ["203", "AV SANTA FE 3760 - CAP. FED.", -34.584711, -58.416573, "", "Corta Distancia"],
  ["204", "RUTA 11 KM 330 - PARTIDO DE LA COSTA", -36.581328, -56.717064, "", "Larga Distancia"],
  ["208", "MERLO, AV PTE J. D. PERON 24080 - Merlo", -34.666443, -58.7037, "", "Corta Distancia"],
  ["209", "Av. Per\u00fa y Carlos Pellegrini - MENDOZA", -32.871818, -68.842584, "", "Larga Distancia"],
  ["215", "Gral. Juan Jose Valle 51 - Mor\u00f3n", -34.649687, -58.625979, "", "Corta Distancia"],
  ["219", "AV. VICTORICA 660 - Moreno", -34.640324, -58.795812, "", "Corta Distancia"],
  ["220", "Gaspar M. Jovellanos 151 - CABA", -34.631825, -58.374134, "", "Corta Distancia"],
  ["235", "Olavarria 180 - Quilmes", -34.724695, -58.255617, "", "Corta Distancia"],
  ["238", "Av. Jorge Newbery 4750 - Mar del Plata", -38.077517, -57.581732, "", "Larga Distancia"],
  ["242", "AV IDE LOS TRABAJADORES ENTRE ALTAIR Y AV DE LOS PESCADORES", -38.04318, -57.543054, "", "Larga Distancia"]
];

// Horarios de recepcion por sucursal: [Refri, SN]. Se cargan en la hoja Sucursales con cargarHorarios().
const HORARIOS = {"2":["06:00 a 11:00","12:00 a 20:00"],"6":["08:00 a 14:00","08:00 a 14:00"],"7":["06:00 a 14:00","06:00 a 14:00"],"18":["14:00 a 18:00","14:00 a 18:00"],"19":["06:00 a 14:00","06:00 a 14:00"],"20":["10:00 a 16:00","10:00 a 16:00"],"22":["10:00 a 19:00","10:00 a 19:00"],"24":["14:00 a 20:00","14:00 a 20:00"],"25":["06:00 a 14:00","06:00 a 14:00"],"26":["06:00 a 10:00","06:00 a 08:00"],"35":["12:00 a 18:00","12:00 a 18:00"],"37":["10:00 a 19:00","10:00 a 19:00"],"39":["08:00 a 13:00","08:00 a 13:00"],"40":["06:00 a 14:00","06:00 a 14:00"],"41":["10:00 a 17:00","10:00 a 17:00"],"42":["10:00 a 18:00","10:00 a 18:00"],"43":["12:00 a 18:00","12:00 a 18:00"],"44":["14:00 a 20:00","14:00 a 20:00"],"45":["22:00 a 04:00","22:00 a 04:00"],"46":["00:00 a 06:00","00:00 a 06:00"],"47":["12:00 a 17:00","12:00 a 17:00"],"48":["22:00 a 23:59","22:00 a 23:59"],"52":["10:00 a 19:00","12:00 a 19:00"],"55":["22:00 a 06:00","22:00 a 06:00"],"56":["12:00 a 20:00","12:00 a 20:00"],"58":["22:00 a 06:00","22:00 a 06:00"],"59":["14:00 a 20:00","14:00 a 20:00"],"60":["06:00 a 14:00","14:00 a 20:00"],"61":["22:00 a 06:00","22:00 a 06:00"],"63":["06:30 a 16:00","06:30 a 16:00"],"66":["06:00 a 15:00","06:00 a 15:00"],"74":["06:00 a 14:00","06:00 a 14:00"],"78":["12:00 a 20:00","12:00 a 20:00"],"80":["22:00 a 05:00","22:00 a 05:00"],"82":["22:00 a 06:00","22:00 a 06:00"],"83":["10:00 a 19:00","10:00 a 19:00"],"84":["22:00 a 06:00","22:00 a 06:00"],"85":["06:30 a 14:00","06:30 a 14:00"],"90":["22:00 a 06:00","22:00 a 06:00"],"91":["22:00 a 06:00","22:00 a 06:00"],"103":["12:00 a 18:00","12:00 a 18:00"],"108":["14:00 a 22:00","14:00 a 22:00"],"110":["10:00 a 16:00","10:00 a 16:00"],"116":["12:00 a 18:00","06:00 a 14:00"],"121":["07:00 a 15:00","07:00 a 15:00"],"124":["14:00 a 20:00","14:00 a 20:00"],"125":["06:00 a 14:00","06:00 a 14:00"],"136":["12:00 a 17:00","12:00 a 17:00"],"151":["06:00 a 14:00","06:00 a 14:00"],"153":["22:00 a 06:00","22:00 a 06:00"],"158":["10:00 a 18:00","10:00 a 18:00"],"159":["22:00 a 05:00","22:00 a 05:00"],"160":["06:00 a 14:00","06:00 a 14:00"],"163":["06:00 a 11:00","06:00 a 11:00"],"167":["12:00 a 20:00","12:00 a 20:00"],"168":["06:00 a 14:00","06:00 a 14:00"],"170":["10:00 a 18:00","10:00 a 18:00"],"174":["14:00 a 20:00","14:00 a 20:00"],"176":["07:00 a 15:00","07:00 a 15:00"],"180":["13:00 a 21:00","13:00 a 21:00"],"181":["06:00 a 14:00","14:00 a 22:00"],"203":["22:00 a 06:00","22:00 a 06:00"],"220":["14:00 a 20:00","14:00 a 20:00"],"38":["13:00 a 21:00","13:00 a 21:00"],"67":["06:00 a 18:00","06:00 a 14:00"],"68":["07:00 a 18:00","07:00 a 13:00"],"69":["10:00 a 18:00","10:00 a 16:00"],"70":["06:00 a 18:00","06:00 a 14:00"],"92":["08:00 a 15:00","12:00 a 20:00"],"117":["06:00 a 14:00","06:00 a 14:00"],"154":["22:00 a 06:00","22:00 a 06:00"],"155":["08:00 a 14:00","08:00 a 14:00"],"162":["08:00 a 14:00","08:00 a 14:00"],"164":["22:30 a 06:00","22:30 a 06:00"],"182":["22:00 a 06:00","22:00 a 06:00"],"184":["22:00 a 06:00","22:00 a 06:00"],"188":["22:00 a 05:00","22:00 a 05:00"],"192":["06:00 a 14:00","06:00 a 14:00"],"197":["22:00 a 04:00","22:00 a 04:00"],"13":["12:00 a 20:00","12:00 a 20:00"],"51":["11:00 a 19:00","11:00 a 19:00"],"53":["06:00 a 14:00","06:00 a 14:00"],"57":["00:00 a 06:00","06:00 a 14:00"],"94":["12:00 a 19:00","12:00 a 19:00"],"111":["10:00 a 18:00","10:00 a 18:00"],"123":["07:00 a 15:00","07:00 a 15:00"],"129":["22:00 a 06:00","22:00 a 06:00"],"131":["06:00 a 14:00","06:00 a 14:00"],"199":["11:00 a 17:00","11:00 a 17:00"],"208":["12:00 a 20:00","12:00 a 20:00"],"215":["22:00 a 06:00","22:00 a 06:00"],"219":["12:00 a 18:00","12:00 a 18:00"],"64":["13:00 a 20:00","13:00 a 20:00"],"65":["22:00 a 06:00","22:00 a 06:00"],"75":["12:00 a 20:00","12:00 a 20:00"],"101":["06:00 a 14:00","06:00 a 14:00"],"104":["07:00 a 14:00","07:00 a 14:00"],"105":["12:00 a 18:00","12:00 a 18:00"],"107":["14:00 a 22:00","14:00 a 22:00"],"130":["06:30 a 14:30","06:30 a 14:30"],"149":["22:00 a 04:00","22:00 a 04:00"],"171":["11:00 a 19:00","11:00 a 19:00"],"183":["22:00 a 06:00","22:00 a 06:00"],"186":["22:00 a 06:00","22:00 a 06:00"],"189":["12:00 a 20:00","12:00 a 20:00"],"235":["22:00 a 06:00","22:00 a 06:00"],"95":["06:00 a 14:00","06:00 a 14:00"],"96":["06:00 a 14:00","06:00 a 14:00"],"97":["06:00 a 14:00","06:00 a 14:00"],"99":["06:00 a 14:00","06:00 a 14:00"],"118":["22:00 a 06:00","22:00 a 06:00"],"165":["06:00 a 14:00","06:00 a 14:00"],"179":["00:00 a 06:00","00:00 a 06:00"],"49":["06:00 a 14:00","06:00 a 14:00"],"178":["22:00 a 06:00","22:00 a 06:00"],"204":["22:00 a 06:00","22:00 a 06:00"],"238":["22:00 a 06:00","22:00 a 06:00"],"242":["22:00 a 06:00","22:00 a 06:00"],"109":["06:00 a 14:00","06:00 a 14:00"],"209":["06:00 a 14:00","06:00 a 14:00"],"185":["14:00 a 06:00","14:00 a 06:00"]};

// ---------------------------------------------------------------- setup
function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ);

  let sh = ss.getSheetByName(HOJA_SUC) || ss.insertSheet(HOJA_SUC);
  if (sh.getLastRow() < 2) {
    sh.clear();
    sh.getRange(1, 1, 1, COLS_SUC.length).setValues([COLS_SUC]);
    const filas = SUCURSALES_INICIALES.map(r => [r[0], r[1], r[2] === null ? '' : r[2], r[3] === null ? '' : r[3], r[4], r[5], (HORARIOS[r[0]] || ['', ''])[0], (HORARIOS[r[0]] || ['', ''])[1]]);
    sh.getRange(2, 1, filas.length, COLS_SUC.length).setValues(filas);
    sh.getRange(2, 1, filas.length, 1).setNumberFormat('@');
  }
  formatearEncabezado_(sh, COLS_SUC.length);

  sh = ss.getSheetByName(HOJA_MARC) || ss.insertSheet(HOJA_MARC);
  if (sh.getLastRow() < 1) sh.getRange(1, 1, 1, COLS_MARC.length).setValues([COLS_MARC]);
  formatearEncabezado_(sh, COLS_MARC.length);
  sh.getRange('B:B').setNumberFormat('dd/mm/yyyy');
  sh.getRange('C:C').setNumberFormat('HH:mm:ss');
  sh.getRange('T:T').setNumberFormat('dd/mm/yyyy HH:mm:ss');
  sh.getRange('G:H').setNumberFormat('@');

  sh = ss.getSheetByName(HOJA_CHOF) || ss.insertSheet(HOJA_CHOF);
  if (sh.getLastRow() < 1) sh.getRange(1, 1, 1, COLS_CHOF.length).setValues([COLS_CHOF]);
  formatearEncabezado_(sh, COLS_CHOF.length);
  sh.getRange('A:A').setNumberFormat('dd/mm/yyyy HH:mm');
  sh.getRange('B:B').setNumberFormat('@');

  const hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && hoja1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);
}

// Ejecutar UNA vez: agrega las columnas de horario en Sucursales (G y H) y en Marcados (V y W).
function cargarHorarios() {
  const ss = SpreadsheetApp.getActive();
  const su = ss.getSheetByName(HOJA_SUC);
  su.getRange(1, 7, 1, 2).setValues([['Horario Refri', 'Horario SN']]);
  formatearEncabezado_(su, 8);
  const n = su.getLastRow() - 1;
  if (n > 0) {
    const cods = su.getRange(2, 1, n, 1).getValues();
    const rango = su.getRange(2, 7, n, 2);
    rango.setNumberFormat('@');
    rango.setValues(cods.map(r => HORARIOS[String(r[0]).trim()] || ['', '']));
  }
  const ma = ss.getSheetByName(HOJA_MARC);
  ma.getRange(1, 22, 1, 2).setValues([['Horario Refri', 'Horario SN']]);
  formatearEncabezado_(ma, 23);
  ma.getRange('V:W').setNumberFormat('@');
}

function txtHorario_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'HH:mm');
  return String(v === null || v === undefined ? '' : v).trim();
}

function formatearEncabezado_(sh, n) {
  sh.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#E6E9ED');
  sh.setFrozenRows(1);
}

// ---------------------------------------------------------------- web app
function doGet(e) {
  const accion = (e && e.parameter && e.parameter.action) || '';
  if (accion === 'sucursales') {
    return json_({ ok: true, sucursales: leerSucursales_().map(s => [s.suc, s.dir, s.lat, s.lon, s.radio, s.hr, s.hs]) });
  }
  return json_({ ok: true, servicio: 'Llegada a sucursal', hora: Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss') });
}

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Formato inv\u00e1lido' }); }
  if (!data || data.key !== APP_KEY) return json_({ ok: false, error: 'Clave inv\u00e1lida' });

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    if (data.action === 'registro') return json_(registrarChofer_(data));
    if (data.action === 'marcado') return json_(registrarMarcado_(data));
    return json_({ ok: false, error: 'Acci\u00f3n desconocida' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------- logica
function registrarChofer_(d) {
  const sh = SpreadsheetApp.getActive().getSheetByName(HOJA_CHOF);
  const legajo = String(d.legajo || '').trim();
  const disp = String(d.deviceId || '');
  const filas = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 4).getValues() : [];
  const existe = filas.some(r => String(r[0]).trim() === legajo && String(r[3]) === disp);
  if (!existe) sh.appendRow([new Date(), legajo, String(d.nombre || '').trim(), String(d.empresa || '').trim(), disp]);
  return { ok: true };
}

function registrarMarcado_(d) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(HOJA_MARC);
  const id = String(d.id || '');
  const hdr = String(d.hdr || '').trim();
  const suc = String(d.suc || '').trim();
  if (!id || !hdr || !suc) return { ok: false, error: 'Faltan datos' };

  const ahora = new Date();
  const ultima = sh.getLastRow();

  if (ultima > 1) {
    // 1) Reenvio del mismo marcado (ya llego antes): no se duplica
    const hit = sh.getRange(2, 1, ultima - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
    if (hit) {
      const h = sh.getRange(hit.getRow(), 3).getValue();
      return { ok: true, duplicado: true, hora: fmtHora_(h) };
    }
    // 2) Misma HDR + misma sucursal ya registrada: vale la primera llegada
    const desde = Math.max(2, ultima - 3000);
    const vals = sh.getRange(desde, 3, ultima - desde + 1, 6).getValues(); // C..H
    for (let i = vals.length - 1; i >= 0; i--) {
      if (String(vals[i][4]).trim() === hdr && String(vals[i][5]).trim() === suc) {
        return { ok: true, duplicado: true, hora: fmtHora_(vals[i][0]) };
      }
    }
  }

  // Hora de llegada: hora del celular al marcar, corregida por el desfase entre su reloj y el servidor.
  // Si se envio al instante, es practicamente la hora del servidor.
  const marcaCel = Number(d.marcaCel) || ahora.getTime();
  const envioCel = Number(d.envioCel) || ahora.getTime();
  const desfaseMs = ahora.getTime() - envioCel;
  const llegada = new Date(marcaCel + desfaseMs);
  const demoraEnvioMin = Math.round((envioCel - marcaCel) / 60000);
  const desfaseMin = Math.round(desfaseMs / 60000);

  const sucs = leerSucursales_();
  const s = sucs.find(x => x.suc === suc);
  const lat = numOrNull_(d.lat), lon = numOrNull_(d.lon), acc = numOrNull_(d.acc);

  let distSuc = '', dentro = '', cercana = '', distCercana = '';
  if (lat !== null && lon !== null) {
    if (s && s.lat !== null) {
      distSuc = Math.round(haversine_(lat, lon, s.lat, s.lon));
      dentro = distSuc <= s.radio ? 'SI' : 'NO';
    }
    let best = null;
    sucs.forEach(x => {
      if (x.lat === null) return;
      const dd = haversine_(lat, lon, x.lat, x.lon);
      if (!best || dd < best.d) best = { suc: x.suc, d: dd };
    });
    if (best) { cercana = best.suc; distCercana = Math.round(best.d); }
  }

  sh.appendRow([
    id, llegada, llegada, String(d.legajo || ''), String(d.nombre || ''), String(d.empresa || ''),
    hdr, suc, s ? s.dir : '', String(d.modo || ''), distSuc, dentro, cercana, distCercana,
    lat === null ? '' : lat, lon === null ? '' : lon, acc === null ? '' : Math.round(acc),
    demoraEnvioMin, desfaseMin, ahora, String(d.deviceId || ''),
    s && s.hr ? s.hr : 'Sin horario', s && s.hs ? s.hs : 'Sin horario'
  ]);

  return { ok: true, hora: fmtHora_(llegada) };
}

function leerSucursales_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(HOJA_SUC);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues()
    .filter(r => String(r[0]).trim() !== '')
    .map(r => ({
      suc: String(r[0]).trim(),
      dir: String(r[1]).trim(),
      lat: numOrNull_(r[2]),
      lon: numOrNull_(r[3]),
      radio: numOrNull_(r[4]) || RADIO_DEFAULT,
      hr: txtHorario_(r[6]),
      hs: txtHorario_(r[7])
    }));
}

// ---------------------------------------------------------------- utilidades
function numOrNull_(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}
function haversine_(la1, lo1, la2, lo2) {
  const R = 6371000, r = Math.PI / 180;
  const dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function fmtHora_(v) {
  return v instanceof Date ? Utilities.formatDate(v, TZ, 'HH:mm') : String(v);
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
