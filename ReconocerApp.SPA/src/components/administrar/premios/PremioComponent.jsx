import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import {
  createPremio,
  editPremio,
  uploadPremioImages,
  getPremioImages,
} from "../../../utils/services/premios";
import { getCategorias } from "../../../utils/services/categorias";
import { useAlert } from "../../../contexts/AlertContext";
import SelectorImagen from "./SelectorImages";

const PremioComponent = ({ open, onClose, premioData = null, organizacionId }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    costoWallet: 0,
    imagenUrl: "",
    cantidadActual: 0,
    ultimaActualizacion: new Date().toISOString(),
    categoriaId: 0,
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const showAlert = useAlert?.() ?? (() => {});

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        showAlert("Error al cargar categorías.", "error");
      }
    };
    fetchCategorias();

    if (premioData) {
      setFormData({ ...premioData });
      if (premioData.premioId) {
        fetchPremioImages(premioData.premioId); // Cargar imágenes al editar
      }
    }
  }, [premioData]);

  // Cargar las imágenes del premio si existe
  const fetchPremioImages = async (premioId) => {
    try {
      const images = await getPremioImages(premioId);
      if (images.length > 0) {
        const image = images[0];
        setSelectedFile({
          name: image.name,
          content: `data:image/jpeg;base64,${image.content}`,
        });
        console.log("Imagen cargada:", image.name);
      } else {
        console.log("No hay imágenes para el premio");
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error al obtener las imágenes:", error);
      showAlert("Error al obtener las imágenes del premio.", "error");
    }
  };

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageChange = ({ target: { files } }) => {
    const file = files[0];
    if (file) {
      setSelectedFile({ name: file.name, content: URL.createObjectURL(file), file });
      console.log("Imagen seleccionada:", file.name);
    }
  };

  const uploadImage = async (premioId) => {
    if (!selectedFile?.file) return;
    try {
      const formData = new FormData();
      formData.append("files", selectedFile.file);
      console.log("Subiendo imagen - ID:", premioId, "Archivo:", selectedFile.file);
      await uploadPremioImages(premioId, formData);
      showAlert("Imagen subida exitosamente.", "success");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      showAlert("Error al subir la imagen.", "error");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, organizacionId, ultimaActualizacion: new Date().toISOString() };
      console.log("Payload enviado:", payload);

      let premioId = premioData?.premioId;
      if (premioId) {
        await editPremio(premioId, payload);
        showAlert("Premio actualizado.", "success");
      } else {
        const { premioId: newId } = await createPremio(payload);
        showAlert("Premio creado.", "success");
        premioId = newId;
        console.log("Premio creado con ID:", premioId);
      }

      if (selectedFile) await uploadImage(premioId);
      onClose(true);
    } catch (error) {
      console.error("Error al guardar el premio:", error);
      showAlert("Error al guardar el premio.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>{premioData?.premioId ? "Editar Premio" : "Crear Premio"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {["nombre", "descripcion", "costoWallet", "cantidadActual"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              fullWidth
              required
              multiline={field === "descripcion"}
              rows={field === "descripcion" ? 3 : 1}
              type={field.includes("Wallet") || field.includes("Actual") ? "number" : "text"}
            />
          ))}
          <TextField
            label="Categoría"
            name="categoriaId"
            select
            value={formData.categoriaId}
            onChange={handleChange}
            fullWidth
            required
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.categoriaId} value={cat.categoriaId}>
                {cat.nombre}
              </MenuItem>
            ))}
          </TextField>

          <SelectorImagen imageData={selectedFile} />

          <Button variant="outlined" component="label" fullWidth>
            Seleccionar Imagen
            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
          </Button>

          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Imagen seleccionada: {selectedFile.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {premioData?.premioId ? "Guardar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PremioComponent;
