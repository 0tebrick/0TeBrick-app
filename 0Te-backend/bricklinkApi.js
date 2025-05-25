import axios from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const token = process.env.TOKEN;
const tokenSecret = process.env.TOKEN_SECRET;

const oauth = OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

export async function getSetInfo(setNumber) {
  const normalizedSetNumber = setNumber.includes("-") ? setNumber : `${setNumber}-1`;
  const url = `https://api.bricklink.com/api/store/v1/items/set/${normalizedSetNumber}`;

  const request_data = {
    url,
    method: "GET",
  };

  const authHeader = oauth.toHeader(
    oauth.authorize(request_data, { key: token, secret: tokenSecret })
  );

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader.Authorization,
        "Content-Type": "application/json",
      },
    });

     // --- ¡NUEVA LÓGICA AQUÍ! ---
    // Verificar el meta.code de BrickLink.
    if (response.data && response.data.meta && response.data.meta.code !== 200) {
      // Si BrickLink devuelve un error (ej. 404), lanzamos un error personalizado
      const errorDetails = response.data.meta.description || 'Set no encontrado en BrickLink.';
      const errorCode = response.data.meta.code || 404;
      const error = new Error(errorDetails);
      error.statusCode = errorCode; // Añade un código de estado para manejarlo en server.js
      error.bricklinkDetails = response.data; // Para depuración
      throw error;
    }

    // Si todo está bien, devuelve solo la data útil del set
    return response.data.data; // Asegúrate de que devolvemos `data.data`
  } catch (error) {
    console.error("Error en API BrickLink:", error.response?.data || error.message);
    // Propaga el error para que server.js pueda manejarlo
    throw error;
  }
}