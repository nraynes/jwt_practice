require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');


const app = express();

app.use(express.json())

let refreshTokens = [];

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            deleteRefreshToken(refreshToken)
            return res.sendStatus(403)
        }
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken });
    })
})

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { name: username };
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
})

app.delete('/logout', (req, res) => {
    deleteRefreshToken(req.body.token)
    res.sendStatus(204)
})

function deleteRefreshToken(refreshtoken) {
    refreshTokens = refreshTokens.filter(token => token !== refreshtoken)
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1m' });
}

app.listen(4000, () => {
    console.log('Listening on port 4000...')
});
