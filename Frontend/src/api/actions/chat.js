import api from "../client";

export const sendChatMessage = ({ message, history }) =>
  api.post("/public/chat/message", { message, history });
