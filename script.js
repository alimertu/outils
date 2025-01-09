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
    const distance = parseFloat((document.getElementById('distance').value))*2|| 0; //*2 pour l'allez retour
    const distance1 = parseFloat((document.getElementById('distance1').value))*2 || 0;
    const distance2 = parseFloat((document.getElementById('distance2').value)) *2 || 0;

    const transport = document.getElementById('transport').value;
    const transport1 = document.getElementById('transport1').value;
    const transport2 = document.getElementById('transport2').value;

    // Initialise les émissions totales
    let totalEmissions = 0;

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
    const diffVoiture = bilanVoiture - totalEmissions;
    const diffAvion = bilanAvion - totalEmissions;

    // Génère le résultat final
    let resultHTML = `
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

function goBack() {
    // Affiche la section du formulaire
    document.getElementById('form-section').style.display = 'block';

    // Cache la section des résultats
    document.getElementById('result-section').style.display = 'none';

    // Optionnel : Réinitialise les résultats si nécessaire
    document.getElementById('result').innerHTML = '';
}