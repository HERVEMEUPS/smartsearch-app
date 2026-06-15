/*
// Déclaration
document.getElementById("declarationForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        typeDeclaration: typeDeclaration.value,
        typeDocument: typeDocument.value,
        nom: nom.value,
        numero: numero.value,
        lieu: lieu.value,
        date: date.value,
        description: description.value
    };

    await fetch("http://localhost:3000/declaration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("Déclaration enregistrée !");
    this.reset();
});

// Recherche
//document.getElementById("rechercheForm")?.addEventListener("submit", async function (e) {
// e.preventDefault();

// const response = await fetch("http://localhost:3000/recherche");
// const documents = await response.json();

//const resultats = document.getElementById("resultats");
// resultats.innerHTML = "";

// documents.forEach(doc => {
//   resultats.innerHTML += `
//       <p><strong>${doc.typeDocument}</strong> - ${doc.nom} (${doc.typeDeclaration})</p>
//      `;
//  });
//});
document.getElementById("rechercheForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const typeDocument = document.getElementById("rTypeDocument").value;
    const nom = document.getElementById("rNom").value;
    const numero = document.getElementById("rNumero").value;

    const params = new URLSearchParams({
        typeDocument,
        nom,
        numero
    });

    const response = await fetch(`http://localhost:3000/recherche?${params}`);
    const resultatsData = await response.json();

    const typeDeclaration = document.getElementById("rTypeDeclaration").value;
    const lieu = document.getElementById("rLieu").value;
    const dateDebut = document.getElementById("rDateDebut").value;
    const dateFin = document.getElementById("rDateFin").value;
    const params = new URLSearchParams({
        typeDocument,
        nom,
        numero,
        typeDeclaration,
        lieu,
        dateDebut,
        dateFin
    });


    const resultats = document.getElementById("resultats");
    resultats.innerHTML = "";

    if (resultatsData.length === 0) {
        resultats.innerHTML = "<p>Aucun document correspondant.</p>";
        return;
    }

    resultatsData.forEach(doc => {
        resultats.innerHTML += `
            <p>
                <strong>${doc.typeDocument}</strong> – ${doc.nom}<br>
                Type: ${doc.typeDeclaration} | Score: ${doc.score}/12
            </p>
        `;
    });
});
*/

console.log("script.js chargé");

/***************************************
 * CONFIGURATION GLOBALE
 ***************************************/
const API_URL = "https://smartsearch-backend-pxw5.onrender.com";


/***************************************
 * VÉRIFICATION DE L'AUTHENTIFICATION
 ***************************************/
function checkAuth() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // Afficher l'utilisateur connecté s'il existe
    const userInfoDiv = document.getElementById("userInfo");
    if (userInfoDiv && token && username) {
        userInfoDiv.innerHTML = `
            <span>Connecté : <strong>${username}</strong></span>
            <button onclick="logout()" style="margin-left: 10px;">Déconnexion</button>
        `;
    }
}

/***************************************
 * DÉCONNEXION
 ***************************************/
function logout() {
    localStorage.clear();
    alert("Déconnexion réussie");
    window.location.href = "login.html";
}

// Vérifier l'authentification au chargement de la page
window.addEventListener("DOMContentLoaded", checkAuth);

/***************************************
 * AUTHENTIFICATION
 ***************************************/
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        console.log('🔐 Tentative de connexion:', username);
        message.textContent = "Connexion en cours...";
        message.style.color = "blue";

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            console.log('📡 Réponse reçue:', response.status, response.statusText);

            const data = await response.json();
            console.log('📦 Data:', data);

            if (!response.ok) {
                message.textContent = data.message || "Erreur de connexion";
                message.style.color = "red";
                return;
            }

            // Sauvegarde du token et des infos utilisateur (MongoDB backend structure)
            const token = data.data?.accessToken || data.token;
            const user = data.data?.user || data;
            const usernameToStore = user.username || data.username;
            const role = user.role || data.role;

            console.log('✅ Connexion réussie:', { username: usernameToStore, role });

            localStorage.setItem("token", token);
            localStorage.setItem("username", usernameToStore);
            localStorage.setItem("role", role);

            message.textContent = "✓ Connexion réussie ! Redirection...";
            message.style.color = "green";

            // Redirection selon le rôle
            setTimeout(() => {
                if (role === "admin") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 500);

        } catch (err) {
            console.error('❌ Erreur:', err);
            message.textContent = "Erreur: " + err.message;
            message.style.color = "red";
        }
    });
}

/***************************************
 * INSCRIPTION
 ***************************************/
/*const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg_username").value;
        const password = document.getElementById("reg_password").value;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                registerMessage.textContent = data.message;
                return;
            }

            alert("Compte créé avec succès !");
            window.location.href = "login.html";

        } catch (err) {
            registerMessage.textContent = "Erreur serveur";
        }
    });
}*/

/***************************************
 * INSCRIPTION
 ***************************************/
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");

// Afficher/masquer le champ code admin selon le rôle sélectionné
const roleSelect = document.getElementById("reg_role");
const adminCodeInput = document.getElementById("admin_code");

if (roleSelect && adminCodeInput) {
    roleSelect.addEventListener("change", (e) => {
        if (e.target.value === "admin") {
            adminCodeInput.style.display = "block";
            adminCodeInput.required = true;
        } else {
            adminCodeInput.style.display = "none";
            adminCodeInput.required = false;
            adminCodeInput.value = ""; // Réinitialiser le champ
        }
    });
}

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg_username").value;
        const email = document.getElementById("reg_email").value;
        const password = document.getElementById("reg_password").value;
        const role = document.getElementById("reg_role").value;
        const adminCode = document.getElementById("admin_code").value;

        // Validation : vérifier que le rôle est sélectionné
        if (!role) {
            registerMessage.textContent = "Veuillez sélectionner un type de compte";
            registerMessage.style.color = "red";
            return;
        }

        // Validation : vérifier le code admin si rôle admin
        if (role === "admin" && !adminCode) {
            registerMessage.textContent = "Le code administrateur est requis pour créer un compte admin";
            registerMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role,
                    adminCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                registerMessage.textContent = data.message;
                registerMessage.style.color = "red";
                return;
            }

            // Afficher un message de succès
            registerMessage.textContent = "✓ Compte créé avec succès ! Redirection...";
            registerMessage.style.color = "green";

            // Redirection après 1.5 secondes
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (err) {
            registerMessage.textContent = "Erreur serveur - Vérifiez que le serveur est démarré";
            registerMessage.style.color = "red";
        }
    });
}


/***************************************
 * DÉCLARATION D’UN DOCUMENT
 ***************************************/
const declarationForm = document.getElementById("declarationForm");

if (declarationForm) {
    declarationForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Vérification de l’authentification
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vous devez être connecté pour déclarer un document");
            window.location.href = "login.html";
            return;
        }

        // Récupération des valeurs du formulaire
        const typeDeclarationValue = document.getElementById("typeDeclaration").value;
        const typeDocumentValue = document.getElementById("typeDocument").value;

        // Mapper les valeurs du frontend vers le format attendu par le backend
        const typeMapping = {
            'perdu': 'PERTE',
            'trouve': 'DECOUVERTE',
            'trouvé': 'DECOUVERTE'
        };

        const typeDocMapping = {
            'CNI': 'CNI',
            'Passeport': 'PASSEPORT',
            'Permis de Conduire': 'PERMIS',
            'Carte Scolaire': 'CARTE_SCOLAIRE',
            'Diplôme': 'DIPLOME',
            'Acte de Naissance': 'ACTE_NAISSANCE'
        };

        const documentData = {
            type: typeMapping[typeDeclarationValue] || 'PERTE',
            typeDocument: typeDocMapping[typeDocumentValue] || typeDocumentValue.toUpperCase().replace(/ /g, '_'),
            nomPartiel: document.getElementById("nom").value,
            numeroPartiel: document.getElementById("numero").value,
            localisation: {
                ville: document.getElementById("lieu").value
            },
            dateEvenement: document.getElementById("date").value,
            description: document.getElementById("description").value
        };

        try {
            const response = await fetch(`${API_URL}/api/declarations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(documentData)
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert("Session expirée. Veuillez vous reconnecter.");
                    localStorage.clear();
                    window.location.href = "login.html";
                    return;
                }
                alert(result.message || "Erreur lors de l’enregistrement");
                return;
            }

            alert(result.message || "Déclaration enregistrée avec succès !");
            declarationForm.reset();
        } catch (error) {
            alert("Erreur lors de l’enregistrement");
            console.error(error);
        }
    });
}

/***************************************
 * RECHERCHE DE DOCUMENTS
 ***************************************/
const rechercheForm = document.getElementById("rechercheForm");
const resultatsDiv = document.getElementById("resultats");

if (rechercheForm) {
    rechercheForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Vérification de l'authentification
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vous devez être connecté pour rechercher des documents");
            window.location.href = "login.html";
            return;
        }

        // Construction des paramètres de recherche
        const params = new URLSearchParams();

        const typeDeclaration = document.getElementById("r_typeDeclaration").value;
        const typeDocument = document.getElementById("r_typeDocument").value;
        const nom = document.getElementById("r_nom").value;
        const numero = document.getElementById("r_numero").value;
        const lieu = document.getElementById("r_lieu").value;
        const dateDebut = document.getElementById("r_dateDebut").value;
        const dateFin = document.getElementById("r_dateFin").value;

        // Ajouter seulement les paramètres non vides
        if (typeDeclaration) params.append("type", typeDeclaration);
        if (typeDocument) params.append("typeDocument", typeDocument);
        if (nom) params.append("search", nom);
        if (numero) params.append("search", numero);
        if (lieu) params.append("ville", lieu);
        if (dateDebut) params.append("dateDebut", dateDebut);
        if (dateFin) params.append("dateFin", dateFin);

        console.log("🔍 Recherche avec paramètres:", Object.fromEntries(params));

        try {
            const response = await fetch(`${API_URL}/api/declarations?${params.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log("📡 Réponse recherche:", response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert("Session expirée. Veuillez vous reconnecter.");
                    localStorage.clear();
                    window.location.href = "login.html";
                    return;
                }
                throw new Error("Erreur de recherche");
            }

            const result = await response.json();
            console.log("📦 Données reçues:", result);

            // Extraire les déclarations du format {success: true, data: [...]}
            const documents = result.success ? result.data : result;
            afficherResultats(documents);
        } catch (error) {
            resultatsDiv.innerHTML = "<p>Erreur lors de la recherche</p>";
            console.error(error);
        }
    });
}

/***************************************
 * AFFICHAGE DES RÉSULTATS
 ***************************************/
function afficherResultats(documents) {
    resultatsDiv.innerHTML = "";

    if (!documents || documents.length === 0) {
        resultatsDiv.innerHTML = "<p>Aucun document trouvé. Essayez avec d'autres critères de recherche.</p>";
        return;
    }

    console.log(`📊 Affichage de ${documents.length} résultat(s)`);

    documents.forEach(doc => {
        const card = document.createElement("div");
        card.className = "result-card";

        // Date formatée
        const dateEvenement = doc.dateEvenement ? new Date(doc.dateEvenement).toLocaleDateString('fr-FR') : 'N/A';
        const dateCreation = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : 'N/A';

        // Localisation
        const lieu = doc.localisation ?
            `${doc.localisation.ville || ''}${doc.localisation.quartier ? ', ' + doc.localisation.quartier : ''}` :
            'Non spécifié';

        // Badge de type
        const typeBadge = doc.type === 'perdu' ?
            '<span style="background: #dc3545; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">📍 PERDU</span>' :
            '<span style="background: #28a745; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">✅ RETROUVÉ</span>';

        // Badge de statut
        const statutBadge = doc.statut === 'actif' ?
            '<span style="background: #ffc107; color: black; padding: 5px 10px; border-radius: 5px; font-size: 12px;">🔔 Actif</span>' :
            '<span style="background: #6c757d; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">✔️ Résolu</span>';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h3 style="margin: 0;">${doc.typeDocument}</h3>
                <div style="display: flex; gap: 10px;">
                    ${typeBadge}
                    ${statutBadge}
                </div>
            </div>
            <p><strong>Nom partiel :</strong> ${doc.nomPartiel || 'Non renseigné'}</p>
            <p><strong>Numéro partiel :</strong> ${doc.numeroPartiel || 'Non renseigné'}</p>
            <p><strong>Lieu :</strong> ${lieu}</p>
            <p><strong>Date de l'événement :</strong> ${dateEvenement}</p>
            <p><strong>Description :</strong> ${doc.description || 'Aucune description'}</p>
            <p style="font-size: 12px; color: #6c757d;"><strong>Déclaré le :</strong> ${dateCreation}</p>
            ${doc.utilisateur ? `<p style="font-size: 12px; color: #6c757d;"><strong>Par :</strong> ${doc.utilisateur.username || 'Utilisateur inconnu'}</p>` : ''}
        `;

        resultatsDiv.appendChild(card);
    });
}

