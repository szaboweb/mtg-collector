document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display filtered cards only when the filter button is clicked
    document.getElementById('filter').addEventListener('change', () => {
        // Clear existing cards when changing filter criteria
        document.getElementById('cards').innerHTML = '';
    });

    // Handle form submission for adding a new card
    document.getElementById('addCardForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Create a FormData object to collect form data
        const formData = new FormData(this);

        // Send form data to server for adding a new card
        fetch('http://localhost:3300/cards', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Display success message or handle response as needed
            console.log('New card added:', data);
            // Optionally, you can clear the form fields after successful submission
            this.reset();
        })
        .catch(error => {
            console.error('Error adding new card:', error);
            // Display error message or handle error as needed
        });
    });
});
