// to hold the db connection 
let db;

// IndexedDB DATABASE budget_tracker and create version 1
const request = indexedDB.open('budget_tracker', 1);

// ends the event if the database version is changed
request.onupgradeneeded = function(event) {

    //saving a reference to the datebase
    const db = event.target.result;

    //creating a table aka new transaction and setting up an auto incrementing primary key 
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon success
request.onsuccess = function(event) {

    //successfully created db with its table or established connection, this saves the db into a global variable
    db = event.target.result;

    // to check if the application is online if it is it sends the local db data to the api
    if (navigator.onLine) {

    }
};

request.onerror = function(event) {
    // log the error 
    console.log(event.target.errorCode);
};

// attempting to submit a new transaction with n o intedrnect connection 
function saveRecord(record) {

    // opening a new transactionw ith read and write permissions in the databasde
    const transaction = db.transaction(['new_transaction'], 'readwrite');

   // accessing the table for a new transaction
   const budgetObjectStore = transaction.objectStore('new_transaction');

    // adding the option to record in your table using an add method
    budgetObjectStore.add(record);
}

// adding a new transaction 
function uploadTransaction() {
    // to open a transaction in the db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // accessing your table 
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // sets all recorded information to a variable 
     const getAll = budgetObjectStore.getAll();

     // when the information is successfully recorded to a variable creates this function
     getAll.onsuccess = function() {

        // when there id data stored in the indexedDb it is sent to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'

                }
            })
            // error response message
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }
                    // open another transaction 
                    const transaction = db.transaction(['new_transaction'], 'readwrite');

                    // accessing the new transaction's table 
                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    //clearing all items in the store
                    budgetObjectStore.clear();

                    // message shnowing that all transactions have been saved and submitted
                    alert('All transactions that have been saved have been submitted');

                })

            .catch(err => {
                console.log(err);
            });    
        }
     }
}

// for the app coming back online 
window.addEventListener('online', uploadTransaction);