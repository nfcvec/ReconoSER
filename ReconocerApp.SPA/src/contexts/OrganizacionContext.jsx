import React, { createContext, useState, useEffect, useContext, use } from 'react';
import { useMsal } from '@azure/msal-react';
import { getOrganizaciones, getUserOrganizacion } from '../utils/services/organizaciones';
import { Box, Typography, Button, Paper } from '@mui/material';

const OrganizacionContext = createContext();

export const OrganizacionProvider = ({ children }) => {
    const { instance, accounts } = useMsal();
    const [organizacion, setOrganizacion] = useState(null);
    const activeAccount = instance.getActiveAccount();
    const [dominio, setDominio] = useState(null);

    useEffect(() => {
        setDominio(activeAccount?.username.split('@')[1]);
        console.log('Dominio:', activeAccount?.username.split('@')[1]);
    }, [activeAccount]);

    useEffect(() => {
        const fetchOrganizacion = async () => {
            const tokenResponse = await instance.acquireTokenSilent({
                scopes: ['openid email profile User.Read.All'],
                account: activeAccount,
            });
            const token = tokenResponse.accessToken;
            if (!token) {
                console.error('No se pudo obtener el token de acceso');
                return;
            }
            try {
                // Llama a la función getOrganizaciones con el token
                const data = await getUserOrganizacion(token);
                setOrganizacion(data);
            } catch (error) {
                console.error('Error al obtener la organización:', error);
            }
        };

        fetchOrganizacion();
    }, [accounts, instance]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (organizacion === null && (e.key === 'Escape' || e.key === 'Esc')) {
                instance.logout();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [organizacion, instance]);

    return (
        <OrganizacionContext.Provider value={{ organizacion, dominio, instance }}>
            {children}
        </OrganizacionContext.Provider>
    );
};

export const useOrganizacion = () => useContext(OrganizacionContext);