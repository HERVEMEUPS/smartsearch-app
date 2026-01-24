from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)


def get_db():
    return sqlite3.connect("database.db")


def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_document TEXT,
            nom_proprietaire TEXT,
            numero_document TEXT,
            lieu_perte TEXT,
            date_perte TEXT
        )
    """)
    db.commit()
    db.close()


init_db()


@app.route("/api/declarer", methods=["POST"])
def declarer_document():
    data = request.json

    db = get_db()
    db.execute("""
        INSERT INTO documents
        (type_document, nom_proprietaire, numero_document, lieu_perte, date_perte)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["type_document"],
        data["nom_proprietaire"],
        data["numero_document"],
        data["lieu_perte"],
        data["date_perte"]
    ))
    db.commit()
    db.close()

    return jsonify({"message": "Document déclaré avec succès"}), 201


@app.route("/api/rechercher", methods=["GET"])
def rechercher_document():
    mot_cle = request.args.get("q")

    db = get_db()
    cursor = db.execute("""
        SELECT * FROM documents
        WHERE type_document LIKE ?
        OR nom_proprietaire LIKE ?
        OR numero_document LIKE ?
    """, (f"%{mot_cle}%", f"%{mot_cle}%", f"%{mot_cle}%"))

    resultats = cursor.fetchall()
    db.close()

    documents = []
    for doc in resultats:
        documents.append({
            "type_document": doc[1],
            "nom_proprietaire": doc[2],
            "numero_document": doc[3],
            "lieu_perte": doc[4],
            "date_perte": doc[5]
        })

    return jsonify(documents)


if __name__ == "__main__":
    app.run(debug=True)
