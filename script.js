/* =========================
   DATA
========================= */

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let goal =
    JSON.parse(localStorage.getItem("goal")) || {
        name: "My Savings",
        target: 0
    };


/* =========================
   ELEMENTS
========================= */

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionsElement =
    document.getElementById("transactions");

const goalName =
    document.getElementById("goalName");

const goalAmount =
    document.getElementById("goalAmount");

const goalPercent =
    document.getElementById("goalPercent");

const progressBar =
    document.getElementById("progressBar");


/* =========================
   FORMAT MONEY
========================= */

function formatMoney(amount) {

    return "Rs. " + Number(amount).toLocaleString(
        "en-LK",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =========================
   UPDATE DASHBOARD
========================= */

function updateDashboard() {

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else {

            expense += Number(transaction.amount);

        }

    });

    const balance = income - expense;

    incomeElement.textContent =
        formatMoney(income);

    expenseElement.textContent =
        formatMoney(expense);

    balanceElement.textContent =
        formatMoney(balance);


    updateTransactions();

    updateGoal();

}


/* =========================
   UPDATE TRANSACTIONS
========================= */

function updateTransactions() {

    if (transactions.length === 0) {

        transactionsElement.innerHTML = `
            <div class="empty-state">
                <span>💰</span>
                <p>No transactions yet</p>
                <small>Add your first income or expense.</small>
            </div>
        `;

        return;
    }


    transactionsElement.innerHTML = "";


    // Show newest first
    const recent =
        [...transactions]
        .reverse()
        .slice(0, 5);


    recent.forEach(transaction => {

        const div =
            document.createElement("div");

        div.className = "transaction";


        const icon =
            transaction.type === "income"
            ? "💰"
            : getCategoryIcon(transaction.category);


        const sign =
            transaction.type === "income"
            ? "+"
            : "-";


        const amountClass =
            transaction.type === "income"
            ? "income-text"
            : "expense-text";


        div.innerHTML = `

            <div class="transaction-left">

                <div class="transaction-icon">
                    ${icon}
                </div>

                <div class="transaction-info">

                    <h4>${escapeHTML(transaction.description)}</h4>

                    <small>
                        ${escapeHTML(transaction.category)}
                    </small>

                </div>

            </div>

            <div class="transaction-amount ${amountClass}">
                ${sign}${formatMoney(transaction.amount)}
            </div>

        `;


        transactionsElement.appendChild(div);

    });

}


/* =========================
   CATEGORY ICON
========================= */

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",

        Transport: "🚌",

        Shopping: "🛍️",

        Education: "📚",

        Bills: "💡",

        Salary: "💼",

        Other: "📌"

    };

    return icons[category] || "📌";

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================
   OPEN TRANSACTION MODAL
========================= */

function openModal(type = "expense") {

    const modal =
        document.getElementById("transactionModal");

    const typeSelect =
        document.getElementById("transactionType");

    typeSelect.value = type;

    document.getElementById("modalTitle").textContent =
        type === "income"
        ? "Add Income 💰"
        : "Add Expense 💸";

    modal.classList.add("show");

}


/* =========================
   CLOSE TRANSACTION MODAL
========================= */

function closeModal() {

    document
        .getElementById("transactionModal")
        .classList.remove("show");

    document
        .getElementById("transactionForm")
        .reset();

}


/* =========================
   TRANSACTION TYPE CHANGE
========================= */

document
    .getElementById("transactionType")
    .addEventListener("change", function () {

        document.getElementById("modalTitle").textContent =
            this.value === "income"
            ? "Add Income 💰"
            : "Add Expense 💸";

    });


/* =========================
   SAVE TRANSACTION
========================= */

document
    .getElementById("transactionForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const type =
            document.getElementById("transactionType").value;

        const description =
            document.getElementById("description").value.trim();

        const amount =
            Number(document.getElementById("amount").value);

        const category =
            document.getElementById("category").value;


        if (!description || amount <= 0) {

            alert("Please enter valid information.");

            return;

        }


        const transaction = {

            id: Date.now(),

            type: type,

            description: description,

            amount: amount,

            category: category,

            date: new Date().toISOString()

        };


        transactions.push(transaction);


        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );


        closeModal();

        updateDashboard();

    });


/* =========================
   GOAL MODAL
========================= */

function openGoalModal() {

    document
        .getElementById("goalModal")
        .classList.add("show");

    document
        .getElementById("goalInputName")
        .value = goal.name;

    document
        .getElementById("goalInputAmount")
        .value = goal.target || "";

}


function closeGoalModal() {

    document
        .getElementById("goalModal")
        .classList.remove("show");

}


/* =========================
   SAVE GOAL
========================= */

document
    .getElementById("goalForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document
            .getElementById("goalInputName")
            .value
            .trim();


        const target =
            Number(
                document
                .getElementById("goalInputAmount")
                .value
            );


        if (!name || target <= 0) {

            alert("Please enter a valid goal.");

            return;

        }


        goal = {

            name: name,

            target: target

        };


        localStorage.setItem(
            "goal",
            JSON.stringify(goal)
        );


        closeGoalModal();

        updateGoal();

    });


/* =========================
   UPDATE GOAL
========================= */

function updateGoal() {

    goalName.textContent =
        goal.name;


    let income = 0;
    let expense = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else {

            expense += Number(transaction.amount);

        }

    });


    const savedAmount =
        Math.max(0, income - expense);


    if (goal.target > 0) {

        let percentage =
            (savedAmount / goal.target) * 100;


        percentage =
            Math.min(100, percentage);


        goalAmount.textContent =
            `${formatMoney(savedAmount)} / ${formatMoney(goal.target)}`;


        goalPercent.textContent =
            Math.round(percentage) + "%";


        progressBar.style.width =
            percentage + "%";

    } else {

        goalAmount.textContent =
            "Rs. 0 / Rs. 0";

        goalPercent.textContent =
            "0%";

        progressBar.style.width =
            "0%";

    }

}


/* =========================
   SHOW ALL TRANSACTIONS
========================= */

function showAllTransactions() {

    if (transactions.length === 0) {

        alert("No transactions available yet.");

        return;

    }


    let message =
        "Transaction History\n\n";


    [...transactions]
        .reverse()
        .forEach((transaction, index) => {

            const sign =
                transaction.type === "income"
                ? "+"
                : "-";


            message +=
                `${index + 1}. ${transaction.description} ` +
                `${sign}${formatMoney(transaction.amount)}\n`;

        });


    alert(message);

}


/* =========================
   DARK MODE
========================= */

const themeBtn =
    document.getElementById("themeBtn");


if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}


themeBtn.addEventListener("click", function() {

    document.body.classList.toggle("dark");


    const dark =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "darkMode",
        dark
    );


    themeBtn.textContent =
        dark ? "☀️" : "🌙";

});


/* =========================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================= */

document
    .getElementById("transactionModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeModal();

        }

    });


document
    .getElementById("goalModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeGoalModal();

        }

    });


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function() {

        navigator.serviceWorker
            .register("service-worker.js")
            .then(function() {

                console.log(
                    "Service Worker registered successfully."
                );

            })
            .catch(function(error) {

                console.log(
                    "Service Worker registration failed:",
                    error
                );

            });

    });

}


/* =========================
   INITIAL LOAD
========================= */

updateDashboard();