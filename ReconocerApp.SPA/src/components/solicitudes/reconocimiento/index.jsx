import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const IndexReconocimientos = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                gap: 2,
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Componente de Ejemplo
            </Typography>
            <Button variant="contained" color="primary">
                Presionar
            </Button>
        </Box>
    );
};

export default IndexReconocimientos;