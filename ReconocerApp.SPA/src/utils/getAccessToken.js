import { msalInstance } from '../main';

export const getAccessToken = async (scopes = ["User.Read.All"]) => {
  const account = msalInstance.getActiveAccount();
  if (!account) throw new Error("No active account");
  const response = await msalInstance.acquireTokenSilent({ account, scopes });
  return response.accessToken;
};
