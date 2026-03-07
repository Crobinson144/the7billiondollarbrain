// State data for dashboard
const stateData = [
    { state: "California", members: 6741 },
    { state: "New York", members: 4382 },
    { state: "Texas", members: 3892 },
    { state: "Georgia", members: 3104 },
    { state: "Illinois", members: 2988 },
    { state: "Florida", members: 2743 },
];

function populateDashboard() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
    stateData.forEach(state => {
        const remaining = 10000 - state.members;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${state.state}</td><td>${state.members}</td><td>10,000</td><td>${remaining}</td>`;
        tableBody.appendChild(row);
    });
}

// Application form handler
document.getElementById('inner-circle-application')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    setTimeout(() => {
        document.getElementById('application-message').innerHTML = 'Application received. We will review within 7-10 days.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }, 1000);
});

// Run on page load
document.addEventListener('DOMContentLoaded', populateDashboard);