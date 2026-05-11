DROP DATABASE IF EXISTS music_store;
CREATE DATABASE music_store;

\c music_store

DROP TYPE IF EXISTS categorie_album;
CREATE TYPE categorie_album AS ENUM ('rock', 'metal', 'progressive', 'alternative', 'jazz');

DROP TABLE IF EXISTS produse;
CREATE TABLE produse (
  id integer PRIMARY KEY,
  nume varchar(120) NOT NULL,
  descriere text NOT NULL,
  imagine varchar(255) NOT NULL,
  categorie_mare categorie_album NOT NULL,
  format varchar(30) NOT NULL CHECK (format IN ('vinyl', 'cd')),
  pret numeric(8, 2) NOT NULL CHECK (pret > 0),
  durata_minute integer NOT NULL CHECK (durata_minute > 0),
  data_adaugare date NOT NULL,
  culoare varchar(30) NOT NULL,
  caracteristici varchar(255) NOT NULL,
  admite_voucher boolean NOT NULL DEFAULT false,
  stoc integer NOT NULL DEFAULT 0,
  cod varchar(30) NOT NULL UNIQUE,
  producator varchar(120) NOT NULL,
  greutate_g integer NOT NULL CHECK (greutate_g > 0)
);

INSERT INTO produse VALUES
(1, 'Vinyl Black Classics', 'Selectie de albume rock clasice pentru colectii personale, potrivita pentru auditii pe pickup.', '/resurse/imagini/vinyl.jpeg', 'rock', 'vinyl', 145, 42, '2026-04-28', 'negru', 'analog, remasterizat, editie europeana', true, 12, 'VR-001', 'Analog House', 180),
(2, 'CD Metal Starter', 'Pachet accesibil pentru ascultatori la inceput de colectie, cu piese metal energice.', '/resurse/imagini/METAL.jpeg', 'metal', 'cd', 58, 51, '2026-02-15', 'argintiu', 'digital, booklet, best-of', true, 34, 'CDM-002', 'Metal Vault', 95),
(3, 'Progressive Vinyl Pack', 'Editii progressive cu sunet amplu, structuri lungi si coperti de colectie.', '/resurse/imagini/metal_band1.jpeg', 'progressive', 'vinyl', 172, 64, '2026-05-03', 'verde', 'gatefold, analog, editie limitata', false, 8, 'VP-003', 'Longform Records', 210),
(4, 'Alternative CD Bundle', 'Albume alternative potrivite pentru auditii zilnice si colectii compacte.', '/resurse/imagini/cds.jpeg', 'alternative', 'cd', 47, 39, '2026-01-20', 'alb', 'digital, compact, editie standard', true, 21, 'ACD-004', 'Indie Press', 90),
(5, 'Limited Metal Vinyl', 'Editie limitata pentru fanii metalului clasic, cu coperta intensa si disc greu.', '/resurse/imagini/metal_band2.jpg', 'metal', 'vinyl', 210, 48, '2026-05-08', 'rosu', 'analog, disc colorat, editie limitata', false, 5, 'LMV-005', 'Heavy Needle', 220),
(6, 'Rock Essentials CD', 'Compilatie cu albume esentiale pentru biblioteca de rock, buna pentru ascultare rapida.', '/resurse/imagini/cds.jpeg', 'rock', 'cd', 65, 56, '2026-03-02', 'albastru', 'digital, booklet, compilatie', true, 18, 'REC-006', 'Stage Light', 92),
(7, 'Indie Vinyl Evening', 'Viniluri alternative pentru auditii de seara, cu ton cald si piese melancolice.', '/resurse/imagini/vinyl.jpeg', 'alternative', 'vinyl', 132, 44, '2026-05-01', 'mov', 'analog, indie, coperta mata', true, 10, 'IVE-007', 'North Room', 180),
(8, 'Progressive Archive CD', 'Albume progressive remasterizate pentru ascultare detaliata si colectii de arhiva.', '/resurse/imagini/metal_band1.jpeg', 'progressive', 'cd', 83, 72, '2026-04-02', 'auriu', 'digital, remasterizat, arhiva', true, 16, 'PAC-008', 'Longform Records', 100),
(9, 'Jazz Night Vinyl', 'Vinil jazz cu atmosfera nocturna, recomandat pentru auditii relaxate.', '/resurse/imagini/vinyl.jpeg', 'jazz', 'vinyl', 156, 50, '2026-05-06', 'negru', 'analog, live, editie audiophile', false, 7, 'JNV-009', 'Blue Corner', 200),
(10, 'Jazz Compact Session', 'CD jazz compact cu inregistrari live si booklet cu note de studio.', '/resurse/imagini/cds.jpeg', 'jazz', 'cd', 74, 61, '2026-02-28', 'alb', 'digital, live, booklet', true, 14, 'JCS-010', 'Blue Corner', 90),
(11, 'Metal Deluxe CD', 'Editie deluxe cu piese bonus si ambalaj rezistent pentru colectie.', '/resurse/imagini/METAL.jpeg', 'metal', 'cd', 96, 68, '2026-04-18', 'rosu', 'digital, bonus tracks, deluxe', true, 11, 'MDC-011', 'Metal Vault', 120),
(12, 'Rock Collector Vinyl', 'Vinil rock pentru colectionari, cu sunet remasterizat si coperta groasa.', '/resurse/imagini/metal_band2.jpg', 'rock', 'vinyl', 188, 46, '2026-05-09', 'albastru', 'analog, remasterizat, coperta groasa', false, 6, 'RCV-012', 'Stage Light', 205),
(13, 'Alternative Live Vinyl', 'Inregistrare live alternativa cu energie de concert si productie clara.', '/resurse/imagini/metal_band1.jpeg', 'alternative', 'vinyl', 149, 58, '2026-03-24', 'verde', 'analog, live, editie europeana', true, 9, 'ALV-013', 'Indie Press', 190),
(14, 'Progressive Concept Vinyl', 'Album concept progressive, potrivit pentru ascultare cap-coada.', '/resurse/imagini/vinyl.jpeg', 'progressive', 'vinyl', 199, 75, '2026-01-12', 'mov', 'analog, concept album, gatefold', false, 4, 'PCV-014', 'Longform Records', 230),
(15, 'Jazz Fusion CD', 'CD de jazz fusion cu ritmuri rapide si productie moderna.', '/resurse/imagini/cds.jpeg', 'jazz', 'cd', 88, 63, '2026-05-04', 'auriu', 'digital, fusion, editie moderna', true, 13, 'JFC-015', 'Blue Corner', 98);

DROP USER IF EXISTS music_store_app;
CREATE USER music_store_app WITH PASSWORD 'music_store_pass';
GRANT CONNECT ON DATABASE music_store TO music_store_app;
GRANT USAGE ON SCHEMA public TO music_store_app;
GRANT SELECT ON TABLE produse TO music_store_app;
