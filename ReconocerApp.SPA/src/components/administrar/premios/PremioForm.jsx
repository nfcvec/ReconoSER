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
  Card,
  CardContent,
  CardMedia,
  Typography
} from "@mui/material";
import {
  createPremio,
  editPremio,
  uploadPremioImages,
  getPremioImages,
  deletePremioImage,
} from "../../../utils/services/premios";
import { getCategorias } from "../../../utils/services/categorias";
import { useAlert } from "../../../contexts/AlertContext";
import DeleteIcon from '@mui/icons-material/Delete';
import { useOrganizacion } from "../../../contexts/OrganizacionContext";

const PremioForm = ({ open, onClose, premio = null }) => {
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const showAlert = useAlert?.() ?? (() => {});
  const { organizacion } = useOrganizacion();
  const organizacionId = organizacion?.organizacionId;

  const handleChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageChange = async ({ target: { files } }) => {
    const file = files[0];
    if (!file) return;
    // Si estamos editando (premio?.premioId existe), subimos la imagen inmediatamente
    if (premio?.premioId) {
      try {
        const formData = new FormData();
        formData.append("files", file);
        await uploadPremioImages(premio.premioId, formData);
        showAlert("Imagen subida exitosamente.", "success");
        await fetchPremioImages(premio.premioId);
      } catch {
        showAlert("Error al subir la imagen.", "error");
      }
    } else {
      // Si estamos creando, solo previsualizamos
      setSelectedFiles([{ name: file.name, content: URL.createObjectURL(file), file }]);
    }
  };

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
      if (premio) {
        const categoriaId = Number(premio.categoria?.categoriaId);
        setFormData((prev) => ({
          ...prev,
          ...premio,
          categoriaId: categoriaId || "",
        }));
        if (premio.premioId) fetchPremioImages(premio.premioId);
      }
    } catch (error) {
      showAlert("Error al cargar categorías.", "error");
    }
  }, [premio, showAlert]);

  const fetchPremioImages = useCallback(async (premioId) => {
    try {
      const images = await getPremioImages(premioId);
      if (images.length) {
        setSelectedFiles(images.map(image => ({ name: image.name, content: `data:image/jpeg;base64,${image.content}` })));
      } else {
        setSelectedFiles([]);
      }
    } catch {
      showAlert("Error al obtener las imágenes del premio.", "error");
    }
  }, [showAlert]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const uploadImage = async (premioId) => {
    if (!selectedFiles[0]?.file) return;
    try {
      const formData = new FormData();
      formData.append("files", selectedFiles[0].file);
      await uploadPremioImages(premioId, formData);
      showAlert("Imagen subida exitosamente.", "success");
    } catch {
      showAlert("Error al subir la imagen.", "error");
    }
  };

  const handleDeleteImage = async (imageName) => {
    if (!premio?.premioId) return;
    try {
      const imageFileName = imageName.split('/').pop();
      await deletePremioImage(premio.premioId, imageFileName);
      showAlert("Imagen eliminada exitosamente.", "success");
      await fetchPremioImages(premio.premioId);
    } catch {
      showAlert("Error al eliminar la imagen.", "error");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, organizacionId, ultimaActualizacion: new Date().toISOString() };
      const premioId = premio?.premioId;
      if (premioId) {
        await editPremio(premioId, payload);
        // Si hay una nueva imagen seleccionada (con propiedad 'file'), subirla
        if (selectedFiles[0]?.file) {
          await uploadImage(premioId);
        }
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
      <DialogTitle>{premio?.premioId ? "Editar Premio" : "Crear Premio"}</DialogTitle>
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
          {/* Imagenes Preview Inline */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
            {selectedFiles.length > 0 ? (
              selectedFiles.map((img, idx) => (
                <Card key={idx} sx={{ maxWidth: 150, position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={img.content}
                    alt={img.name}
                    sx={{ height: 100, width: "100%", objectFit: "contain", borderRadius: "4px" }}
                  />
                  {premio?.premioId && (
                    <Button
                      size="small"
                      sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, padding: '4px', background: 'rgba(255,255,255,0.7)' }}
                      onClick={() => handleDeleteImage(img.name)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Agregue una imagen para el premio.
                </Typography>
              </Box>
            )}
          </Box>
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
          {premio?.premioId ? "Guardar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PremioForm;
