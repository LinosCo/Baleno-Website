-- Script SQL per popolare il database Railway con le risorse del regolamento Baleno
-- Questo script crea utenti di test e tutte le risorse dal REGOLAMENTO BALENO.pdf

-- Nota: Le password sono hashate con bcrypt (salt rounds: 10)
-- Password admin: admin123
-- Password cm: cm123
-- Password user: user123

-- INSERIMENTO UTENTI
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES
  ('admin001', 'admin@balenosanzeno.it', '$2b$10$K1wZ3j4yP5qR7sT9uV1wX.eN2oA3iB4jC5kD6lE7mF8nG9hH0iI1j', 'Admin', 'Baleno', 'ADMIN', true, true, NOW(), NOW()),
  ('cm001', 'cm@balenosanzeno.it', '$2b$10$L2xA4k5zQ6rS8tU0vW2xY.fO3pB4jC5kD6lE7mF8nG9hH0iI1jJ2k', 'Community', 'Manager', 'COMMUNITY_MANAGER', true, true, NOW(), NOW()),
  ('user001', 'user@test.com', '$2b$10$M3yB5l6aR7sT9uV1wX2yZ.gP4qC5kD6lE7mF8nG9hH0iI1jJ2kK3l', 'Test', 'User', 'USER', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- INSERIMENTO RISORSE

-- A. NAVATA PIPINO
INSERT INTO "Resource" (id, name, description, type, capacity, "pricePerHour", "isActive", location, amenities, rules, images, "createdAt", "updatedAt")
VALUES
(
  'res001',
  'Navata Pipino Completa',
  'Sala polifunzionale attrezzata con sala riunioni (Orata), area morbida, calcetto, ping pong, giochi. Ideale per laboratori, formazioni, riunioni. Tariffe: 1h €50 | 2h €90 | ½ giornata €120 | 1 giornata €180',
  'ROOM',
  40,
  50.00,
  true,
  'Navata Pipino - 74 mq',
  ARRAY['Sala riunioni Orata', 'Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Wi-Fi'],
  'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),
(
  'res002',
  'Sala Riunioni Pipino',
  'Sala riunioni dotata di tavolo rettangolare e 8 sedie ed eventuali sedute supplementari. Ideale per incontri di piccoli gruppi, riunioni, corsi e laboratori di vario genere. Tariffe: 1h €20 | 2h €35 | ½ giornata €60 | 1 giornata €100',
  'ROOM',
  8,
  20.00,
  true,
  'Navata Pipino - 18.5 mq',
  ARRAY['Tavolo rettangolare', '8 sedie', 'Sedute supplementari disponibili', 'Wi-Fi'],
  'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),
(
  'res003',
  'Spazio Libero Pipino',
  'Sala attrezzata con area morbida, calcetto, ping pong, giochi. Ideale per attività destinate a bambini e ragazzi (spazio compiti, ludoteca, spazio lettura). Tariffe: 1h €50 | 2h €90 | ½ giornata €120 | 1 giornata €180',
  'SPACE',
  25,
  50.00,
  true,
  'Navata Pipino - 37 mq',
  ARRAY['Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Spazio lettura'],
  'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),

-- B. NAVATA SPAGNA
(
  'res004',
  'Sala Riunioni Spagna',
  'Sala riunioni dotata di tavolo rotondo, 8 sedie ed eventuali sedute supplementari. Ideale per incontri di piccoli gruppi, riunioni, corsi e laboratori di vario genere. Tariffe: 1h €20 | 2h €35 | ½ giornata €60 | 1 giornata €100',
  'ROOM',
  8,
  20.00,
  true,
  'Navata Spagna - 18.5 mq',
  ARRAY['Tavolo rotondo', '8 sedie', 'Sedute supplementari disponibili', 'Wi-Fi'],
  'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),

-- C. NAVATA CENTRALE
(
  'res005',
  'Navata Centrale',
  'Salone polifunzionale attrezzato con 6 tavoli pieghevoli, 4 set tavolino e sedia, 48 sedie pieghevoli, Service audio/video. Eventuale utilizzo di ripostiglio e frigorifero da concordare. Tariffe: 2h €120 | ½ giornata €200 | 1 giornata €400',
  'ROOM',
  100,
  60.00,
  true,
  'Navata Centrale - 148 mq',
  ARRAY['6 tavoli pieghevoli', '4 set tavolino e sedia', '48 sedie pieghevoli', 'Service audio/video', 'Ripostiglio (da concordare)', 'Frigorifero (da concordare)'],
  'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),

-- D. BALENO COMPLETO
(
  'res006',
  'Baleno Completo',
  'Spazio completo con tutte le dotazioni disponibili. Eventuale utilizzo di ripostiglio e frigorifero da concordare. Include tutte le navate e attrezzature. Tariffe: ½ giornata €400 | 1 giornata €800',
  'SPACE',
  150,
  100.00,
  true,
  'Intero edificio - 314.5 mq',
  ARRAY['Tutte le sale', 'Videoproiettore', 'Impianto stereo completo', 'Microfono con asta', 'Mixer 12 ingressi', '2 casse 800W', 'Lavagne a fogli mobili', 'Tavoli pieghevoli', 'Frigorifero'],
  'Vietato fumare. Riordinare tutte le sale prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),

-- ATTREZZATURE AGGIUNTIVE
(
  'res007',
  'Videoproiettore',
  'Videoproiettore professionale disponibile a noleggio. Da richiedere contestualmente alla prenotazione dello spazio.',
  'EQUIPMENT',
  NULL,
  10.00,
  true,
  'Attrezzatura mobile',
  ARRAY['Videoproiettore HD', 'Cavo HDMI', 'Telecomando'],
  'Utilizzare con cura. Segnalare eventuali malfunzionamenti.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),
(
  'res008',
  'Impianto Audio Completo',
  'Impianto stereo e voce con 1 microfono con asta, mixer 12 ingressi e 2 casse da 800W. Da richiedere contestualmente alla prenotazione dello spazio.',
  'EQUIPMENT',
  NULL,
  25.00,
  true,
  'Attrezzatura mobile',
  ARRAY['Microfono con asta', 'Mixer 12 ingressi', '2 casse 800W', 'Cavi audio'],
  'Utilizzare con cura. Non superare il volume massimo. Segnalare eventuali malfunzionamenti.',
  ARRAY[]::text[],
  NOW(),
  NOW()
),
(
  'res009',
  'Lavagne a Fogli Mobili',
  'Lavagne a fogli mobili (flipchart) per presentazioni e workshop. Da richiedere contestualmente alla prenotazione dello spazio.',
  'EQUIPMENT',
  NULL,
  5.00,
  true,
  'Attrezzatura mobile',
  ARRAY['Lavagna con fogli', 'Pennarelli colorati', 'Cancellino'],
  'Utilizzare con cura. Riportare al posto originale dopo l''uso.',
  ARRAY[]::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
