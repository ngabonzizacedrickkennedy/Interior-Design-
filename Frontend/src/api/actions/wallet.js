import api from "../client";

export const getMyWallet = () => api.get("/wallet/me");
export const getMyWalletTransactions = () => api.get("/wallet/me/transactions");
export const deposit = ({ amount, method }) => api.post("/wallet/deposit", { amount, method });
export const invest = ({ requestId, amount }) => api.post("/wallet/invest", { requestId, amount });
