import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
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
    categoriaId: "",
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const showAlert = useAlert?.() ?? (() => {});

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageChange = ({ target: { files } }) => {
    const file = files[0];
    if (file) setSelectedFile({ name: file.name, content: URL.createObjectURL(file), file });
  };

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
      if (premioData) {
        const categoriaId = Number(premioData.categoria?.categoriaId);
        setFormData((prev) => ({
          ...prev,
          ...premioData,
          categoriaId: categoriaId || "",
        }));
        if (premioData.premioId) fetchPremioImages(premioData.premioId);
      }
    } catch (error) {
      showAlert("Error al cargar categorías.", "error");
    }
  }, [premioData, showAlert]);

  const fetchPremioImages = useCallback(async (premioId) => {
    try {
      const images = await getPremioImages(premioId);
      if (images.length) {
        const image = images[0];
        setSelectedFile({ name: image.name, content: `data:image/jpeg;base64,${image.content}` });
      } else {
        setSelectedFile(null);
      }
    } catch {
      showAlert("Error al obtener las imágenes del premio.", "error");
    }
  }, [showAlert]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const uploadImage = async (premioId) => {
    if (!selectedFile?.file) return;
    try {
      const formData = new FormData();
      formData.append("files", selectedFile.file);
      await uploadPremioImages(premioId, formData);
      showAlert("Imagen subida exitosamente.", "success");
    } catch {
      showAlert("Error al subir la imagen.", "error");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, organizacionId, ultimaActualizacion: new Date().toISOString() };
      const premioId = premioData?.premioId;
      if (premioId) {
        await editPremio(premioId, payload);
        showAlert("Premio actualizado.", "success");
      } else {
        const { premioId: newId } = await createPremio(payload);
        showAlert("Premio creado.", "success");
        await uploadImage(newId);
      }
      onClose(true);
    } catch {
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
            value={Number(formData.categoriaId)}
            onChange={handleChange}
            fullWidth
            required
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.categoriaId} value={Number(cat.categoriaId)}>
                {cat.nombre}
              </MenuItem>
            ))}
          </TextField>
          <SelectorImagen imageData={selectedFile} />
          <Button variant="outlined" component="label" fullWidth>
            Seleccionar Imagen
            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
          </Button>
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
