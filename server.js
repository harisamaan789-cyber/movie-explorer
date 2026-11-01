const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(cors());
app.use(express.json());
const token = process.env.TMDB_ACCESS_TOKEN;
app.get("/api/movies", async (req, res) => {
    try {
        const movieName = req.query.movie;

        if (!movieName || movieName.trim() === "") {
            return res.status(400).json({
                error: "Please provide a movie name"
            });
        }

        const response = await fetch(
            "https://api.themoviedb.org/3/search/movie?query=" + encodeURIComponent(movieName),
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Something went wrong with TMDB"
            });
        }

        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



