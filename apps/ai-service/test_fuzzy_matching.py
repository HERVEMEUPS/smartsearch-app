"""
Test du système de fuzzy matching avec RapidFuzz
"""
from rapidfuzz import fuzz
import sys

def test_fuzzy_matching():
    """Tests unitaires du fuzzy matching"""

    print("=" * 60)
    print("🧪 TESTS DE FUZZY MATCHING - SMARTSEARCH")
    print("=" * 60)
    print()

    tests_passed = 0
    tests_total = 0

    # ========================================
    # TEST 1 : Noms avec fautes de frappe
    # ========================================
    print("📝 TEST 1 : Noms avec fautes de frappe")
    print("-" * 60)

    tests_cases = [
        ("KOUAKOU", "KOAKOU", 90, "Lettre manquante"),
        ("NGUESSAN", "NGUESAN", 90, "Double lettre"),
        ("KOUASSI", "KOUASI", 90, "Faute de frappe"),
        ("YAO", "YAO", 100, "Identique"),
    ]

    for nom1, nom2, seuil, description in tests_cases:
        tests_total += 1
        ratio = fuzz.ratio(nom1, nom2)
        passed = ratio >= seuil
        tests_passed += passed

        status = "✅" if passed else "❌"
        print(f"{status} {description:20s} : '{nom1}' vs '{nom2}' = {ratio:.2f}% (seuil: {seuil}%)")

    print()

    # ========================================
    # TEST 2 : Numéros partiels
    # ========================================
    print("🔢 TEST 2 : Numéros partiels")
    print("-" * 60)

    numero_tests = [
        ("123456", "CI0123456789", 100, "Numéro partiel dans complet"),
        ("789", "CI0123456789", 100, "Fin du numéro"),
        ("0123", "CI0123456789", 100, "Début du numéro"),
        ("999", "CI0123456789", 0, "Numéro non présent"),
    ]

    for num1, num2, expected_min, description in numero_tests:
        tests_total += 1
        partial_ratio = fuzz.partial_ratio(num1, num2)

        if expected_min == 0:
            # Pour le test négatif, on accepte un score < 50
            passed = partial_ratio < 50
        else:
            passed = partial_ratio >= expected_min

        tests_passed += passed

        status = "✅" if passed else "❌"
        print(f"{status} {description:30s} : '{num1}' in '{num2}' = {partial_ratio:.2f}%")

    print()

    # ========================================
    # TEST 3 : Ordre des mots
    # ========================================
    print("🔄 TEST 3 : Ordre des mots inversé")
    print("-" * 60)

    order_tests = [
        ("Jean KOUASSI", "KOUASSI Jean", 100, "Prénom/Nom inversé"),
        ("CNI Abidjan", "Abidjan CNI", 100, "Lieu/Type inversé"),
        ("Perdu Plateau", "Plateau Perdu", 100, "Ordre inversé"),
    ]

    for text1, text2, expected_min, description in order_tests:
        tests_total += 1
        token_sort = fuzz.token_sort_ratio(text1, text2)
        passed = token_sort >= expected_min
        tests_passed += passed

        status = "✅" if passed else "❌"
        print(f"{status} {description:30s} : '{text1}' vs '{text2}' = {token_sort:.2f}%")

    print()

    # ========================================
    # TEST 4 : Villes avec fautes
    # ========================================
    print("🏙️ TEST 4 : Villes avec fautes de frappe")
    print("-" * 60)

    ville_tests = [
        ("Abidjan", "Abidjan", 100, "Ville identique"),
        ("Abidjan", "Abijan", 85, "Lettre manquante"),
        ("Bouaké", "Bouake", 95, "Accent manquant"),
        ("Yamoussoukro", "Yamoussokro", 95, "Lettre manquante"),
    ]

    for ville1, ville2, expected_min, description in ville_tests:
        tests_total += 1
        ratio = fuzz.ratio(ville1.lower(), ville2.lower())
        passed = ratio >= expected_min
        tests_passed += passed

        status = "✅" if passed else "❌"
        print(f"{status} {description:30s} : '{ville1}' vs '{ville2}' = {ratio:.2f}%")

    print()

    # ========================================
    # TEST 5 : Noms complets vs partiels
    # ========================================
    print("👤 TEST 5 : Noms complets vs partiels")
    print("-" * 60)

    partial_tests = [
        ("KOUASSI", "YAO KOUASSI", 100, "Nom dans nom complet"),
        ("Jean", "Jean Pierre KOUAME", 100, "Prénom dans nom complet"),
        ("KOUAME", "Jean Pierre KOUAME", 100, "Nom de famille"),
    ]

    for nom1, nom2, expected_min, description in partial_tests:
        tests_total += 1
        partial_ratio = fuzz.partial_ratio(nom1.lower(), nom2.lower())
        passed = partial_ratio >= expected_min
        tests_passed += passed

        status = "✅" if passed else "❌"
        print(f"{status} {description:30s} : '{nom1}' in '{nom2}' = {partial_ratio:.2f}%")

    print()

    # ========================================
    # RÉSULTATS FINAUX
    # ========================================
    print("=" * 60)
    success_rate = (tests_passed / tests_total) * 100

    if success_rate == 100:
        print(f"✅ TOUS LES TESTS RÉUSSIS : {tests_passed}/{tests_total} ({success_rate:.0f}%)")
        print("=" * 60)
        return True
    else:
        print(f"⚠️ TESTS PARTIELLEMENT RÉUSSIS : {tests_passed}/{tests_total} ({success_rate:.0f}%)")
        print("=" * 60)
        return False

def test_bonus_scoring():
    """Test du système de bonus progressif"""

    print()
    print("=" * 60)
    print("📊 TEST DU SYSTÈME DE BONUS PROGRESSIF")
    print("=" * 60)
    print()

    def calculate_bonus(fuzzy_score):
        """Calcule le bonus selon les seuils"""
        if fuzzy_score >= 0.9:
            return 0.25
        elif fuzzy_score >= 0.8:
            return 0.20
        elif fuzzy_score >= 0.7:
            return 0.15
        elif fuzzy_score >= 0.6:
            return 0.10
        return 0.0

    test_cases = [
        ("KOUAKOU", "KOUAKOU", 1.0, 0.25, "Identique"),
        ("KOUAKOU", "KOAKOU", 0.93, 0.25, "Quasi identique"),
        ("KOUASSI", "KOUASI", 0.92, 0.25, "Faute légère"),
        ("NGUESSAN", "NGUESAN", 0.94, 0.25, "Double lettre"),
        ("KOUAME", "KOAME", 0.83, 0.20, "Lettre manquante"),
        ("YAO", "YO", 0.67, 0.10, "Très court"),
    ]

    print("Nom A          | Nom B          | Fuzzy Score | Bonus | Description")
    print("-" * 80)

    for nom1, nom2, expected_score, expected_bonus, description in test_cases:
        actual_score = fuzz.ratio(nom1, nom2) / 100.0
        actual_bonus = calculate_bonus(actual_score)

        # Tolérance de 5%
        score_ok = abs(actual_score - expected_score) < 0.05
        bonus_ok = actual_bonus == expected_bonus

        status = "✅" if (score_ok and bonus_ok) else "⚠️"

        print(f"{status} {nom1:14s} | {nom2:14s} | {actual_score:.2f}        | +{actual_bonus:.2f} | {description}")

    print()

def test_real_world_scenario():
    """Test avec un scénario réel complet"""

    print("=" * 60)
    print("🌍 SCÉNARIO RÉEL : CNI PERDUE/TROUVÉE")
    print("=" * 60)
    print()

    # Simulation d'une déclaration de perte
    perte = {
        "nomPartiel": "KOUAKOU",
        "numeroPartiel": "123456",
        "ville": "Abidjan",
        "quartier": "Plateau"
    }

    # Simulation d'une déclaration de découverte (avec fautes)
    decouverte = {
        "nomPartiel": "KOAKOU",
        "numeroPartiel": "CI0123456789",
        "ville": "Abijan",
        "quartier": "Platoue"
    }

    print("📍 Déclaration de PERTE :")
    print(f"   - Nom partiel    : {perte['nomPartiel']}")
    print(f"   - Numéro partiel : {perte['numeroPartiel']}")
    print(f"   - Ville          : {perte['ville']}")
    print(f"   - Quartier       : {perte['quartier']}")
    print()

    print("✅ Déclaration de DÉCOUVERTE :")
    print(f"   - Nom partiel    : {decouverte['nomPartiel']}")
    print(f"   - Numéro partiel : {decouverte['numeroPartiel']}")
    print(f"   - Ville          : {decouverte['ville']}")
    print(f"   - Quartier       : {decouverte['quartier']}")
    print()

    print("-" * 60)
    print("🔍 RÉSULTATS DU FUZZY MATCHING :")
    print("-" * 60)

    # Nom
    nom_ratio = fuzz.ratio(perte['nomPartiel'].lower(), decouverte['nomPartiel'].lower())
    print(f"Nom          : {nom_ratio:.2f}% de similarité → {'✅ MATCH' if nom_ratio >= 85 else '❌ NO MATCH'}")

    # Numéro
    num_partial = fuzz.partial_ratio(perte['numeroPartiel'], decouverte['numeroPartiel'])
    print(f"Numéro       : {num_partial:.2f}% de correspondance → {'✅ MATCH' if num_partial >= 85 else '❌ NO MATCH'}")

    # Ville
    ville_ratio = fuzz.ratio(perte['ville'].lower(), decouverte['ville'].lower())
    print(f"Ville        : {ville_ratio:.2f}% de similarité → {'✅ MATCH' if ville_ratio >= 85 else '❌ NO MATCH'}")

    # Quartier
    quartier_ratio = fuzz.ratio(perte['quartier'].lower(), decouverte['quartier'].lower())
    print(f"Quartier     : {quartier_ratio:.2f}% de similarité → {'✅ MATCH' if quartier_ratio >= 85 else '❌ NO MATCH'}")

    print()
    print("=" * 60)

    # Score global estimé
    score_global = (nom_ratio + num_partial + ville_ratio + quartier_ratio) / 4
    print(f"📊 SCORE GLOBAL ESTIMÉ : {score_global:.2f}%")

    if score_global >= 85:
        print("✅ RÉSULTAT : CORRESPONDANCE TRÈS PROBABLE")
    elif score_global >= 70:
        print("⚠️ RÉSULTAT : CORRESPONDANCE PROBABLE (À VÉRIFIER)")
    else:
        print("❌ RÉSULTAT : PAS DE CORRESPONDANCE ÉVIDENTE")

    print("=" * 60)
    print()

if __name__ == "__main__":
    print()
    print("🚀 Lancement des tests de fuzzy matching...")
    print()

    # Test principal
    success = test_fuzzy_matching()

    # Test du système de bonus
    test_bonus_scoring()

    # Test scénario réel
    test_real_world_scenario()

    # Code de sortie
    sys.exit(0 if success else 1)
