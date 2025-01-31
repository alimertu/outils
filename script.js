// Déclaration des variables globales pour stocker les résultats
let totalEmissions = 0;
let diffVoiture = 0;
let diffAvion = 0;
let nomUtilisateur = '';
let prenomUtilisateur = '';

const emissionFactors = {
    train: 0.06,           // 60 g CO₂/km
    bus: 0.12,            // 120 g CO₂/km
    avion: 0.152,         // 152 g CO₂/km
    bateau: 0,            // 0 g CO₂/km (selon vos données)
    VoitureElectrique: 0.0367, // 36.7 g CO₂/km
    AutoStop: 0,          // 0 g CO₂/km (émissions partagées ou négligeables)
    carDiesel: 0.099      // 99 g CO₂/km
};

function calculateCarbon() {
    // Récupère les distances et moyens de transport
    const distance = parseFloat((document.getElementById('distance').value)) * 2 || 0; //*2 pour l'allez retour
    const distance1 = parseFloat((document.getElementById('distance1').value)) * 2 || 0;
    const distance2 = parseFloat((document.getElementById('distance2').value)) * 2 || 0;

    const transport = document.getElementById('transport').value;
    const transport1 = document.getElementById('transport1').value;
    const transport2 = document.getElementById('transport2').value;

    // Récupère les informations de l'utilisateur
    nomUtilisateur = document.getElementById('Nom').value;
    prenomUtilisateur = document.getElementById('Prénom').value;

    // Initialise les émissions totales
    totalEmissions = 0;

    // Ajoute les émissions pour chaque mode de transport s'il est valide
    if (distance > 0 && emissionFactors[transport] !== undefined) {
        totalEmissions += distance * emissionFactors[transport];
    }

    if (distance1 > 0 && emissionFactors[transport1] !== undefined) {
        totalEmissions += distance1 * emissionFactors[transport1];
    }

    if (distance2 > 0 && emissionFactors[transport2] !== undefined) {
        totalEmissions += distance2 * emissionFactors[transport2];
    }

    // Vérifie si des distances et transports valides ont été saisis
    if (totalEmissions === 0) {
        document.getElementById('result').innerHTML = "Veuillez entrer au moins une distance et un mode de transport valides.";
        return;
    }

    // Calcul des références pour comparaison
    const distancetotale = distance + distance1 + distance2;
    const bilanVoiture = distancetotale * emissionFactors.carDiesel;
    const bilanAvion = distancetotale * emissionFactors.avion;

    // Calcul des émissions économisées
    diffVoiture = bilanVoiture - totalEmissions;
    diffAvion = bilanAvion - totalEmissions;

    // Génère le résultat final
    let resultHTML = `
        <p>Le résultat de vos émissions totales sur vos trajets est de <strong>${totalEmissions} kg CO₂</strong></p>
        <p>Félicitations ! Sur votre trajet allez-retour, vous avez économisé :</p>
        <ul>
            <li><strong>${diffVoiture.toFixed(2)} kg CO₂</strong> par rapport à un déplacement en voiture diesel.</li>
            <li><strong>${diffAvion.toFixed(2)} kg CO₂</strong> par rapport à un déplacement en avion.</li>
        </ul>
    `;

    // Affiche le résultat
    document.getElementById('result').innerHTML = resultHTML;

    // Affichage de l'histogramme
    displayCarbonChart(diffVoiture, diffAvion);

    // Change la section visible
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
}

// Fonction pour afficher le graphique
function displayCarbonChart(diffVoiture, diffAvion) {
    const ctx = document.getElementById('carbonChart').getContext('2d');
    
    // Création du graphique
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Par rapport à la voiture', 'Par rapport à l"avion'],
            datasets: [{
                label: 'Émissions carbone évités(kg CO₂e)',
                data: [diffVoiture.toFixed(2), diffAvion.toFixed(2)],
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
        ["Nom", "Prénom", "Emission Totales (kg CO₂)","Différence par rapport à la voiture (kg CO₂)", "Différence par rapport à l'avion (kg CO₂)", "Date"],
        [nomUtilisateur, prenomUtilisateur, totalEmissions,diffVoiture.toFixed(2), diffAvion.toFixed(2), date]
    ];

    // Crée un objet de feuille Excel
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Crée un classeur Excel à partir de la feuille
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bilan Carbone");

    // Exporte le fichier Excel
    XLSX.writeFile(wb, "Bilan_Carbone.xlsx");
}

function goBack() {
    // Affiche la section du formulaire
    document.getElementById('form-section').style.display = 'block';

    // Cache la section des résultats
    document.getElementById('result-section').style.display = 'none';

    // Optionnel : Réinitialise les résultats si nécessaire
    document.getElementById('result').innerHTML = '';
}
