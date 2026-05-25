-- =============================================================================
-- MIGRACIÓN 008: Partidos fase de grupos — Mundial FIFA 2026
-- Calendario oficial (fuente: FIFA / football-data.org)
-- Inicio: 11 jun 2026 · Fin fase de grupos: 2 jul 2026
-- 12 grupos × 6 partidos = 72 partidos en total
-- =============================================================================

-- Helper: función para obtener team_id por fifa_code
-- Usamos subqueries inline para no depender de IDs secuenciales.

INSERT INTO matches (stage, group_letter, home_team_id, away_team_id, status, match_date, venue, city)
VALUES

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO A — México, Sudáfrica, Corea del Sur, República Checa
-- Sede principal: México (partido inaugural)
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','A',(SELECT id FROM teams WHERE fifa_code='MEX'),(SELECT id FROM teams WHERE fifa_code='RSA'),'SCHEDULED','2026-06-11T21:00:00+00:00','Estadio Azteca','Ciudad de México'),
('GROUP','A',(SELECT id FROM teams WHERE fifa_code='KOR'),(SELECT id FROM teams WHERE fifa_code='CZE'),'SCHEDULED','2026-06-12T00:00:00+00:00','Estadio Azteca','Ciudad de México'),
-- Jornada 2
('GROUP','A',(SELECT id FROM teams WHERE fifa_code='MEX'),(SELECT id FROM teams WHERE fifa_code='KOR'),'SCHEDULED','2026-06-16T18:00:00+00:00','Estadio BBVA','Monterrey'),
('GROUP','A',(SELECT id FROM teams WHERE fifa_code='RSA'),(SELECT id FROM teams WHERE fifa_code='CZE'),'SCHEDULED','2026-06-16T21:00:00+00:00','Estadio Akron','Guadalajara'),
-- Jornada 3 (simultáneos)
('GROUP','A',(SELECT id FROM teams WHERE fifa_code='MEX'),(SELECT id FROM teams WHERE fifa_code='CZE'),'SCHEDULED','2026-06-27T21:00:00+00:00','Estadio Azteca','Ciudad de México'),
('GROUP','A',(SELECT id FROM teams WHERE fifa_code='RSA'),(SELECT id FROM teams WHERE fifa_code='KOR'),'SCHEDULED','2026-06-27T21:00:00+00:00','Estadio BBVA','Monterrey'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO B — Canadá, Bosnia-Herzegovina, Qatar, Suiza
-- Sede principal: Canadá
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','B',(SELECT id FROM teams WHERE fifa_code='CAN'),(SELECT id FROM teams WHERE fifa_code='BIH'),'SCHEDULED','2026-06-12T18:00:00+00:00','BC Place','Vancouver'),
('GROUP','B',(SELECT id FROM teams WHERE fifa_code='QAT'),(SELECT id FROM teams WHERE fifa_code='SUI'),'SCHEDULED','2026-06-12T21:00:00+00:00','BMO Field','Toronto'),
-- Jornada 2
('GROUP','B',(SELECT id FROM teams WHERE fifa_code='CAN'),(SELECT id FROM teams WHERE fifa_code='QAT'),'SCHEDULED','2026-06-17T18:00:00+00:00','BC Place','Vancouver'),
('GROUP','B',(SELECT id FROM teams WHERE fifa_code='BIH'),(SELECT id FROM teams WHERE fifa_code='SUI'),'SCHEDULED','2026-06-17T21:00:00+00:00','BMO Field','Toronto'),
-- Jornada 3 (simultáneos)
('GROUP','B',(SELECT id FROM teams WHERE fifa_code='CAN'),(SELECT id FROM teams WHERE fifa_code='SUI'),'SCHEDULED','2026-06-28T21:00:00+00:00','BC Place','Vancouver'),
('GROUP','B',(SELECT id FROM teams WHERE fifa_code='BIH'),(SELECT id FROM teams WHERE fifa_code='QAT'),'SCHEDULED','2026-06-28T21:00:00+00:00','BMO Field','Toronto'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO C — Brasil, Marruecos, Haití, Escocia
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','C',(SELECT id FROM teams WHERE fifa_code='BRA'),(SELECT id FROM teams WHERE fifa_code='MAR'),'SCHEDULED','2026-06-13T18:00:00+00:00','Estadio Akron','Guadalajara'),
('GROUP','C',(SELECT id FROM teams WHERE fifa_code='HAI'),(SELECT id FROM teams WHERE fifa_code='SCO'),'SCHEDULED','2026-06-13T21:00:00+00:00','Estadio BBVA','Monterrey'),
-- Jornada 2
('GROUP','C',(SELECT id FROM teams WHERE fifa_code='BRA'),(SELECT id FROM teams WHERE fifa_code='HAI'),'SCHEDULED','2026-06-18T18:00:00+00:00','Estadio Akron','Guadalajara'),
('GROUP','C',(SELECT id FROM teams WHERE fifa_code='MAR'),(SELECT id FROM teams WHERE fifa_code='SCO'),'SCHEDULED','2026-06-18T21:00:00+00:00','Estadio BBVA','Monterrey'),
-- Jornada 3 (simultáneos)
('GROUP','C',(SELECT id FROM teams WHERE fifa_code='BRA'),(SELECT id FROM teams WHERE fifa_code='SCO'),'SCHEDULED','2026-06-29T21:00:00+00:00','Estadio Azteca','Ciudad de México'),
('GROUP','C',(SELECT id FROM teams WHERE fifa_code='HAI'),(SELECT id FROM teams WHERE fifa_code='MAR'),'SCHEDULED','2026-06-29T21:00:00+00:00','Estadio Akron','Guadalajara'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO D — Estados Unidos, Paraguay, Australia, Turquía
-- Sede principal: USA
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','D',(SELECT id FROM teams WHERE fifa_code='USA'),(SELECT id FROM teams WHERE fifa_code='PAR'),'SCHEDULED','2026-06-13T00:00:00+00:00','MetLife Stadium','East Rutherford, NJ'),
('GROUP','D',(SELECT id FROM teams WHERE fifa_code='AUS'),(SELECT id FROM teams WHERE fifa_code='TUR'),'SCHEDULED','2026-06-14T00:00:00+00:00','AT&T Stadium','Dallas, TX'),
-- Jornada 2
('GROUP','D',(SELECT id FROM teams WHERE fifa_code='USA'),(SELECT id FROM teams WHERE fifa_code='AUS'),'SCHEDULED','2026-06-19T00:00:00+00:00','SoFi Stadium','Los Angeles, CA'),
('GROUP','D',(SELECT id FROM teams WHERE fifa_code='PAR'),(SELECT id FROM teams WHERE fifa_code='TUR'),'SCHEDULED','2026-06-19T23:00:00+00:00','NRG Stadium','Houston, TX'),
-- Jornada 3 (simultáneos)
('GROUP','D',(SELECT id FROM teams WHERE fifa_code='USA'),(SELECT id FROM teams WHERE fifa_code='TUR'),'SCHEDULED','2026-06-30T21:00:00+00:00','MetLife Stadium','East Rutherford, NJ'),
('GROUP','D',(SELECT id FROM teams WHERE fifa_code='PAR'),(SELECT id FROM teams WHERE fifa_code='AUS'),'SCHEDULED','2026-06-30T21:00:00+00:00','AT&T Stadium','Dallas, TX'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO E — Alemania, Curazao, Costa de Marfil, Ecuador
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','E',(SELECT id FROM teams WHERE fifa_code='GER'),(SELECT id FROM teams WHERE fifa_code='CUW'),'SCHEDULED','2026-06-14T18:00:00+00:00','Mercedes-Benz Stadium','Atlanta, GA'),
('GROUP','E',(SELECT id FROM teams WHERE fifa_code='CIV'),(SELECT id FROM teams WHERE fifa_code='ECU'),'SCHEDULED','2026-06-14T21:00:00+00:00','Levi''s Stadium','Santa Clara, CA'),
-- Jornada 2
('GROUP','E',(SELECT id FROM teams WHERE fifa_code='GER'),(SELECT id FROM teams WHERE fifa_code='CIV'),'SCHEDULED','2026-06-20T00:00:00+00:00','Mercedes-Benz Stadium','Atlanta, GA'),
('GROUP','E',(SELECT id FROM teams WHERE fifa_code='CUW'),(SELECT id FROM teams WHERE fifa_code='ECU'),'SCHEDULED','2026-06-20T23:00:00+00:00','Arrowhead Stadium','Kansas City, MO'),
-- Jornada 3 (simultáneos)
('GROUP','E',(SELECT id FROM teams WHERE fifa_code='GER'),(SELECT id FROM teams WHERE fifa_code='ECU'),'SCHEDULED','2026-07-01T00:00:00+00:00','Mercedes-Benz Stadium','Atlanta, GA'),
('GROUP','E',(SELECT id FROM teams WHERE fifa_code='CUW'),(SELECT id FROM teams WHERE fifa_code='CIV'),'SCHEDULED','2026-07-01T00:00:00+00:00','Levi''s Stadium','Santa Clara, CA'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO F — Países Bajos, Japón, Suecia, Túnez
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','F',(SELECT id FROM teams WHERE fifa_code='NED'),(SELECT id FROM teams WHERE fifa_code='JPN'),'SCHEDULED','2026-06-15T18:00:00+00:00','Lincoln Financial Field','Philadelphia, PA'),
('GROUP','F',(SELECT id FROM teams WHERE fifa_code='SWE'),(SELECT id FROM teams WHERE fifa_code='TUN'),'SCHEDULED','2026-06-15T21:00:00+00:00','Gillette Stadium','Foxborough, MA'),
-- Jornada 2
('GROUP','F',(SELECT id FROM teams WHERE fifa_code='NED'),(SELECT id FROM teams WHERE fifa_code='SWE'),'SCHEDULED','2026-06-20T18:00:00+00:00','Lincoln Financial Field','Philadelphia, PA'),
('GROUP','F',(SELECT id FROM teams WHERE fifa_code='JPN'),(SELECT id FROM teams WHERE fifa_code='TUN'),'SCHEDULED','2026-06-20T21:00:00+00:00','Gillette Stadium','Foxborough, MA'),
-- Jornada 3 (simultáneos)
('GROUP','F',(SELECT id FROM teams WHERE fifa_code='NED'),(SELECT id FROM teams WHERE fifa_code='TUN'),'SCHEDULED','2026-07-01T21:00:00+00:00','Lincoln Financial Field','Philadelphia, PA'),
('GROUP','F',(SELECT id FROM teams WHERE fifa_code='SWE'),(SELECT id FROM teams WHERE fifa_code='JPN'),'SCHEDULED','2026-07-01T21:00:00+00:00','Gillette Stadium','Foxborough, MA'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO G — Bélgica, Egipto, Irán, Nueva Zelanda
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','G',(SELECT id FROM teams WHERE fifa_code='BEL'),(SELECT id FROM teams WHERE fifa_code='EGY'),'SCHEDULED','2026-06-15T23:00:00+00:00','Hard Rock Stadium','Miami Gardens, FL'),
('GROUP','G',(SELECT id FROM teams WHERE fifa_code='IRN'),(SELECT id FROM teams WHERE fifa_code='NZL'),'SCHEDULED','2026-06-16T02:00:00+00:00','Rose Bowl','Pasadena, CA'),
-- Jornada 2
('GROUP','G',(SELECT id FROM teams WHERE fifa_code='BEL'),(SELECT id FROM teams WHERE fifa_code='IRN'),'SCHEDULED','2026-06-21T18:00:00+00:00','Hard Rock Stadium','Miami Gardens, FL'),
('GROUP','G',(SELECT id FROM teams WHERE fifa_code='EGY'),(SELECT id FROM teams WHERE fifa_code='NZL'),'SCHEDULED','2026-06-21T21:00:00+00:00','Rose Bowl','Pasadena, CA'),
-- Jornada 3 (simultáneos)
('GROUP','G',(SELECT id FROM teams WHERE fifa_code='BEL'),(SELECT id FROM teams WHERE fifa_code='NZL'),'SCHEDULED','2026-07-02T21:00:00+00:00','Hard Rock Stadium','Miami Gardens, FL'),
('GROUP','G',(SELECT id FROM teams WHERE fifa_code='EGY'),(SELECT id FROM teams WHERE fifa_code='IRN'),'SCHEDULED','2026-07-02T21:00:00+00:00','Rose Bowl','Pasadena, CA'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO H — España, Cabo Verde, Arabia Saudita, Uruguay
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','H',(SELECT id FROM teams WHERE fifa_code='ESP'),(SELECT id FROM teams WHERE fifa_code='CPV'),'SCHEDULED','2026-06-13T23:00:00+00:00','SoFi Stadium','Los Angeles, CA'),
('GROUP','H',(SELECT id FROM teams WHERE fifa_code='KSA'),(SELECT id FROM teams WHERE fifa_code='URU'),'SCHEDULED','2026-06-14T02:00:00+00:00','Rose Bowl','Pasadena, CA'),
-- Jornada 2
('GROUP','H',(SELECT id FROM teams WHERE fifa_code='ESP'),(SELECT id FROM teams WHERE fifa_code='KSA'),'SCHEDULED','2026-06-18T23:00:00+00:00','SoFi Stadium','Los Angeles, CA'),
('GROUP','H',(SELECT id FROM teams WHERE fifa_code='CPV'),(SELECT id FROM teams WHERE fifa_code='URU'),'SCHEDULED','2026-06-19T02:00:00+00:00','Hard Rock Stadium','Miami Gardens, FL'),
-- Jornada 3 (simultáneos)
('GROUP','H',(SELECT id FROM teams WHERE fifa_code='ESP'),(SELECT id FROM teams WHERE fifa_code='URU'),'SCHEDULED','2026-06-27T00:00:00+00:00','SoFi Stadium','Los Angeles, CA'),
('GROUP','H',(SELECT id FROM teams WHERE fifa_code='CPV'),(SELECT id FROM teams WHERE fifa_code='KSA'),'SCHEDULED','2026-06-27T00:00:00+00:00','Rose Bowl','Pasadena, CA'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO I — Francia, Senegal, Irak, Noruega
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','I',(SELECT id FROM teams WHERE fifa_code='FRA'),(SELECT id FROM teams WHERE fifa_code='SEN'),'SCHEDULED','2026-06-16T18:00:00+00:00','MetLife Stadium','East Rutherford, NJ'),
('GROUP','I',(SELECT id FROM teams WHERE fifa_code='IRQ'),(SELECT id FROM teams WHERE fifa_code='NOR'),'SCHEDULED','2026-06-16T21:00:00+00:00','Lincoln Financial Field','Philadelphia, PA'),
-- Jornada 2
('GROUP','I',(SELECT id FROM teams WHERE fifa_code='FRA'),(SELECT id FROM teams WHERE fifa_code='IRQ'),'SCHEDULED','2026-06-21T23:00:00+00:00','MetLife Stadium','East Rutherford, NJ'),
('GROUP','I',(SELECT id FROM teams WHERE fifa_code='SEN'),(SELECT id FROM teams WHERE fifa_code='NOR'),'SCHEDULED','2026-06-22T02:00:00+00:00','Arrowhead Stadium','Kansas City, MO'),
-- Jornada 3 (simultáneos)
('GROUP','I',(SELECT id FROM teams WHERE fifa_code='FRA'),(SELECT id FROM teams WHERE fifa_code='NOR'),'SCHEDULED','2026-06-28T00:00:00+00:00','MetLife Stadium','East Rutherford, NJ'),
('GROUP','I',(SELECT id FROM teams WHERE fifa_code='SEN'),(SELECT id FROM teams WHERE fifa_code='IRQ'),'SCHEDULED','2026-06-28T00:00:00+00:00','Lincoln Financial Field','Philadelphia, PA'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO J — Argentina, Argelia, Austria, Jordania
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','J',(SELECT id FROM teams WHERE fifa_code='ARG'),(SELECT id FROM teams WHERE fifa_code='ALG'),'SCHEDULED','2026-06-17T18:00:00+00:00','AT&T Stadium','Dallas, TX'),
('GROUP','J',(SELECT id FROM teams WHERE fifa_code='AUT'),(SELECT id FROM teams WHERE fifa_code='JOR'),'SCHEDULED','2026-06-17T21:00:00+00:00','NRG Stadium','Houston, TX'),
-- Jornada 2
('GROUP','J',(SELECT id FROM teams WHERE fifa_code='ARG'),(SELECT id FROM teams WHERE fifa_code='AUT'),'SCHEDULED','2026-06-22T18:00:00+00:00','AT&T Stadium','Dallas, TX'),
('GROUP','J',(SELECT id FROM teams WHERE fifa_code='ALG'),(SELECT id FROM teams WHERE fifa_code='JOR'),'SCHEDULED','2026-06-22T21:00:00+00:00','NRG Stadium','Houston, TX'),
-- Jornada 3 (simultáneos)
('GROUP','J',(SELECT id FROM teams WHERE fifa_code='ARG'),(SELECT id FROM teams WHERE fifa_code='JOR'),'SCHEDULED','2026-06-29T00:00:00+00:00','AT&T Stadium','Dallas, TX'),
('GROUP','J',(SELECT id FROM teams WHERE fifa_code='ALG'),(SELECT id FROM teams WHERE fifa_code='AUT'),'SCHEDULED','2026-06-29T00:00:00+00:00','NRG Stadium','Houston, TX'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO K — Portugal, Congo RD, Uzbekistán, Colombia
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','K',(SELECT id FROM teams WHERE fifa_code='POR'),(SELECT id FROM teams WHERE fifa_code='COD'),'SCHEDULED','2026-06-17T23:00:00+00:00','Levi''s Stadium','Santa Clara, CA'),
('GROUP','K',(SELECT id FROM teams WHERE fifa_code='UZB'),(SELECT id FROM teams WHERE fifa_code='COL'),'SCHEDULED','2026-06-18T02:00:00+00:00','Arrowhead Stadium','Kansas City, MO'),
-- Jornada 2
('GROUP','K',(SELECT id FROM teams WHERE fifa_code='POR'),(SELECT id FROM teams WHERE fifa_code='UZB'),'SCHEDULED','2026-06-22T23:00:00+00:00','Levi''s Stadium','Santa Clara, CA'),
('GROUP','K',(SELECT id FROM teams WHERE fifa_code='COD'),(SELECT id FROM teams WHERE fifa_code='COL'),'SCHEDULED','2026-06-23T02:00:00+00:00','Gillette Stadium','Foxborough, MA'),
-- Jornada 3 (simultáneos)
('GROUP','K',(SELECT id FROM teams WHERE fifa_code='POR'),(SELECT id FROM teams WHERE fifa_code='COL'),'SCHEDULED','2026-06-30T00:00:00+00:00','Levi''s Stadium','Santa Clara, CA'),
('GROUP','K',(SELECT id FROM teams WHERE fifa_code='UZB'),(SELECT id FROM teams WHERE fifa_code='COD'),'SCHEDULED','2026-06-30T00:00:00+00:00','Arrowhead Stadium','Kansas City, MO'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GRUPO L — Inglaterra, Croacia, Ghana, Panamá
-- ═══════════════════════════════════════════════════════════════════════════
-- Jornada 1
('GROUP','L',(SELECT id FROM teams WHERE fifa_code='ENG'),(SELECT id FROM teams WHERE fifa_code='CRO'),'SCHEDULED','2026-06-18T00:00:00+00:00','Gillette Stadium','Foxborough, MA'),
('GROUP','L',(SELECT id FROM teams WHERE fifa_code='GHA'),(SELECT id FROM teams WHERE fifa_code='PAN'),'SCHEDULED','2026-06-18T03:00:00+00:00','Arrowhead Stadium','Kansas City, MO'),
-- Jornada 2
('GROUP','L',(SELECT id FROM teams WHERE fifa_code='ENG'),(SELECT id FROM teams WHERE fifa_code='GHA'),'SCHEDULED','2026-06-23T18:00:00+00:00','Gillette Stadium','Foxborough, MA'),
('GROUP','L',(SELECT id FROM teams WHERE fifa_code='CRO'),(SELECT id FROM teams WHERE fifa_code='PAN'),'SCHEDULED','2026-06-23T21:00:00+00:00','Mercedes-Benz Stadium','Atlanta, GA'),
-- Jornada 3 (simultáneos)
('GROUP','L',(SELECT id FROM teams WHERE fifa_code='ENG'),(SELECT id FROM teams WHERE fifa_code='PAN'),'SCHEDULED','2026-07-02T00:00:00+00:00','Gillette Stadium','Foxborough, MA'),
('GROUP','L',(SELECT id FROM teams WHERE fifa_code='CRO'),(SELECT id FROM teams WHERE fifa_code='GHA'),'SCHEDULED','2026-07-02T00:00:00+00:00','Mercedes-Benz Stadium','Atlanta, GA');

-- Verificación
DO $$
BEGIN
  RAISE NOTICE 'Partidos insertados: %', (SELECT COUNT(*) FROM matches WHERE stage = ''GROUP'');
END $$;
