import { connectDB } from "./config/database.js";
import app from "./presentation/middlewares/authMiddleware.js";


connectDB(); 

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});


