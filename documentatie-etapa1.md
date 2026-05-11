# Documentatie proiect

npm install
npm start
psql -U postgres -f sql/init-produse.sql

## Schema cromatica

Pentru site am ales ca baza cromatica verdele `#1DB954`, apropiat de identitatea vizuala asociata frecvent cu muzica digitala si cu ideea de ascultare activa. Schema aleasa este analog-complementara, pentru ca site-ul combina atmosfera de magazin de viniluri cu accente moderne: verdele sugereaza energie, crestere si descoperire, burgundy-ul adauga caracter rock/metal, iar tonurile inchise sustin contrastul specific unui magazin de discuri.

Schema cromatica folosita:

- Culoare principala: `#1DB954`
- Background: `#080A0D`
- Suprafete: `#151A1F`
- Text principal: `#F3F7F2`
- Text secundar: `#B7C8BC`
- Accent cald/highlight: `#D94F70`
- Accent rece/border: `#3FA7D6`
- Accent auriu: `#F2C94C`

Psihologia culorilor: verdele este potrivit pentru un magazin de muzica deoarece transmite prospetime, ritm si descoperire. Rosul-burgundy aduce intensitate si trimite la zona rock/metal, fara sa oboseasca vizual ca un rosu pur. Albastrul este folosit pentru bordere si elemente informative deoarece sugereaza incredere si claritate, iar galbenul marcheaza promotiile si zonele care trebuie observate rapid.

Variabilele CSS pentru culori sunt declarate in selectorul `body` din `resurse/css/etapa2.css`, iar in restul stilurilor se folosesc variabile, nu valori hardcodate pentru tema.

## Layout responsive

Pagina principala foloseste CSS Grid pe elementul `main`, cu zone definite prin `grid-template-areas`. Pe ecran mare sunt patru coloane si sunt delimitate zone pentru prezentare, tabel, calendar, anunturi, utilizatori online, statistici, date server si continut divers.

Pe ecran mediu layoutul se schimba in doua coloane, iar pe ecran mic se trece la o singura coloana. Astfel se evita scrollbarul orizontal pe viewport. Font-size-ul de baza este setat pe `html` si descreste usor intre desktop, mediu si mobil, cu tranzitie pe proprietatea `font-size`.

Principii de design folosite:

- Ierarhie vizuala: titlul site-ului si zona de prezentare sunt primele elemente observate.
- Contrast: fundal inchis si text deschis pentru lizibilitate, cu accente verzi/galbene pentru actiuni si zone importante.
- Proximitate: informatiile similare sunt grupate in sectiuni clare.
- Consistenta: aceleasi variabile cromatice, bordere si raze sunt folosite in toata pagina.
- Responsive design: structura se adapteaza pe trei dimensiuni de ecran.

## Taburi iframe

Linkurile care schimba continutul iframe-ului sunt stilizate ca taburi laterale. Containerul foloseste flexbox, iar iframe-ul are border vizibil, astfel incat relatia dintre taburi si continut este clara.

## Tabel

Tabelul are caption pozitionat sub tabel, border exterior inset, bordere interne de 1px si culori alternate pentru liniile dintre randuri. La hover, randul primeste gradual un outline transparent cu alpha. Pe ecrane mici, tabelul ramane intr-un container cu `overflow-x: auto`, deci doar zona tabelului poate avea scrollbar orizontal.

## Link catre inceputul paginii

Butonul de revenire sus este fixat in partea dreapta-jos, este semi-transparent si devine opac la hover. Forma este realizata doar din CSS, fara imagini. Cercul se roteste la hover, iar sageata ramane orientata corect si trece de la blur la clar. Tooltipul este generat prin `::after`.

## Meniu

Meniul este in `nav`, construit din lista neordonata. Optiunile principale au iconuri Font Awesome. Exista doua submeniuri: unul pentru sectiuni din pagina principala si unul pentru paginile de galerie.

Stilul meniului este scris in `resurse/scss/nav.scss` si compilat in `resurse/css/nav.css`. SASS foloseste imbricare, variabile, `%placeholder` cu `@extend` si `@for` pentru intarzierile barelor hamburger. Pe desktop, hoverul genereaza bara cu gradient prin pseudoelement, iar submeniul se scaleaza din centru. Pe mediu raman doar iconurile. Pe mobil apare meniul hamburger, iar submeniurile se deschid prin `clip-path` circular.

## Printare

Stilurile de print sunt in `@media print`. Bannerul "Acesta este un proiect scolar!" este afisat jos pe prima pagina, centrat si incadrat. Media, iframe-urile si linkul de revenire sus sunt ascunse. Gridul devine block, linkurile sunt afisate ca text normal, meniul apare ca lista simpla, iar watermarkul cu numele este fixat in dreapta-jos pe fiecare pagina. Marginile paginilor stanga/dreapta sunt configurate prin `@page:left` si `@page:right`.

## Video VTT

Videoclipul are `poster`, controale implicite, `preload="auto"`, doua surse (`webm` si `mp4`) si doua trackuri VTT: romana ca default si engleza. Textele VTT au cate trei mesaje si sunt formatate pe doua randuri. Stilizarea cue-urilor foloseste gradient pe text.

## Stilizare linkuri

Linkurile vizitate folosesc o culoare din schema cromatica. Linkurile externe sunt detectate prin selectorul `a[href^="http"]` si primesc simbolul generat `⮳` prin pseudoelement. Linkurile din `main` au pata radiala care creste din centru la hover si border la `:active`.

## Efecte CSS

Separatorul `hr` este stilizat cu linie in gradient si simboluri muzicale generate prin `::before` si `::after`. Efectul duotone este aplicat pe un `div` cu imagine de fundal, folosind pseudoelemente si `mix-blend-mode`. Reflexia textului este realizata prin duplicarea continutului in `::after`, cu blur si alungire la hover.

## Galerie statica

Datele galeriei sunt in `resurse/json/galerie.json`, cu proprietatile `cale_galerie` si `imagini`. Fiecare imagine are `cale_imagine`, `titlu`, `descriere`, `timp` si date de licenta. Serverul filtreaza imaginile in functie de ora curenta si afiseaza maximum 10 imagini. Template-ul EJS foloseste `figure`, `figcaption` si `picture`.

Imaginile pentru ecran mediu si mic sunt generate prin Node cu pachetul `sharp`, in folderele `resurse/imagini/galerie/mediu` si `resurse/imagini/galerie/mic`.

## Galerie animata

Galeria animata foloseste aceleasi date JSON. La fiecare randare se alege aleator un numar de imagini intre 7 si 11, diferit de 10, iar imaginile sunt distincte. Galeria are border cu gradient, animatie continua si se opreste la hover. Pe ecran mediu si mic este ascunsa conform cerintei.

## Etapa 6 - format-entitati

Entitatile aplicatiei sunt albume si produse muzicale specifice unui magazin de discuri: viniluri si CD-uri. Pagina `/produse` afiseaza produsele citite din tabelul `produse` al bazei de date PostgreSQL. Pentru portabilitate, daca baza de date nu este disponibila local, serverul foloseste fallback-ul din `resurse/json/produse.json`, cu aceeasi structura de campuri.

Scriptul SQL este in `sql/init-produse.sql`. El creeaza baza de date `music_store`, enum-ul `categorie_album`, tabelul `produse`, utilizatorul `music_store_app` si cele 15 produse de test.

Campurile principale ale produselor:

- `id`: identificator numeric unic;
- `nume`, `descriere`, `imagine`;
- `categorie_mare`: enum PostgreSQL cu valorile `rock`, `metal`, `progressive`, `alternative`, `jazz`;
- `format`: categorizare secundara, cu valori `vinyl` sau `cd`;
- `pret` si `durata_minute`: caracteristici numerice;
- `data_adaugare`: data calendaristica;
- `culoare`: valoare simpla dintr-un set de valori;
- `caracteristici`: valori multiple separate prin virgula;
- `admite_voucher`: caracteristica booleana;
- campuri suplimentare pentru pagina produsului unic: `stoc`, `cod`, `producator`, `greutate_g`.

Pagina de produs unic este generata automat prin ruta `/produs/:id`. Datele produsului sunt trimise catre EJS prin `locals`, iar pagina afiseaza toate detaliile produsului.

Meniul contine optiunea `Produse`, cu suboptiunea `Toate` si cate o suboptiune pentru fiecare valoare a categoriei mari. Categoriile sunt generate in program din enum-ul bazei de date sau, in fallback, din datele JSON. Linkurile folosesc aceeasi pagina EJS si trimit parametrul GET `categorie`, de exemplu `/produse?categorie=rock`. Filtrarea pe categorie se face server-side: vectorul transmis catre template contine doar produsele cerute.

Formatul de afisare al produselor:

- fiecare produs este intr-un `article` cu id de forma `artc-id`, de exemplu `artc-1`;
- articolul are clasa categoriei mari, fara spatii;
- headingul articolului contine numele produsului si link catre pagina proprie;
- continutul este impartit in doua coloane;
- prima coloana contine imaginea si lista de caracteristici: durata, format, caracteristici multiple, data si booleanul voucher;
- data este afisata cu tagul `time` si format romanesc de tipul `Sambata, 15 septembrie 2018`;
- a doua coloana contine categoria, pretul, culoarea si descrierea.

Functionalitati implementate:

- filtrare dupa nume introdus in `textarea`, cu potrivire de tip `startsWith`;
- filtrare dupa cuvant in descriere prin input text;
- filtrare dupa pret maxim cu input `range`;
- filtrare dupa producator prin `datalist`;
- filtrare dupa format prin grup radio stilizat ca toggle buttons Bootstrap;
- filtrare dupa noutati prin checkbox, unde noutatile sunt produse introduse dupa `1 mai 2026`;
- filtrare dupa culoare prin select simplu;
- filtrare dupa caracteristici prin select multiplu;
- sortare crescatoare/descrescatoare dupa doua chei: nume si raportul `durata_minute / pret`;
- calcularea mediei preturilor produselor vizibile; rezultatul apare intr-un `div` fix creat dinamic si dispare dupa 2 secunde;
- resetarea tuturor filtrelor cu mesaj `confirm`; resetarea reface si ordinea initiala;
- afisarea numarului de produse vizibile dupa filtrare.

Sectiunea de filtre nu este formular, ci o sectiune cu inputuri. Inputurile sunt stilizate cu Bootstrap: `form-control`, `form-select`, `form-range`, `form-floating`, `btn`, `btn-group` si `btn-check`. Radio-urile pentru format si checkbox-ul `Noutati` sunt toggle buttons Bootstrap cu clase `btn-outline-primary`. Asezarea inputurilor foloseste gridul Bootstrap prin clasele `row`, `col-*` si `g-3`.

Bonus 1: atributele si etichetele inputurilor sunt generate din metadatele calculate pe server in obiectul `filtreProduse`. Exemple: `range` primeste `min`, `max` si valoarea initiala din preturile produselor, `datalist` primeste producatorii existenti, selectul simplu primeste culorile, selectul multiplu primeste caracteristicile extrase din campul cu valori multiple, iar radio-urile de format sunt generate din valorile existente in date.

Butoanele folosesc tema Bootstrap personalizata in `resurse/scss/custom.scss`, unde sunt setate culorile, raza si grosimea borderului. Butoanele au iconuri Bootstrap Icons. Pe ecran mic se ascunde textul butoanelor si raman doar iconurile.

Inputul `range` este customizat prin variabile SASS Bootstrap: dimensiunea bulinei este `1.5rem`, iar culorile pentru thumb si track sunt adaptate schemei cromatice.

Bonus 2: tema este controlata printr-un `select` Bootstrap din header. Utilizatorul poate alege intre patru teme: `dark`, `light`, `concert` si `studio`. Tema aleasa se salveaza in `localStorage` sub cheia `tema-site` si se aplica pe toate paginile la urmatoarea incarcare.
