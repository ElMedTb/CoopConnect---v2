-- CoopConnect AI — Seed Data (Cooperative Platform)
-- All test account passwords: Admin123!
-- BCrypt hash: $2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O

-- ═══════════════════════════════════════════════════════════
-- USERS (platform accounts)
-- ═══════════════════════════════════════════════════════════

INSERT INTO users (id, username, email, password, first_name, last_name, phone_number, user_type, status, email_verified, phone_verified, login_attempts, rating_average, rating_count, trust_score, verification_level, is_active, created_at, updated_at, version)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@coopconnect.ai', '$2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O', 'Admin', 'Plateforme', '+33600000001', 'INDIVIDUAL', 'ACTIVE', true, false, 0, 5.0, 0, 100.0, 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO users (id, username, email, password, first_name, last_name, phone_number, user_type, status, email_verified, phone_verified, login_attempts, rating_average, rating_count, trust_score, verification_level, is_active, created_at, updated_at, version)
VALUES ('22222222-2222-2222-2222-222222222222', 'coop_bio', 'contact@biolocal.coop', '$2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O', 'Marie', 'Dupont', '+33600000002', 'BUSINESS', 'ACTIVE', true, false, 0, 4.8, 12, 85.0, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO users (id, username, email, password, first_name, last_name, phone_number, user_type, status, email_verified, phone_verified, login_attempts, rating_average, rating_count, trust_score, verification_level, is_active, created_at, updated_at, version)
VALUES ('33333333-3333-3333-3333-333333333333', 'restau_coll', 'contact@restauration-collective.fr', '$2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O', 'Pierre', 'Martin', '+33600000003', 'BUSINESS', 'ACTIVE', true, false, 0, 4.5, 8, 72.0, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO users (id, username, email, password, first_name, last_name, phone_number, user_type, status, email_verified, phone_verified, login_attempts, rating_average, rating_count, trust_score, verification_level, is_active, created_at, updated_at, version)
VALUES ('44444444-4444-4444-4444-444444444444', 'menuiserie_pro', 'contact@boisalpes.fr', '$2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O', 'Sophie', 'Bernard', '+33600000004', 'BUSINESS', 'ACTIVE', true, false, 0, 4.7, 6, 68.0, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO users (id, username, email, password, first_name, last_name, phone_number, user_type, status, email_verified, phone_verified, login_attempts, rating_average, rating_count, trust_score, verification_level, is_active, created_at, updated_at, version)
VALUES ('55555555-5555-5555-5555-555555555555', 'logistique_sud', 'contact@transportsud.fr', '$2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O', 'Lucas', 'Petit', '+33600000005', 'BUSINESS', 'ACTIVE', true, false, 0, 4.3, 4, 60.0, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO users (id, username, email, password, first_name, last_name, phone_number, user_type, status, email_verified, phone_verified, login_attempts, rating_average, rating_count, trust_score, verification_level, is_active, created_at, updated_at, version)
VALUES ('66666666-6666-6666-6666-666666666666', 'energie_verte', 'contact@energieverte.coop', '$2a$10$tHH428ddVpylY4tjRx5ok.pE1DA/yZR9cgsRnNiNuOxZ1LdJRfj5O', 'Emma', 'Garcia', '+33600000006', 'BUSINESS', 'ACTIVE', true, false, 0, 4.9, 3, 90.0, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- ═══════════════════════════════════════════════════════════
-- ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════

INSERT INTO organizations (id, name, description, org_type, sector, status, siret, website, phone, email, address, city, region, country, postal_code, latitude, longitude, member_count, year_founded, values_labels, rating_average, rating_count, trust_score, partnerships_count, co2_saved_kg, waste_recycled_pct, admin_id, is_active, created_at, updated_at, version)
VALUES ('aaaa0001-0001-0001-0001-000000000001', 'Coopérative Bio Local', 'Coopérative agricole spécialisée en maraîchage biologique. Production de légumes de saison, fruits et herbes aromatiques sur 15 hectares dans l''arrière-pays niçois.', 'COOPERATIVE', 'AGRICULTURE', 'ACTIVE', '12345678901234', 'https://biolocal.coop', '+33493000001', 'contact@biolocal.coop', '245 Chemin des Collines', 'Nice', 'PACA', 'France', '06100', 43.7102, 7.2620, 25, 2018, 'bio, local, circuit court, zéro pesticide', 4.8, 12, 85.0, 5, 1250.0, 78.0, '22222222-2222-2222-2222-222222222222', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO organizations (id, name, description, org_type, sector, status, siret, website, phone, email, address, city, region, country, postal_code, latitude, longitude, member_count, year_founded, values_labels, rating_average, rating_count, trust_score, partnerships_count, co2_saved_kg, waste_recycled_pct, admin_id, is_active, created_at, updated_at, version)
VALUES ('aaaa0002-0002-0002-0002-000000000002', 'Restauration Collective Azur', 'Entreprise de restauration collective fournissant 3000 repas/jour pour écoles, hôpitaux et entreprises de la Côte d''Azur. Engagement fort envers les produits locaux et bio.', 'PME', 'RESTAURATION', 'ACTIVE', '23456789012345', 'https://restau-azur.fr', '+33493000002', 'contact@restau-azur.fr', '78 Avenue du Commerce', 'Cannes', 'PACA', 'France', '06400', 43.5528, 7.0174, 45, 2015, 'local, anti-gaspillage, bio, insertion sociale', 4.5, 8, 72.0, 3, 890.0, 85.0, '33333333-3333-3333-3333-333333333333', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO organizations (id, name, description, org_type, sector, status, siret, website, phone, email, address, city, region, country, postal_code, latitude, longitude, member_count, year_founded, values_labels, rating_average, rating_count, trust_score, partnerships_count, co2_saved_kg, waste_recycled_pct, admin_id, is_active, created_at, updated_at, version)
VALUES ('aaaa0003-0003-0003-0003-000000000003', 'Menuiserie Bois des Alpes', 'Atelier artisanal de menuiserie utilisant exclusivement du bois local issu de forêts gérées durablement. Fabrication de meubles sur mesure, portes, fenêtres et aménagements intérieurs.', 'ARTISAN', 'ARTISANAT', 'ACTIVE', '34567890123456', 'https://boisalpes.fr', '+33493000003', 'contact@boisalpes.fr', '12 Zone Artisanale', 'Antibes', 'PACA', 'France', '06600', 43.5804, 7.1252, 8, 2012, 'artisanat local, bois durable, sur mesure, PEFC', 4.7, 6, 68.0, 2, 340.0, 92.0, '44444444-4444-4444-4444-444444444444', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO organizations (id, name, description, org_type, sector, status, siret, website, phone, email, address, city, region, country, postal_code, latitude, longitude, member_count, year_founded, values_labels, rating_average, rating_count, trust_score, partnerships_count, co2_saved_kg, waste_recycled_pct, admin_id, is_active, created_at, updated_at, version)
VALUES ('aaaa0004-0004-0004-0004-000000000004', 'Transport Sud Logistique', 'TPE de logistique et transport mutualisé pour les circuits courts en région PACA. Flotte de 12 véhicules dont 4 électriques pour des livraisons éco-responsables.', 'TPE', 'LOGISTIQUE', 'ACTIVE', '45678901234567', 'https://transportsud.fr', '+33493000004', 'contact@transportsud.fr', '156 Route de Grasse', 'Mougins', 'PACA', 'France', '06250', 43.6004, 6.9958, 12, 2020, 'mobilité verte, mutualisation, dernier kilomètre', 4.3, 4, 60.0, 4, 2100.0, 0.0, '55555555-5555-5555-5555-555555555555', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO organizations (id, name, description, org_type, sector, status, siret, website, phone, email, address, city, region, country, postal_code, latitude, longitude, member_count, year_founded, values_labels, rating_average, rating_count, trust_score, partnerships_count, co2_saved_kg, waste_recycled_pct, admin_id, is_active, created_at, updated_at, version)
VALUES ('aaaa0005-0005-0005-0005-000000000005', 'Énergie Verte Méditerranée', 'Coopérative d''énergie renouvelable proposant des solutions biomasse et solaire. Valorisation des déchets organiques et résidus agricoles en énergie thermique et biogaz.', 'COOPERATIVE', 'ENERGIE', 'ACTIVE', '56789012345678', 'https://energieverte-med.coop', '+33493000005', 'contact@energieverte.coop', '89 Boulevard des Énergies', 'Grasse', 'PACA', 'France', '06130', 43.6584, 6.9230, 18, 2019, 'énergie renouvelable, biomasse, valorisation déchets, local', 4.9, 3, 90.0, 3, 4500.0, 95.0, '66666666-6666-6666-6666-666666666666', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- ═══════════════════════════════════════════════════════════
-- RESOURCES (Surplus & Besoins)
-- ═══════════════════════════════════════════════════════════

-- Coopérative Bio Local — SURPLUS
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0001-0001-0001-0001-000000000001', 'Tomates bio (surplus saisonnier)', 'Surplus de 500kg de tomates bio variétés anciennes. Production excédentaire de la saison d''été. Disponibles immédiatement, idéal pour transformation ou restauration collective.', 'SURPLUS', 'ALIMENTAIRE', 'AVAILABLE', 500, 'kg', 750.0, 'Excellent', true, 'saisonnier', 'Nice, arrière-pays', 43.7102, 7.2620, true, false, 50, 34, 8, 'aaaa0001-0001-0001-0001-000000000001', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0002-0002-0002-0002-000000000002', 'Courgettes bio', 'Surplus prévu de 300kg de courgettes bio dans 2 semaines. Production régulière de mai à septembre.', 'SURPLUS', 'ALIMENTAIRE', 'AVAILABLE', 300, 'kg', 420.0, 'Excellent', true, 'hebdomadaire', 'Nice', 43.7102, 7.2620, true, false, 30, 18, 3, 'aaaa0001-0001-0001-0001-000000000001', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Coopérative Bio Local — BESOIN
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0003-0003-0003-0003-000000000003', 'Compost organique (besoin mensuel)', 'Besoin de 5 tonnes de compost organique chaque mois pour enrichir les sols de nos parcelles. Nous acceptons les biodéchets compostés conformes.', 'NEED', 'MATIERE_PREMIERE', 'AVAILABLE', 5, 'tonnes', 200.0, null, true, 'mensuel', 'Nice, arrière-pays', 43.7102, 7.2620, false, true, null, 12, 2, 'aaaa0001-0001-0001-0001-000000000001', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Restauration Collective — BESOIN
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0004-0004-0004-0004-000000000004', 'Légumes locaux bio (approvisionnement)', 'Besoin hebdomadaire de 800kg de légumes bio locaux pour nos 3000 repas/jour. Nous cherchons des producteurs de la région PACA.', 'NEED', 'ALIMENTAIRE', 'AVAILABLE', 800, 'kg', 2400.0, null, true, 'hebdomadaire', 'Cannes', 43.5528, 7.0174, false, false, 60, 45, 12, 'aaaa0002-0002-0002-0002-000000000002', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Restauration Collective — SURPLUS
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0005-0005-0005-0005-000000000005', 'Déchets organiques compostables', 'Surplus quotidien de 200kg de déchets organiques propres (épluchures, restes alimentaires triés). Disponibles pour compostage ou méthanisation.', 'SURPLUS', 'DECHET_VALORISABLE', 'AVAILABLE', 200, 'kg', 0.0, 'À recycler', true, 'quotidien', 'Cannes', 43.5528, 7.0174, true, false, 30, 22, 5, 'aaaa0002-0002-0002-0002-000000000002', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Menuiserie — SURPLUS
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0006-0006-0006-0006-000000000006', 'Chutes de bois (chêne et noyer)', 'Surplus régulier de chutes de bois de qualité. Idéal pour chauffage biomasse, artisanat ou petite menuiserie. Environ 500kg par mois.', 'SURPLUS', 'DECHET_VALORISABLE', 'AVAILABLE', 500, 'kg', 150.0, 'Bon état', true, 'mensuel', 'Antibes', 43.5804, 7.1252, false, true, null, 28, 6, 'aaaa0003-0003-0003-0003-000000000003', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Menuiserie — BESOIN
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0007-0007-0007-0007-000000000007', 'Bois local certifié PEFC', 'Besoin de 3m³/mois de bois local certifié PEFC (chêne, hêtre, noyer). Recherche fournisseur régulier en région PACA.', 'NEED', 'MATIERE_PREMIERE', 'AVAILABLE', 3, 'm3', 1800.0, null, true, 'mensuel', 'Antibes', 43.5804, 7.1252, false, false, 100, 15, 3, 'aaaa0003-0003-0003-0003-000000000003', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Logistique — SURPLUS (service)
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0008-0008-0008-0008-000000000008', 'Capacité de transport mutualisé', 'Capacité excédentaire de transport sur les axes Nice-Cannes-Antibes-Grasse. 2 véhicules électriques disponibles les mardis et jeudis. Idéal pour mutualiser vos livraisons.', 'SURPLUS', 'LOGISTIQUE', 'AVAILABLE', 2, 'véhicules', 200.0, 'Neuf', true, 'hebdomadaire', 'Mougins / axe Côte d''Azur', 43.6004, 6.9958, true, false, 80, 38, 9, 'aaaa0004-0004-0004-0004-000000000004', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Énergie Verte — BESOIN
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0009-0009-0009-0009-000000000009', 'Biomasse / déchets organiques', 'Besoin continu de matière organique pour notre unité de méthanisation. Nous acceptons : déchets verts, résidus agricoles, biodéchets alimentaires, sciure de bois.', 'NEED', 'DECHET_VALORISABLE', 'AVAILABLE', 10, 'tonnes', 0.0, null, true, 'mensuel', 'Grasse', 43.6584, 6.9230, false, false, 60, 41, 7, 'aaaa0005-0005-0005-0005-000000000005', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- Énergie Verte — SURPLUS (production)
INSERT INTO resources (id, name, description, resource_type, category, status, quantity, unit, estimated_value, condition_state, is_recurring, recurring_frequency, location_text, latitude, longitude, delivery_available, pickup_only, max_delivery_km, views_count, contact_count, organization_id, is_active, created_at, updated_at, version)
VALUES ('bbbb0010-0010-0010-0010-000000000010', 'Énergie thermique biomasse', 'Production d''énergie thermique à partir de biomasse. Nous pouvons fournir du chauffage mutualisé aux entreprises de la zone de Grasse.', 'PRODUCTION', 'ENERGIE', 'AVAILABLE', 500, 'MWh', 25000.0, 'Neuf', true, 'continu', 'Grasse, zone industrielle', 43.6584, 6.9230, false, false, 20, 19, 4, 'aaaa0005-0005-0005-0005-000000000005', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

-- ═══════════════════════════════════════════════════════════
-- PARTNERSHIPS
-- ═══════════════════════════════════════════════════════════

INSERT INTO partnerships (id, initiator_id, partner_id, type, status, message, compatibility_score, distance_km, shared_values, co2_saved_kg, economic_value_eur, is_active, created_at, updated_at, version)
VALUES ('cccc0001-0001-0001-0001-000000000001', 'aaaa0001-0001-0001-0001-000000000001', 'aaaa0002-0002-0002-0002-000000000002', 'EXCHANGE', 'ACTIVE', 'Proposition d''échange : surplus tomates bio contre approvisionnement régulier pour la restauration collective.', 87.5, 23.4, 'bio, local', 450.0, 3200.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO partnerships (id, initiator_id, partner_id, type, status, message, compatibility_score, distance_km, shared_values, co2_saved_kg, economic_value_eur, is_active, created_at, updated_at, version)
VALUES ('cccc0002-0002-0002-0002-000000000002', 'aaaa0003-0003-0003-0003-000000000003', 'aaaa0005-0005-0005-0005-000000000005', 'CIRCULAR', 'ACTIVE', 'Circuit circulaire : chutes de bois de la menuiserie → biomasse pour la coopérative énergie → chaleur pour l''atelier.', 92.0, 31.2, 'valorisation déchets, énergie locale', 680.0, 1800.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);

INSERT INTO partnerships (id, initiator_id, partner_id, type, status, message, compatibility_score, distance_km, shared_values, co2_saved_kg, economic_value_eur, is_active, created_at, updated_at, version)
VALUES ('cccc0003-0003-0003-0003-000000000003', 'aaaa0002-0002-0002-0002-000000000002', 'aaaa0005-0005-0005-0005-000000000005', 'CIRCULAR', 'PROPOSED', 'Suggestion IA : les déchets organiques de la restauration peuvent alimenter l''unité de méthanisation.', 79.3, 38.5, 'anti-gaspillage, valorisation déchets', 0.0, 0.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0);
