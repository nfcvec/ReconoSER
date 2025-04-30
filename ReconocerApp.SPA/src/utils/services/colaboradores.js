import axios from 'axios';

export const getColaboradores = async (accessToken, searchTerm) => {
  const url = `https://graph.microsoft.com/v1.0/users`;
  const headers = {
    Authorization: `Bearer ${accessToken}`, // Token de acceso
    'Content-Type': 'application/json',
  };

  let users = [];

  if (searchTerm) {
    url += `?$search="displayName:${searchTerm}" OR "mail:${searchTerm}" OR "userPrincipalName:${searchTerm}"`;
    headers['ConsistencyLevel'] = 'eventual'; // Para búsquedas
  }

  try {
    const response = await axios.get(url, { headers });

    // Agregar los usuarios obtenidos a la lista
    if (response.data && response.data.value) {
      users = users.concat(response.data.value);
    }
    return users;
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