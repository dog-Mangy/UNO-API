import app from "./app.js";
import { connectDB } from "./config/database.js";

import dotenv from "dotenv";
dotenv.config();



connectDB(); 

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});


