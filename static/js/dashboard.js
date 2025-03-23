// Speech-to-text functionality
document.getElementById('speechToTextBtn').addEventListener('click', function () {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('queryInput').value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('Speech recognition failed. Please try again.');
    };
});

// Function to display query history
async function displayQueries(patientId) {
    const queryList = document.getElementById('queryList');
    queryList.innerHTML = ''; // Clear existing content

    try {
        // Fetch queries from the backend
        const response = await fetch(`http://localhost:3000/api/queries?patientId=${patientId}`);
        const queries = await response.json();

        queries.forEach(query => {
            const queryItem = document.createElement('div');
            queryItem.classList.add('query-item');

            // Add a class based on verification status
            if (query.status === 'Verified' || query.status === 'Edited') {
                queryItem.classList.add('verified');
            } else {
                queryItem.classList.add('unverified');
            }

            queryItem.innerHTML = `
                <h3>${query.query_text}</h3>
                <p><strong>Status:</strong> <span class="status">${query.status}</span></p>
                ${query.ai_response ? `<p><strong>Response:</strong> ${query.ai_response}</p>` : ''}
            `;

            queryList.appendChild(queryItem);
        });
    } catch (error) {
        console.error('Error fetching queries:', error);
    }
}

// Function to handle new query submission
document.getElementById('queryForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const queryInput = document.getElementById('queryInput').value;
    const patientId = localStorage.getItem('patientId'); // Get patientId from localStorage

    if (queryInput.trim() === '') {
        alert('Please enter a valid query.');
        return;
    }

    try {
        // Send the new query to the backend
        const response = await fetch('http://localhost:3000/api/queries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patientId: patientId,
                queryText: queryInput,
            }),
        });

        if (response.ok) {
            // Refresh the query list
            displayQueries(patientId);
        } else {
            console.error('Error submitting query:', response.statusText);
        }
    } catch (error) {
        console.error('Error submitting query:', error);
    }

    // Clear the input field
    document.getElementById('queryInput').value = '';
});

// Display initial queries on page load
const patientId = localStorage.getItem('patientId'); // Get patientId from localStorage
if (patientId) {
    displayQueries(patientId);
} else {
    console.error('Patient ID not found. Please log in again.');
}