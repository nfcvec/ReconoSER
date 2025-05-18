import React, { createContext, useState, useEffect, useContext, use } from 'react';
import { useMsal } from '@azure/msal-react';
import { getUserOrganizacion } from '../utils/services/organizaciones';
import { useTheme } from './ThemeContext';
import { useLoading } from './LoadingContext';
import { useAlert } from './AlertContext';

const OrganizacionContext = createContext();

export const OrganizacionProvider = ({ children }) => {
    const { instance, accounts } = useMsal();
    const [organizacion, setOrganizacion] = useState(null);
    const [dominio, setDominio] = useState(null);
    const { setPrimaryColor } = useTheme();
    const { showLoading, hideLoading } = useLoading();
    const showAlert = useAlert();

    useEffect(() => {
        const fetchOrganizacion = async () => {
            showLoading('Cargando organización...', true);
            try {
                console.log('[OrganizacionContext] useEffect organizacion ejecutado', instance.getActiveAccount(), instance);
                if (!instance.getActiveAccount()) {
                    setPrimaryColor('#c9c9c9');
                    setOrganizacion(null);
                    setDominio(null);
                    hideLoading();
                    return;
                }
                const tokenResponse = await instance.acquireTokenSilent({
                    scopes: ['openid email profile User.Read.All'],
                    account: instance.getActiveAccount(),
                });
                const token = tokenResponse.accessToken;
                if (!token) {
                    showAlert('No se pudo obtener el token de acceso', 'error');
                    hideLoading();
                    return;
                }
                const data = await getUserOrganizacion(token);
                setOrganizacion(data);
            } catch (error) {
                showAlert('Error al obtener la organización: ' + error.message, 'error');
                console.error('Error al obtener la organización:', error);
                console.log('[OrganizacionContext] useEffect dominio ejecutado', instance.getActiveAccount());
                setDominio(instance.getActiveAccount()?.username.split('@')[1]);
                console.log('Dominio:', instance.getActiveAccount()?.username.split('@')[1]);
            } finally {
                hideLoading();
            }
        };
        fetchOrganizacion();
    }, [instance, accounts]);

    useEffect(() => {
        console.log('[OrganizacionContext] useEffect color ejecutado', organizacion);
        if (organizacion) {
            const color = organizacion.colorPrincipal || '#c9c9c9';
            setPrimaryColor(color);
        }
    }, [organizacion]);

    return (
        <OrganizacionContext.Provider value={{ organizacion, dominio, instance }}>
            {children}
        </OrganizacionContext.Provider>
    );
};

export const useOrganizacion = () => useContext(OrganizacionContext);