const WA = '573226747868';
const BIN_ID = '6a21c113da38895dfe88176d';
const BASE = 'https://surticapilar.com/wp-content/uploads/';

// ── COSTOS DE ENVÍO ──────────────────────────────────
const ENVIO = {
  'Antioquia-Medellín': { label: 'Medellín', detalle: 'Entrega en Medellín', costo: 10000 },
  'Antioquia-Otro': { label: 'Otro municipio de Antioquia', detalle: 'Envío a municipios de Antioquia', costo: 13000 },
  'La Guajira': { label: 'La Guajira', detalle: 'Envío a La Guajira', costo: 18000 },
  default: { label: 'Flete nacional', detalle: 'Envío a todo el país', costo: 15000 },
};

// ── CIUDADES POR DEPARTAMENTO ─────────────────────────
const CIUDADES = {
  'Antioquia-Medellín': ['Medellín'],
  'Antioquia-Otro': ['Abejorral', 'Abriaquí', 'Alejandría', 'Amagá', 'Amalfi', 'Andes', 'Angelópolis', 'Angostura', 'Anorí', 'Anzá', 'Apartadó', 'Arboletes', 'Argelia', 'Armenia', 'Barbosa', 'Bello', 'Betania', 'Betulia', 'Briceño', 'Buriticá', 'Cáceres', 'Caicedo', 'Caldas', 'Campamento', 'Cañasgordas', 'Caracolí', 'Caramanta', 'Carepa', 'Carolina del Príncipe', 'Caucasia', 'Chigorodó', 'Cisneros', 'Ciudad Bolívar', 'Cocorná', 'Concepción', 'Concordia', 'Copacabana', 'Dabeiba', 'Donmatías', 'Ebéjico', 'El Bagre', 'El Carmen de Viboral', 'El Santuario', 'Entrerríos', 'Envigado', 'Fredonia', 'Frontino', 'Giraldo', 'Girardota', 'Gómez Plata', 'Granada', 'Guadalupe', 'Guarne', 'Guatapé', 'Heliconia', 'Hispania', 'Itagüí', 'Ituango', 'Jardín', 'Jericó', 'La Ceja', 'La Estrella', 'La Pintada', 'La Unión', 'Liborina', 'Maceo', 'Marinilla', 'Montebello', 'Murindó', 'Mutatá', 'Nariño', 'Nechí', 'Necoclí', 'Olaya', 'Peñol', 'Peque', 'Pueblorrico', 'Puerto Berrío', 'Puerto Nare', 'Puerto Triunfo', 'Remedios', 'Retiro', 'Rionegro', 'Sabanalarga', 'Sabaneta', 'Salgar', 'San Andrés de Cuerquia', 'San Carlos', 'San Francisco', 'San Jerónimo', 'San José de la Montaña', 'San Juan de Urabá', 'San Luis', 'San Pedro de Antioquia', 'San Pedro de los Milagros', 'San Rafael', 'San Roque', 'San Vicente Ferrer', 'Santa Bárbara', 'Santa Fe de Antioquia', 'Santa Rosa de Osos', 'Santo Domingo', 'Segovia', 'Sonsón', 'Sopetrán', 'Tarazá', 'Tarso', 'Titiribí', 'Toledo', 'Turbo', 'Uramita', 'Urrao', 'Valdivia', 'Valparaíso', 'Vegachí', 'Venecia', 'Vigía del Fuerte', 'Yalí', 'Yarumal', 'Yolombó', 'Yondó', 'Zaragoza'],
  'Amazonas': ['Leticia', 'Puerto Nariño'],
  'Arauca': ['Arauca', 'Arauquita', 'Cravo Norte', 'Fortul', 'Puerto Rondón', 'Saravena', 'Tame'],
  'Atlántico': ['Barranquilla', 'Baranoa', 'Campo de la Cruz', 'Candelaria', 'Galapa', 'Juan de Acosta', 'Luruaco', 'Malambo', 'Manatí', 'Palmar de Varela', 'Piojó', 'Polonuevo', 'Ponedera', 'Puerto Colombia', 'Repelón', 'Sabanagrande', 'Sabanalarga', 'Santa Lucía', 'Santo Tomás', 'Soledad', 'Suan', 'Tubará', 'Usiacurí'],
  'Bolívar': ['Cartagena', 'Achí', 'Altos del Rosario', 'Arenal', 'Arjona', 'Arroyohondo', 'Barranco de Loba', 'Calamar', 'Cantagallo', 'Cicuco', 'Clemencia', 'Córdoba', 'El Carmen de Bolívar', 'El Guamo', 'El Peñón', 'Hatillo de Loba', 'Magangué', 'Mahates', 'Margarita', 'María La Baja', 'Mompós', 'Montecristo', 'Morales', 'Norosí', 'Pinillos', 'Regidor', 'Río Viejo', 'San Cristóbal', 'San Estanislao', 'San Fernando', 'San Jacinto', 'San Jacinto del Cauca', 'San Juan Nepomuceno', 'San Martín de Loba', 'San Pablo', 'Santa Catalina', 'Santa Rosa', 'Santa Rosa del Sur', 'Simití', 'Soplaviento', 'Talaigua Nuevo', 'Tiquisio', 'Turbaco', 'Turbaná', 'Villanueva', 'Zambrano'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Aquitania', 'Arcabuco', 'Belén', 'Berbeo', 'Betéitiva', 'Boavita', 'Boyacá', 'Briceño', 'Buenavista', 'Busbanzá', 'Caldas', 'Campohermoso', 'Cerinza', 'Chinavita', 'Chíquiza', 'Chiscas', 'Chita', 'Chitaraque', 'Chivatá', 'Ciénega', 'Cómbita', 'Coper', 'Corrales', 'Covarachía', 'Cubará', 'Cucaita', 'Cuítiva', 'El Cocuy', 'El Espino', 'Firavitoba', 'Floresta', 'Gachantivá', 'Gámeza', 'Garagoa', 'Guacamayas', 'Guateque', 'Guayatá', 'Güicán', 'Iza', 'Jenesano', 'Jericó', 'Labranzagrande', 'La Capilla', 'La Uvita', 'La Victoria', 'Macanal', 'Maripí', 'Miraflores', 'Mongua', 'Monguí', 'Moniquirá', 'Motavita', 'Muzo', 'Nobsa', 'Nuevo Colón', 'Oicatá', 'Otanche', 'Pachavita', 'Páez', 'Paipa', 'Pajarito', 'Panqueba', 'Pauna', 'Paya', 'Paz de Río', 'Pesca', 'Pisba', 'Puerto Boyacá', 'Quípama', 'Ramiriquí', 'Ráquira', 'Rondón', 'Saboyá', 'Sáchica', 'Samacá', 'San Eduardo', 'San José de Pare', 'San Luis de Gaceno', 'San Mateo', 'San Miguel de Sema', 'San Pablo de Borbur', 'Santana', 'Santa María', 'Santa Rosa de Viterbo', 'Santa Sofía', 'Sativanorte', 'Sativasur', 'Siachoque', 'Soatá', 'Socotá', 'Socha', 'Somondoco', 'Sora', 'Soracá', 'Sotaquirá', 'Susacón', 'Sutamarchán', 'Sutatenza', 'Tasco', 'Tenza', 'Tibaná', 'Tibasosa', 'Tinjacá', 'Tipacoque', 'Toca', 'Togüí', 'Tópaga', 'Tota', 'Turmequé', 'Tuta', 'Tutazá', 'Umbita', 'Ventaquemada', 'Viracachá', 'Zetaquira'],
  'Caldas': ['Manizales', 'Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia', 'La Dorada', 'La Merced', 'Manzanares', 'Marmato', 'Marquetalia', 'Marulanda', 'Neira', 'Norcasia', 'Pácora', 'Palestina', 'Pensilvania', 'Riosucio', 'Rionegro', 'Salamina', 'Samaná', 'San José', 'Supía', 'Victoria', 'Villamaría', 'Viterbo'],
  'Caquetá': ['Florencia', 'Albania', 'Belén de los Andaquíes', 'Cartagena del Chairá', 'Curillo', 'El Doncello', 'El Paujil', 'La Montañita', 'Milán', 'Morelia', 'Puerto Rico', 'San José del Fragua', 'San Vicente del Caguán', 'Solano', 'Solita', 'Valparaíso'],
  'Casanare': ['Yopal', 'Aguazul', 'Chámeza', 'Hato Corozal', 'La Salina', 'Maní', 'Monterrey', 'Nunchía', 'Orocué', 'Paz de Ariporo', 'Pore', 'Recetor', 'Sabanalarga', 'Sácama', 'San Luis de Palenque', 'Támara', 'Tauramena', 'Trinidad', 'Villanueva'],
  'Cauca': ['Popayán', 'Almaguer', 'Argelia', 'Balboa', 'Bolívar', 'Buenos Aires', 'Cajibío', 'Caldono', 'Caloto', 'Coconuco', 'Corinto', 'El Tambo', 'Florencia', 'Guachené', 'Guapi', 'Inzá', 'Jambaló', 'La Sierra', 'La Vega', 'López de Micay', 'Mercaderes', 'Miranda', 'Morales', 'Padilla', 'Páez', 'Patía', 'Piamonte', 'Piendamó', 'Puerto Tejada', 'Puracé', 'Rosas', 'San Sebastián', 'Santa Rosa', 'Santander de Quilichao', 'Silvia', 'Sotara', 'Sucre', 'Suárez', 'Timbío', 'Timbiquí', 'Toribío', 'Totoró', 'Villa Rica'],
  'Cesar': ['Valledupar', 'Aguachica', 'Agustín Codazzi', 'Astrea', 'Becerril', 'Bosconia', 'Chimichagua', 'Chiriguaná', 'Curumaní', 'El Copey', 'El Paso', 'Gamarra', 'González', 'La Gloria', 'La Jagua de Ibirico', 'La Paz', 'Manaure', 'Pailitas', 'Pelaya', 'Pueblo Bello', 'Río de Oro', 'San Alberto', 'San Diego', 'San Martín', 'Tamalameque'],
  'Chocó': ['Quibdó', 'Acandí', 'Alto Baudo', 'Atrato', 'Bagadó', 'Bahía Solano', 'Bajo Baudó', 'Bojaya', 'Cantón de San Pablo', 'Carmen del Darién', 'Cértegui', 'Condoto', 'El Carmen de Atrato', 'El Litoral del San Juan', 'Istmina', 'Juradó', 'Lloró', 'Medio Atrato', 'Medio Baudó', 'Medio San Juan', 'Nóvita', 'Nuquí', 'Río Iró', 'Río Quito', 'Riosucio', 'San José del Palmar', 'Sipí', 'Tadó', 'Unguía', 'Unión Panamericana'],
  'Córdoba': ['Montería', 'Ayapel', 'Buenavista', 'Canalete', 'Cereté', 'Chimá', 'Chinú', 'Ciénaga de Oro', 'Cotorra', 'La Apartada', 'Lorica', 'Los Córdobas', 'Momil', 'Montelíbano', 'Moñitos', 'Planeta Rica', 'Pueblo Nuevo', 'Puerto Escondido', 'Puerto Libertador', 'Purísima', 'Sahagún', 'San Andrés de Sotavento', 'San Antero', 'San Bernardo del Viento', 'San Carlos', 'San José de Uré', 'San Pelayo', 'Santa Cruz de Lorica', 'Tierralta', 'Tuchín', 'Valencia'],
  'Cundinamarca': ['Bogotá D.C.', 'Agua de Dios', 'Albán', 'Anapoima', 'Anolaima', 'Apulo', 'Arbeláez', 'Beltrán', 'Bituima', 'Bojacá', 'Cabrera', 'Cachipay', 'Cajicá', 'Caparrapí', 'Cáqueza', 'Carmen de Carupa', 'Chaguaní', 'Chía', 'Chipaque', 'Choachí', 'Chocontá', 'Cogua', 'Cota', 'Cucunubá', 'El Colegio', 'El Peñón', 'El Rosal', 'Facatativá', 'Fómeque', 'Fosca', 'Funza', 'Fúquene', 'Fusagasugá', 'Gachalá', 'Gachancipá', 'Gachetá', 'Gama', 'Girardot', 'Granada', 'Guachetá', 'Guaduas', 'Guasca', 'Guataquí', 'Guatavita', 'Guayabal de Síquima', 'Guayabetal', 'Gutiérrez', 'Jerusalén', 'Junín', 'La Calera', 'La Mesa', 'La Palma', 'La Peña', 'La Vega', 'Lenguazaque', 'Macheta', 'Madrid', 'Manta', 'Medina', 'Mosquera', 'Nariño', 'Nemocón', 'Nilo', 'Nimaima', 'Nocaima', 'Pacho', 'Paime', 'Pandi', 'Paratebueno', 'Pasca', 'Puerto Salgar', 'Pulí', 'Quebradanegra', 'Quetame', 'Quipile', 'Ricaurte', 'San Antonio del Tequendama', 'San Bernardo', 'San Cayetano', 'San Francisco', 'San Juan de Río Seco', 'Sasaima', 'Sesquilé', 'Sibaté', 'Silvania', 'Simijaca', 'Soacha', 'Sopó', 'Subachoque', 'Suesca', 'Supatá', 'Susa', 'Sutatausa', 'Tabio', 'Tausa', 'Tena', 'Tenjo', 'Tibacuy', 'Tibirita', 'Tocaima', 'Tocancipá', 'Topaipí', 'Ubalá', 'Ubaque', 'Une', 'Útica', 'Vergara', 'Vianí', 'Villagómez', 'Villapinzón', 'Villeta', 'Viotá', 'Yacopí', 'Zipacón', 'Zipaquirá'],
  'Guainía': ['Inírida', 'Barranco Minas', 'Cacahual', 'La Guadalupe', 'Mapiripana', 'Morichal', 'Pana Pana', 'Puerto Colombia', 'San Felipe'],
  'Guaviare': ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'],
  'Huila': ['Neiva', 'Acevedo', 'Agrado', 'Aipe', 'Algeciras', 'Altamira', 'Baraya', 'Campoalegre', 'Colombia', 'Elías', 'Garzón', 'Gigante', 'Guadalupe', 'Hobo', 'Iquira', 'Isnos', 'La Argentina', 'La Plata', 'Nátaga', 'Oporapa', 'Paicol', 'Palermo', 'Palestina', 'Pital', 'Pitalito', 'Rivera', 'Saladoblanco', 'San Agustín', 'Santa María', 'Suaza', 'Tarqui', 'Tesalia', 'Tello', 'Teruel', 'Timaná', 'Villavieja', 'Yaguará'],
  'La Guajira': ['Riohacha', 'Albania', 'Barrancas', 'Dibulla', 'Distracción', 'El Molino', 'Fonseca', 'Hatonuevo', 'La Jagua del Pilar', 'Maicao', 'Manaure', 'San Juan del Cesar', 'Uribia', 'Urumita', 'Villanueva'],
  'Magdalena': ['Santa Marta', 'Algarrobo', 'Aracataca', 'Ariguaní', 'Cerro San Antonio', 'Chibolo', 'Ciénaga', 'Concordia', 'El Banco', 'El Piñón', 'El Retén', 'Fundación', 'Guamal', 'Nueva Granada', 'Pedraza', 'Pijiño del Carmen', 'Pivijay', 'Plato', 'Puebloviejo', 'Remolino', 'Sabanas de San Ángel', 'Salamina', 'San Sebastián de Buenavista', 'San Zenón', 'Santa Ana', 'Santa Bárbara de Pinto', 'Sitionuevo', 'Tenerife', 'Zapayán', 'Zona Bananera'],
  'Meta': ['Villavicencio', 'Acacías', 'Barranca de Upía', 'Cabuyaro', 'Castilla la Nueva', 'Cubarral', 'Cumaral', 'El Calvario', 'El Castillo', 'El Dorado', 'Fuente de Oro', 'Granada', 'Guamal', 'La Macarena', 'Lejanías', 'Mapiripán', 'Mesetas', 'La Uribe', 'Puerto Concordia', 'Puerto Gaitán', 'Puerto Lleras', 'Puerto López', 'Puerto Rico', 'Restrepo', 'San Carlos de Guaroa', 'San Juan de Arama', 'San Juanito', 'San Martín', 'Vistahermosa'],
  'Nariño': ['Pasto', 'Albán', 'Aldana', 'Ancuyá', 'Arboleda', 'Barbacoas', 'Belén', 'Buesaco', 'Colón', 'Consaca', 'Contadero', 'Córdoba', 'Cuaspud', 'Cumbal', 'Cumbitara', 'El Charco', 'El Peñón', 'El Rosario', 'El Tablón de Gómez', 'El Tambo', 'Francisco Pizarro', 'Funes', 'Guachucal', 'Guaitarilla', 'Gualmatán', 'Iles', 'Imués', 'Ipiales', 'La Cruz', 'La Florida', 'La Llanada', 'La Tola', 'La Unión', 'Leiva', 'Linares', 'Los Andes', 'Magüí', 'Mallama', 'Mosquera', 'Nariño', 'Olaya Herrera', 'Ospina', 'Policarpa', 'Potosí', 'Providencia', 'Puerres', 'Pupiales', 'Ricaurte', 'Roberto Payán', 'Samaniego', 'Sandoná', 'San Bernardo', 'San Lorenzo', 'San Pablo', 'Santa Bárbara', 'Santacruz', 'Sapuyes', 'Taminango', 'Tangua', 'Tumaco', 'Túquerres', 'Yacuanquer'],
  'Norte de Santander': ['Cúcuta', 'Ábrego', 'Arboledas', 'Bochalema', 'Bucarasica', 'Cáchira', 'Cácota', 'Chinácota', 'Chitagá', 'Convención', 'Cucutilla', 'Durania', 'El Carmen', 'El Tarra', 'El Zulia', 'Gramalote', 'Hacarí', 'Herrán', 'La Esperanza', 'La Playa', 'Labateca', 'Los Patios', 'Lourdes', 'Mutiscua', 'Ocaña', 'Pamplona', 'Pamplonita', 'Puerto Santander', 'Ragonvalia', 'Salazar', 'San Calixto', 'San Cayetano', 'Santiago', 'Sardinata', 'Silos', 'Teorama', 'Tibú', 'Toledo', 'Villacaro', 'Villa del Rosario'],
  'Putumayo': ['Mocoa', 'Colón', 'Leguízamo', 'Orito', 'Puerto Asís', 'Puerto Caicedo', 'Puerto Guzmán', 'San Francisco', 'San Miguel', 'Santiago', 'Sibundoy', 'Valle del Guamuez', 'Villagarzón'],
  'Quindío': ['Armenia', 'Buenavista', 'Calarcá', 'Circasia', 'Córdoba', 'Filandia', 'Génova', 'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento'],
  'Risaralda': ['Pereira', 'Apía', 'Balboa', 'Belén de Umbría', 'Dosquebradas', 'Guática', 'La Celia', 'La Virginia', 'Marsella', 'Mistrató', 'Pueblo Rico', 'Quinchía', 'Santa Rosa de Cabal', 'Santuario'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': ['Bucaramanga', 'Aguada', 'Albania', 'Aratoca', 'Barbosa', 'Barichara', 'Barrancabermeja', 'Betulia', 'Bolívar', 'Cabrera', 'California', 'Cepitá', 'Cerrito', 'Charalá', 'Charta', 'Chima', 'Chipatá', 'Cimitarra', 'Concepción', 'Confines', 'Contratación', 'Coromoro', 'Curití', 'El Carmen de Chucurí', 'El Guacamayo', 'El Peñón', 'El Playón', 'Encino', 'Enciso', 'Florián', 'Floridablanca', 'Galán', 'Gámbita', 'Girón', 'Guaca', 'Guadalupe', 'Guapotá', 'Guavatá', 'Güepsa', 'Hato', 'Jesús María', 'Jordán', 'La Belleza', 'Landázuri', 'La Paz', 'Lebríja', 'Los Santos', 'Macaravita', 'Málaga', 'Matanza', 'Mogotes', 'Molagavita', 'Ocamonte', 'Oiba', 'Onzaga', 'Palmar', 'Palmas del Socorro', 'Páramo', 'Piedecuesta', 'Pinchote', 'Puente Nacional', 'Puerto Parra', 'Puerto Wilches', 'Rionegro', 'Sabana de Torres', 'San Andrés', 'San Benito', 'San Gil', 'San Joaquín', 'San José de Miranda', 'San Miguel', 'San Vicente de Chucurí', 'Santa Bárbara', 'Santa Helena del Opón', 'Simacota', 'Socorro', 'Suaita', 'Sucre', 'Suratá', 'Tona', 'Valle de San José', 'Vélez', 'Vetas', 'Villanueva', 'Zapatoca'],
  'Sucre': ['Sincelejo', 'Buenavista', 'Caimito', 'Chalán', 'Colosó', 'Corozal', 'Coveñas', 'El Roble', 'Galeras', 'Guaranda', 'La Unión', 'Los Palmitos', 'Majagual', 'Morroa', 'Ovejas', 'Palmito', 'Sampués', 'San Benito Abad', 'San Juan de Betulia', 'San Luis de Sincé', 'San Marcos', 'San Onofre', 'San Pedro', 'Sucre', 'Tolú', 'Tolú Viejo'],
  'Tolima': ['Ibagué', 'Alpujarra', 'Alvarado', 'Ambalema', 'Anzoátegui', 'Armero-Guayabal', 'Ataco', 'Cajamarca', 'Carmen de Apicalá', 'Casabianca', 'Chaparral', 'Coello', 'Coyaima', 'Cunday', 'Dolores', 'Espinal', 'Falan', 'Flandes', 'Fresno', 'Guamo', 'Herveo', 'Honda', 'Icononzo', 'Lérida', 'Líbano', 'Mariquita', 'Melgar', 'Murillo', 'Natagaima', 'Ortega', 'Palocabildo', 'Piedras', 'Planadas', 'Prado', 'Purificación', 'Rioblanco', 'Roncesvalles', 'Rovira', 'Saldaña', 'San Antonio', 'San Luis', 'Santa Isabel', 'Suárez', 'Valle de San Juan', 'Venadillo', 'Villahermosa', 'Villarrica'],
  'Valle del Cauca': ['Cali', 'Alcalá', 'Andalucía', 'Ansermanuevo', 'Argelia', 'Bolívar', 'Buenaventura', 'Buga', 'Bugalagrande', 'Caicedonia', 'Calima', 'Candelaria', 'Cartago', 'Dagua', 'El Águila', 'El Cairo', 'El Cerrito', 'El Dovio', 'Florida', 'Ginebra', 'Guacarí', 'Guadalajara de Buga', 'Jamundí', 'La Cumbre', 'La Unión', 'La Victoria', 'Obando', 'Palmira', 'Pradera', 'Restrepo', 'Riofrío', 'Roldanillo', 'San Pedro', 'Sevilla', 'Toro', 'Trujillo', 'Tuluá', 'Ulloa', 'Versalles', 'Vijes', 'Yotoco', 'Yumbo', 'Zarzal'],
  'Vaupés': ['Mitú', 'Carurú', 'Pacoa', 'Papunaua', 'Taraira', 'Yavaraté'],
  'Vichada': ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía'],
};

// ── PRODUCTOS POR DEFECTO ────────────────────────────
const defaultProducts = [
  { id: 1, name: 'Flash Mask Mantenimiento de Color x300ml', price: 77800, cat: 'mascarilla', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla de mantenimiento de color para cabello tratado.' },
  { id: 2, name: 'Acondicionador Glow x500ml', price: 64900, cat: 'acondicionador', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-2-300x300.png', instock: true, brand: 'Yellow', desc: 'Acondicionador con efecto brillo intenso.' },
  { id: 3, name: 'Shampoo Hidro-Nutritivo x500ml', price: 62900, cat: 'shampoo', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-4-300x300.png', instock: true, brand: 'Yellow', desc: 'Shampoo con nutricion profunda e hidratacion intensa.' },
  { id: 4, name: 'Molecular Serum x150ml', price: 62900, cat: 'leavein', img: BASE + '2026/05/Copia-de-Copia-de-pagina-web-3-300x300.png', instock: true, brand: 'Organic Fiber', desc: 'Serum molecular de accion profunda.' },
  { id: 5, name: 'Protector Thermal Yellow x250ml', price: 69000, cat: 'Termoprotector', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-23-300x300.png', instock: true, brand: 'Yellow', desc: 'Termoprotector Yellow hasta 230C.' },
  { id: 6, name: 'Crema de Peinar Curly Yellow x200ml', price: 43900, cat: 'leavein', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-22-300x300.png', instock: true, brand: 'Yellow', desc: 'Crema definidora de rizos Yellow.' },
  { id: 7, name: 'Shampoo Curly Yellow x500ml', price: 62900, cat: 'shampoo', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-21-300x300.png', instock: true, brand: 'Yellow', desc: 'Shampoo Yellow especial para rizos.' },
  { id: 8, name: 'Acondicionador Curly Yellow x500ml', price: 64900, cat: 'acondicionador', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-20-300x300.png', instock: true, brand: 'Yellow', desc: 'Acondicionador Yellow para rizos.' },
  { id: 9, name: 'Mascarilla Reparadora Yellow x300ml', price: 62900, cat: 'mascarilla', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-19-300x300.png', instock: true, brand: 'Yellow', desc: 'Mascarilla reparadora Yellow con keratina.' },
  { id: 10, name: 'Shampoo Liss Yellow x500ml', price: 62900, cat: 'shampoo', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-18-300x300.png', instock: true, brand: 'Yellow', desc: 'Shampoo Yellow para cabello liso.' },
  { id: 11, name: 'Mascarilla Nutritiva Yellow', price: 62900, cat: 'mascarilla', img: BASE + '2026/01/Copia-de-Copia-de-pagina-web-17-300x300.png', instock: true, brand: 'Yellow', sizes: [{ label: '200ml', price: 62900 }, { label: '500ml', price: 85700 }], priceMax: 85700, desc: 'Mascarilla nutritiva Yellow en dos tamanios.' },
  { id: 12, name: 'Reparative Mask Reestructurante', price: 98900, cat: 'mascarilla', img: BASE + '2025/12/Copia-de-Copia-de-pagina-web-10-300x300.png', instock: true, brand: 'Yellow', sizes: [{ label: '200ml', price: 98900 }, { label: '500ml', price: 170000 }], priceMax: 170000, badge: 'Premium', desc: 'Mascarilla reestructurante de alto rendimiento.' },
  { id: 13, name: 'Illuminating Mask 200ml', price: 106000, cat: 'mascarilla', img: BASE + '2025/12/Copia-de-Copia-de-pagina-web-14-300x300.png', instock: true, brand: 'Yellow', badge: 'Premium', desc: 'Mascarilla nutritiva iluminadora.' },
  { id: 14, name: 'Thermal Protector 300ml', price: 93500, cat: 'Termoprotector', img: BASE + '2025/12/Copia-de-Copia-de-pagina-web-15-300x300.png', instock: true, brand: 'Organic Fiber', desc: 'Termoprotector sin fijacion hasta 230C.' },
  { id: 15, name: 'Shampoo Hydratation Terra by Lendan', price: 59700, cat: 'shampoo', img: BASE + '2025/05/SHAMPOO-HYDRATION-PROFUNDA-TERRA-BYLENDAN-300x300.png', instock: true, brand: 'Terra by Lendan', sizes: [{ label: '300ml', price: 59700 }, { label: '1L', price: 120000 }], priceMax: 120000, desc: 'Shampoo Terra by Lendan para cabello color.' },
  { id: 16, name: 'Conditioner Hydratation Terra by Lendan', price: 67000, cat: 'acondicionador', img: BASE + '2025/05/CONDITIONER-HYDRATATION-CUIDA-COLOR-TERRA-BYLENDAN-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Acondicionador Terra by Lendan.' },
  { id: 17, name: 'Leave-In Termoprotector Profundo Terra', price: 63500, cat: 'leavein', img: BASE + '2025/05/TERRA_CURLY_ACTIVATOR_275ml_-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Leave-In sin enjuague Terra by Lendan.' },
  { id: 18, name: 'Termoprotector Reparador Profundo Terra', price: 55000, cat: 'Termoprotector', img: BASE + '2025/05/Termoprotector-REPARADOR-PROFUNDO-TERRABY-LENDAN-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Termoprotector reparador intensivo Terra by Lendan.' },
  { id: 19, name: 'Mascarilla Nutricion Cuida Color Terra 500ml', price: 98900, cat: 'mascarilla', img: BASE + '2025/05/MASCARILLA-NUTRICION-CUIDA-COLOR-TERRABY-LENDAN-500M-300x300.png', instock: true, brand: 'Terra by Lendan', desc: 'Mascarilla Terra by Lendan nutre y protege el color.' },
  { id: 20, name: 'Mascarilla Hydration Profunda Terra 500ml', price: 98900, cat: 'mascarilla', img: BASE + '2025/05/MASCARILLA-HYDRATION-PROFUNDA-TERRA-BYLENDAN-300x300.png', instock: false, brand: 'Terra by Lendan', desc: 'Mascarilla de hidratacion profunda Terra by Lendan.' },
  { id: 21, name: 'Shampoo Plex Forte N.4 x300ml', price: 57900, cat: 'shampoo', img: BASE + '2025/05/SHAMPOO-PLEX-FORTE-N4-LENDAN-300x300.png', instock: true, brand: 'Lendan', desc: 'Shampoo Lendan Plex Forte N.4.' },
  { id: 22, name: 'Acondicionador Plex Forte N.5 x300ml', price: 62900, cat: 'acondicionador', img: BASE + '2025/05/ACONDICIONADOR-PLEX-FORTE-N5-LENDAN-300x300.png', instock: true, brand: 'Lendan', desc: 'Acondicionador Lendan Plex Forte N.5.' },
  { id: 23, name: 'Ampolla Plex Forte N.3', price: 39000, cat: 'Termoprotector', img: BASE + '2025/05/AMPOLLA-PLEX-FORTE-N3-LENDAN-300x300.png', instock: true, brand: 'Lendan', sizes: [{ label: '1 ampolla', price: 39000 }, { label: 'Caja x12', price: 186000 }], priceMax: 186000, desc: 'Ampolla Lendan Plex Forte N.3.' },
  { id: 24, name: 'Oleo Capilar Plex Forte N.6 75ml', price: 114000, cat: 'oleo', img: BASE + '2025/05/OLEO-CAPILAR-REPARADOR-Y-PROTECTORLENDAN-PLEX-FORTE-N6-300x300.png', instock: true, brand: 'Lendan', desc: 'Oleo Lendan Plex Forte N.6.' },
  { id: 25, name: 'Mascarilla Salerm 21 Original', price: 33700, cat: 'mascarilla', img: BASE + '2025/05/Salerm-21-Original-Hair-Lab-Salerm-Cosmetic-Mascarilla_surticapilar-300x300.png', instock: true, brand: 'Salerm', desc: 'Mascarilla clasica Salerm 21.' },
  { id: 26, name: 'Salerm 21 Jazmin y Ambar', price: 37500, cat: 'mascarilla', img: BASE + '2025/05/SALERM-21-JAZMIN-AMBAR-300x300.png', instock: true, brand: 'Salerm', desc: 'Salerm 21 con aroma a Jazmin y Ambar.' },
  { id: 27, name: 'Mascarilla Nutricion Germen de Trigo 200ml', price: 65900, cat: 'mascarilla', img: BASE + '2025/05/MASCARILLA-NUTRICION-GERMEN-DE-TRIGO-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla Hair Lab con germen de trigo.' },
  { id: 28, name: 'Mascarilla Lisos Anti Frizz Hair Lab 300ml', price: 55000, cat: 'mascarilla', img: BASE + '2025/05/mascarilla_para_alisado_hair_lab_cosmetic-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Mascarilla anti-frizz Hair Lab.' },
  { id: 29, name: 'Shampoo Control Caspa Hair Lab 300ml', price: 35000, cat: 'shampoo', img: BASE + '2025/05/Shampoo-Control-Caspa-Hair-Lab-Salerm-Cosmetic-Shampoo-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Shampoo anticaspa Hair Lab.' },
  { id: 30, name: 'Impermeabilizante Protector Capilar Hair Lab', price: 48900, cat: 'Termoprotector', img: BASE + '2025/05/Spray-Impermeabilizante-Hair-Lab-Salerm-Cosmetic-Spray_surticapilar-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Spray impermeabilizante Hair Lab.' },
  { id: 31, name: 'Acondicionador Color Hair Lab 300ml', price: 45000, cat: 'acondicionador', img: BASE + '2025/05/ACONDICIONADOR-HIDRATANTE-PROTECTOR-COLOR-HAIRLAB-300x300.png', instock: true, brand: 'Hair Lab', desc: 'Acondicionador Hair Lab para cabello con color.' },
  { id: 32, name: 'Termoprotector Moisture Kick Bonacure 200ml', price: 82000, cat: 'Termoprotector', img: BASE + '2025/05/Termoprotector-MOISTURE-KICK-BONACURE-300x300.png', instock: true, brand: 'Bonacure', desc: 'Termoprotector Schwarzkopf Bonacure Moisture Kick.' },
  { id: 33, name: 'Termoprotector Repair Rescue Bonacure 200ml', price: 82000, cat: 'Termoprotector', img: BASE + '2025/05/REPAIR-RESCUE-BONACURE-300x300.png', instock: false, brand: 'Bonacure', desc: 'Termoprotector Bonacure Repair Rescue.' },
  { id: 34, name: 'Dark & Lovely Alisador Regular Sin Lejia', price: 69000, cat: 'alisadora', img: BASE + '2025/05/Dark-LovelyDark-Lovely-Alisador-300x300.png', instock: true, brand: 'Dark & Lovely', desc: 'Alisador Dark & Lovely Regular Sin Lejia.' },
  { id: 35, name: 'Dark & Lovely Super Alisador Sin Lejia', price: 64800, cat: 'alisadora', img: BASE + '2025/05/Aliser-DarkLovely-Super-Sin-Lejia-1-Aplicacion-300x300.png', instock: false, wasPrice: 69400, brand: 'Dark & Lovely', badge: 'Oferta', desc: 'Alisador Dark & Lovely Super Sin Lejia.' },
  { id: 36, name: 'Just For Me Relajante Sin Lejia', price: 55700, cat: 'alisadora', img: BASE + '2025/05/Just-For-Me-Relajante-sin-Lejia-1-Aplicacion-300x300.png', instock: false, wasPrice: 59900, brand: 'Just For Me', badge: 'Oferta', desc: 'Relajante Just For Me Sin Lejia.' },
  { id: 37, name: 'Ultra Sheen Supreme Kit Relajante x2', price: 78300, cat: 'alisadora', img: BASE + '2025/05/Ultra-Sheen-Supreme-Regular-Kit-Relajante-sin-lejia-2-aplicaciones-300x300.png', instock: false, brand: 'Ultra Sheen', desc: 'Kit relajante Ultra Sheen Supreme.' },
  { id: 38, name: 'SheaMoisture Mascarilla Miel de Manuka 326gr', price: 88000, cat: 'mascarilla', img: BASE + '2025/05/SHEAMOISTURE-MASCARILLA-MIEL-MANUKA-300x300.png', instock: true, brand: 'SheaMoisture', desc: 'Mascarilla SheaMoisture con miel de manuka.' },
  { id: 39, name: 'OGX Aceite de Argan de Marruecos 100ml', price: 53900, cat: 'oleo', img: BASE + '2025/05/aceite-de-argan-OGX-300x300.png', instock: true, wasPrice: 68000, brand: 'OGX', badge: 'Oferta', desc: 'Aceite de argan OGX.' },
  { id: 40, name: 'Oleo Extraordinario Elvive 100ml', price: 47300, cat: 'oleo', img: BASE + '2025/05/OLEO-EXTRAORDINARIO-ACEITE-CAPILAR-ELVIVE-300x300.png', instock: true, brand: "L'Oreal", desc: 'Oleo Elvive Extraordinario.' },
  { id: 41, name: 'Termoprotector Leche Pal Pelo', price: 36500, cat: 'Termoprotector', img: BASE + '2025/05/TERMOPROTECTOR-LECHE-PAL-PELO-300x300.png', instock: true, brand: 'Leche Pal Pelo', desc: 'Termoprotector Leche Pal Pelo.' },
  { id: 42, name: 'Salerm 21 Jazmin y Ambar Leave-In', price: 37500, cat: 'leavein', img: BASE + '2025/05/SALERM-21-JAZMIN-AMBAR-300x300.png', instock: true, brand: 'Salerm', desc: 'Leave-in Salerm 21 con aroma Jazmin y Ambar.' },
  { id: 43, name: 'Gorro Malla para Rulos – Negro', price: 37500, cat: 'accesorio', img: BASE + '2025/05/GORRO-MALLA-REDECILLA-RULOS-NEGRO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Gorro de malla para proteger los rulos.' },
  { id: 44, name: 'Rulos 1 Pulgada 3/4 x12 – Morado', price: 26000, cat: 'accesorio', img: BASE + '2025/05/RULOS-1-PULGADA-TRES-CUARTO-MORADO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Set de 12 rulos medianos morados.' },
  { id: 45, name: 'Rulos 2 Pulgadas x12 – Verde Oscuro', price: 29500, cat: 'accesorio', img: BASE + '2025/05/RULOS-2-PULGADAS-VERDE-OSCURO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Set de 12 rulos grandes verde oscuro.' },
  { id: 46, name: 'Rulos 2 Pulgadas y Medio x6', price: 25900, cat: 'accesorio', img: BASE + '2025/05/RULOS-2-PULGADAS-MEDIO-300x300.png', instock: true, brand: 'Accesorios', desc: 'Set de 6 rulos extra grandes 2.5 pulgadas.' },
  { id: 47, name: 'Rulos Extra Grande 3 Pulgadas x6', price: 27900, cat: 'accesorio', img: BASE + '2025/05/RULOS-EXTRA-GRANDE-3-PULGADAS-300x300.png', instock: false, brand: 'Accesorios', desc: 'Set de 6 rulos extra grandes 3 pulgadas.' },
];

// ── CARGA JSONBIN ────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch('https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest', {
      headers: { 'X-Bin-Meta': 'false' }
    });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const prods = data.record ? data.record.products : data.products;
    if (prods && prods.length > 0) return prods;
    return defaultProducts;
  } catch (e) {
    console.warn('JSONBin no disponible, usando productos por defecto');
    return defaultProducts;
  }
}

// ── ESTADO GLOBAL ────────────────────────────────────
let products = defaultProducts;
let cart = [], activeCat = 'all', currentProduct = null, detailQty = 1, selectedSize = null;

// ── PERSISTENCIA DEL CARRITO ─────────────────────────
function saveCart() {
  try { localStorage.setItem('sc_cart', JSON.stringify(cart)); } catch (e) { }
}
function loadCart() {
  try {
    const raw = localStorage.getItem('sc_cart');
    if (raw) cart = JSON.parse(raw);
  } catch (e) { cart = []; }
}

const tagClasses = { shampoo: 't-shampoo', acondicionador: 't-acondicionador', mascarilla: 't-mascarilla', Termoprotector: 't-Termoprotector', leavein: 't-leavein', oleo: 't-oleo', alisadora: 't-alisadora', accesorio: 't-accesorio', tinte: 't-tinte' };
const tagNames = { shampoo: 'Shampoo', acondicionador: 'Acondicionador', mascarilla: 'Mascarilla', Termoprotector: 'Termoprotector', leavein: 'Leave-In', oleo: 'Oleo', alisadora: 'Alisadora', accesorio: 'Accesorio', tinte: 'Tinte' };

// ── BANNER ───────────────────────────────────────────
function buildBanner() {
  const avail = products.filter(p => p.instock);
  const bg = document.getElementById('bannerBg');
  if (bg) bg.innerHTML = avail.slice(0, 24).map(p =>
    '<img src="' + p.img + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
  ).join('');
  ['bf1', 'bf2', 'bf3', 'bf4', 'bf5', 'bf6', 'bf7'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && avail[i]) el.src = avail[i].img;
  });
}

function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO'); }

// ── FILTRO + RENDER ──────────────────────────────────
function filterCat(cat, btn) {
  activeCat = cat;
  document.querySelectorAll('.cat').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderProducts();
}

function renderProducts() {
  const q = document.getElementById('srchInput').value.toLowerCase().trim();
  const list = products.filter(p => {
    const mc = activeCat === 'all' || p.cat === activeCat;
    const mq = !q || p.name.toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
    return mc && mq;
  });
  const g = document.getElementById('grid');
  if (!list.length) { g.innerHTML = '<p style="color:#aaa;grid-column:1/-1;padding:2rem 0">No se encontraron productos.</p>'; return; }
  g.innerHTML = list.map(p => renderCard(p)).join('');
}

function renderCard(p) {
  const b = p.badge ? '<span class="card-badge' + (p.badge === 'Oferta' ? ' sale' : '') + '">' + p.badge + '</span>' : '';
  // For cards with sizes, check if at least one size is in stock
  const effectiveInstock = p.sizes && p.sizes.length > 1
    ? p.sizes.some(s => getSizeInstock(p, s.label))
    : p.instock;
  return '<div class="card" onclick="openDetail(' + p.id + ')">'
    + '<div class="card-img-wrap">'
    + '<img class="card-img" src="' + p.img + '" alt="' + p.name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
    + '<div class="card-img-err"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>' + (p.brand || '') + '</span></div>'
    + b + '</div>'
    + '<div class="card-body">'
    + '<span class="card-tag ' + (tagClasses[p.cat] || 't-otro') + '">' + (tagNames[p.cat] || p.cat) + '</span>'
    + '<p class="card-name">' + p.name + (p.wasPrice ? '<span class="on-sale-badge">Oferta</span>' : '') + '</p>'
    + (p.wasPrice ? '<span class="card-offer">' + fmt(p.wasPrice) + '</span>' : '')
    + (p.priceMax ? '<p class="card-price-range">' + fmt(p.price) + ' – ' + fmt(p.priceMax) + '</p>' : '<p class="card-price">' + fmt(p.price) + '</p>')
    + '<button class="add-btn" onclick="event.stopPropagation();quickAdd(' + p.id + ')" ' + (effectiveInstock ? '' : 'disabled') + '>'
    + (effectiveInstock ? 'Añadir al carrito' : 'Sin stock') + '</button>'
    + (!effectiveInstock ? '<p class="outofstock-lbl">Producto agotado</p>' : '')
    + '</div></div>';
}

// ── HELPERS DE STOCK POR TALLA ────────────────────────

/**
 * Obtiene el stock disponible de una talla específica o del producto (si no tiene tallas).
 * Retorna Infinity si no hay conteo configurado.
 */
function getSizeAvailableStock(p, sizeLabel) {
  if (p.sizes && p.sizes.length > 1 && sizeLabel) {
    // Producto con múltiples tallas: leer stockQty de la talla
    const sizeObj = p.sizes.find(s => s.label === sizeLabel);
    if (!sizeObj) return Infinity;
    if (sizeObj.stockQty === null || sizeObj.stockQty === undefined || sizeObj.stockQty === '') return Infinity;
    return parseInt(sizeObj.stockQty) || 0;
  }
  // Producto sin tallas (o con una sola): usar stockQty del producto
  if (p.stockQty === null || p.stockQty === undefined || p.stockQty === '') return Infinity;
  return parseInt(p.stockQty) || 0;
}

/**
 * Determina si una talla (o el producto entero) está en stock.
 */
function getSizeInstock(p, sizeLabel) {
  if (p.sizes && p.sizes.length > 1 && sizeLabel) {
    const sizeObj = p.sizes.find(s => s.label === sizeLabel);
    if (!sizeObj) return false;
    // Si la talla tiene instock explícito, usarlo
    if (typeof sizeObj.instock === 'boolean') return sizeObj.instock;
    // Si tiene stockQty = 0, está agotada
    if (sizeObj.stockQty !== undefined && sizeObj.stockQty !== null && parseInt(sizeObj.stockQty) <= 0) return false;
    // Heredar del producto
    return p.instock;
  }
  return p.instock;
}

function getAvailableStock(p) {
  // Compatibilidad hacia atrás para productos sin tallas
  if (p.stockQty === null || p.stockQty === undefined || p.stockQty === '') return Infinity;
  return parseInt(p.stockQty) || 0;
}

function getCartQtyForProduct(key) {
  const item = cart.find(x => x.key === key);
  return item ? item.qty : 0;
}

// ── CARRITO ──────────────────────────────────────────
function quickAdd(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  // For multi-size products, open detail so user picks a size
  if (p.sizes && p.sizes.length > 1) {
    openDetail(id);
    return;
  }
  if (!p.instock) return;
  const key = String(p.id);
  const available = getSizeAvailableStock(p, null);
  const inCart = getCartQtyForProduct(key);
  if (available !== Infinity && inCart >= available) {
    showToast(available === 1 ? 'Solo queda 1 unidad disponible' : 'Solo quedan ' + available + ' unidades disponibles');
    return;
  }
  addToCart(p, 1, null);
  showToast('Producto añadido al carrito');
}

function addToCart(p, qty, sizeLabel) {
  const key = p.id + (sizeLabel || '');
  const price = p.sizes && sizeLabel ? (p.sizes.find(s => s.label === sizeLabel)?.price || p.price) : p.price;
  const available = getSizeAvailableStock(p, sizeLabel);
  const ex = cart.find(x => x.key === key);
  const currentQty = ex ? ex.qty : 0;
  const allowed = available !== Infinity ? Math.min(qty, available - currentQty) : qty;
  if (allowed <= 0) return;
  if (ex) ex.qty += allowed;
  else cart.push({ key, id: p.id, name: p.name, img: p.img, price, sizeLabel, qty: allowed });
  saveCart();
  updateCartUI();
}

function clampCartToStock() {
  let changed = false;
  cart = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return item;
    const available = getSizeAvailableStock(p, item.sizeLabel);
    if (available !== Infinity && item.qty > available) {
      changed = true;
      if (available <= 0) return null;
      return { ...item, qty: available };
    }
    return item;
  }).filter(Boolean);
  if (changed) {
    saveCart();
    showToast('Algunas cantidades se ajustaron por disponibilidad de stock');
  }
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartBadge').textContent = count;
  const dcb = document.getElementById('detailCartBadge');
  if (dcb) dcb.textContent = count;
  const ci = document.getElementById('cpItems');
  const cf = document.getElementById('cpFoot');
  if (!cart.length) {
    ci.innerHTML = '<div class="empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Tu carrito está vacío</p></div>';
    cf.style.display = 'none'; return;
  }
  cf.style.display = 'block';
  document.getElementById('cpTotal').textContent = fmt(total);
  ci.innerHTML = cart.map(i =>
    '<div class="ci">'
    + '<img class="ci-img" src="' + i.img + '" alt="" onerror="this.style.background=\'#f0e0e5\'">'
    + '<div class="ci-info"><p class="ci-name">' + i.name + '</p>'
    + (i.sizeLabel ? '<p class="ci-sub">' + i.sizeLabel + '</p>' : '')
    + '<p class="ci-price">' + fmt(i.price) + '</p>'
    + '<div class="ci-ctrl">'
    + '<button class="cq" onclick="cqChange(\'' + i.key + '\',-1)">−</button>'
    + '<span style="font-size:.85rem;font-weight:600;min-width:18px;text-align:center">' + i.qty + '</span>'
    + '<button class="cq" onclick="cqChange(\'' + i.key + '\',1)">+</button>'
    + '<button class="ci-rm" onclick="cRemove(\'' + i.key + '\')">×</button>'
    + '</div></div></div>'
  ).join('');
}

function cqChange(key, d) {
  const i = cart.find(x => x.key === key);
  if (!i) return;
  if (d > 0) {
    const p = products.find(x => x.id === i.id);
    const available = p ? getSizeAvailableStock(p, i.sizeLabel) : Infinity;
    if (available !== Infinity && i.qty >= available) {
      showToast(available === 1 ? 'Solo queda 1 unidad disponible' : 'Solo quedan ' + available + ' unidades disponibles');
      return;
    }
  }
  i.qty += d;
  if (i.qty <= 0) cart = cart.filter(x => x.key !== key);
  saveCart();
  updateCartUI();
}
function cRemove(key) { cart = cart.filter(x => x.key !== key); saveCart(); updateCartUI(); }
function openCart() { document.getElementById('cartOverlay').classList.add('open'); document.getElementById('cartPanel').classList.add('open'); }
function closeCart() { document.getElementById('cartOverlay').classList.remove('open'); document.getElementById('cartPanel').classList.remove('open'); }

// ── CIUDADES DINÁMICAS ────────────────────────────────
function onDeptChange() {
  const dept = document.getElementById('omDepartamento').value;
  const ciudadSel = document.getElementById('omCiudad');
  ciudadSel.innerHTML = '<option value="">— Selecciona tu ciudad —</option>';
  if (!dept) {
    document.getElementById('envioBox').style.display = 'none';
    document.getElementById('omTotalRow').style.display = 'none';
    return;
  }
  const ciudades = CIUDADES[dept] || [];
  ciudades.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    ciudadSel.appendChild(opt);
  });
  if (ciudades.length === 1) ciudadSel.value = ciudades[0];
  const info = ENVIO[dept] || ENVIO.default;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + info.costo;
  document.getElementById('envioZona').textContent = info.label;
  document.getElementById('envioDetalle').textContent = info.detalle;
  document.getElementById('envioPrice').textContent = fmt(info.costo);
  document.getElementById('envioBox').style.display = 'flex';
  document.getElementById('omTotalDetail').textContent = fmt(subtotal) + ' productos + ' + fmt(info.costo) + ' envío';
  document.getElementById('omTotalVal').textContent = fmt(total);
  document.getElementById('omTotalRow').style.display = 'flex';
}

// ── FORMULARIO DE PEDIDO ─────────────────────────────
function openOrderForm() {
  if (!cart.length) return;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('omResumen').innerHTML = cart.map(i =>
    '<div class="om-item">'
    + '<span class="om-item-name">' + i.name + (i.sizeLabel ? ' <small>(' + i.sizeLabel + ')</small>' : '') + ' ×' + i.qty + '</span>'
    + '<span class="om-item-price">' + fmt(i.price * i.qty) + '</span>'
    + '</div>'
  ).join('') + '<div class="om-item om-subtotal"><span>Subtotal productos</span><span>' + fmt(subtotal) + '</span></div>';
  ['omNombre', 'omCedula', 'omTelefono', 'omCorreo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('omDepartamento').value = '';
  const ciudadSel = document.getElementById('omCiudad');
  ciudadSel.innerHTML = '<option value="">— Selecciona tu ciudad —</option>';
  document.getElementById('omDireccion').value = '';
  document.getElementById('envioBox').style.display = 'none';
  document.getElementById('omTotalRow').style.display = 'none';
  closeCart();
  document.getElementById('orderOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderForm() {
  document.getElementById('orderOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── VALIDACIONES ──────────────────────────────────────
function validarTelefono(tel) {
  const limpio = tel.replace(/\s/g, '');
  return /^3\d{9}$/.test(limpio);
}

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function submitOrder() {
  const nombre = document.getElementById('omNombre').value.trim();
  const cedula = document.getElementById('omCedula').value.trim();
  const telefono = document.getElementById('omTelefono').value.trim();
  const correo = document.getElementById('omCorreo').value.trim();
  const dept = document.getElementById('omDepartamento').value;
  const ciudad = document.getElementById('omCiudad').value.trim();
  const direccion = document.getElementById('omDireccion').value.trim();

  let hasError = false;
  const obligatorios = [
    { id: 'omNombre', v: nombre },
    { id: 'omCedula', v: cedula },
    { id: 'omDepartamento', v: dept },
    { id: 'omCiudad', v: ciudad },
    { id: 'omDireccion', v: direccion },
  ];
  obligatorios.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) el.style.borderColor = f.v ? '' : '#c0392b';
    if (!f.v) hasError = true;
  });

  const telEl = document.getElementById('omTelefono');
  if (!telefono) {
    telEl.style.borderColor = '#c0392b';
    hasError = true;
  } else if (!validarTelefono(telefono)) {
    telEl.style.borderColor = '#c0392b';
    showToast('Ingresa un número colombiano válido (ej: 3001234567)');
    return;
  } else {
    telEl.style.borderColor = '';
  }

  if (correo) {
    const correoEl = document.getElementById('omCorreo');
    if (!validarCorreo(correo)) {
      correoEl.style.borderColor = '#c0392b';
      showToast('Ingresa un correo electrónico válido');
      return;
    } else {
      correoEl.style.borderColor = '';
    }
  }

  if (hasError) {
    showToast('Completa los campos obligatorios *');
    return;
  }

  const envioInfo = ENVIO[dept] || ENVIO.default;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + envioInfo.costo;
  let msg = '%C2%A1Hola! Tengo un nuevo pedido desde la tienda:%0A%0A';
  msg += '👤 *Datos del cliente*%0A';
  msg += 'Nombre: ' + encodeURIComponent(nombre) + '%0A';
  msg += 'Cédula: ' + encodeURIComponent(cedula) + '%0A';
  msg += 'Teléfono: ' + encodeURIComponent(telefono) + '%0A';
  if (correo) msg += 'Correo: ' + encodeURIComponent(correo) + '%0A';
  msg += '%0A📦 *Productos*%0A';
  cart.forEach(i => {
    msg += '• ' + encodeURIComponent(i.name)
      + (i.sizeLabel ? ' (' + encodeURIComponent(i.sizeLabel) + ')' : '')
      + ' ×' + i.qty + ' = ' + encodeURIComponent(fmt(i.price * i.qty)) + '%0A';
  });
  msg += '%0A🚚 *Envío*%0A';
  msg += encodeURIComponent(envioInfo.label) + ': ' + encodeURIComponent(fmt(envioInfo.costo)) + '%0A';
  msg += 'Dirección: ' + encodeURIComponent(direccion) + '%0A';
  msg += 'Ciudad: ' + encodeURIComponent(ciudad) + ' – ' + encodeURIComponent(dept) + '%0A';
  msg += '%0A💰 *Total a pagar: ' + encodeURIComponent(fmt(total)) + '*%0A';
  msg += '%0APor favor confirmar disponibilidad y método de pago.';
  window.open('https://wa.me/' + WA + '?text=' + msg, '_blank');
  closeOrderForm();
}

// ── DETALLE ──────────────────────────────────────────
function openDetail(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  detailQty = 1;
  selectedSize = p.sizes && p.sizes.length > 0 ? p.sizes[0].label : null;

  document.getElementById('detailNavTitle').textContent = p.name;
  document.getElementById('mainImgBox').classList.remove('is-zoomed');
  document.getElementById('dBrand').textContent = p.brand || '';
  document.getElementById('dName').textContent = p.name;
  document.getElementById('dDesc').textContent = p.desc || '';

  const cb = document.getElementById('dCatBadge');
  cb.textContent = tagNames[p.cat] || p.cat;
  cb.className = 'd-cat-badge ' + (tagClasses[p.cat] || 't-otro');

  const firstImg = (p.sizes && p.sizes.length > 0 && p.sizes[0].img) ? p.sizes[0].img : p.img;
  setDetailImage(firstImg);

  const firstPrice = (p.sizes && p.sizes.length > 0) ? p.sizes[0].price : p.price;
  renderDetailPrice(firstPrice, p.wasPrice);

  const ds = document.getElementById('dSizes');
  if (p.sizes && p.sizes.length > 1) {
    ds.innerHTML = '<span class="d-label">Presentación</span><div class="size-opts">'
      + p.sizes.map((s, i) => {
        const sInstock = getSizeInstock(p, s.label);
        const sStock = getSizeAvailableStock(p, s.label);
        const stockInfo = sStock !== Infinity ? ' (' + sStock + ' uds.)' : '';
        return '<button class="size-opt' + (i === 0 ? ' sel' : '') + (sInstock ? '' : ' size-out') + '" '
          + 'onclick="selectSize(this,' + i + ')" '
          + (sInstock ? '' : 'disabled ')
          + 'title="' + s.label + (sInstock ? stockInfo : ' – Agotado') + '">'
          + s.label
          + (sInstock ? (sStock !== Infinity ? '<small class="size-stock-hint">' + sStock + ' uds.</small>' : '') : '<small class="size-stock-hint">Agotado</small>')
          + '</button>';
      }).join('')
      + '</div>';
    ds.style.display = 'block';
  } else {
    ds.style.display = 'none';
    ds.innerHTML = '';
  }

  document.getElementById('dQty').textContent = '1';
  const ab = document.getElementById('detailAddBtn');
  const firstSizeInstock = selectedSize ? getSizeInstock(p, selectedSize) : p.instock;
  ab.disabled = !firstSizeInstock;
  ab.textContent = firstSizeInstock ? 'Añadir al carrito' : 'Sin stock';

  renderSimilar(p);
  document.getElementById('detailPage').classList.add('open');
  window.scrollTo(0, 0);
}

function setDetailImage(src) {
  const mainImg = document.getElementById('dMainImg');
  mainImg.src = src;
  const p = currentProduct;
  const thumbs = [];
  thumbs.push({ src: p.img, label: '' });
  if (p.sizes) {
    p.sizes.forEach(s => {
      if (s.img && s.img !== p.img) thumbs.push({ src: s.img, label: s.label });
    });
  }
  document.getElementById('dThumbs').innerHTML = thumbs.map((t, i) =>
    '<div class="thumb' + (t.src === src ? ' active' : '') + '" onclick="thumbClick(this,\'' + t.src + '\')">'
    + '<img src="' + t.src + '" alt="' + t.label + '" onerror="this.parentElement.style.display=\'none\'">'
    + '</div>'
  ).join('');
}

function thumbClick(el, src) {
  document.querySelectorAll('#dThumbs .thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('dMainImg').src = src;
  document.getElementById('mainImgBox').classList.remove('is-zoomed');
  resetZoom();
}

function renderDetailPrice(price, wasPrice) {
  const pw = document.getElementById('dPriceWrap');
  if (wasPrice && wasPrice > price) {
    pw.innerHTML = '<div style="display:flex;align-items:baseline;gap:10px">'
      + '<span class="d-price">' + fmt(price) + '</span>'
      + '<span style="text-decoration:line-through;color:#bbb;font-size:.95rem">' + fmt(wasPrice) + '</span>'
      + '</div>';
  } else {
    pw.innerHTML = '<span class="d-price">' + fmt(price) + '</span>';
  }
}

function closeDetail() { document.getElementById('detailPage').classList.remove('open'); }

function renderSimilar(p) {
  const sim = products.filter(x => x.id !== p.id && (x.cat === p.cat || x.brand === p.brand)).slice(0, 8);
  document.getElementById('similarGrid').innerHTML = sim.length
    ? sim.map(s => renderCard(s)).join('')
    : '<p style="color:#aaa;font-size:.85rem">No hay productos similares.</p>';
}

function selectSize(btn, idx) {
  const p = currentProduct;
  if (!p || !p.sizes || !p.sizes[idx]) return;
  const s = p.sizes[idx];
  selectedSize = s.label;
  document.querySelectorAll('.size-opt').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  renderDetailPrice(s.price, p.wasPrice);
  if (s.img) setDetailImage(s.img);

  // Update add button based on this size's stock
  const sInstock = getSizeInstock(p, s.label);
  const ab = document.getElementById('detailAddBtn');
  ab.disabled = !sInstock;
  ab.textContent = sInstock ? 'Añadir al carrito' : 'Sin stock';
  detailQty = 1;
  document.getElementById('dQty').textContent = '1';
}

function changeDetailQty(d) {
  const p = currentProduct;
  const available = p ? getSizeAvailableStock(p, selectedSize) : Infinity;
  const newQty = detailQty + d;
  if (newQty < 1) return;
  if (available !== Infinity && newQty > available) {
    showToast(available === 1 ? 'Solo queda 1 unidad disponible' : 'Solo quedan ' + available + ' unidades disponibles');
    return;
  }
  detailQty = newQty;
  document.getElementById('dQty').textContent = detailQty;
}

function addFromDetail() {
  if (!currentProduct) return;
  const p = currentProduct;
  const sInstock = selectedSize ? getSizeInstock(p, selectedSize) : p.instock;
  if (!sInstock) return;

  const key = p.id + (selectedSize || '');
  const available = getSizeAvailableStock(p, selectedSize);
  const inCart = getCartQtyForProduct(key);

  if (available !== Infinity && inCart + detailQty > available) {
    const remaining = available - inCart;
    if (remaining <= 0) {
      showToast(available === 1 ? 'Solo queda 1 unidad disponible' : 'Solo quedan ' + available + ' unidades disponibles');
      return;
    }
    addToCart(p, remaining, selectedSize);
    showToast('Se añadieron ' + remaining + ' unidades (máximo disponible)');
    return;
  }
  addToCart(p, detailQty, selectedSize);
  showToast('Producto añadido al carrito');
}

function waFromDetail() {
  if (!currentProduct) return;
  const p = currentProduct;
  const price = p.sizes && selectedSize
    ? (p.sizes.find(s => s.label === selectedSize)?.price || p.price)
    : p.price;
  const total = price * detailQty;
  const msg = '%C2%A1Hola! Me interesa este producto:%0A%0A• *' + encodeURIComponent(p.name) + '*'
    + (selectedSize ? ' (' + encodeURIComponent(selectedSize) + ')' : '')
    + '%0AUnidades: ' + detailQty + '%0ATotal estimado: ' + encodeURIComponent(fmt(total))
    + '%0A%0A%C2%BFComo coordino la compra?';
  window.open('https://wa.me/' + WA + '?text=' + msg, '_blank');
}

// ── ZOOM ─────────────────────────────────────────────
function handleZoom(e) {
  const box = document.getElementById('mainImgBox');
  const img = document.getElementById('dMainImg');
  const rect = box.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  img.style.transformOrigin = (x * 100) + '% ' + (y * 100) + '%';
  img.style.transform = 'scale(2.5)';
  box.classList.add('is-zoomed');
}
function handleZoomTouch(e) { e.preventDefault(); const t = e.touches[0]; handleZoom({ clientX: t.clientX, clientY: t.clientY }); }
function resetZoom() {
  const img = document.getElementById('dMainImg');
  if (img) img.style.transform = 'scale(1)';
  const box = document.getElementById('mainImgBox');
  if (box) box.classList.remove('is-zoomed');
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── INIT ──────────────────────────────────────────────
(async () => {
  loadCart();
  products = await loadProducts();
  clampCartToStock();
  buildBanner();
  renderProducts();
  updateCartUI();
})();