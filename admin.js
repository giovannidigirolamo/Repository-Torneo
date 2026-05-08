import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnYEtwrhmjT3aJY4dk_vST32cOX-kPe_M",
  authDomain: "torneo-trisport-corridonia.firebaseapp.com",
  projectId: "torneo-trisport-corridonia",
  storageBucket: "torneo-trisport-corridonia.firebasestorage.app",
  messagingSenderId: "330248876134",
  appId: "1:330248876134:web:f8814eda23c8da91063da7"
};

console.log("Inizializzazione Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.aggiungiSquadra = async function() {
    const nome = document.getElementById('new-team-name').value;
    if (!nome) return alert("Inserisci un nome!");

    console.log("Tentativo di aggiunta squadra:", nome);
    try {
        await addDoc(collection(db, "squadre"), { nome: nome });
        console.log("Squadra salvata con successo!");
        document.getElementById('new-team-name').value = "";
        caricaSquadre();
        alert("Squadra aggiunta correttamente!");
    } catch (e) { 
        console.error("ERRORE DURANTE IL SALVATAGGIO:", e);
        alert("Errore: controlla le regole di Firebase o la console.");
    }
}

async function caricaSquadre() {
    console.log("Caricamento lista squadre...");
    try {
        const querySnapshot = await getDocs(query(collection(db, "squadre"), orderBy("nome")));
        const listHtml = document.getElementById('teams-list');
        const selectA = document.getElementById('select-team-a');
        const selectB = document.getElementById('select-team-b');

        listHtml.innerHTML = "";
        selectA.innerHTML = "";
        selectB.innerHTML = "";

        if (querySnapshot.empty) {
            console.log("Nessuna squadra trovata nel database.");
            listHtml.innerHTML = "<li>Nessuna squadra presente.</li>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const squadra = doc.data().nome;
            listHtml.innerHTML += `<li>• ${squadra}</li>`;
            const option = `<option value="${squadra}">${squadra}</option>`;
            selectA.innerHTML += option;
            selectB.innerHTML += option;
        });
        console.log("Squadre caricate correttamente.");
    } catch (e) {
        console.error("ERRORE DURANTE IL CARICAMENTO:", e);
    }
}

window.creaAccoppiamento = async function() {
    const data = document.getElementById('match-date').value;
    const sqA = document.getElementById('select-team-a').value;
    const sqB = document.getElementById('select-team-b').value;

    if (!data || sqA === sqB) return alert("Dati non validi o squadre identiche!");

    try {
        await addDoc(collection(db, "calendario"), {
            data: data,
            squadraA: sqA,
            squadraB: sqB,
            creatoIl: new Date()
        });
        alert(`Sfida creata!`);
    } catch (e) { console.error(e); }
}

caricaSquadre();
