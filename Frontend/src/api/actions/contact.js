import api from "../client";

export const sendContactMessage = ({ name, email, phone, message }) =>
  api.post("/public/contact", { name, email, phone, message });
