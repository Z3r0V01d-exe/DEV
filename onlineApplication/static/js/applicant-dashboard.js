document.addEventListener("DOMContentLoaded", function () {
    loadDashboardData();
});

function loadDashboardData() {

    // Empty array (until database is connected)
    const applications = [];

    const table = document.getElementById("applicationsTable");

    let total = applications.length;
    let underReview = 0;
    let approved = 0;
    let rejected = 0;

    // If there are no applications
    if (applications.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    No application submitted yet.
                </td>
            </tr>
        `;
    } else {

        applications.forEach(app => {

            if (app.status === "Under Review") underReview++;
            if (app.status === "Approved") approved++;
            if (app.status === "Rejected") rejected++;

            let badgeClass = "secondary";
            if (app.status === "Under Review") badgeClass = "warning";
            if (app.status === "Approved") badgeClass = "success";
            if (app.status === "Rejected") badgeClass = "danger";

            table.innerHTML += `
                <tr>
                    <td>${app.position}</td>
                    <td>${app.date}</td>
                    <td><span class="badge bg-${badgeClass}">${app.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Update summary cards (will stay 0 if empty)
    document.getElementById("totalApplications").textContent = total;
    document.getElementById("underReview").textContent = underReview;
    document.getElementById("approvedCount").textContent = approved;
    document.getElementById("rejectedCount").textContent = rejected;
}