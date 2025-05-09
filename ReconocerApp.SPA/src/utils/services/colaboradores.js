import axios from 'axios';

export const getColaboradores = async (accessToken, searchTerm) => {
  console.log("Token de acceso:", accessToken); // Verifica el token
  let url = `https://graph.microsoft.com/v1.0/users`;
  const headers = {
    Authorization: `Bearer ${accessToken}`, // Token de acceso
    'Content-Type': 'application/json',
  };

  console.log("Encabezados de la solicitud:", headers);

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