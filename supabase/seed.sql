-- ============================================================
-- SEED: 48 equipos del Mundial 2026 con grupos confirmados
-- ============================================================
-- Nota: Los grupos A-L son provisionales hasta el sorteo oficial
-- Fuente: equipos clasificados a noviembre 2025

INSERT INTO teams (name, code, fifa_code, group_letter, confederation, fifa_ranking) VALUES
-- GRUPO A (Sede USA)
('Estados Unidos', 'us', 'USA', 'A', 'CONCACAF', 11),
('México', 'mx', 'MEX', 'A', 'CONCACAF', 16),
('Canadá', 'ca', 'CAN', 'A', 'CONCACAF', 41),
('Uruguay', 'uy', 'URU', 'A', 'CONMEBOL', 17),

-- GRUPO B
('Brasil', 'br', 'BRA', 'B', 'CONMEBOL', 5),
('Argentina', 'ar', 'ARG', 'B', 'CONMEBOL', 1),
('Colombia', 'co', 'COL', 'B', 'CONMEBOL', 9),
('Ecuador', 'ec', 'ECU', 'B', 'CONMEBOL', 44),

-- GRUPO C
('España', 'es', 'ESP', 'C', 'UEFA', 3),
('Francia', 'fr', 'FRA', 'C', 'UEFA', 2),
('Portugal', 'pt', 'POR', 'C', 'UEFA', 6),
('Marruecos', 'ma', 'MAR', 'C', 'CAF', 14),

-- GRUPO D
('Inglaterra', 'gb-eng', 'ENG', 'D', 'UEFA', 4),
('Alemania', 'de', 'GER', 'D', 'UEFA', 12),
('Países Bajos', 'nl', 'NED', 'D', 'UEFA', 7),
('Australia', 'au', 'AUS', 'D', 'AFC', 23),

-- GRUPO E
('Bélgica', 'be', 'BEL', 'E', 'UEFA', 3),
('Croacia', 'hr', 'CRO', 'E', 'UEFA', 10),
('Turquía', 'tr', 'TUR', 'E', 'UEFA', 29),
('Senegal', 'sn', 'SEN', 'E', 'CAF', 20),

-- GRUPO F
('Italia', 'it', 'ITA', 'F', 'UEFA', 8),
('Austria', 'at', 'AUT', 'F', 'UEFA', 25),
('Eslovaquia', 'sk', 'SVK', 'F', 'UEFA', 47),
('Nigeria', 'ng', 'NGA', 'F', 'CAF', 36),

-- GRUPO G
('Japón', 'jp', 'JPN', 'G', 'AFC', 15),
('Corea del Sur', 'kr', 'KOR', 'G', 'AFC', 22),
('Irán', 'ir', 'IRN', 'G', 'AFC', 21),
('Costa Rica', 'cr', 'CRC', 'G', 'CONCACAF', 49),

-- GRUPO H
('Polonia', 'pl', 'POL', 'H', 'UEFA', 26),
('Hungría', 'hu', 'HUN', 'H', 'UEFA', 30),
('Albania', 'al', 'ALB', 'H', 'UEFA', 64),
('Ghana', 'gh', 'GHA', 'H', 'CAF', 55),

-- GRUPO I
('Suiza', 'ch', 'SUI', 'I', 'UEFA', 19),
('Dinamarca', 'dk', 'DEN', 'I', 'UEFA', 24),
('Escocia', 'gb-sct', 'SCO', 'I', 'UEFA', 32),
('Arabia Saudita', 'sa', 'KSA', 'I', 'AFC', 53),

-- GRUPO J
('Rumania', 'ro', 'ROU', 'J', 'UEFA', 46),
('República Checa', 'cz', 'CZE', 'J', 'UEFA', 37),
('Georgia', 'ge', 'GEO', 'J', 'UEFA', 74),
('Camerún', 'cm', 'CMR', 'J', 'CAF', 40),

-- GRUPO K
('Venezuela', 've', 'VEN', 'K', 'CONMEBOL', 51),
('Chile', 'cl', 'CHI', 'K', 'CONMEBOL', 35),
('Bolivia', 'bo', 'BOL', 'K', 'CONMEBOL', 83),
('Panamá', 'pa', 'PAN', 'K', 'CONCACAF', 52),

-- GRUPO L
('Egipto', 'eg', 'EGY', 'L', 'CAF', 34),
('Costa de Marfil', 'ci', 'CIV', 'L', 'CAF', 48),
('Túnez', 'tn', 'TUN', 'L', 'CAF', 26),
('Serbia', 'rs', 'SRB', 'L', 'UEFA', 33)
ON CONFLICT DO NOTHING;

-- Update flag_url based on code
UPDATE teams SET flag_url = 'https://flagcdn.com/' || lower(code) || '.svg'
WHERE flag_url IS NULL;
