const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;
const WINDOW_SIZE = 10;

let storedNumbers = [];
let accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTQ3Mzk1LCJpYXQiOjE3MTUxNDcwOTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVhYzIzOGRiLTQ2ZGYtNDY0YS1hYzJjLTg0YTg5YTJjYmY2MyIsInN1YiI6IjIxMDUxNzgyQGtpaXQuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJkbW1hcnQiLCJjbGllbnRJRCI6IjVhYzIzOGRiLTQ2ZGYtNDY0YS1hYzJjLTg0YTg5YTJjYmY2MyIsImNsaWVudFNlY3JldCI6IlNPam1IamlEVkFTZm5TRWEiLCJvd25lck5hbWUiOiJXQU5TSCBTVVJFTkRFUiBCSVNXQUtBUk1BIiwib3duZXJFbWFpbCI6IjIxMDUxNzgyQGtpaXQuYWMuaW4iLCJyb2xsTm8iOiIyMTA1MTc4MiJ9.mZ150auOGRSzDGjyNOJmn_Oym4S8PM0airR3z1jcsu8';


// Fetch numbers from the third-party server based on type
const fetchNumbers = async (type) => {
    let x;
    switch (type) {
        case 'p':
            x = 'primes';
            break;

        case 'e':
            x = 'even';
            break;

        case 'f':
            x = 'fibo';
            break;

        case 'r':
            x = 'rand';
            break;
    
        default:
            break;
    }

    console.log("server api",x);
    try {
        const response = await fetch(`http://20.244.56.144/test/even`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("res", data);
        return data.numbers;
    } catch (error) {
        console.error(`Error fetching ${x} numbers: ${error.message}`);
        return [];
    }
};


// Calculate average of numbers
const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

// Middleware to handle requests
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    const prevWindow = [...storedNumbers];
    
    // Fetch numbers from third-party server
    const fetchedNumbers = await fetchNumbers(numberid);
    console.log("numberid",numberid);
    
    // Filter out duplicates and ensure uniqueness
    const uniqueNumbers = fetchedNumbers.filter(num => !storedNumbers.includes(num));
    
    // Ignore responses taking longer than 500 ms or encountering errors
    if (fetchedNumbers.length === 0) {
        return res.status(500).json({ error: `No valid numbers found for type '${numberid}'` });
    }
    
    // Limit stored numbers to the window size
    storedNumbers = [...storedNumbers.slice(-WINDOW_SIZE + uniqueNumbers.length), ...uniqueNumbers];
    
    const currWindow = [...storedNumbers];
    const avg = storedNumbers.length >= WINDOW_SIZE ? calculateAverage(storedNumbers.slice(-WINDOW_SIZE)) : calculateAverage(storedNumbers);
    
    res.json({
        windowPrevState: prevWindow,
        windowCurrState: currWindow,
        numbers: storedNumbers,
        avg: avg.toFixed(2)
    });
});

// // Initialize registration and authentication
// (async () => {
//     const registrationResponse = await registerWithTestServer();
//     if (registrationResponse) {
//         console.log("Registration successful");
//         await authenticateWithTestServer();
//     } else {
//         console.log("Registration failed. Exiting...");
//         process.exit(1);
//     }
// })();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
