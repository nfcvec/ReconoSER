import React from "react";
import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Botón para descargar un área referenciada como PDF.
 * @param {Object} props
 * @param {React.RefObject} props.targetRef - Ref del elemento a exportar.
 * @param {string} props.fileName - Nombre del archivo PDF.
 * @param {string} [props.ariaLabel] - Etiqueta accesible.
 */
const PdfDownloadButton = ({ targetRef, fileName, ariaLabel = "descargar-pdf" }) => {
  const handleDownloadPdf = async () => {
    if (!targetRef.current) return;
    try {
      const canvas = await html2canvas(targetRef.current, { scale: 2, useCORS: true, backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Error al exportar el certificado a PDF:", error);
    }
  };

  return (
    <IconButton color="primary" onClick={handleDownloadPdf} aria-label={ariaLabel}>
      <DownloadIcon />
    </IconButton>
  );
};

export default PdfDownloadButton;
