import axios from 'axios';
import { useMsal } from '@azure/msal-react';

export const getColaboradores = async (searchTerm, instance, accounts) => {
  const response = await instance.acquireTokenSilent({
    account: accounts[0],
    scopes: ["User.Read.All"],
  });
  const accessToken = response.accessToken; // Obtiene el token de acceso
  if (!accessToken) {
    throw new Error("No se pudo obtener el token de acceso.");
  }
  let url = `https://graph.microsoft.com/v1.0/users`;
  const headers = {
    Authorization: `Bearer ${accessToken}`, // Token de acceso
    'Content-Type': 'application/json',
  };


  if (searchTerm) {
    url += `?$search="displayName:${searchTerm}" OR "mail:${searchTerm}" OR "userPrincipalName:${searchTerm}"`;
    headers['ConsistencyLevel'] = 'eventual'; // Para búsquedas
  }

  try {
    const response = await axios.get(url, { headers });
    if (response.data && response.data.value) {
      return response.data.value;
    }
    return [];
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error(
        "Error 403: Permisos insuficientes. Asegúrate de que el token de acceso tiene el permiso 'User.Read.All'."
      );
    } else {
      console.error('Error al obtener los colaboradores desde Microsoft Graph:', error.message);
    }
    throw error;
  }
};

export const getColaboradoresFromBatchIds = async (ids, instance, accounts) => {
  const response = await instance.acquireTokenSilent({
    account: accounts[0],
    scopes: ["User.Read.All"],
  });
  const accessToken = response.accessToken; // Obtiene el token de acceso
  if (!accessToken) {
    throw new Error("No se pudo obtener el token de acceso.");
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`, // Token de acceso
    'Content-Type': 'application/json',
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
    const body = {
      requests: batchRequests,
    };

    try {
      const response = await axios.post(
        `https://graph.microsoft.com/v1.0/$batch`,
        body,
        { headers }
      );
      if (response.data && response.data.responses) {
        results.push(...response.data.responses.map((res) => res.body));
      }
    } catch (error) {
      console.error('Error al obtener los colaboradores desde Microsoft Graph:', error.message);
      throw error;
    }
  }

  return results;
};