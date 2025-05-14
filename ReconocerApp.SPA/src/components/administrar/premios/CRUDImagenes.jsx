import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { getPremioImages, uploadPremioImages, deletePremioImage } from "../../../utils/services/premios";

const CRUDImagenes = ({ premioId }) => {
  const [imagenes, setImagenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Cargar imágenes al montar el componente
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getPremioImages(premioId);
        setImagenes(data);
        setFilteredImages(data);
      } catch (error) {
        console.error("Error al obtener las imágenes:", error);
      }
    };
    fetchImages();
  }, [premioId]);

  // Filtrar imágenes por nombre
  useEffect(() => {
    const filtered = imagenes.filter((img) =>
      img.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImages(filtered);
  }, [searchTerm, imagenes]);

  // Manejar la subida de imágenes
  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await uploadPremioImages(premioId, formData);
      alert("Imagen subida con éxito");
      setSelectedFile(null);
      const updatedImages = await getPremioImages(premioId);
      setImagenes(updatedImages);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  // Manejar la eliminación de imágenes
  const handleDelete = async (imageName) => {
    try {
      await deletePremioImage(premioId, imageName);
      alert("Imagen eliminada con éxito");
      const updatedImages = await getPremioImages(premioId);
      setImagenes(updatedImages);
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Imágenes para el Premio
      </Typography>

      {/* Campo de búsqueda */}
      <TextField
        label="Buscar por nombre"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabla de imágenes */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre de la Imagen</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredImages.map((imageName) => (
              <TableRow key={imageName}>
                <TableCell>{imageName}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(imageName)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Subir imágenes */}
      <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Seleccionar Imagen
          <input
            type="file"
            hidden
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Subir Imagen
        </Button>
        {selectedFile && (
          <Typography variant="body2">
            Archivo seleccionado: {selectedFile.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CRUDImagenes;