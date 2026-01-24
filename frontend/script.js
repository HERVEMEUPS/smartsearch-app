function declarerDocument() {
    const data = {
        type_document: document.getElementById("type").value,
        nom_proprietaire: document.getElementById("nom").value,
        numero_document: document.getElementById("numero").value,
        lieu_perte: document.getElementById("lieu").value,
        date_perte: document.getElementById("date").value
    };

    fetch("http://127.0.0.1:5000/api/declarer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => alert(data.message));
}

function rechercherDocument() {
    const motCle = document.getElementById("motCle").value;

    fetch(`http://127.0.0.1:5000/api/rechercher?q=${motCle}`)
        .then(res => res.json())
        .then(docs => {
            let resultat = document.getElementById("resultats");
            resultat.innerHTML = "";

            docs.forEach(doc => {
                resultat.innerHTML += `
                    <li>${doc.type_document} - ${doc.nom_proprietaire} - ${doc.numero_document}</li>
                `;
            });
        });
}
