function updateAccountCount() {
    var accountsTextarea = document.getElementById("accountsTextarea");
    var accountCheckLabel = document.getElementById("accountCheckLabel");
    var accounts = accountsTextarea.value.split("\n").filter(Boolean); // Split text area content by line breaks and filter out empty lines
    var accountCount = accounts.length;
    if (accountCount > 30) {
        accountsTextarea.value = accounts.slice(0, 30).join("\n"); // Limit textarea to 30 lines
        accountCount = 30;
    }
    accountCheckLabel.textContent = "Accounts to be checked (" + accountCount + ")";
}

function addAccountRow(account) {
    var accountsTable = document.getElementById("accountsTable");
    var newRow = accountsTable.insertRow(-1);
    var accInfoCell = newRow.insertCell(0);
    var resetStatusCell = newRow.insertCell(1);
    accInfoCell.className = "acc_info";
    resetStatusCell.className = "reset_status";
    accInfoCell.textContent = account;
}

function toggleLoading(show) {
    var loadingIndicator = document.getElementById("loadingIndicator");
    if (show) {
        loadingIndicator.style.display = "block";
    } else {
        loadingIndicator.style.display = "none";
    }
}

function sendRequests() {
    toggleLoading(true);
    var accountsTextarea = document.getElementById("accountsTextarea");
    var accounts = accountsTextarea.value.split("\n").filter(Boolean); // Split text area content by line breaks and filter out empty lines

    fetch('/check_account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accounts: accounts, server: document.getElementById("serverSelect").value })
    })
    .then(response => response.json())
    .then(data => {
        toggleLoading(false);
        if (data) {
            accounts.forEach(function(account) {
                addAccountRow(account);
            });

            var resetStatusCells = document.querySelectorAll('.reset_status');
            resetStatusCells.forEach(function(cell) {
                var char = cell.parentNode.querySelector('.acc_info').textContent.trim();
                if (data[char]) {
                    cell.textContent = "Resetou";
                    cell.classList.add('resetou');
                    cell.classList.remove('nao_resetou');
                } else {
                    cell.textContent = "Não Resetou";
                    cell.classList.add('nao_resetou');
                    cell.classList.remove('resetou');
                }
            });
        }
        console.log('Accounts checked successfully.');
    })
    .catch(error => {
        toggleLoading(false);
        console.error('Error checking accounts:', error);
    });
}