package com.coopconnect.config;

import com.coopconnect.domain.model.Listing;
import com.coopconnect.domain.model.User;
import com.coopconnect.repository.ListingRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random rnd = new Random(42);

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        long userCount = userRepository.count();
        long listingCount = listingRepository.count();

        if (userCount >= 20 && listingCount >= 60) {
            log.info("Base déjà seedée ({} utilisateurs, {} annonces). Rien à faire.", userCount, listingCount);
            return;
        }

        log.info("Initialisation des données de démonstration...");
        List<User> users = seedUsers();
        int total = seedListings(users);
        log.info("Seed terminé : {} utilisateurs, {} annonces créées.", users.size(), total);
    }

    // ─── USERS ────────────────────────────────────────────────────────────────

    private List<User> seedUsers() {
        String hash = passwordEncoder.encode("Test1234!");
        List<User> users = new ArrayList<>();

        users.add(mkUser("ahmed.benali",    "ahmed.benali@example.ma",    hash, "Ahmed",    "Benali",    "+212661234001", User.UserType.INDIVIDUAL,  "Casablanca", "Maarif",   33.5898, -7.6031, 4.6));
        users.add(mkUser("fatima.alaoui",   "fatima.alaoui@example.ma",   hash, "Fatima",   "Alaoui",    "+212661234002", User.UserType.PROFESSIONAL, "Rabat",       "Agdal",    34.0209, -6.8416, 4.8));
        users.add(mkUser("hassan.boukhris", "hassan.boukhris@example.ma", hash, "Hassan",   "Boukhris",  "+212661234003", User.UserType.BUSINESS,     "Marrakech",   "Guéliz",   31.6295, -7.9811, 4.3));
        users.add(mkUser("aicha.bensouda",  "aicha.bensouda@example.ma",  hash, "Aicha",    "Bensouda",  "+212661234004", User.UserType.INDIVIDUAL,  "Fes",         "Médina",   34.0181, -5.0078, 3.9));
        users.add(mkUser("mohamed.tahir",   "mohamed.tahir@example.ma",   hash, "Mohamed",  "Tahir",     "+212661234005", User.UserType.BUSINESS,     "Tanger",      "Iberia",   35.7595, -5.8340, 4.1));
        users.add(mkUser("khadija.ennajah", "khadija.ennajah@example.ma", hash, "Khadija",  "Ennajah",   "+212661234006", User.UserType.NON_PROFIT,   "Agadir",      "Talborjt", 30.4278, -9.5981, 4.7));
        users.add(mkUser("youssef.amrani",  "youssef.amrani@example.ma",  hash, "Youssef",  "Amrani",    "+212661234007", User.UserType.PROFESSIONAL, "Casablanca",  "Ain Diab", 33.5600, -7.6700, 4.5));
        users.add(mkUser("nadia.berrada",   "nadia.berrada@example.ma",   hash, "Nadia",    "Berrada",   "+212661234008", User.UserType.INDIVIDUAL,  "Rabat",       "Hassan",   34.0209, -6.8500, 3.7));
        users.add(mkUser("omar.filali",     "omar.filali@example.ma",     hash, "Omar",     "Filali",    "+212661234009", User.UserType.BUSINESS,     "Meknes",      "Hamria",   33.8935, -5.5547, 4.2));
        users.add(mkUser("salma.tazi",      "salma.tazi@example.ma",      hash, "Salma",    "Tazi",      "+212661234010", User.UserType.NON_PROFIT,   "Casablanca",  "Anfa",     33.5850, -7.6200, 4.9));
        users.add(mkUser("karim.benj",      "karim.benjelloun@example.ma",hash, "Karim",    "Benjelloun","+212661234011", User.UserType.PROFESSIONAL, "Casablanca",  "Bourgogne",33.5731, -7.5898, 4.4));
        users.add(mkUser("zineb.chraibi",   "zineb.chraibi@example.ma",   hash, "Zineb",    "Chraibi",   "+212661234012", User.UserType.INDIVIDUAL,  "Marrakech",   "Médina",   31.6340, -7.9890, 3.8));
        users.add(mkUser("abdellah.mouss",  "abdellah.mouss@example.ma",  hash, "Abdellah", "Moussaoui", "+212661234013", User.UserType.BUSINESS,     "Fes",         "Nouvelle", 34.0300, -5.0200, 4.0));
        users.add(mkUser("samira.kettani",  "samira.kettani@example.ma",  hash, "Samira",   "Kettani",   "+212661234014", User.UserType.INDIVIDUAL,  "Casablanca",  "Sidi Maarouf", 33.5400, -7.6400, 4.3));
        users.add(mkUser("rachid.idrissi",  "rachid.idrissi@example.ma",  hash, "Rachid",   "Idrissi",   "+212661234015", User.UserType.PROFESSIONAL, "Oujda",       "Centre",   34.6805, -1.9076, 3.6));
        users.add(mkUser("houda.mansouri",  "houda.mansouri@example.ma",  hash, "Houda",    "Mansouri",  "+212661234016", User.UserType.INDIVIDUAL,  "Kenitra",     "Médina",   34.2610, -6.5802, 4.1));
        users.add(mkUser("khalid.bouq",     "khalid.bouqroun@example.ma", hash, "Khalid",   "Bouqroun",  "+212661234017", User.UserType.BUSINESS,     "Agadir",      "Inzegane", 30.3597, -9.5332, 4.6));
        users.add(mkUser("meriem.lahbabi",  "meriem.lahbabi@example.ma",  hash, "Meriem",   "Lahbabi",   "+212661234018", User.UserType.PROFESSIONAL, "Rabat",       "Souissi",  34.0100, -6.8200, 4.8));
        users.add(mkUser("mustapha.sekkat", "mustapha.sekkat@example.ma", hash, "Mustapha", "Sekkat",    "+212661234019", User.UserType.BUSINESS,     "Casablanca",  "Hay Hassani", 33.5300, -7.6600, 3.9));
        users.add(mkUser("rim.benkirane",   "rim.benkirane@example.ma",   hash, "Rim",      "Benkirane", "+212661234020", User.UserType.INDIVIDUAL,  "Tanger",      "Malabata", 35.7700, -5.8100, 4.5));

        return userRepository.saveAll(users);
    }

    private User mkUser(String username, String email, String hash, String firstName, String lastName,
                        String phone, User.UserType type, String city, String district,
                        double lat, double lon, double trust) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(hash);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPhoneNumber(phone);
        u.setUserType(type);
        u.setStatus(User.UserStatus.ACTIVE);
        u.setEmailVerified(true);
        u.setPhoneVerified(true);
        u.setLoginAttempts(0);
        u.setCity(city);
        u.setAddress(district + ", " + city);
        u.setCountry("Maroc");
        u.setLatitude(lat);
        u.setLongitude(lon);
        u.setTrustScore(trust);
        u.setRatingAverage(trust);
        u.setRatingCount(rnd.nextInt(40) + 5);
        u.setVerificationLevel(2);
        u.setMaxDistanceKm(80);
        u.setIsActive(true);
        u.setCreatedAt(LocalDateTime.now().minusDays(rnd.nextInt(300) + 30));
        u.setUpdatedAt(LocalDateTime.now().minusDays(rnd.nextInt(10)));
        return u;
    }

    // ─── LISTINGS ─────────────────────────────────────────────────────────────

    private int seedListings(List<User> users) {
        List<Listing> all = new ArrayList<>();

        // ── 1. Agriculture & Alimentation (OTHER) ────────────────────────────
        all.add(listing(users, 0, "Surplus 600 kg tomates bio — livraison possible Casablanca",
            "Producteur local propose surplus de 600 kg de tomates biologiques certifiées, calibre A, parfait état. Disponibles immédiatement. Convient restauration, épiceries, marchés. Livraison possible dans un rayon de 30 km autour de Casablanca. Conditionnement en caisses de 10 kg. Prix préférentiel pour achat en gros.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 3500.0, "Casablanca, Hay Mohammadi", 33.5500, -7.5600, 5, 30));

        all.add(listing(users, 3, "Recherche fournisseur régulier tomates fraîches — restaurant Fes",
            "Restaurant gastronomique à Fes cherche fournisseur local de tomates fraîches bio ou conventionnelles. Besoin de 200 à 400 kg par semaine. Contrat annuel possible. Préférence producteurs certifiés. Livraison souhaitée le mardi et vendredi matin.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 0.0, "Fes, Nouvelle Ville", 34.0300, -5.0200, 12, 0));

        all.add(listing(users, 6, "Lot 2 tonnes oranges Maroc calibre A — départ Casablanca",
            "Agrumes de qualité supérieure, région Souss, récolte récente. Lot de 2 tonnes disponible immédiatement. Idéal pour jus de fruits, épiceries, export. Conditionnement en filets 5 kg ou caisses 15 kg. Certificat d'origine disponible.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 8000.0, "Casablanca, Port", 33.6100, -7.5800, 3, 15));

        all.add(listing(users, 2, "Besoin urgent oranges et agrumes — épicerie Marrakech",
            "Épicerie bien établie à Marrakech Guéliz cherche fournisseur direct d'oranges Maroc. Quantité : 500 à 800 kg hebdomadaire. Paiement comptant. Contact direct avec producteur ou grossiste. Éviter intermédiaires.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 0.0, "Marrakech, Guéliz", 31.6295, -7.9811, 8, 0));

        all.add(listing(users, 16, "Huile d'argan artisanale 100% pure — coopérative Agadir",
            "Coopérative féminine propose huile d'argan cosmétique et alimentaire, pressée à froid, certifiée biologique. Conditionnement 100 ml, 250 ml, 500 ml et en vrac (5L). Idéal pour revendeurs, spas, exportateurs. Étiquetage personnalisé possible.",
            Listing.ListingCategory.HEALTH_BEAUTY, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 450.0, "Agadir, Inzegane", 30.3597, -9.5332, 22, 50));

        all.add(listing(users, 5, "Recherche huile d'argan en vrac — distributeur Agadir",
            "Entreprise de distribution cosmétiques cherche fournisseur d'huile d'argan pure, minimum 50L par commande. Certification bio exigée. Partenariat long terme envisagé. Fourniture d'analyses en laboratoire requise.",
            Listing.ListingCategory.HEALTH_BEAUTY, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 0.0, "Agadir, Talborjt", 30.4278, -9.5981, 15, 0));

        all.add(listing(users, 8, "Surplus olives Picholine 800 kg — départ Meknès",
            "Domaine agricole propose surplus de récolte : 800 kg d'olives Picholine, calibre moyen-grand, propres à la consommation ou à la trituration. Idéal pour huileries artisanales ou conserveries. Prix départ champ.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 4000.0, "Meknes, Plaine", 33.8700, -5.5300, 6, 20));

        all.add(listing(users, 12, "Achat olives brutes — huilerie traditionnelle Fes",
            "Huilerie traditionnelle à Fes cherche apporteurs d'olives brutes pour pressage. Nous achetons minimum 500 kg. Paiement immédiat à la pesée. Trituration possible aussi pour compte tiers.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Fes, Médina", 34.0181, -5.0078, 18, 0));

        all.add(listing(users, 4, "Miel de thym Atlas 100% naturel — 200 kg disponibles",
            "Apiculteur de l'Atlas propose miel de thym non pasteurisé, récolte printemps 2025. 200 kg disponibles. Conditionnement en pots 500g, 1kg ou en fûts 20L. Analyse laboratoire fournie. Idéal pour pharmacies, épiceries bio, exportateurs.",
            Listing.ListingCategory.HEALTH_BEAUTY, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 900.0, "Tanger, Souk", 35.7595, -5.8340, 9, 30));

        all.add(listing(users, 9, "Amandes du Maroc décortiquées — lot 300 kg",
            "Coopérative agricole propose amandes décortiquées, calibre 25/27, taux d'humidité <8%. Lot de 300 kg. Idéal pour pâtissiers, chocolatiers, épiceries fine. Conditionnement en sacs 25 kg.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 15000.0, "Casablanca, Ain Diab", 33.5650, -7.6900, 7, 40));

        all.add(listing(users, 14, "Safran de Taliouine premium — 500g disponibles",
            "Producteur direct propose safran de Taliouine IGP, qualité Category I. 500g disponibles. Conditionnement en sachets hermétiques 1g, 5g, 10g ou en vrac. Certificat d'origine et d'authenticité fournis.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 3500.0, "Oujda, Centre", 34.6805, -1.9076, 14, 25));

        all.add(listing(users, 15, "Surplus menthe fraîche séchée — 150 kg Kenitra",
            "Exploitation agricole dispose de surplus de menthe nana séchée, conditionnée en sachets 500g. Idéal pour le marché du thé, herboristeries, export. Contact direct producteur.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 2200.0, "Kenitra, Médina", 34.2610, -6.5802, 11, 20));

        all.add(listing(users, 18, "Recherche matières premières alimentaires locales — Casablanca",
            "Entreprise agroalimentaire cherche fournisseurs locaux : tomates, oignons, pommes de terre, carottes. Volumes : 1 à 5 tonnes/semaine selon légume. Contrat cadre possible. Producteurs et coopératives privilégiés.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 0.0, "Casablanca, Hay Hassani", 33.5300, -7.6600, 25, 0));

        all.add(listing(users, 1, "Lot figues séchées artisanales — 400 kg Rabat",
            "Coopérative propose figues séchées naturellement, sans additifs. Production du Rif. 400 kg disponibles en sacs 10 kg ou 25 kg. Certifiées agriculture raisonnée.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 12000.0, "Rabat, Agdal", 34.0209, -6.8416, 8, 25));

        // ── 2. Électronique ───────────────────────────────────────────────────
        all.add(listing(users, 10, "Lot 30 ordinateurs reconditionnés HP/Dell — Casablanca",
            "Entreprise IT cède lot de 30 ordinateurs de bureau reconditionnés : HP EliteDesk et Dell OptiPlex, processeur Core i5/i7, RAM 8 Go, SSD 256 Go, Windows 11 Pro. Testés et garantis 3 mois. Idéal pour entreprises, écoles, associations. Facture disponible.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.LIKE_NEW, 45000.0, "Casablanca, Bourgogne", 33.5731, -7.5898, 18, 0));

        all.add(listing(users, 7, "Besoin ordinateurs pour association jeunesse — Casablanca",
            "Association culturelle cherche ordinateurs reconditionnés pour salle informatique (15 postes minimum). Budget limité, condition bon état acceptable. Don ou vente à prix solidaire préféré. Reçu fiscal possible.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 20, 0));

        all.add(listing(users, 4, "Smartphones Samsung Galaxy A série — lot 15 unités Tanger",
            "Commerçant cède lot de 15 smartphones Samsung Galaxy A32/A52, déverrouillés, état excellent à bon état, avec boîtes d'origine. Idéal revendeurs. Vente par lot uniquement.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 22500.0, "Tanger, Iberia", 35.7595, -5.8340, 10, 0));

        all.add(listing(users, 11, "Écrans LCD 22 pouces — lot de 20 unités — Casablanca",
            "Société de services informatiques revend 20 écrans LCD 22 pouces (Full HD), marques HP et LG, en bon état de fonctionnement. Câbles VGA/HDMI inclus. Idéal pour bureaux, call centers.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 18000.0, "Casablanca, Bourgogne", 33.5731, -7.5898, 14, 0));

        all.add(listing(users, 18, "Imprimantes HP LaserJet reconditionnées — lot 8 unités",
            "Lot de 8 imprimantes HP LaserJet Pro M402n, reconditionnées, avec cartouches neuves. Garantie 6 mois. Idéal TPE, cabinets médicaux, agences. Prix incluant mise en service.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.LIKE_NEW, 16000.0, "Rabat, Souissi", 34.0100, -6.8200, 12, 10));

        all.add(listing(users, 0, "Tablettes iPad reconditionnnées — lot 10 unités",
            "Lot de 10 iPad (6e et 7e génération), reconditionnées, 32 Go, WiFi, état cosmétique très bon. Idéal éducation, formation professionnelle. Housse de protection incluse.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.LIKE_NEW, 24000.0, "Casablanca, Maarif", 33.5898, -7.6031, 15, 0));

        all.add(listing(users, 3, "Routeurs WiFi professionnels — lot 12 Cisco/TP-Link",
            "Lot de 12 routeurs WiFi professionnels (6 Cisco RV340 + 6 TP-Link Archer AX50), état excellent, déréférencés. Idéal hôtels, bureaux, cafés. Configuration possible en option.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 14400.0, "Fes, Nouvelle Ville", 34.0300, -5.0200, 8, 20));

        all.add(listing(users, 6, "Câbles réseau et accessoires IT — lot important",
            "Liquidation de stock : câbles RJ45 Cat6 (500m), câbles HDMI, prises électriques, multiprises, switchs 8 ports. Tout tester et fonctionnel. Vente en lot complet ou par type.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 8500.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 6, 0));

        all.add(listing(users, 19, "Caméras de surveillance IP — lot 8 unités Tanger",
            "Lot de 8 caméras IP Full HD 2MP, extérieures, étanches IP66, vision nocturne 30m. Marque Hikvision. Avec câbles d'alimentation. Idéal commerces, entrepôts.",
            Listing.ListingCategory.ELECTRONICS, Listing.ListingType.ITEM, Listing.ItemCondition.LIKE_NEW, 11200.0, "Tanger, Malabata", 35.7700, -5.8100, 9, 15));

        // ── 3. Outillage & Machines ───────────────────────────────────────────
        all.add(listing(users, 8, "Machine à coudre industrielle Singer — atelier Meknès",
            "Machine à coudre industrielle Singer 4452 robuste, 1100 coups/minute, excellent état, entretenue régulièrement. Idéal atelier couture, confection, maroquinerie. Démo sur place possible.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 8500.0, "Meknes, Hamria", 33.8935, -5.5547, 7, 15));

        all.add(listing(users, 17, "Cherche machines à coudre pour coopérative couture",
            "Coopérative artisanale de couture cherche 3 à 5 machines industrielles ou semi-industrielles. Budget : 3000 à 8000 MAD par machine. Marque : peu importe si bon état. Région Agadir.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Agadir, Inzegane", 30.3597, -9.5332, 14, 0));

        all.add(listing(users, 12, "Compresseur d'air 200L — atelier Marrakech",
            "Compresseur d'air professionnel 200L, 3HP, pression maxi 10 bars. Marque Lacme. Entretenu, révisé il y a 6 mois. Vendu avec tuyau spiral 10m et pistolet de gonflage.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 5500.0, "Marrakech, Médina", 31.6340, -7.9890, 6, 10));

        all.add(listing(users, 2, "Outillage électroportatif professionnel — lot Marrakech",
            "Liquidation atelier : perçeuse Bosch GSB 20-2, visseuse DeWalt DCD771, scie sauteuse Makita, ponceuse orbitale. Tout fonctionnel avec leurs coffrets. Idéal artisan débutant ou complément d'atelier.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 9200.0, "Marrakech, Guéliz", 31.6295, -7.9811, 11, 0));

        all.add(listing(users, 14, "Cherche outillage électroportatif — artisan plombier",
            "Artisan plombier cherche perceuse à percussion et meuleuse d'angle en bon état. Budget max 2500 MAD les deux. Région Oujda. Pas d'intermédiaires SVP.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Oujda, Centre", 34.6805, -1.9076, 12, 0));

        all.add(listing(users, 0, "Groupe électrogène 5 kVA diesel — Casablanca",
            "Groupe électrogène diesel 5 kVA, marque Sdmo, 220V/380V, démarrage électrique, compteur horaire 850h. Idéal chantiers, locaux sans alimentation. Bac anti-déversement inclus.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 14000.0, "Casablanca, Maarif", 33.5898, -7.6031, 8, 20));

        all.add(listing(users, 16, "Matériel de menuiserie aluminium — lot Agadir",
            "Atelier menuiserie aluminium vend : table de coupe, perceuse à colonne, plieuse manuelle, lot de profils aluminium 6m. Convient atelier qui démarre. Prix ensemble.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.FAIR, 28000.0, "Agadir, Inzegane", 30.3597, -9.5332, 9, 0));

        all.add(listing(users, 5, "Équipement cuisine professionnelle — restaurant Agadir",
            "Restaurant en fermeture cède équipement complet : piano de cuisson 6 feux, friteuse 20L, hotte aspirante inox 2m, réfrigérateur pro 700L, étagères inox. Tout en état de marche.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 55000.0, "Agadir, Talborjt", 30.4278, -9.5981, 15, 10));

        all.add(listing(users, 3, "Recherche équipement cuisine pro — café pâtisserie Fes",
            "Futur café-pâtisserie cherche équipement cuisine : four à convection, pétrin, réfrigérateur, machine à expresso. Occasion acceptée si bon état. Fes ou livraison.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Fes, Nouvelle Ville", 34.0300, -5.0200, 18, 0));

        // ── 4. Maison & Décoration ────────────────────────────────────────────
        all.add(listing(users, 12, "Mobilier salon marocain traditionnel — Marrakech",
            "Artisan propose salon marocain complet : canapés en L, coussins brodés, table basse laquée, luminaire en cuivre. Bois de cèdre. Fabrication sur mesure ou modèles expo disponibles à vendre.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 18000.0, "Marrakech, Médina", 31.6340, -7.9890, 20, 40));

        all.add(listing(users, 3, "Zellige artisanal — carreaux mosaïque Fes",
            "Maâlem propose zellige marocain traditionnel, fait main, couleurs multiples. Idéal rénovation salle de bain, piscine, cuisine. Devis gratuit sur plan. Pose possible. Exportation possible.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 350.0, "Fes, Médina", 34.0181, -5.0078, 24, 20));

        all.add(listing(users, 15, "Lot tapis berbères authentiques — Oujda",
            "Négociant propose lot de 25 tapis berbères (Beni Ourain, kilims) de différentes tailles. Certificat d'authenticité. Idéal décorateurs, hôtels, boutiques design.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 35000.0, "Oujda, Centre", 34.6805, -1.9076, 14, 0));

        all.add(listing(users, 0, "Meubles bureau occasion — Casablanca",
            "Entreprise en déménagement cède : 10 bureaux en L avec caissons, 10 fauteuils ergonomiques, 5 armoires classeurs. Marque Steelcase. État très bon. Vente par unité ou lot complet.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.LIKE_NEW, 45000.0, "Casablanca, Maarif", 33.5898, -7.6031, 16, 0));

        all.add(listing(users, 8, "Recherche mobilier bureau pour open space — Meknès",
            "Startup cherche mobilier bureau pour 15 postes : bureaux, fauteuils, cloisons séparatives, caissons. Occasion acceptée si bon état. Budget 30 000 à 50 000 MAD.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Meknes, Hamria", 33.8935, -5.5547, 20, 0));

        all.add(listing(users, 19, "Luminaires artisanaux laiton — Tanger",
            "Artisan propose lustres et appliques en laiton ciselé, fabriqués artisanalement. Sur mesure ou modèles catalogue. Finitions : dorée, argentée, cuivre. Livraison nationale.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 2500.0, "Tanger, Malabata", 35.7700, -5.8100, 16, 0));

        // ── 8. Vêtements & Textile ────────────────────────────────────────────
        all.add(listing(users, 5, "Surplus djellabas homme — lot 500 unités Agadir",
            "Usine textile propose surplus production : 500 djellabas homme, tissus laine et coton mélangé, couleurs classiques. Tailles M à XXL. Idéal grossistes, marchands souk, exportateurs.",
            Listing.ListingCategory.CLOTHING, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 75000.0, "Agadir, Talborjt", 30.4278, -9.5981, 18, 0));

        all.add(listing(users, 3, "Cherche surplus textile — boutique vêtements traditionnels",
            "Commerçant cherche surplus djellabas, caftans, jabadors pour stock boutique Fes. Préférence pour lots 50-200 unités. Règlement comptant. Contact producteurs ou usines directement.",
            Listing.ListingCategory.CLOTHING, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 0.0, "Fes, Médina", 34.0181, -5.0078, 12, 0));

        all.add(listing(users, 6, "Stock vêtements enfants 0-12 ans — déstockage Casablanca",
            "Importateur propose déstockage vêtements enfants toutes saisons : T-shirts, pantalons, robes, pyjamas. Marques no-name et quelques marques françaises. Lot de 2000 à 5000 pièces.",
            Listing.ListingCategory.CLOTHING, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 50000.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 14, 0));

        // ── 6. Santé & Bien-être ──────────────────────────────────────────────
        all.add(listing(users, 1, "Équipement médical occasion — cabinet Rabat",
            "Cabinet médical renouvelle équipement et propose : ECG Cardioline, tensiomètre numérique Withings, oxymètre, balance médicale. Tout étalonné et avec certificat de conformité.",
            Listing.ListingCategory.HEALTH_BEAUTY, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 22000.0, "Rabat, Agdal", 34.0209, -6.8416, 14, 0));

        all.add(listing(users, 15, "Cherche matériel médical d'occasion — dispensaire rural",
            "Association sanitaire cherche matériel médical d'occasion pour dispensaire rural : stéthoscopes, tensiomètres, petit matériel chirurgical. Don ou vente prix solidaire. Région Oujda.",
            Listing.ListingCategory.HEALTH_BEAUTY, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Oujda, Centre", 34.6805, -1.9076, 10, 0));

        all.add(listing(users, 17, "Plantes médicinales séchées — pharmacopée marocaine",
            "Producteur propose gamme plantes médicinales séchées : romarin, thym, lavande, camomille, rose de Damas. Conditionnement professionnel, analyse sanitaire fournie. Idéal herboristeries, pharmacies, export.",
            Listing.ListingCategory.HEALTH_BEAUTY, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 180.0, "Agadir, Inzegane", 30.3597, -9.5332, 16, 15));

        // ── 7. Automobile & Véhicules ────────────────────────────────────────
        all.add(listing(users, 8, "Pièces détachées Renault Dacia — lot important Meknès",
            "Garagiste propose lot de pièces détachées originales et après-marché : Renault Logan, Dacia Sandero, Clio III. Filtres, plaquettes, amortisseurs, alternateurs. Garantie 3 mois.",
            Listing.ListingCategory.AUTOMOTIVE, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 35000.0, "Meknes, Hamria", 33.8935, -5.5547, 22, 0));

        all.add(listing(users, 14, "Cherche pièces moteur Renault 1.5 dCi — Oujda",
            "Mécanicien cherche pièces moteur 1.5 dCi (K9K) : injecteurs, pompe haute pression, turbo reconditionné. Occasion acceptée si garantie donnée. Oujda ou envoi.",
            Listing.ListingCategory.AUTOMOTIVE, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Oujda, Centre", 34.6805, -1.9076, 16, 0));

        all.add(listing(users, 4, "Vélos électriques d'occasion — lot 8 unités Tanger",
            "Location saisonnière revend lot de 8 vélos électriques (autonomie 60km, 250W, vitesse 25km/h) fin de saison. Batterie capacité 80%+. Idéal location, école, association.",
            Listing.ListingCategory.AUTOMOTIVE, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 24000.0, "Tanger, Iberia", 35.7595, -5.8340, 12, 0));

        // ── 12. Agriculture & Intrants ────────────────────────────────────────
        all.add(listing(users, 16, "Surplus d'engrais organiques — compost maraîcher Agadir",
            "Exploitation agricole propose surplus compost organique certifié, issu de déchets végétaux compostés 6 mois. 5 à 20 tonnes disponibles. Livraison possible région Souss.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 600.0, "Agadir, Inzegane", 30.3597, -9.5332, 14, 50));

        all.add(listing(users, 0, "Cherche compost ou fumier — maraîchage bio Casablanca",
            "Maraîcher bio cherche apport régulier de matière organique : compost, fumier de poulet ou bovin. 2 à 5 tonnes/mois. Livraison sur site préférée. Région Casablanca-Settat.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Casablanca, Hay Mohammadi", 33.5500, -7.5600, 18, 0));

        all.add(listing(users, 5, "Semences maraîchères certifiées — lot varié",
            "Distributeur propose lots de semences certifiées maraîchères : tomates, poivrons, courgettes, melons, pastèques. Variétés hybrides et traditionnelles. Rapport de certification inclus.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 2500.0, "Agadir, Talborjt", 30.4278, -9.5981, 20, 0));

        all.add(listing(users, 11, "Irrigation goutte-à-goutte — système complet occasion",
            "Exploitation cède système d'irrigation complet : pompe 2CV, filtres, tuyaux PE 16mm (2000m), goutteurs. Utilisé 2 saisons, excellent état. Idéal maraîchage 1 à 3 hectares.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 18000.0, "Casablanca, Bourgogne", 33.5731, -7.5898, 14, 0));

        all.add(listing(users, 15, "Achat système goutte-à-goutte — exploitation Oujda",
            "Agriculteur cherche système irrigation goutte-à-goutte complet pour 2 ha de maraîchage. Occasion ou neuf. Budget 20 000 MAD max. Livraison incluse souhaitée.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Oujda, Centre", 34.6805, -1.9076, 10, 0));

        // ── 13. Artisanat & Poterie ───────────────────────────────────────────
        all.add(listing(users, 3, "Poterie et céramiques artisanales — lot export Fes",
            "Coopérative de potiers propose lot céramiques Fès : assiettes, bols, tajines, vases. Faïences et grès. Certifications origine artisanale disponibles. Conditionnement export possible.",
            Listing.ListingCategory.HOME_GARDEN, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 28000.0, "Fes, Médina", 34.0181, -5.0078, 26, 0));

        all.add(listing(users, 2, "Maroquinerie cuir véritable — lot accessoires Marrakech",
            "Tannerie artisanale propose sacs, portefeuilles, ceintures, babouches en cuir véritable tanné traditionnel. Lots à partir de 50 pièces. Sur mesure possible. Export facilité.",
            Listing.ListingCategory.CLOTHING, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 22000.0, "Marrakech, Médina", 31.6340, -7.9890, 28, 0));

        // ── 14. Énergies renouvelables ────────────────────────────────────────
        all.add(listing(users, 17, "Panneaux solaires photovoltaïques — lot 20 panneaux",
            "Installateur propose lot de 20 panneaux solaires monocristallins 400W (marque JA Solar), déréférencés mais neufs. Avec micro-onduleurs Enphase. Idéal projet résidentiel ou PME.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 48000.0, "Agadir, Inzegane", 30.3597, -9.5332, 18, 0));

        all.add(listing(users, 10, "Chauffe-eau solaire occasion — 300L Casablanca",
            "Particulier revend chauffe-eau solaire thermique 300L (2 capteurs plans), 5 ans de fonctionnement, bon état. Ballon et capteurs inclus. Démontage par acheteur ou en option.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 5500.0, "Casablanca, Bourgogne", 33.5731, -7.5898, 10, 20));

        // ── 15. Livres & Médias ───────────────────────────────────────────────
        all.add(listing(users, 1, "Lot manuels universitaires — droit, économie, gestion",
            "Libraire propose lot de 200 manuels universitaires en français : droit des affaires, économie générale, gestion comptable, marketing. Éditions récentes (2019-2024). Vente par lot ou à l'unité.",
            Listing.ListingCategory.BOOKS_MEDIA, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 8000.0, "Rabat, Agdal", 34.0209, -6.8416, 14, 0));

        all.add(listing(users, 7, "Matériel pédagogique — association alphabétisation",
            "Association éducative cherche manuels alphabétisation adultes, cahiers, crayons pour programme d'alphabétisation en darija. Don ou achat symbolique. Région Casablanca.",
            Listing.ListingCategory.BOOKS_MEDIA, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 10, 0));

        // ── 16. Emballage & Conditionnement ──────────────────────────────────
        all.add(listing(users, 6, "Surplus emballages carton et plastique — Casablanca",
            "Grossiste propose surplus conditionnements : cartons double cannelure 50x30x30 (2000 unités), barquettes plastique alimentaire PP (5000 unités), film étirable industriel (20 rouleaux). Vente lot complet.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 12000.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 10, 0));

        all.add(listing(users, 2, "Cherche emballages pour producteur de confitures",
            "Producteur artisanal de confitures cherche pots en verre 250g et 370g (minimum 500 pots), capsules et étiquettes vierges. Occasion acceptable si propres. Marrakech ou livraison.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Marrakech, Guéliz", 31.6295, -7.9811, 14, 0));

        all.add(listing(users, 18, "Matériel imprimerie — impression numérique Rabat",
            "Imprimerie revend matériel : traceur grand format HP DesignJet T520, massicot électrique A2, plastifieuse A3, stock papier 200 ramettes. Matériel en bon état, cause cessation.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 42000.0, "Rabat, Souissi", 34.0100, -6.8200, 16, 0));

        // ── 17. Eau & Irrigation ──────────────────────────────────────────────
        all.add(listing(users, 12, "Pompe à eau centrifuge 5CV — Marrakech",
            "Agriculteur cède pompe centrifuge 5CV, débit 60m³/h, marque DAB. Excellent état, entretenue. Idéal irrigation champ ou remplissage bassin. Départ Marrakech.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 7500.0, "Marrakech, Médina", 31.6340, -7.9890, 8, 0));

        all.add(listing(users, 13, "Cherche pompe hydraulique pour puits — Casablanca",
            "Propriétaire terrien cherche pompe immergée ou centrifuge pour puits 40m de profondeur, débit minimum 10m³/h. Occasion ou neuve. Région Casablanca-Berrechid.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Casablanca, Sidi Maarouf", 33.5400, -7.6400, 12, 0));

        // ── 18. Récupération & Recyclage ──────────────────────────────────────
        all.add(listing(users, 0, "Surplus palettes bois — lot 200 palettes Casablanca",
            "Entrepôt logistique cède surplus palettes bois EUR 80x120, en bon état, clouées. 200 palettes disponibles immédiatement. Idéal artisans, jardinerie, déco. Ramassage sur place.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 6000.0, "Casablanca, Hay Mohammadi", 33.5500, -7.5600, 8, 0));

        all.add(listing(users, 11, "Cherche palettes bois pour projet aménagement",
            "Designer d'intérieur cherche palettes bois en bon état pour aménagement café-coworking. 50 à 80 palettes. Casablanca ou livraison. Prix raisonnable souhaité.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Casablanca, Bourgogne", 33.5731, -7.5898, 12, 0));

        // ── 19. Gastronomie & Restauration ───────────────────────────────────
        all.add(listing(users, 2, "Surplus huile de table — 500 litres Marrakech",
            "Importateur propose surplus huile de table tournesol, conditionnement bidon 5L. 100 bidons disponibles, date limite 18 mois. Idéal restaurateurs, collectivités, revendeurs.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 15000.0, "Marrakech, Guéliz", 31.6295, -7.9811, 12, 0));

        all.add(listing(users, 7, "Farine de blé T55 — lot 50 sacs 50kg",
            "Meunier propose lot de farine T55 (50 sacs de 50 kg), production récente, humidité <15%. Idéal boulangeries, pâtisseries, collectivités. Départ Casablanca, livraison négociable.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 20000.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 16, 20));

        all.add(listing(users, 4, "Cherche fournisseur de sucre en poudre — pâtisserie Tanger",
            "Pâtisserie artisanale cherche fournisseur de sucre en poudre et glace, minimum 200 kg/mois. Contrat mensuel possible. Livraison à Tanger.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 0.0, "Tanger, Iberia", 35.7595, -5.8340, 14, 0));

        // ── 16. Santé animale & Élevage ───────────────────────────────────────
        all.add(listing(users, 15, "Surplus aliments bétail — son de blé 5 tonnes",
            "Moulin propose surplus son de blé, 5 tonnes disponibles. Idéal éleveurs bovins, ovins, volailles. Conditionnement sacs 40 kg. Départ Oujda, livraison région possible.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.EXCELLENT, 7500.0, "Oujda, Centre", 34.6805, -1.9076, 12, 25));

        all.add(listing(users, 5, "Cages et enclos volailles — occasion Agadir",
            "Aviculteur cède équipement : 50 cages pondeuses galvanisées, 200m² filet anti-volatiles, mangeoires et abreuvoirs automatiques. Démontage et chargement acheteur.",
            Listing.ListingCategory.TOOLS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 12000.0, "Agadir, Talborjt", 30.4278, -9.5981, 10, 0));

        // ── 22. Construction & BTP ────────────────────────────────────────────
        all.add(listing(users, 13, "Surplus matériaux construction — chantier terminé",
            "Entrepreneur cède surplus chantier : 500 parpaings, 20 sacs ciment Portland, 200 kg acier HA 8mm, carrelage 20m², sable lavé 2m³. Ramassage sur place Casablanca.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.NEW, 8500.0, "Casablanca, Sidi Maarouf", 33.5400, -7.6400, 10, 0));

        all.add(listing(users, 14, "Cherche matériaux construction pour auto-construction",
            "Particulier cherche parpaings, ciment, carrelage et fer à béton pour petite construction (60m²). Occasion ou surplus chantier accepté. Région Oujda-Nador.",
            Listing.ListingCategory.OTHER, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Oujda, Centre", 34.6805, -1.9076, 8, 0));

        // ── 15. Sport & Loisirs ───────────────────────────────────────────────
        all.add(listing(users, 1, "Équipement salle de sport — lot complet occasion",
            "Salle de sport en restructuration cède : 5 tapis roulants Technogym, 10 vélos elliptiques, rack haltères 5-50kg, bancs de musculation. Tout en état de fonctionnement.",
            Listing.ListingCategory.SPORTS_OUTDOORS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 120000.0, "Rabat, Agdal", 34.0209, -6.8416, 18, 0));

        all.add(listing(users, 10, "Cherche matériel salle de sport d'occasion",
            "Association sportive cherche matériel musculation et cardio pour salle associative : quelques tapis, vélos, haltères. Budget limité, donations bienvenues. Casablanca.",
            Listing.ListingCategory.SPORTS_OUTDOORS, Listing.ListingType.ITEM, Listing.ItemCondition.FAIR, 0.0, "Casablanca, Bourgogne", 33.5731, -7.5898, 14, 0));

        all.add(listing(users, 12, "Équipement randonnée et camping — lot Marrakech",
            "Loueur de matériel outdoor revend stock : tentes 2-4 pers. (15 unités), sacs de couchage -5°C (20 unités), sacs à dos 60L (12 unités). Tout en bon état. Idéal tour-opérateur, club montagne.",
            Listing.ListingCategory.SPORTS_OUTDOORS, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 35000.0, "Marrakech, Médina", 31.6340, -7.9890, 14, 0));

        // ── 24. Jouets & Éducation enfants ────────────────────────────────────
        all.add(listing(users, 7, "Jouets et matériel créatif — association enfants Casablanca",
            "Association propose redistribution jouets, jeux de société, matériel activités manuelles (peinture, argile, perles). Tout en bon état. Don aux crèches et associations.",
            Listing.ListingCategory.TOYS_GAMES, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Casablanca, Ain Diab", 33.5600, -7.6700, 12, 0));

        all.add(listing(users, 15, "Cherche jouets et matériel pédagogique — école rurale",
            "École primaire rurale cherche jouets éducatifs, puzzles, jeux de construction, crayons de couleur, cahiers. Dons appréciés. Région Oujda. Viens chercher ou envoyer.",
            Listing.ListingCategory.TOYS_GAMES, Listing.ListingType.ITEM, Listing.ItemCondition.GOOD, 0.0, "Oujda, Centre", 34.6805, -1.9076, 6, 0));

        return listingRepository.saveAll(all).size();
    }

    private Listing listing(List<User> users, int userIdx, String title, String description,
                            Listing.ListingCategory category, Listing.ListingType type,
                            Listing.ItemCondition condition, Double price,
                            String location, double lat, double lon,
                            int views, int deliveryRadius) {
        User owner = users.get(userIdx % users.size());
        LocalDateTime created = LocalDateTime.now().minusDays(rnd.nextInt(180) + 1);

        Listing l = new Listing();
        l.setTitle(title);
        l.setDescription(description);
        l.setCategory(category);
        l.setType(type);
        l.setCondition(condition);
        l.setStatus(Listing.ListingStatus.ACTIVE);
        l.setOwner(owner);
        l.setEstimatedValue(price > 0 ? price : null);
        l.setCurrency("MAD");
        l.setIsNegotiable(price > 0 && rnd.nextBoolean());
        l.setIsFeatured(false);
        l.setLocationText(location);
        l.setLatitude(lat + (rnd.nextDouble() - 0.5) * 0.02);
        l.setLongitude(lon + (rnd.nextDouble() - 0.5) * 0.02);
        l.setIsPickupOnly(deliveryRadius == 0);
        l.setIsDeliveryAvailable(deliveryRadius > 0);
        l.setDeliveryRadiusKm(deliveryRadius > 0 ? deliveryRadius : null);
        l.setViewsCount(views + rnd.nextInt(50));
        l.setLikesCount(rnd.nextInt(views / 2 + 1));
        l.setInquiriesCount(rnd.nextInt(views / 4 + 1));
        l.setAutoRenew(false);
        l.setIsActive(true);
        l.setCreatedAt(created);
        l.setUpdatedAt(created.plusHours(rnd.nextInt(48)));
        return l;
    }
}
