import axios from 'axios';

export const getColaboradores = async (accessToken) => {
  const url = 'https://graph.microsoft.com/v1.0/users';
  const headers = {
    Authorization: `Bearer ${accessToken}`, // Token de acceso
    'Content-Type': 'application/json',
  };

  let users = [];
  let nextLink = url;

  try {
    // Manejar la paginación
    while (nextLink) {
      const response = await axios.get(nextLink, { headers });

      // Agregar los usuarios obtenidos a la lista
      if (response.data && response.data.value) {
        users = users.concat(response.data.value);
      }

      // Verificar si hay un enlace para la siguiente página
      nextLink = response.data['@odata.nextLink'] || null;
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