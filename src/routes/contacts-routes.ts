import Router from "express";
import { verifyToken } from "../middlewares/auth-middleware";
import {
  getAllContacts,
  getContactsForDmList,
  searchContacts,
} from "../controllers/contacts-controllers";

const contactRoutes = Router();

contactRoutes.post("/search", verifyToken, searchContacts);
contactRoutes.get("/get-contact-for-dm", verifyToken, getContactsForDmList);
contactRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactRoutes;
