import axios from "axios";
import { useMsal } from "@azure/msal-react";

const getAccessToken = async (instance, accounts) => {
  if (!accounts || accounts.length === 0) {
    throw new Error("No hay cuentas disponibles.");
  }
  const response = await instance.acquireTokenSilent({
    account: accounts[0],
    scopes: ["User.Read.All"],
  });
  return response.accessToken;
};

export const graphService = {
  getColaboradores: async (searchTerm, instance, accounts) => {
    const accessToken = await getAccessToken(instance, accounts);
    let url = `https://graph.microsoft.com/v1.0/users`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    if (searchTerm) {
      url += `?$search="displayName:${searchTerm}" OR "mail:${searchTerm}" OR "userPrincipalName:${searchTerm}"`;
      headers["ConsistencyLevel"] = "eventual";
    }

    try {
      const response = await axios.get(url, { headers });
      return response.data?.value || [];
    } catch (error) {
      console.error("Error al obtener colaboradores:", error.message);
      throw error;
    }
  },

  getColaboradoresFromBatchIds: async (ids, instance, accounts) => {
    const accessToken = await getAccessToken(instance, accounts);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const chunkedIds = [];
    for (let i = 0; i < ids.length; i += 20) {
      chunkedIds.push(ids.slice(i, i + 20));
    }

    const results = [];
    for (const chunk of chunkedIds) {
      const batchRequests = chunk.map((id, index) => ({
        id: (index + 1).toString(),
        method: "GET",
        url: `/users/${id}`,
      }));
      const body = { requests: batchRequests };

      try {
        const response = await axios.post(
          `https://graph.microsoft.com/v1.0/$batch`,
          body,
          { headers }
        );
        if (response.data?.responses) {
          results.push(...response.data.responses.map((res) => res.body));
        }
      } catch (error) {
        console.error("Error al obtener colaboradores desde Microsoft Graph:", error.message);
        throw error;
      }
    }

    return results;
  },
};