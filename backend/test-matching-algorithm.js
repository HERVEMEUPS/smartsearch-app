/**
 * Script de test pour vérifier l'algorithme de matching amélioré
 * Simule le cas DJANGA Kymia
 */

// Simuler l'algorithme de matching (copie de matchingService.js)
function calculateStringSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  str1 = str1.trim().toLowerCase();
  str2 = str2.trim().toLowerCase();

  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.9;
  }

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  let matches = 0;
  const minLen = Math.min(len1, len2);

  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) {
      matches++;
    }
  }

  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  const commonWords = words1.filter(w => words2.includes(w)).length;

  const charSimilarity = matches / maxLen;
  const wordSimilarity = commonWords / Math.max(words1.length, words2.length);

  return (charSimilarity * 0.5) + (wordSimilarity * 0.5);
}

function calculateLevenshteinSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const len1 = str1.length;
  const len2 = str2.length;

  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1.0 : 1.0 - (distance / maxLen);
}

function computeMatch(declA, declB) {
  const scores = {
    typeDocument: 0,
    nom: 0,
    numero: 0,
    localisation: 0,
    date: 0
  };

  // 1. Type de document (35%)
  if (declA.typeDocument === declB.typeDocument) {
    scores.typeDocument = 0.35;
  }

  // 2. Nom (30%)
  if (declA.nomPartiel && declB.nomPartiel) {
    const similarity = calculateStringSimilarity(
      declA.nomPartiel.toLowerCase().trim(),
      declB.nomPartiel.toLowerCase().trim()
    );
    scores.nom = similarity * 0.30;
  }

  // 3. Numéro (25%)
  if (declA.numeroPartiel && declB.numeroPartiel) {
    const numA = declA.numeroPartiel.replace(/[\s\-_./]/g, '').toLowerCase();
    const numB = declB.numeroPartiel.replace(/[\s\-_./]/g, '').toLowerCase();

    if (numA === numB) {
      scores.numero = 0.25;
    } else if (numA.includes(numB) || numB.includes(numA)) {
      const ratio = Math.min(numA.length, numB.length) / Math.max(numA.length, numB.length);
      scores.numero = 0.25 * ratio;
    } else {
      const similarity = calculateLevenshteinSimilarity(numA, numB);
      if (similarity >= 0.8) {
        scores.numero = 0.25 * similarity;
      }
    }
  }

  // 4. Localisation (5%)
  if (declA.localisation?.ville && declB.localisation?.ville) {
    const villeA = declA.localisation.ville.toLowerCase().trim();
    const villeB = declB.localisation.ville.toLowerCase().trim();

    if (villeA === villeB) {
      scores.localisation = 0.05;
    } else if (calculateStringSimilarity(villeA, villeB) >= 0.85) {
      scores.localisation = 0.03;
    }
  }

  // 5. Date (5%)
  if (declA.dateEvenement && declB.dateEvenement) {
    const dateA = new Date(declA.dateEvenement);
    const dateB = new Date(declB.dateEvenement);
    const diffDays = Math.abs((dateB - dateA) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      scores.date = 0.05;
    } else if (diffDays <= 30) {
      scores.date = 0.03;
    } else if (diffDays <= 60) {
      scores.date = 0.01;
    }
  }

  const scoreGlobal = Object.values(scores).reduce((sum, val) => sum + val, 0);

  // Bonus pour correspondance parfaite
  let bonus = 0;
  if (scores.numero === 0.25 && scores.nom >= 0.27) {
    bonus = 0.10;
  }

  const scoreFinal = Math.min(1.0, scoreGlobal + bonus);

  return {
    scoreFinal,
    scores,
    bonus,
    details: {
      typeMatch: declA.typeDocument === declB.typeDocument ? '✓' : '✗',
      nomSimilarity: `${(scores.nom / 0.30 * 100).toFixed(0)}%`,
      numeroMatch: scores.numero > 0 ? '✓' : '✗',
      villeMatch: scores.localisation > 0 ? '✓' : '✗',
      dateDiff: Math.abs((new Date(declB.dateEvenement) - new Date(declA.dateEvenement)) / (1000 * 60 * 60 * 24))
    }
  };
}

// CAS TEST: DJANGA Kymia
console.log('\n🧪 TEST: Cas DJANGA Kymia\n');
console.log('═'.repeat(60));

const declPerte = {
  type: 'PERTE',
  typeDocument: 'ACTE_NAISSANCE',
  nomPartiel: 'DJANGA Kymia',
  numeroPartiel: 'AN203/25',
  localisation: { ville: 'Yaoundé' },
  dateEvenement: '2025-10-31'
};

const declTrouve = {
  type: 'DECOUVERTE',
  typeDocument: 'ACTE_NAISSANCE',
  nomPartiel: 'DJANGA Kymia',
  numeroPartiel: 'AN203/25',
  localisation: { ville: 'Yaoundé' },
  dateEvenement: '2025-11-03'
};

const result = computeMatch(declPerte, declTrouve);

console.log('\n📄 DÉCLARATION PERTE:');
console.log(`   Type: ${declPerte.typeDocument}`);
console.log(`   Nom: ${declPerte.nomPartiel}`);
console.log(`   Numéro: ${declPerte.numeroPartiel}`);
console.log(`   Lieu: ${declPerte.localisation.ville}`);
console.log(`   Date: ${declPerte.dateEvenement}`);

console.log('\n📄 DÉCLARATION TROUVÉE:');
console.log(`   Type: ${declTrouve.typeDocument}`);
console.log(`   Nom: ${declTrouve.nomPartiel}`);
console.log(`   Numéro: ${declTrouve.numeroPartiel}`);
console.log(`   Lieu: ${declTrouve.localisation.ville}`);
console.log(`   Date: ${declTrouve.dateEvenement}`);

console.log('\n📊 SCORES DÉTAILLÉS:');
console.log(`   Type Document: ${(result.scores.typeDocument * 100).toFixed(1)}% / 35%`);
console.log(`   Nom: ${(result.scores.nom * 100).toFixed(1)}% / 30%`);
console.log(`   Numéro: ${(result.scores.numero * 100).toFixed(1)}% / 25%`);
console.log(`   Localisation: ${(result.scores.localisation * 100).toFixed(1)}% / 5%`);
console.log(`   Date: ${(result.scores.date * 100).toFixed(1)}% / 5%`);
if (result.bonus > 0) {
  console.log(`   🎁 Bonus Match Parfait: +${(result.bonus * 100).toFixed(0)}%`);
}

console.log('\n🎯 RÉSULTAT FINAL:');
console.log(`   Score Global: ${(result.scoreFinal * 100).toFixed(1)}%`);
console.log(`   Seuil: 72.0%`);
console.log(`   Match Détecté: ${result.scoreFinal >= 0.72 ? '✅ OUI' : '❌ NON'}`);

console.log('\n💡 DÉTAILS:');
console.log(`   Type Match: ${result.details.typeMatch}`);
console.log(`   Nom Similarité: ${result.details.nomSimilarity}`);
console.log(`   Numéro Match: ${result.details.numeroMatch}`);
console.log(`   Ville Match: ${result.details.villeMatch}`);
console.log(`   Différence jours: ${result.details.dateDiff.toFixed(0)} jours`);

console.log('\n' + '═'.repeat(60));
console.log(result.scoreFinal >= 0.72 ? '✅ TEST RÉUSSI !' : '❌ TEST ÉCHOUÉ !');
console.log('═'.repeat(60) + '\n');

// Autres cas de test
console.log('\n🧪 TESTS ADDITIONNELS\n');
console.log('─'.repeat(60));

const testCases = [
  {
    name: 'Variante avec typo sur le nom',
    declA: { ...declPerte, nomPartiel: 'DJANGA Kimia' },
    declB: declTrouve
  },
  {
    name: 'Variante avec numéro différent',
    declA: { ...declPerte, numeroPartiel: 'AN204/25' },
    declB: declTrouve
  },
  {
    name: 'Variante avec ville en minuscule',
    declA: { ...declPerte, localisation: { ville: 'yaoundé' } },
    declB: declTrouve
  },
  {
    name: 'Documents complètement différents',
    declA: {
      type: 'PERTE',
      typeDocument: 'PASSEPORT',
      nomPartiel: 'FOSSI Jean',
      numeroPartiel: 'Pass12345678',
      localisation: { ville: 'Nkongsamba' },
      dateEvenement: '2026-05-21'
    },
    declB: declTrouve
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  const res = computeMatch(testCase.declA, testCase.declB);
  console.log(`   Score: ${(res.scoreFinal * 100).toFixed(1)}%`);
  console.log(`   Match: ${res.scoreFinal >= 0.72 ? '✅ OUI' : '❌ NON'}`);
});

console.log('\n' + '─'.repeat(60) + '\n');
