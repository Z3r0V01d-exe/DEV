let records = [];

function addRecord() {
  const documentTitle = document.getElementById("documentTitle").value;
  const documentNumber = document.getElementById("documentNumber").value;
  const originatingOffice = document.getElementById("originatingOffice").value;
  const assignedTo = document.getElementById("assignedTo").value;
  const priority = document.getElementById("priority").value;
  const status = document.getElementById("status").value;
  const dueDate = document.getElementById("dueDate").value;
  const remarks = document.getElementById("remarks").value;

  if (!documentTitle || !documentNumber) {
    alert("Document Title and Document Number are required.");
    return;
  }

  const record = {
    id: Date.now(),
    documentTitle,
    documentNumber,
    originatingOffice,
    assignedTo,
    priority,
    status,
    dueDate,
    remarks,
    dateCreated: new Date().toLocaleString()
  };

  records.unshift(record);
  clearForm();
  renderRecords();
}

function clearForm() {
  document.getElementById("documentTitle").value = "";
  document.getElementById("documentNumber").value = "";
  document.getElementById("originatingOffice").value = "";
  document.getElementById("assignedTo").value = "";
  document.getElementById("priority").value = "Normal";
  document.getElementById("status").value = "Pending";
  document.getElementById("dueDate").value = "";
  document.getElementById("remarks").value = "";
}

function renderRecords() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  const container = document.getElementById("recordsContainer");
  container.innerHTML = "";

  const filtered = records.filter(r =>
    r.documentTitle.toLowerCase().includes(searchValue) ||
    r.documentNumber.toLowerCase().includes(searchValue)
  );

  filtered.forEach(record => {
    const div = document.createElement("div");
    div.className = "record";
    div.innerHTML = `
      <div>
        <strong>${record.documentTitle}</strong>
        <span class="status">${record.status}</span>
      </div>
      <div>#${record.documentNumber} • ${record.originatingOffice}</div>
      <div><strong>Assigned To:</strong> ${record.assignedTo}</div>
      <div><strong>Priority:</strong> ${record.priority}</div>
      <div><strong>Due Date:</strong> ${record.dueDate}</div>
      <div><strong>Remarks:</strong> ${record.remarks}</div>
      <div style="font-size:12px;color:gray;margin-top:5px;">Created: ${record.dateCreated}</div>
    `;
    container.appendChild(div);
  });
}
