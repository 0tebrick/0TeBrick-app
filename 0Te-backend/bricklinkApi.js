// bricklinkApi.js
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';
import { generatePotentialSetNumbers } from './utils.js';
import 'dotenv/config'; // Para asegurar que dotenv.config() se ejecuta

// Define las credenciales de Bricklink como un array de objetos
// Esto asume que tienes múltiples pares de tokens/secrets en tus ENV
// Adaptar según cómo las nombres (ej. BRICKLINK_TOKEN_1, BRICKLINK_SECRET_1)
const BRICKLINK_CREDENTIALS = [
  {
    consumerKey: process.env.CONSUMER_KEY, // Asumo que Consumer Key/Secret son los mismos
    consumerSecret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN_1, // Token para IP_1
    tokenSecret: process.env.TOKEN_SECRET_1, // Secret para IP_1
  },
  {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN_2, // Token para IP_2
    tokenSecret: process.env.TOKEN_SECRET_2, // Secret para IP_2
  },
  {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN_3, // Token para IP_3
    tokenSecret: process.env.TOKEN_SECRET_3, // Secret para IP_3
  },
  // Agrega más si Render te da más de 3 IPs estáticas
].filter(cred => cred.token && cred.tokenSecret);

// Crea la instancia de OAuth
const oauth = OAuth({
  consumer: {
    key: BRICKLINK_CREDENTIALS[0].consumerKey, // Usamos la misma Consumer Key para todos
    secret: BRICKLINK_CREDENTIALS[0].consumerSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// En 0Te-backend/bricklinkApi.js
// ... (resto de tu código hasta la función getSetInfo)

export async function getSetMinifigs(setNumber) {
  const cleanSet = String(setNumber).trim();

  // Mismo esquema que getSetInfo, intentamos posibles formatos si no tiene secuencia
  const potentialSetNumbers = generatePotentialSetNumbers(setNumber);

  for (let currentSetNumberIndex = 0; currentSetNumberIndex < potentialSetNumbers.length; currentSetNumberIndex++) {
    const currentSetNumber = potentialSetNumbers[currentSetNumberIndex];
    if (!currentSetNumber) continue;

    const url = `https://api.bricklink.com/api/store/v1/items/SET/${currentSetNumber}/minifigs`;
    const requestData = {
      url,
      method: 'GET',
      data: null,
    };

    for (let i = 0; i < BRICKLINK_CREDENTIALS.length; i++) {
      const { token, tokenSecret } = BRICKLINK_CREDENTIALS[i];

      const authorization = oauth.authorize(requestData, {
        key: token,
        secret: tokenSecret,
      });

      try {
        const response = await axios({
          method: requestData.method,
          url: requestData.url,
          headers: oauth.toHeader(authorization),
        });

        return response.data.data;  // Aquí retornas la lista de minifigs
      } catch (error) {
        const errorMessage = error.response?.data?.meta?.description || error.response?.data?.message || '';
        const statusCode = error.response?.status;

        if (statusCode === 401 && errorMessage.includes('TOKEN_IP_MISMATCHED')) {
          if (i === BRICKLINK_CREDENTIALS.length - 1 && currentSetNumberIndex === potentialSetNumbers.length - 1) {
            const bricklinkError = new Error(errorMessage || `Error final: TOKEN_IP_MISMATCHED para ${currentSetNumber}.`);
            bricklinkError.statusCode = statusCode;
            bricklinkError.bricklinkDetails = error.response?.data;
            throw bricklinkError;
          }
          continue;
        }

        if ((statusCode === 400 && errorMessage.includes('PARAMETER_MISSING_OR_INVALID')) || statusCode === 404) {
          break;
        }

        const bricklinkError = new Error(errorMessage || `Error al obtener minifigs de BrickLink para ${currentSetNumber}.`);
        bricklinkError.statusCode = statusCode;
        bricklinkError.bricklinkDetails = error.response?.data;
        throw bricklinkError;
      }
    }
  }

  const finalError = new Error(`No se pudo encontrar minifigs para el set "${setNumber}".`);
  finalError.statusCode = 404;
  throw finalError;
}


export async function getSetInfo(rawSetNumber) {
  const cleanSet = String(rawSetNumber).trim();

  // Generar los posibles formatos del set
  const potentialSetNumbers = generatePotentialSetNumbers(rawSetNumber)
  for (let currentSetNumberIndex = 0; currentSetNumberIndex < potentialSetNumbers.length; currentSetNumberIndex++) {
    const currentSetNumber = potentialSetNumbers[currentSetNumberIndex];
    if (!currentSetNumber) continue;

    //console.log(`getSetInfo: Intentando buscar con número de set: "${currentSetNumber}"`);

    const url = `https://api.bricklink.com/api/store/v1/items/SET/${currentSetNumber}`;
    const requestData = {
      url,
      method: 'GET',
      data: null,
    };

    for (let i = 0; i < BRICKLINK_CREDENTIALS.length; i++) {
      const { token, tokenSecret } = BRICKLINK_CREDENTIALS[i];

      /*if (!token || !tokenSecret) {
        console.warn(`Saltando intento con credenciales incompletas para IP #${i + 1}.`);
        continue;
      }*/

      const authorization = oauth.authorize(requestData, {
        key: token,
        secret: tokenSecret,
      });

      try {
        const response = await axios({
          method: requestData.method,
          url: requestData.url,
          headers: oauth.toHeader(authorization),
        });

        /*if (response.status === 200 && response.data && response.data.data) {
          console.log("✅ BrickLink API: Éxito con setNumber:", currentSetNumber);*/
          return response.data.data;
        /*} else {
          console.warn("⚠️ Respuesta 200 sin datos esperados para:", currentSetNumber);
          break;
        }*/
      } catch (error) {
        const errorMessage = error.response?.data?.meta?.description || error.response?.data?.message || '';
        const statusCode = error.response?.status;

        //console.error(`❌ Intento ${i + 1} con ${currentSetNumber} falló: ${statusCode} - ${errorMessage}`);

        if (statusCode === 401 && errorMessage.includes('TOKEN_IP_MISMATCHED')) {
          if (i === BRICKLINK_CREDENTIALS.length - 1 && currentSetNumberIndex === potentialSetNumbers.length - 1) {
            const bricklinkError = new Error(errorMessage || `Error final: TOKEN_IP_MISMATCHED para ${currentSetNumber}.`);
            bricklinkError.statusCode = statusCode;
            bricklinkError.bricklinkDetails = error.response?.data;
            throw bricklinkError;
          }
          continue; // Probar el siguiente token
        }

        if ((statusCode === 400 && errorMessage.includes('PARAMETER_MISSING_OR_INVALID')) || statusCode === 404) {
          break; // Salir del bucle de IPs, intentar siguiente formato de setNumber
        }

        const bricklinkError = new Error(errorMessage || `Error al obtener información de BrickLink para ${currentSetNumber}.`);
        bricklinkError.statusCode = statusCode;
        bricklinkError.bricklinkDetails = error.response?.data;
        throw bricklinkError;
      }
    }
  }
//console.warn(`❌ Todos los intentos fallaron para el set "${rawSetNumber}".`);
  const finalError = new Error(`No se pudo encontrar el set "${rawSetNumber}".`);
  finalError.statusCode = 404;
  throw finalError;
}