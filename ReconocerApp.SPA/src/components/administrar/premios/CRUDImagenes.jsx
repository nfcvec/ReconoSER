import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { getPremioImages, uploadPremioImages, getPremios } from "../../../utils/services/premios";
import SelectorImagen from "./SelectorImages";

const CRUDImagenes = () => {
  const [premios, setPremios] = useState([]);
  const [selectedPremio, setSelectedPremio] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageData, setImageData] = useState(null);

  // Cargar premios al montar el componente
  useEffect(() => {
    const fetchPremios = async () => {
      try {
        const data = await getPremios();
        setPremios(data);
        console.log("Premios cargados:", data);
      } catch (error) {
        console.error("Error al obtener los premios:", error);
      }
    };
    fetchPremios();
  }, []);

  // Manejar el cambio de premio seleccionado
  const handleSelectChange = async (e) => {
    const premioId = e.target.value;
    console.log("Premio seleccionado:", premioId);
    setSelectedPremio(premioId);

    // Obtener las imágenes asociadas al premio seleccionado
    try {
      const images = await getPremioImages(premioId);
      if (images.length > 0) {
        const image = images[0];
        setImageData({
          name: image.name,
          content: `data:image/jpeg;base64,${image.content}`,
        });
        console.log("Imagen obtenida:", image);
      } else {
        setImageData(null);
        console.log("No hay imágenes para el premio seleccionado.");
      }
    } catch (error) {
      console.error("Error al obtener las imágenes:", error);
    }
  };

  // Manejar la subida de imágenes
  const handleUpload = async () => {
    if (!selectedFile || !selectedPremio) {
      console.warn("No hay imagen o premio seleccionado");
      return;
    }

    const formData = new FormData();
    formData.append("files", selectedFile);

    try {
      const response = await uploadPremioImages(selectedPremio, formData);
      console.log("✅ Respuesta de la API:", response);
      alert("Imagen subida con éxito");
      setSelectedFile(null);
      handleSelectChange({ target: { value: selectedPremio } });
    } catch (error) {
      console.error("❌ Error al subir la imagen:", error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de la Imagen para el Premio
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Seleccionar Premio</InputLabel>
        <Select
          value={selectedPremio}
          onChange={handleSelectChange}
          label="Seleccionar Premio"
        >
          <MenuItem value="" disabled>
            Seleccione el Premio
          </MenuItem>
          {premios.map((premio) => (
            <MenuItem key={premio.premioId} value={String(premio.premioId)}>
              {premio.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Componente para visualizar la imagen */}
      <SelectorImagen imageData={imageData} />

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" component="label" fullWidth>
          Seleccionar Imagen
          <input
            type="file"
            hidden
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </Button>
      </Box>

      {selectedFile && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Imagen seleccionada: {selectedFile.name}
        </Typography>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpload}
          disabled={!selectedFile || !selectedPremio}
        >
          Subir Imagen
        </Button>
      </Box>
    </Box>
  );
};

export default CRUDImagenes;
