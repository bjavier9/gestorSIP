# Endpoints de Content

**Ruta base**: `/api/content`

El modulo ofrece utilidades de generacion de contenido. El router aplica `authMiddleware`, por lo que todos los llamados requieren JWT valido. Actualmente solo existe un endpoint.

## POST /refine-prompt
- **Descripcion**: Refina un prompt inicial agregando instrucciones estructuradas y devuelve el texto listo para un modelo generativo.
- **Autenticacion**: `Authorization: Bearer <token>`.
- **Cuerpo**:
  ```json
  {
    "prompt": "Escribe un resumen sobre seguros de salud",
    "languageCode": "es-ES",
    "additionalInstructions": [
      "Enfatiza beneficios fiscales",
      "Incluye un llamado a la accion"
    ]
  }
  ```
  - `languageCode` debe existir en `supportedLanguages`.
  - `additionalInstructions` es opcional.
- **Respuesta 200**:
  ```json
  {
    "success": true,
    "status": 200,
    "data": {
      "refinedPrompt": "---\n**PROMPT REFINEMENT INSTRUCTIONS**\n1. Role: You are an expert copywriter ...",
      "language": "Spanish",
      "languageCode": "es-ES",
      "originalPrompt": "Escribe un resumen sobre seguros de salud",
      "instructions": [
        "1. Role: You are an expert copywriter ...",
        "Enfatiza beneficios fiscales",
        "Incluye un llamado a la accion"
      ]
    }
  }
  ```
- **Errores**:
  - `400 VALIDATION_MISSING_FIELDS`: falta `prompt` o `languageCode`.
  - `400 VALIDATION_INVALID_LANGUAGE_CODE`: `languageCode` no soportado.
  - `401`: token ausente o invalido.
