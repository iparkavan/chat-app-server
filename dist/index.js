"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth-routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const contacts_routes_1 = __importDefault(require("./routes/contacts-routes"));
const socket_1 = __importDefault(require("./socket"));
const messages_routes_1 = __importDefault(require("./routes/messages-routes"));
const channel_routes_1 = __importDefault(require("./routes/channel-routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const databaseURL = process.env.DATABASE_URL;
const nextURL = process.env.ORIGIN;
// const allowedOrigins = [
//   "https://chat-app-client-rose.vercel.app",
//   "http://localhost:3000",
// ];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );
const allowedOrigins = [
    "https://chat-app-client-rose.vercel.app",
    "http://localhost:3000",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
}));
// Make sure Express actually responds to OPTIONS
app.options("*", (0, cors_1.default)());
// app.use("/uploads/profiles", express.static("/uploads/profiles"));
app.use("/src/uploads/profiles", express_1.default.static("src/uploads/profiles"));
app.use("/src/uploads/files", express_1.default.static("src/uploads/files"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/contacts", contacts_routes_1.default);
app.use("/api/messages", messages_routes_1.default);
app.use("/api/channel", channel_routes_1.default);
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
(0, socket_1.default)(server);
mongoose_1.default
    .connect(databaseURL)
    .then(() => console.log("Database Connected Successfully"))
    .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1); // Exit if database connection fails
});
// nQumkesk6qvtou8C
