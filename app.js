const express = require('express');
const https = require("https");
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları servis et
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function() {
    console.log("Server is started at port: " + port);
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/", function (req, res) {
    let id = Number(req.body.pokemon);
    let url = "https://pokeapi.co/api/v2/pokemon/" + id;
    let pokeImg = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/" + id + ".svg";
    const request = https.get(url, function(response) {
        let responseData = "";

        response.on("data", function(dataChunk) {
            responseData += dataChunk;
        });

        response.on("end", function() {
            if (response.statusCode === 200) {
                let pokeInfo = JSON.parse(responseData);
                let pokemonName = pokeInfo.name;
                let pokeType = pokeInfo.types[0].type.name;
              
                const htmlResponse = `
                <style>
                  .container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    height: 100vh;
                    text-align: center;
                    background: url('bg1.jpg') no-repeat center center;
                    background-size: cover; 
                    background-position: center; 
                    margin: 0;
                    font-family: Arial, sans-serif;                  }
                  .info-box {
                    background-color: rgba(255, 255, 255, 0.8);
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px; 
                  }
                  img {
                    width: 40%;
                    max-width: 500px;
                    height: auto;
                  }
                </style>
                <div class="container">
                  <div class="info-box">
                    <h1>Aradığın pokemon ${pokemonName}</h1>
                    <img src="${pokeImg}" alt="Image of ${pokemonName}">
                    <h3>Pokemonun türü: ${pokeType}</h3>
                  </div>
                </div>`;
                
              res.send(htmlResponse);
              

            } else {
                res.status(response.statusCode).send("Error fetching Pokemon data.");
            }
        });
    });

    // Set timeout for the request
    request.setTimeout(5000, function() { // 5000 ms = 5 seconds
        request.abort();
        if (!res.headersSent) {
            res.status(408).send("Request timed out. Please try again.");
        }
    });

    request.on("error", function(e) {
        if (e.code === "ECONNRESET") {
            console.error("Request timeout: ", e.message);
        } else {
            console.error("Got error: ", e.message);
        }
        if (!res.headersSent) {
            res.status(500).send("Unable to fetch Pokemon data. Please try again later.");
        }
    });
});
