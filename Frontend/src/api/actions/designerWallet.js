import api from "../client";

export const getMyDesignerWallet = () => api.get("/designer-wallet/me");
export const getMyDesignerWalletTransactions = () => api.get("/designer-wallet/me/transactions");
export const transferToPersonalAccount = (amount) => api.post("/designer-wallet/me/transfer", { amount });
