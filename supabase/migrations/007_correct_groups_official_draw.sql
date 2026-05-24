-- =============================================================================
-- MIGRACIÓN: Grupos oficiales del sorteo FIFA World Cup 2026
-- Sorteo: 5 de diciembre 2025 — Kennedy Center, Washington D.C.
-- =============================================================================
-- Reemplaza los grupos provisionales de la migración 002 con los oficiales.
-- Fuente: football-data.org API (ID de equipos confirmados)
-- =============================================================================

-- Limpiar datos anteriores (sin matches ni predictions vinculadas)
TRUNCATE teams CASCADE;

-- Reiniciar secuencia de IDs
ALTER SEQUENCE teams_id_seq RESTART WITH 1;

INSERT INTO teams (name, code, fifa_code, group_letter, confederation, fifa_ranking) VALUES

-- ── GRUPO A (sede México — partido inaugural) ──────────────────────────────
('México',          'mx',     'MEX', 'A', 'CONCACAF',  16),
('Sudáfrica',       'za',     'RSA', 'A', 'CAF',        63),
('Corea del Sur',   'kr',     'KOR', 'A', 'AFC',        22),
('República Checa', 'cz',     'CZE', 'A', 'UEFA',       37),

-- ── GRUPO B (sede Canadá) ──────────────────────────────────────────────────
('Canadá',          'ca',     'CAN', 'B', 'CONCACAF',   36),
('Bosnia-Herzegovina','ba',   'BIH', 'B', 'UEFA',       60),
('Qatar',           'qa',     'QAT', 'B', 'AFC',        37),
('Suiza',           'ch',     'SUI', 'B', 'UEFA',       20),

-- ── GRUPO C ────────────────────────────────────────────────────────────────
('Brasil',          'br',     'BRA', 'C', 'CONMEBOL',    5),
('Marruecos',       'ma',     'MAR', 'C', 'CAF',        14),
('Haití',           'ht',     'HAI', 'C', 'CONCACAF',   90),
('Escocia',         'gb-sct', 'SCO', 'C', 'UEFA',       30),

-- ── GRUPO D (sede USA) ────────────────────────────────────────────────────
('Estados Unidos',  'us',     'USA', 'D', 'CONCACAF',   11),
('Paraguay',        'py',     'PAR', 'D', 'CONMEBOL',   63),
('Australia',       'au',     'AUS', 'D', 'AFC',        23),
('Turquía',         'tr',     'TUR', 'D', 'UEFA',       29),

-- ── GRUPO E ────────────────────────────────────────────────────────────────
('Alemania',        'de',     'GER', 'E', 'UEFA',       12),
('Curazao',         'cw',     'CUW', 'E', 'CONCACAF',  120),
('Costa de Marfil', 'ci',     'CIV', 'E', 'CAF',        48),
('Ecuador',         'ec',     'ECU', 'E', 'CONMEBOL',   44),

-- ── GRUPO F ────────────────────────────────────────────────────────────────
('Países Bajos',    'nl',     'NED', 'F', 'UEFA',        7),
('Japón',           'jp',     'JPN', 'F', 'AFC',        15),
('Suecia',          'se',     'SWE', 'F', 'UEFA',       25),
('Túnez',           'tn',     'TUN', 'F', 'CAF',        26),

-- ── GRUPO G ────────────────────────────────────────────────────────────────
('Bélgica',         'be',     'BEL', 'G', 'UEFA',        3),
('Egipto',          'eg',     'EGY', 'G', 'CAF',        34),
('Irán',            'ir',     'IRN', 'G', 'AFC',        21),
('Nueva Zelanda',   'nz',     'NZL', 'G', 'OFC',        97),

-- ── GRUPO H ────────────────────────────────────────────────────────────────
('España',          'es',     'ESP', 'H', 'UEFA',        3),
('Cabo Verde',      'cv',     'CPV', 'H', 'CAF',        72),
('Arabia Saudita',  'sa',     'KSA', 'H', 'AFC',        53),
('Uruguay',         'uy',     'URU', 'H', 'CONMEBOL',   17),

-- ── GRUPO I ────────────────────────────────────────────────────────────────
('Francia',         'fr',     'FRA', 'I', 'UEFA',        2),
('Senegal',         'sn',     'SEN', 'I', 'CAF',        20),
('Irak',            'iq',     'IRQ', 'I', 'AFC',        68),
('Noruega',         'no',     'NOR', 'I', 'UEFA',       28),

-- ── GRUPO J ────────────────────────────────────────────────────────────────
('Argentina',       'ar',     'ARG', 'J', 'CONMEBOL',    1),
('Argelia',         'dz',     'ALG', 'J', 'CAF',        42),
('Austria',         'at',     'AUT', 'J', 'UEFA',       25),
('Jordania',        'jo',     'JOR', 'J', 'AFC',        69),

-- ── GRUPO K ────────────────────────────────────────────────────────────────
('Portugal',        'pt',     'POR', 'K', 'UEFA',        6),
('Congo RD',        'cd',     'COD', 'K', 'CAF',        50),
('Uzbekistán',      'uz',     'UZB', 'K', 'AFC',        75),
('Colombia',        'co',     'COL', 'K', 'CONMEBOL',    9),

-- ── GRUPO L ────────────────────────────────────────────────────────────────
('Inglaterra',      'gb-eng', 'ENG', 'L', 'UEFA',        4),
('Croacia',         'hr',     'CRO', 'L', 'UEFA',       10),
('Ghana',           'gh',     'GHA', 'L', 'CAF',        55),
('Panamá',          'pa',     'PAN', 'L', 'CONCACAF',   52);
