import React, { createContext, useState, useEffect, useContext } from 'react';
import { useMsal } from '@azure/msal-react';
import { getOrganizaciones } from '../utils/services/organizaciones';

const OrganizacionContext = createContext();

export const OrganizacionProvider = ({ children }) => {
    const { accounts } = useMsal();
    const [organizacion, setOrganizacion] = useState(null);

    useEffect(() => {
        const fetchOrganizacion = async () => {
            if (accounts && accounts.length > 0) {
                const email = accounts[0].username;
                const domain = email.split('@')[1];

                try {
                    const organizaciones = await getOrganizaciones();
                    const matchedOrganizacion = organizaciones.find(
                        (org) => org.dominioEmail.toLowerCase() === domain.toLowerCase()
                    );

                    if (matchedOrganizacion) {
                        setOrganizacion(matchedOrganizacion);
                    } else {
                        console.warn('No organization found for domain:', domain);
                    }
                } catch (error) {
                    console.error('Error fetching organizations:', error);
                }
            }
        };

        fetchOrganizacion();
    }, [accounts]);

    return (
        <OrganizacionContext.Provider value={organizacion}>
            {children}
        </OrganizacionContext.Provider>
    );
};

export const useOrganizacion = () => useContext(OrganizacionContext);