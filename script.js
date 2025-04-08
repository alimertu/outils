const zeroEmissionModes = ['marche', 'velo', 'voilier'];
let emissionVoiture = null;
let emissionAvion = null;
let totalCO2 = 0;
let ecoVoiture=0;
let ecoAvion=0;
let nom =''; 
  let prenom =''; 
  let ville =''; 


async function fetchEmissionFactorById(id) {
  const url = `https://data.ademe.fr/data-fair/api/v1/datasets/base-carboner/lines?qs=Identifiant_de_l'élément:"${id}"&size=1`;
  const response = await fetch(url);
  const data = await response.json();
  return parseFloat(data.results[0]?.Total_poste_non_décomposé || 0);
}

// Charger les facteurs voiture et avion au chargement
window.addEventListener("DOMContentLoaded", async () => {
  try {
    emissionVoiture = await fetchEmissionFactorById(27987);
    emissionAvion = await fetchEmissionFactorById(21768);
    console.log("Facteurs chargés : voiture =", emissionVoiture, "avion =", emissionAvion);
  } catch (e) {
    console.error("Erreur chargement voiture/avion", e);
  }
});

function formatTexte(texte) {
  return texte
    .trim()                     // Enlève les espaces en début/fin
    //.toLowerCase()              // Tout en minuscules
    //.replace(/\s+/g, '')        // Supprime tous les espaces
    .replace(/^./, c => c.toUpperCase()); // Majuscule sur la 1re lettre
}

async function calculerCO2() {
  const transports = document.querySelectorAll(".transport");
  const distances = document.querySelectorAll(".distance");
 // const resultDiv = document.getElementById("result");
nom = formatTexte(document.getElementById("Nom").value);
prenom= formatTexte(document.getElementById("Prénom").value) ;
ville= formatTexte(document.getElementById("ville").value);
  
  if (!nom && !prenom && !ville) {
    alert("Merci de remplir nom, prénom et ville !");
    return;
  }
  if (!prenom) {
    alert("Merci de remplir le  prénom !");
    return;
  }
  if (!ville) {
    alert("Merci de remplir la ville !");
    return;
  }

  
  let totalDistance = 0;
  let detail = "";

  for (let i = 0; i < transports.length; i++) {
    const mode = transports[i].value;
    const dist = parseFloat(distances[i].value);

    if (!mode || isNaN(dist) || dist <= 0) continue;

    totalDistance += dist;

    let facteur = 0;
    if (!zeroEmissionModes.includes(mode)) {
      const id = transports[i].options[transports[i].selectedIndex].dataset.id;
      if (id) {
        try {
          facteur = await fetchEmissionFactorById(id);
        } catch (e) {
          detail += `❌ Erreur facteur pour ${mode}<br>`;
          continue;
        }
      }
    }

    const emission = facteur * dist;
    totalCO2 += emission;
    detail += `✅ ${mode} – ${dist} km × ${facteur.toFixed(3)} = <strong>${emission.toFixed(2)} kg CO₂</strong><br>`;
  }

  // Comparaison
  const voitureCO2 = emissionVoiture ? emissionVoiture * totalDistance : 0;
  const avionCO2 = emissionAvion ? emissionAvion * totalDistance : 0;

   ecoVoiture = voitureCO2 - totalCO2;
   ecoAvion = avionCO2 - totalCO2;

 const  resultDiv = `
    <h3>🧾 Résumé pour ${prenom} ${nom} (${ville})</h3>
    <h4>Détails des trajets :</h4>
    ${detail}
    <p><strong>🌍 Émissions totales : ${totalCO2.toFixed(2)} kg CO₂</strong></p>
    <hr>
    <u>Comparaison sur ${totalDistance.toFixed(1)} km :</u><br>
    🚗 Voiture : ${voitureCO2.toFixed(2)} kg CO₂<br>
    ✈️ Avion : ${avionCO2.toFixed(2)} kg CO₂<br><br>
    <p>Bravo sur votre trajet allez-retour vous avez économisé :
   <p> ✅ <strong>${ecoVoiture.toFixed(2)} kg CO₂</strong>  rapport à la voiture </p>
   <p> ✅ Économie  <strong>${ecoAvion.toFixed(2)} kg CO₂</strong> par rapport à l'avion </p>
  `;

  document.getElementById('result').innerHTML = resultDiv;
  document.getElementById('form-section').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';

   // Affichage de l'histogramme
   displayCarbonChart(ecoVoiture, ecoAvion);


}
function  affichergraphe(){
  document.getElementById('result-section').style.display = 'none';
  document.getElementById('canva-section').style.display ='block';
}

  // Fonction pour afficher le graphique
// Fonction pour afficher le graphique
function displayCarbonChart(ecoVoiture, ecoAvion) {
  const ctx = document.getElementById('carbonChart').getContext('2d');

  // Création du graphique
  new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ['Par rapport à la voiture', 'Par rapport à l\'avion'],
          datasets: [{
              label: 'Émissions carbone évités(kg CO₂e)',
              data: [ecoVoiture.toFixed(2), ecoAvion.toFixed(2)],
              backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
              borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: 'Émissions (kg CO₂e)'
                  }
              }
          },
          plugins: {
              legend: {
                  display: false
              }
          }
      }
  });
}
// Fonction pour générer et télécharger le fichier Excel
function generateExcel() {
    // Récupère la date actuelle
    const date = new Date().toLocaleDateString('fr-FR');  // Formate la date en français (jour/mois/année)
    

    // Prépare les données à insérer dans le fichier Excel
    const data = [
        ["Nom", "Prénom", "Ville du stage", "Emission Totales (kg CO₂)","Différence par rapport à la voiture (kg CO₂)", "Différence par rapport à l'avion (kg CO₂)", "Date"],
        [nom, prenom, ville, totalCO2.toFixed(2),ecoVoiture.toFixed(2), ecoAvion.toFixed(2), date]
    ];

    // Crée un objet de feuille Excel
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Crée un classeur Excel à partir de la feuille
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bilan Carbone");

    const fileName = `${nom}_${prenom}_Bilan_Carbone.xlsx`;

    // Exporte le fichier Excel
    XLSX.writeFile(wb, fileName);
}

function goBack(){
  document.getElementById('canva-section').style.display='none';
  document.getElementById('result-section').style.display='block';
}

