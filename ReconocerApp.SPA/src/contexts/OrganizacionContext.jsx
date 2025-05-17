import React, { createContext, useState, useEffect, useContext, use } from 'react';
import { useMsal } from '@azure/msal-react';
import { getUserOrganizacion } from '../utils/services/organizaciones';

const OrganizacionContext = createContext();

export const OrganizacionProvider = ({ children }) => {
    const { instance, accounts } = useMsal();
    const [organizacion, setOrganizacion] = useState(null);
    const activeAccount = instance.getActiveAccount();
    const [dominio, setDominio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setDominio(activeAccount?.username.split('@')[1]);
        console.log('Dominio:', activeAccount?.username.split('@')[1]);
    }, [activeAccount]);

    useEffect(() => {
        const fetchOrganizacion = async () => {
            setLoading(true);
            setError(null);
            try {
                const tokenResponse = await instance.acquireTokenSilent({
                    scopes: ['openid email profile User.Read.All'],
                    account: activeAccount,
                });
                const token = tokenResponse.accessToken;
                if (!token) {
                    setError('No se pudo obtener el token de acceso');
                    setLoading(false);
                    return;
                }
                const data = await getUserOrganizacion(token);
                setOrganizacion(data);
            } catch (error) {
                setError('Error al obtener la organización: ' + error.message);
                console.error('Error al obtener la organización:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizacion();
    }, [accounts, instance]);

    return (
        <OrganizacionContext.Provider value={{ organizacion, dominio, instance, loading, error }}>
            {children}
        </OrganizacionContext.Provider>
    );
};

export const useOrganizacion = () => useContext(OrganizacionContext);