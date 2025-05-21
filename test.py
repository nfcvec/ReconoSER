import os
import base64


# read "anuncio dpto.pdf" and encode it in base64
with open("ebook hands-on kubernetes.pdf", "rb") as pdf_file:
    pdf_data = pdf_file.read()
    encoded_pdf = base64.b64encode(pdf_data).decode('utf-8')

import requests
import json

url = "https://prod-29.westus.logic.azure.com:443/workflows/e24167e6059c437d95f8cfac0ec498f1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mmfae0rh578O0UgOfioA6re-wge-nYyQg5mIC3vc53w"

payload = json.dumps({
  "to": "diego.hachig@udla.edu.ec",
  "subject": "prueba",
  "body": "<strong>Hola</strong> mensaje de prueba",
  "attachmentName": "hola.pdf",
  "attachmentContent": encoded_pdf,
})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
