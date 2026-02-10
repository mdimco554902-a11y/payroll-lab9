// 1. Select DOM Elements
const payrollForm = document.getElementById('payrollForm');
const payrollTbody = document.getElementById('payrollTbody');
const resetBtn = document.getElementById('resetBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Summary Elements
const sumEmployees = document.getElementById('sumEmployees');
const sumGross = document.getElementById('sumGross');
const sumDed = document.getElementById('sumDed');
const sumNet = document.getElementById('sumNet');

// New Elements for Modal and Clickable Box
const netBox = document.getElementById('netBox');
const modal = document.getElementById('summaryModal');
const modalStats = document.getElementById('modalStats');

// Data Array to store payroll records
let payrollData = [];

// 2. Event Listeners
payrollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addPayroll();
});

resetBtn.addEventListener('click', () => {
    payrollForm.reset();
    document.getElementById('msg').textContent = "Form cleared.";
});

clearAllBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all records?")) {
        payrollData = [];
        updateUI();
    }
});

// Listener for the Clickable Total Net box
if (netBox) {
    netBox.addEventListener('click', openSummary);
}

// 3. Core Functions
function addPayroll() {
    // Get values from inputs
    const name = document.getElementById('empName').value;
    const hours = parseFloat(document.getElementById('hours').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const taxRate = parseFloat(document.getElementById('tax').value) / 100;
    const otherDed = parseFloat(document.getElementById('otherDed').value);

    // Calculations
    const grossPay = hours * rate;
    const taxAmount = grossPay * taxRate;
    const totalDeductions = taxAmount + otherDed;
    const netPay = grossPay - totalDeductions;

    // Create record object
    const record = {
        id: Date.now(),
        name,
        hours,
        rate,
        grossPay,
        taxAmount,
        otherDed,
        netPay
    };

    // Add to data array and update UI
    payrollData.push(record);
    updateUI();
    payrollForm.reset();
    document.getElementById('msg').textContent = "Employee added successfully!";
}

function deleteRecord(id) {
    payrollData = payrollData.filter(item => item.id !== id);
    updateUI();
}

// Edit Function: Pulls data back to form and removes the old entry
function editRecord(id) {
    const item = payrollData.find(i => i.id === id);
    if (item) {
        document.getElementById('empName').value = item.name;
        document.getElementById('hours').value = item.hours;
        document.getElementById('rate').value = item.rate;
        // Reverse tax calculation for the input field
        document.getElementById('tax').value = (item.taxAmount / item.grossPay) * 100;
        document.getElementById('otherDed').value = item.otherDed;
        
        // Remove the old record so it can be "updated" on next submit
        deleteRecord(id);
        document.getElementById('empName').focus();
        document.getElementById('msg').textContent = "Editing... Click 'Add Payroll' to save.";
    }
}

// 4. Modal Functions
function openSummary() {
    if (payrollData.length === 0) {
        alert("No data available for summary.");
        return;
    }

    modalStats.innerHTML = `
        <div class="modal-row"><span>Total Employees:</span> <span>${payrollData.length}</span></div>
        <div class="modal-row"><span>Gross Revenue:</span> <span>${sumGross.textContent}</span></div>
        <div class="modal-row"><span>Total Deductions:</span> <span style="color: var(--danger)">${sumDed.textContent}</span></div>
        <div class="modal-row" style="border: none; font-weight: bold; margin-top: 10px;">
            <span>Final Net Payout:</span> <span style="color: var(--ok)">${sumNet.textContent}</span>
        </div>
    `;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// Close modal if user clicks outside the content
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// 5. UI Update Function (The "Engine")
function updateUI() {
    // Clear current table
    payrollTbody.innerHTML = '';

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    payrollData.forEach((item, index) => {
        totalGross += item.grossPay;
        totalDeductions += (item.taxAmount + item.otherDed);
        totalNet += item.netPay;

        // Create table row with both Edit and Delete buttons
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.hours.toFixed(2)}</td>
            <td>₱${item.rate.toFixed(2)}</td>
            <td>₱${item.grossPay.toFixed(2)}</td>
            <td>₱${item.taxAmount.toFixed(2)}</td>
            <td>₱${item.otherDed.toFixed(2)}</td>
            <td style="color: var(--ok)"><strong>₱${item.netPay.toFixed(2)}</strong></td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button class="secondary" style="color: var(--accent); padding: 4px 8px;" onclick="editRecord(${item.id})">Edit</button>
                    <button class="secondary" style="color: var(--danger); padding: 4px 8px;" onclick="deleteRecord(${item.id})">Delete</button>
                </div>
            </td>
        `;
        payrollTbody.appendChild(row);
    });

    // Update Summary Boxes
    sumEmployees.textContent = payrollData.length;
    sumGross.textContent = `₱${totalGross.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    sumDed.textContent = `₱${totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    sumNet.textContent = `₱${totalNet.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}
