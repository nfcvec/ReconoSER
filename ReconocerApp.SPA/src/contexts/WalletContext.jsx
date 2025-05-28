import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMsal } from '@azure/msal-react';
import { getUserWallet } from '../utils/services/walletBalance';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const { instance, accounts } = useMsal();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            // Si no hay cuenta activa, no hacemos nada
            if (!instance.getActiveAccount()) {
                setWallet(null);
                setLoading(false);
                return;
            }
            const tokenResponse = await instance.acquireTokenSilent({
                scopes: ['openid email profile User.Read.All'],
                account: instance.getActiveAccount(),
            });
            const token = tokenResponse.accessToken;
            if (!token) {
                setError('No se pudo obtener el token de acceso');
                setLoading(false);
                return;
            }
            const data = await getUserWallet(token);
            setWallet(data);
        } catch (error) {
            setError('Error al obtener la wallet: ' + error.message);
            console.error('Error al obtener la wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
        const interval = setInterval(fetchWallet, 15000); // Actualiza cada 15 segundos
        return () => clearInterval(interval);
    }, [accounts, instance]);

    return (
        <WalletContext.Provider value={{ wallet, loading, error, refreshWallet: fetchWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
