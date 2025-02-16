"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth-middleware");
const contacts_controllers_1 = require("../controllers/contacts-controllers");
const contactRoutes = (0, express_1.default)();
contactRoutes.post("/search", auth_middleware_1.verifyToken, contacts_controllers_1.searchContacts);
contactRoutes.get("/get-contact-for-dm", auth_middleware_1.verifyToken, contacts_controllers_1.getContactsForDmList);
contactRoutes.get("/get-all-contacts", auth_middleware_1.verifyToken, contacts_controllers_1.getAllContacts);
exports.default = contactRoutes;
