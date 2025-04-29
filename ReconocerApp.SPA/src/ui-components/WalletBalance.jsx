import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { getWalletBalanceByUserId } from '../utils/services/walletBalance';

const WalletBalance = ({ id }) => {
  const [balance, setBalance] = useState(null); // Estado para almacenar el saldo
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getWalletBalanceByUserId(id); // Llama al endpoint con el ID
        setBalance(data.saldoActual); // Usa el campo "saldoActual" de la respuesta
        console.log("Respuesta del endpoint:", data); // Imprime la respuesta completa para depuración
      } catch (err) {
        setError('Error al obtener el saldo'); // Manejo de errores
        console.error("Error al obtener el saldo:", err);
      }
    };
  
    if (id) {
      fetchBalance(); // Solo llama a la API si el ID está definido
      console.log("ID usado para obtener el saldo:", id); // Imprime el ID para depuración
    }
  }, [id]);

  return (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
      <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'green', mr: 2 }} />
      <Box>
        <Typography variant="subtitle2">Saldo disponible</Typography>
        {error ? (
          <Typography variant="h6" color="error">{error}</Typography>
        ) : (
          <Typography variant="h5">
            {balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default WalletBalance;