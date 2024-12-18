// Initialize the map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Simulated flood sensor data with hospital and emergency numbers
const floodData = [
    {
        state: "Andhra Pradesh",
        city: "Vijayawada",
        coords: [16.5062, 80.6480],
        waterLevel: 6.8,
        hospitals: [
            { name: "Andhra Hospital", contact: "0866-2426666" },
            { name: "Ramesh Hospitals", contact: "0866-2480000" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Assam",
        city: "Guwahati",
        coords: [26.1445, 91.7362],
        waterLevel: 5.4,
        hospitals: [
            { name: "GNRC Hospital", contact: "0361-2345678" },
            { name: "Down Town Hospital", contact: "0361-2331000" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Bihar",
        city: "Patna",
        coords: [25.5941, 85.1376],
        waterLevel: 4.2,
        hospitals: [
            { name: "Patna Medical College", contact: "0612-2302226" },
            { name: "AIIMS Patna", contact: "0612-2451070" }
        ],
        emergencyNumber: "112"
    },
  {
        state: "Gujarat",
        city: "Ahmedabad",
        coords: [23.0225, 72.5714],
        waterLevel: 6.5,
        hospitals: [
            { name: "Civil Hospital", contact: "079-22680074" },
            { name: "Sterling Hospital", contact: "079-40023244" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Karnataka",
        city: "Bengaluru",
        coords: [12.9716, 77.5946],
        waterLevel: 2.8,
        hospitals: [
            { name: "Fortis Hospital", contact: "080-66214444" },
            { name: "Manipal Hospital", contact: "080-25023256" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Kerala",
        city: "Thiruvananthapuram",
        coords: [8.5241, 76.9366],
        waterLevel: 3.2,
        hospitals: [
            { name: "SUT Hospital", contact: "0471-2347888" },
            { name: "KIMS Hospital", contact: "0471-3041400" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Maharashtra",
        city: "Mumbai",
        coords: [19.0760, 72.8777],
        waterLevel: 7.1,
        hospitals: [
            { name: "Breach Candy Hospital", contact: "022-23667800" },
            { name: "Hiranandani Hospital", contact: "022-25763500" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Tamil Nadu",
        city: "Chennai",
        coords: [13.0827, 80.2707],
        waterLevel: 4.9,
        hospitals: [
            { name: "Apollo Hospital", contact: "044-28293222" },
            { name: "Global Hospital", contact: "044-44777000" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "Uttar Pradesh",
        city: "Lucknow",
        coords: [26.8467, 80.9462],
        waterLevel: 5.7,
        hospitals: [
            { name: "KGMU", contact: "0522-2258880" },
            { name: "Sahara Hospital", contact: "0522-6780001" }
        ],
        emergencyNumber: "108"
    },
    {
        state: "West Bengal",
        city: "Kolkata",
        coords: [22.5726, 88.3639],
        waterLevel: 4.9,
        hospitals: [
            { name: "AMRI Hospital", contact: "033-66254400" },
            { name: "Apollo Gleneagles", contact: "033-23203040" }
        ],
        emergencyNumber: "108"
    }

    // Add more locations as needed
];

// Flood thresholds
const HIGH_FLOOD_THRESHOLD = 6.5;
const LOW_FLOOD_THRESHOLD = 5.0;

// Notification permission request
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

// Get user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        document.getElementById("location-status").innerText = Your Location: ${userLat.toFixed(2)}, ${userLon.toFixed(2)};

        // Center map to user's location
        map.setView([userLat, userLon], 7);
        L.marker([userLat, userLon]).addTo(map).bindPopup("You are here!").openPopup();

        // Check nearby flood alerts
        checkFloodAlerts(userLat, userLon);
    }, () => {
        document.getElementById("location-status").innerText = "Geolocation access denied.";
    });
} else {
    document.getElementById("location-status").innerText = "Geolocation is not supported by this browser.";
}

// Function to calculate distance between two coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to check flood alerts for nearby locations
function checkFloodAlerts(userLat, userLon) {
    const alertBlock = document.getElementById("alert-block");
    const hospitalDetails = document.getElementById("hospital-details");
    const emergencyNumbers = document.getElementById("emergency-numbers");

    let highFloodNearby = false;
    let lowFloodNearby = false;

    floodData.forEach(location => {
        const distance = getDistance(userLat, userLon, location.coords[0], location.coords[1]);

        // Consider locations within 100 km as "nearby"
        if (distance <= 100) {
            if (location.waterLevel > HIGH_FLOOD_THRESHOLD) {
                highFloodNearby = true;
                sendNotification("High Flood Alert", ${location.city}, ${location.state} is at high risk of flooding!);
                alertBlock.innerText = ⚠ High Flood Risk Nearby in ${location.city}, ${location.state};
                alertBlock.className = "alert high-flood";
                displayHospitalInfo(location.hospitals, location.emergencyNumber);
            } else if (location.waterLevel > LOW_FLOOD_THRESHOLD) {
                lowFloodNearby = true;
                alertBlock.innerText = ⚠ Low Flood Risk Nearby in ${location.city}, ${location.state};
                alertBlock.className = "alert low-flood";
                displayHospitalInfo(location.hospitals, location.emergencyNumber);
            }
        }
    });

    if (!highFloodNearby && !lowFloodNearby) {
        alertBlock.innerText = "✅ No Flood Risk Nearby.";
        alertBlock.className = "alert no-flood";
        hospitalDetails.innerHTML = "No hospital details to display.";
        emergencyNumbers.innerHTML = "No emergency numbers to display.";
    }
}

// Function to display hospital and emergency details
function displayHospitalInfo(hospitals, emergencyNumber) {
    const hospitalDetails = document.getElementById("hospital-details");
    const emergencyNumbers = document.getElementById("emergency-numbers");

    hospitalDetails.innerHTML = <strong>Nearby Hospitals:</strong><br>;
    hospitals.forEach(hospital => {
        hospitalDetails.innerHTML += ${hospital.name} - ${hospital.contact}<br>;
    });

    emergencyNumbers.innerHTML = <strong>Emergency Number:</strong> ${emergencyNumber};
}

// Function to send browser notifications
function sendNotification(title, body) {
    if (Notification.permission === "granted") {
